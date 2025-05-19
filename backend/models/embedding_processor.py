"""
embedding_processor.py

Module to preprocess product-related data, split it into text chunks, and generate
embeddings using HuggingFace embedding models (e.g., thenlper/gte-small) for downstream tasks.

Dependencies:
- langchain
- langchain_community
- langchain_huggingface
- transformers
- huggingface_hub
"""

from typing import List, Tuple
import logging
from langchain.docstore.document import Document as LangchainDocument
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from transformers import AutoTokenizer

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def build_raw_knowledge_base(data: dict) -> List[LangchainDocument]:
    """
    Builds a list of LangchainDocument objects from product data.

    Args:
        data (dict): Dictionary containing 'about', 'reviews', and 'product_details'

    Returns:
        List[LangchainDocument]: List of processed document chunks
    """
    documents = []

    # Add product about and reviews
    documents += [LangchainDocument(page_content=about)
                  for about in data.get("about", [])]
    documents += [LangchainDocument(page_content=review)
                  for review in data.get("reviews", [])]

    # Add product details
    product_details = data.get("product_details", {})
    if "name" in product_details:
        documents.append(LangchainDocument(
            page_content=f"name : {product_details['name']}"))
    if "price" in product_details:
        documents.append(LangchainDocument(
            page_content=f"price : {product_details['price']}"))
    if "rating" in product_details:
        documents.append(LangchainDocument(
            page_content=f"Rating : {product_details['rating']}"))
    if "image" in product_details:
        documents.append(LangchainDocument(
            page_content=f"Image link : {product_details['image']}"))

    return documents


def split_documents(
    chunk_size: int,
    raw_documents: List[LangchainDocument],
    tokenizer_name: str
) -> List[LangchainDocument]:
    """
    Splits documents into smaller chunks using HuggingFace tokenizer-aware splitter.

    Args:
        chunk_size (int): Maximum chunk size in tokens
        raw_documents (List[LangchainDocument]): Documents to split
        tokenizer_name (str): Pretrained tokenizer name

    Returns:
        List[LangchainDocument]: Chunked and deduplicated documents
    """
    tokenizer = AutoTokenizer.from_pretrained(tokenizer_name)

    text_splitter = RecursiveCharacterTextSplitter.from_huggingface_tokenizer(
        tokenizer,
        chunk_size=chunk_size,
        chunk_overlap=int(chunk_size / 10),
        add_start_index=True,
        strip_whitespace=True,
        separators=[
            "\n#{1,6}", "```\n", "\n\\\\\\*+\n", "\n---+\n", "\n_+\n", "\n\n", "\n", " ", ""
        ],
    )

    all_chunks = []
    for doc in raw_documents:
        all_chunks.extend(text_splitter.split_documents([doc]))

    # Deduplicate by content
    seen = set()
    unique_docs = []
    for doc in all_chunks:
        if doc.page_content not in seen:
            seen.add(doc.page_content)
            unique_docs.append(doc)

    return unique_docs


def generate_embeddings(
    docs: List[LangchainDocument],
    model_name: str = "thenlper/gte-small"
) -> List[List[float]]:
    """
    Generates dense vector embeddings for a list of documents.

    Args:
        docs (List[LangchainDocument]): Documents to embed
        model_name (str): HuggingFace model for embedding

    Returns:
        List[List[float]]: List of vector embeddings
    """
    embedding_model = HuggingFaceEmbeddings(
        model_name=model_name,
        encode_kwargs={"normalize_embeddings": True}
    )

    logger.info("Generating embeddings...")
    embeddings = embedding_model.embed_documents(
        [doc.page_content for doc in docs])
    logger.info(
        f"Generated {len(embeddings)} embeddings using model {model_name}")
    return embeddings


def process_data_for_embedding(
    data: dict,
    tokenizer_name: str = "thenlper/gte-small",
    chunk_size: int = 512
) -> Tuple[List[LangchainDocument], List[List[float]]]:
    """
    Full pipeline: builds documents, splits them, and generates embeddings.

    Args:
        data (dict): Input product data
        tokenizer_name (str): Tokenizer used for splitting text
        chunk_size (int): Token chunk size

    Returns:
        Tuple[List[LangchainDocument], List[List[float]]]: Split documents and their corresponding embeddings
    """
    raw_docs = build_raw_knowledge_base(data)
    split_docs = split_documents(chunk_size, raw_docs, tokenizer_name)
    embeddings = generate_embeddings(split_docs, model_name=tokenizer_name)
    return split_docs, embeddings
