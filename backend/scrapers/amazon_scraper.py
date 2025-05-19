from typing import Dict, List, Optional
from playwright.async_api import Page, TimeoutError


class AmazonScraper:
    def __init__(self, page: Page):
        self.page = page
        self.timeout = 10000

    async def _safe_query(self, selector: str, attribute: str = None) -> Optional[str]:
        """Safe element query with error handling"""
        try:
            element = await self.page.query_selector(selector)
            if not element:
                return None
            if attribute:
                return await element.get_attribute(attribute)
            return (await element.inner_text()).strip()
        except Exception:
            return None

    async def get_product_details(self) -> Dict[str, Optional[str]]:
        """Get basic product details with multiple fallback selectors"""
        try:
            product_name = await self._safe_query("#productTitle") or await self._safe_query("#title")

            price_selectors = [
                ".a-price-whole",
                ".priceToPay span.a-price-whole",
                "#priceblock_ourprice",
                "#priceblock_dealprice"
            ]

            product_price = None
            for selector in price_selectors:
                price = await self._safe_query(selector)
                if price:
                    product_price = price
                    break

            rating_element = await self.page.query_selector("i.a-icon-star span.a-icon-alt")
            product_rating = (await rating_element.inner_text()).strip() if rating_element else None

            image_url = (await self._safe_query("#landingImage", "src") or
                         await self._safe_query("#imgBlkFront", "src") or
                         await self._safe_query("#main-image", "src"))

            return {
                "name": product_name,
                "price": product_price,
                "rating": product_rating,
                "image": image_url,
            }
        except Exception as e:
            print(f"Error getting product details: {e}")
            return {}

    async def get_product_about(self) -> List[str]:
        """Get product about section with more robust selectors"""
        try:
            await self.page.wait_for_selector("#feature-bullets", timeout=self.timeout)

            feature_items = (await self.page.query_selector_all('#feature-bullets .a-unordered-list .a-list-item') or
                             await self.page.query_selector_all('#feature-bullets ul.a-vertical .a-list-item'))

            return [await item.inner_text() for item in feature_items if await item.inner_text()]

        except Exception as e:
            print(f"Error getting product about: {e}")
            return []

    async def get_product_overview_features(self) -> List[str]:
        """Get product overview features with table parsing"""
        highlights = []
        try:
            try:
                await self.page.wait_for_selector(
                    "#productOverview_feature_div table.a-normal",
                    timeout=5000
                )
                rows = await self.page.query_selector_all(
                    "#productOverview_feature_div table.a-normal tr"
                )
            except TimeoutError:
                await self.page.wait_for_selector(
                    "table#productDetails_detailBullets_sections1",
                    timeout=5000
                )
                rows = await self.page.query_selector_all(
                    "table#productDetails_detailBullets_sections1 tr"
                )

            for row in rows:
                cells = await row.query_selector_all("td")
                if len(cells) == 2:
                    key = (await cells[0].inner_text()).strip().rstrip(":")
                    value = (await cells[1].inner_text()).strip()
                    if key and value:
                        highlights.append(f"{key}: {value}")

        except Exception as e:
            print(f"Error while scraping product highlights: {e}")

        return highlights

    async def get_product_reviews(self) -> List[str]:
        """Get product reviews (without pagination)"""
        try:
            reviews = []
            await self.page.wait_for_selector("li[data-hook='review']")
            reviews_on_page = self.page.locator("li[data-hook='review']")
            count = await reviews_on_page.count()

            for i in range(count):
                review = reviews_on_page.nth(i)
                review_body = await review.locator("span[data-hook='review-body']").inner_text()
                reviews.append(review_body)

        except Exception as e:
            print(f"Error occurred: {e}")
            return []

        return reviews
