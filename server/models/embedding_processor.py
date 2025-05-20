from typing import List, Tuple, Dict, Set
import logging
from langchain.docstore.document import Document as LangchainDocument
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from transformers import AutoTokenizer
from functools import lru_cache

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_tokenizer(tokenizer_name: str):
    return AutoTokenizer.from_pretrained(tokenizer_name,cache_dir="./hf_cache")


@lru_cache(maxsize=1)
def get_embedding_model(model_name: str):
    return HuggingFaceEmbeddings(
        model_name=model_name,
        encode_kwargs={"normalize_embeddings": True},
        cache_folder="./hf_cache",
    )


def split_documents(
    chunk_size: int,
    raw_documents: List[LangchainDocument],
    tokenizer_name: str
) -> List[LangchainDocument]:
    """
    Optimized document splitting with caching and efficient deduplication.
    """
    # Get cached tokenizer
    tokenizer = get_tokenizer(tokenizer_name)

    # Initialize splitter once
    text_splitter = RecursiveCharacterTextSplitter.from_huggingface_tokenizer(
        tokenizer,
        chunk_size=chunk_size,
        chunk_overlap=int(chunk_size / 10),
        add_start_index=True,
        strip_whitespace=True,
        separators=[
            "\n#{1,6}", "```\n", "\n\\\\\\*+\n", "\n---+\n", "\n_+\n",
            "\n\n", "\n", " ", ""
        ],
    )

    seen: Set[str] = set()
    unique_docs: List[LangchainDocument] = []

    for doc in raw_documents:
        chunks = text_splitter.split_documents([doc])
        for chunk in chunks:
            content = chunk.page_content
            if content not in seen:
                seen.add(content)
                unique_docs.append(chunk)

    return unique_docs


def generate_embeddings(
    docs: List[LangchainDocument],
    model_name: str = "thenlper/gte-small"
) -> List[List[float]]:
    """
    Optimized embedding generation with caching and batch processing.
    """
    embedding_model = get_embedding_model(model_name)

    logger.info("Generating embeddings...")
    contents = [doc.page_content for doc in docs]
    embeddings = embedding_model.embed_documents(contents)
    logger.info(
        f"Generated {len(embeddings)} embeddings using model {model_name}")
    return embeddings


def embed_documents(
    data: List[str],  # Changed from dict to List[str] based on usage
    tokenizer_name: str = "thenlper/gte-small",
    chunk_size: int = 512
) -> List[Dict[str, object]]:
    """
    Optimized full pipeline with better type hints and logging.
    """
    raw_docs = [LangchainDocument(page_content=text) for text in data]
    logger.info(f"Loaded {len(raw_docs)} raw documents.")

    split_docs = split_documents(chunk_size, raw_docs, tokenizer_name)
    embeddings = generate_embeddings(split_docs, model_name=tokenizer_name)

    info_docs = [
        {"doc_text": doc.page_content, "vectors": emb}
        for doc, emb in zip(split_docs, embeddings)
        if doc.page_content and emb is not None
    ]

    logger.info(f"Processed {len(info_docs)} documents with embeddings.")
    return info_docs


def embed_query(
    query: str,
    tokenizer_name: str = "thenlper/gte-small"
) -> List[float]:
    """
    Optimized query embedding generation.
    """
    embedding_model = get_embedding_model(tokenizer_name)
    query_embedding = embedding_model.embed_query(query)
    logger.info(f"Generated query embedding for: {query}")
    return query_embedding