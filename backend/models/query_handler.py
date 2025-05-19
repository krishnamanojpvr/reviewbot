from typing import List, Dict
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from huggingface_hub import InferenceClient
import os
from fastapi import HTTPException
import logging
from functools import lru_cache
from models.embedding_processor import embed_query

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

HF_TOKEN = os.getenv("HF_TOKEN")


@lru_cache(maxsize=1)
def get_inference_client():
    return InferenceClient(
        model="mistralai/Mistral-7B-Instruct-v0.3",
        token=HF_TOKEN
    )


def similarity_search(user_query: str, info_docs: List[Dict[str, object]], k: int = 7) -> List[str]:
    """
    Optimized cosine similarity search using pre-computed document vectors

    Args:
        user_query: Query string to search for
        info_docs: List of {"document_text": str, "vector": List[float]}
        k: Number of top results to return

    Returns:
        List of top k document texts sorted by relevance
    """
    try:
        query_embedding = embed_query(user_query)
        query_vector = np.array(query_embedding, ndmin=2)
        doc_vectors = np.array([doc["vectors"] for doc in info_docs])
        doc_texts = [doc["doc_text"] for doc in info_docs]
        similarities = cosine_similarity(query_vector, doc_vectors)
        top_k_indices = np.argpartition(similarities[0], -k)[-k:]
        top_k_indices = top_k_indices[np.argsort(
            similarities[0][top_k_indices])[::-1]]

        return [doc_texts[i] for i in top_k_indices]

    except Exception as e:
        logger.error(f"Similarity search error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to perform similarity search"
        )


def generate_response(user_query: str, retrieved_docs: List[str]) -> str:
    """
    Generate response using LLM with optimized prompt construction
    """
    try:
        client = get_inference_client()

        context = "\n".join([
            "Extracted Documents:",
            *retrieved_docs,
            f"\nQuestion: {user_query}"
        ])

        prompt = f"""Using the information from reviews and product features below, 
        provide a concise answer to the question. If the information isn't sufficient, 
        respond politely without mentioning lack of context.

        Context:
        {context}
        """

        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.3
        )

        return response.choices[0].message["content"]

    except Exception as e:
        logger.error(f"Response generation error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to generate response"
        )


async def handle_query(
    user_query: str,
    product_id: str,
    users_collection,
    current_user: str
) -> str:
    """
    Optimized query handler with better error handling
    """
    try:
        user = await users_collection.find_one(
            {"username": current_user},
            {"recentSearches": 1}
        )

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        product = next(
            (item for item in user.get("recentSearches", [])
             if item.get("product_id") == product_id),
            None
        )

        if not product or not product.get('info_docs'):
            raise HTTPException(
                status_code=404, detail="Product not found or has no documents")

        retrieved_docs = similarity_search(
            user_query, product['info_docs'], k=7)
        return generate_response(user_query, retrieved_docs)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Query handling error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to process query"
        )
