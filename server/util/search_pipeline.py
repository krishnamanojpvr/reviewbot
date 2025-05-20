import logging
from typing import Dict, Any, Tuple
from util.scrape import scrape
from models.sentiment import analyze_sentiment
from models.summarize import summarize_reviews
from models.embedding_processor import embed_documents


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SearchPipeline:
    def __init__(self, url: str):
        self.url = url
        self.data: Dict[str, Any] = {"url": url}
        self.errors: Dict[str, Any] = {}

    async def execute(self) -> Tuple[Dict[str, Any], int]:
        """Execute the search pipeline steps in sequence"""
        try:
            # Step 1: Scrape product data
            await self._scrape_data()
            if "error" in self.data:
                return self._error_response(self.data["error"], 400)

            # Step 2: Analyze sentiment
            await self._analyze_sentiment()
            if "error" in self.data:
                return self._error_response(self.data["error"], 400)

            # Step 3: Generate summary
            await self._generate_summary()
            if "error" in self.data:
                return self._error_response(self.data["error"], 400)

            await self._embed_documents()
            if "error" in self.data:
                return self._error_response(self.data["error"], 400)

            return self.data, 200

        except Exception as e:
            logger.error(f"Pipeline execution failed: {str(e)}")
            return self._error_response(f"Processing error: {str(e)}", 500)

    async def _scrape_data(self):
        """Scrape product data from the URL"""
        try:
            scraping_response, scraping_status = await scrape(self.url)
            if scraping_status != 200:
                self.data["error"] = scraping_response.get(
                    "error", "Scraping failed")
                return

            self.data.update({
                "reviews": scraping_response.get("reviews", []),
                "product_details": {
                    **scraping_response.get("product_details", {}),
                    "about": scraping_response.get("about", [])
                }
            })

            if not self.data["reviews"]:
                self.data["error"] = "No reviews found for this product"

        except Exception as e:
            self.data["error"] = f"Scraping error: {str(e)}"

    async def _analyze_sentiment(self):
        """Analyze sentiment of the reviews"""
        try:
            if not self.data.get("reviews"):
                self.data["error"] = "No reviews available for sentiment analysis"
                return

            sentiment_response = analyze_sentiment(self.data["reviews"])
            if sentiment_response is None:
                self.data["error"] = "Sentiment analysis failed"
                return

            self.data["sentiment_details"] = sentiment_response

        except Exception as e:
            self.data["error"] = f"Sentiment analysis error: {str(e)}"

    async def _generate_summary(self):
        """Generate summary of the reviews"""
        try:
            if not self.data.get("reviews"):
                self.data["error"] = "No reviews available for summarization"
                return

            summary_response = summarize_reviews(self.data["reviews"])
            if summary_response is None:
                self.data["error"] = "Summary generation failed"
                return

            self.data["summary_details"] = summary_response

        except Exception as e:
            self.data["error"] = f"Summary generation error: {str(e)}"

    async def _embed_documents(self):
        """Embed documents using a pre-trained model"""
        try:
            if not self.data.get("product_details") or not self.data.get("reviews"):
                self.data["error"] = "No product details available for embedding"
                return
            about = self.data["product_details"].get("about", [])
            reviews = self.data.get("reviews", [])
            if not about or not reviews:
                self.data["error"] = "No data available for embedding"
                return
            data = about + reviews
            data.append("Name" + self.data["product_details"].get("name", ""))
            data.append("Image Link" + self.data["product_details"].get("image", ""))
            data.append("Price" + self.data["product_details"].get("price", ""))
            data.append("Rating" + self.data["product_details"].get("rating", ""))
            self.data["info_docs"] = embed_documents(data)
            if not self.data["info_docs"]:
                self.data["error"] = "Embedding generation failed"
                return

        except Exception as e:
            self.data["error"] = f"Embedding error: {str(e)}"

    def _error_response(self, error_msg: str, status_code: int) -> Tuple[Dict[str, Any], int]:
        """Format an error response"""
        return {"error": error_msg, "url": self.url}, status_code
