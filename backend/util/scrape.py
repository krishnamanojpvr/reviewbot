from playwright.async_api import async_playwright
from scrapers.amazon_scraper import AmazonScraper


async def scrape(url):
    response = {}
    status_code = 500

    try:
        async with async_playwright() as p:
            browser = await p.firefox.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()

            await page.set_extra_http_headers({
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/91.0.4472.124 Safari/537.36"
                )
            })

            await page.goto(url)

            if "amazon" in url:
                amazon_scraper = AmazonScraper(page)
                product_details = await amazon_scraper.get_product_details()
                # overview = await amazon_scraper.get_product_overview_features()
                about = await amazon_scraper.get_product_about()
                reviews = await amazon_scraper.get_product_reviews()

                response = {
                    "product_details": product_details,
                    # "overview": overview,
                    "about": about,
                    "reviews": reviews,
                    "success": True
                }
                status_code = 200

    

            else:
                response = {"error": "Unsupported URL", "success": False}
                status_code = 400

            await browser.close()
            return response, status_code

    except Exception as e:
        return {"error": f"Error occurred in Scraping Data: {e}"}, 500
