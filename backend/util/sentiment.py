from models.sentiment import analyze_sentiment


async def sentiment(reviews=None):
    """
    Analyzes the sentiment of the reviews using a sentiment analysis model.
    Args:
        reviews (list): List of reviews to analyze.
    Returns:
        dict: A dictionary containing the sentiment analysis results.
    """
    if not reviews:
        return {"error": "No reviews provided for Sentiment Analysis"}, 400
    try:
        results = analyze_sentiment(reviews)
        return results, 200
    except Exception as e:
        return {"error": f"Error occurred in Sentiment Analysis: {e}"}, 500
