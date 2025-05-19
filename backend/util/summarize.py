from models.summarize import summarize_reviews


async def summarize(reviews=None):
    """
    Summarizes the reviews using a summarization model.
    Args:
        reviews (list): List of reviews to summarize.
    Returns:
        dict: A dictionary containing the summary of the reviews.
    """
    if not reviews:
        return {"error": "No reviews provided for Summarizing Reviews"}, 400
    try:
        summary = summarize_reviews(reviews)
        return {"summary": summary}, 200
    except Exception as e:
        return {"error": f"Error occurred in Summarizing Reviews: {e}"}, 500
