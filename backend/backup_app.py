from flask import Flask, request, jsonify
from playwright.sync_api import sync_playwright
from flask_cors import CORS
from werkzeug.security import check_password_hash
from util.jwt_auth import create_access_token, verify_token
from schemas.user import User
from scrapers.amazon_scraper import AmazonScraper
# from scrapers.flipkart_scraper import FlipkartScraper
from models.sentiment import analyze_sentiment
from models.summarize import summarize_reviews
from dotenv import load_dotenv
from util.db import connect_to_mongo 

app = Flask(__name__)
CORS(app)







@app.route('/scrape', methods=['POST'])
def scrape():
    url = request.json.get('url')
    if not url:
        return jsonify({"error": "URL not provided"}), 400

    response = {}
    statusCode = 500

    try:
        with sync_playwright() as p:
            browser = p.firefox.launch(headless=True)
            context = browser.new_context()
            page = context.new_page()
            page.set_extra_http_headers({
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            })
            page.goto(url)

            if "amazon" in url:
                amazon_scraper = AmazonScraper(page)
                product_details = amazon_scraper.get_product_details()
                # overview = amazon_scraper.get_product_overview_features()
                about = amazon_scraper.get_product_about()
                reviews = amazon_scraper.get_product_reviews()
                response = {
                    'product_details': product_details,
                    # 'overview': overview,
                    'about': about,
                    'reviews': reviews,
                    'success': True
                }
                statusCode = 200

            # elif "flipkart" in url:
            #     flipkart_scraper = FlipkartScraper(page)
            #     product_details = flipkart_scraper.get_product_details()
            #     specs = flipkart_scraper.get_specifications()
            #     high = flipkart_scraper.get_highlights()
            #     reviews = flipkart_scraper.get_reviews()
            #     response = {
            #         'product_details': product_details,
            #         'specifications': specs,
            #         'highlights': high,
            #         'reviews': reviews
            #     }

            else:
                response = {"error": "Unsupported URL", "success": False}
                statusCode = 400

            browser.close()
            return jsonify(response), statusCode

    except Exception as e:
        print(e)
        return jsonify({"error": f"Error occurred: {e}"}), 500


@app.route('/sentiment', methods=['POST'])
def sentiment():
    reviews = request.json.get('reviews')
    if not reviews:
        return jsonify({"error": "No reviews provided"}), 400

    try:
        results = analyze_sentiment(reviews)
        return jsonify(results), 200
    except Exception as e:
        print(e)
        return jsonify({"error": f"Error occurred: {e}"}), 500


@app.route('/summarize', methods=['POST'])
def summarize():
    reviews = request.json.get('reviews')
    if not reviews:
        return jsonify({"error": "No reviews provided"}), 400

    try:
        summary = summarize_reviews(reviews)
        return jsonify({"summary": summary}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": f"Error occurred: {e}"}), 500







if __name__ == '__main__':
    app.run(debug=True, port=5000, host="0.0.0.0")
