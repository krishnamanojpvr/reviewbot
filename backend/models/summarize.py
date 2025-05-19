from huggingface_hub import InferenceClient
from typing import List, Dict, Union
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def summarize_reviews(reviews: List[str]) -> Dict[str, Union[str, int]]:
    """
    Summarizes product reviews using Mistral-7B model via HuggingFace Inference API
    
    Args:
        reviews: List of review strings to summarize
        
    Returns:
        Dictionary containing:
        - summary: Generated summary text
        - word_count: Length of summary in words
        - review_count: Number of reviews processed
        OR error message if failed
    """
    # client = InferenceClient(model="mistralai/Mistral-7B-Instruct-v0.3", token=os.getenv("HF_TOKEN"))
    # client = InferenceClient(model="meta-llama/Llama-3.1-8B-Instruct",token=os.getenv("HF_TOKEN"))
    client = InferenceClient(model="HuggingFaceH4/zephyr-7b-beta",token=os.getenv("HF_TOKEN"))
    logger.info(f"Received {len(reviews)} reviews to summarize")
    
    # Input validation
    if not reviews or not isinstance(reviews, list):
        logger.error("Invalid input - expected non-empty list of reviews")
        return {"error": "Please provide a non-empty list of reviews"}, 400
    
    if not all(isinstance(review, str) for review in reviews):
        logger.error("Invalid input - all reviews must be strings")
        return {"error": "All reviews must be text strings"}, 400

    try:
        reviews_text = "\n".join(f"- {review[:500]}" for review in reviews[:20])  
        prompt = f"""<s>[INST] 
        Analyze these product reviews and create a concise summary that covers all points such that:
        1. Highlights the mentioned positive features
        2. Notes common criticisms or negativities or cons if present
        3. Provides overall sentiment assessment
        4. Uses neutral third-person perspective
        
        Reviews:
        {reviews_text}
        
        Summary: [/INST]"""
        output = client.text_generation(
            prompt=prompt,
            max_new_tokens=250,  
            temperature=0.5,    
            top_p=0.9,
            do_sample=True,
            stop=["</s>"]
        )
        
        summary = output.split("Summary:")[-1].strip()
        summary = summary.replace('"', "'") 
        word_count = len(summary.split())
        
        logger.info(f"Successfully generated {word_count}-word summary")
        return {
            "summary_text": summary,
            "word_count": word_count,
            "review_count": len(reviews)
        }
        
    except Exception as e:
        logger.error(f"Summarization failed: {str(e)}")
        return {"error": "Failed to generate summary. Please try again later."}, 500