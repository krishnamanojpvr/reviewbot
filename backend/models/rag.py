from langchain.docstore.document import Document as langchainDocument
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from transformers import AutoTokenizer,AutoModelForCausalLM
from huggingface_hub import InferenceClient
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
hf_token = os.getenv("HF_TOKEN")

def split_documents(chunk_size, raw_knowledge_base, tokenizer_name):
    text_splitter = RecursiveCharacterTextSplitter.from_huggingface_tokenizer(
        AutoTokenizer.from_pretrained(tokenizer_name),
        chunk_size=chunk_size,
        chunk_overlap=int(chunk_size / 10),
        add_start_index=True,
        strip_whitespace=True,
        separators=[
            "\n#{1,6}", "```\n", "\n\\\\\\*+\n", "\n---+\n", "\n_+\n", "\n\n", "\n", " ", ""
        ],
    )
    docs_processed = []
    for doc in raw_knowledge_base:
        docs_processed += text_splitter.split_documents([doc])

    unique_texts = {}
    docs_processed_unique = []
    for doc in docs_processed:
        if doc.page_content not in unique_texts:
            unique_texts[doc.page_content] = True
            docs_processed_unique.append(doc)
    return docs_processed_unique

RAW_KNOWLEDGE_BASE = [langchainDocument(page_content=about) for about in data["about"]]
RAW_KNOWLEDGE_BASE += [langchainDocument(page_content=review) for review in data["reviews"]]
RAW_KNOWLEDGE_BASE += [langchainDocument(page_content="name : " + data["product_details"]["name"])]
RAW_KNOWLEDGE_BASE += [langchainDocument(page_content= "price : " + data["product_details"]["price"])]
RAW_KNOWLEDGE_BASE += [langchainDocument(page_content= "Rating : " + data["product_details"]["rating"])]
RAW_KNOWLEDGE_BASE += [langchainDocument(page_content= "Image link : " + data["product_details"]["image"])]

docs_processed = split_documents(512, RAW_KNOWLEDGE_BASE, "thenlper/gte-small")

embedding_model = HuggingFaceEmbeddings(
    model_name="thenlper/gte-small",
    encode_kwargs={"normalize_embeddings": True} # this normalizes the embeddings between -1 and 1. This is done to use cosine distance similariity search
)


vec_embeddings = embedding_model.embed_documents([doc.page_content for doc in docs_processed])
logger.info(len(vec_embeddings[0]),len(docs_processed) ,embedding_model.model_name,embedding_model.encode_kwargs,embedding_model.cache_folder)

db = FAISS.from_documents(
    docs_processed,
    embedding_model,
    distance_strategy=DistanceStrategy.COSINE
)

client = InferenceClient(
    model="mistralai/Mistral-7B-Instruct-v0.3",
    token=hf_token
)

user_query = ""
retrieved_docs = similarity_search(user_query, k=7)

rd_text = [doc.page_content for doc in retrieved_docs]
context = "\nExtracted Documents:\n"
context += "".join(f"\n{doc}\n" for doc in rd_text)

prompt = f"""Using the information of people's reviews and product features contained in the context,
Give a comprehensive answer to the question.
Respond only to the question asked, response should be concise and relevant to the question.
If the answer cannot be deduced from the context, do not give an answer(Do not dirctly say that there is no context  or no information, but say politely).

Context:
{context}
---
Now here is the Question you need to answer.
Question: {user_query}
"""

messages = [{"role": "user", "content": prompt}]
completion = client.chat.completions.create(
        messages=messages,
        max_tokens=500,
        temperature = 0.3

    )
response = completion.choices[0].message["content"]
logger.info(f"Response: {response}")

