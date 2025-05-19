from huggingface_hub import InferenceClient
from typing import List, Dict
import os

MODEL_NAME = "cardiffnlp/twitter-roberta-base-sentiment"
client = InferenceClient(
    model=MODEL_NAME, token=os.getenv("HF_TOKEN")
)


def analyze_sentiment(reviews: List[str]) -> Dict[str, float]:
    """
    Analyze sentiment via Hugging Face Inference API
    """
    results = {"positive": 0, "negative": 0, "neutral": 0, "scores": []}
    MAX_REVIEW_CHARS = 1000

    try:
        for review in reviews:
            truncated_review = review[:MAX_REVIEW_CHARS]
            response = client.text_classification(truncated_review)

            top_result = response[0]
            label = top_result.label.lower()
            score = top_result.score

            if "negative" in label:
                results["negative"] += 1
            elif "neutral" in label:
                results["neutral"] += 1
            else:
                results["positive"] += 1

            results["scores"].append(score)

        results["average_score"] = (
            sum(results["scores"]) /
            len(results["scores"]) if results["scores"] else 0.0
        )
        return results
    except Exception as e:
        print(f"Error in sentiment analysis: {e}")
        return {"error": str(e)}


# !local model
# from transformers import AutoModelForSequenceClassification, AutoTokenizer
# import numpy as np
# from scipy.special import softmax
# import torch

# # Initialize model and tokenizer once (cache globally)
# MODEL_NAME = "cardiffnlp/twitter-roberta-base-sentiment"
# tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
# model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

# def analyze_sentiment(reviews: list[str]) -> dict:
#     """
#     Analyze sentiment for a batch of product reviews.
#     Returns:
#         {
#             "positive": int,
#             "negative": int,
#             "neutral": int,
#             "average_score": float
#         }
#     """
#     results = {"positive": 0, "negative": 0, "neutral": 0, "scores": []}


#     for text in reviews:
#         encoded_input = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
#         with torch.no_grad():
#             output = model(**encoded_input)

#         scores = softmax(output.logits[0].numpy())
#         predicted_label = np.argmax(scores)

#         if predicted_label == 0:
#             results["negative"] += 1
#         elif predicted_label == 1:
#             results["neutral"] += 1
#         else:
#             results["positive"] += 1
#         results["scores"].append(float(scores[predicted_label]))

#     results["average_score"] = float(np.mean(results["scores"])) if results["scores"] else 0.0
#     return results
