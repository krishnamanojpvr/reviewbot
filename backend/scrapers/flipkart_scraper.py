import time
from typing import Dict, List, Optional
from playwright.sync_api import Page, TimeoutError

class FlipkartScraper:
    def __init__(self, page: Page):
        self.page = page
        self.timeout = 10000  

    def most_recent(self) -> bool:
        """Gtting reviews that are 'Most Recent'"""
        try:
            self.page.wait_for_selector("select.OZuttk.JEZ5ey", timeout=self.timeout)
            self.page.select_option("select.OZuttk.JEZ5ey", 'MOST_RECENT')
            time.sleep(2) 
            return True
        except Exception as e:
            print(f"Error clicking MOST RECENT: {e}")
            return False

    def get_product_details(self) -> Dict[str, str]:
        """Get basic product details"""
        try:
            self.page.wait_for_selector("h1._6EBuvT", timeout=self.timeout)
            product_name = " ".join([
                span.inner_text() 
                for span in self.page.query_selector_all("h1._6EBuvT span")
            ]).strip()

            price = self.page.locator("div.Nx9bqj.CxhGGd").first.inner_text()
            rating = self.page.locator("div._5OesEi.HDvrBb span.Y1HWO0").first.inner_text()
            image_url = self.page.locator("div.vU5WPQ img").first.get_attribute("src")

            return {
                "name": product_name,
                "image": image_url,
                "price": price,
                "rating": rating,
            }
        except Exception as e:
            print(f"Error getting product details: {e}")
            return {}

    def get_product_highlights(self) -> List[str]:
        """Get product highlights"""
        try:
            self.page.wait_for_selector("div.DOjaWF", timeout=self.timeout)
            highlights_div = self.page.query_selector("div.DOjaWF")
            highlights_list = highlights_div.query_selector("div.xFVion")
            if highlights_div and highlights_list:
                ul_element = highlights_list.query_selector("ul")
                if ul_element:
                    return [li.inner_text().strip() for li in ul_element.query_selector_all("li._7eSDEz")]
            return []
        except Exception as e:
            print(f"Error getting highlights: {e}")
            return []

    def _expand_specifications(self) -> bool:
        """Helper to expand specifications sections"""
        try:
            read_more = self.page.locator("button.QqFHMw._4FgsLt").first
            if read_more.is_visible():
                read_more.click()
                time.sleep(1)
                return True
                
            plus_button = self.page.locator("div._5Pmv5S img").first
            if plus_button.is_visible():
                plus_button.click()
                time.sleep(1)
                return True
                
            return False
        except:
            return False

    def get_product_specifications(self) -> Dict[str, Dict[str, str]]:
        """Get product specifications in structured format"""
        try:
            self.page.wait_for_selector("div._3Fm-hO", timeout=self.timeout)
            self._expand_specifications()

            specs_divs = self.page.query_selector_all("div.GNDEQ-")
            if specs_divs:
                specifications = {}
                for div in specs_divs:
                    category = div.query_selector("div._4BJ2V\\+").inner_text() if div.query_selector("div._4BJ2V\\+") else "Unknown"
                    specs = {}
                    for row in div.query_selector_all("tr.WJdYP6.row"):
                        key = row.query_selector("td.\\+fFi1w.col.col-3-12").inner_text() if row.query_selector("td.\\+fFi1w.col.col-3-12") else "Unknown"
                        value = row.query_selector("td.Izz52n.col.col-9-12").inner_text() if row.query_selector("td.Izz52n.col.col-9-12") else "Unknown"
                        specs[key.strip()] = value.strip()
                    specifications[category.strip()] = specs
                return specifications

            return {"error": "No specifications found"}
        except Exception as e:
            print(f"Error getting specifications: {e}")
            return {"error": str(e)}

    def _navigate_to_reviews(self) -> bool:
        """Navigate to the all reviews page"""
        try:
            self.page.wait_for_selector("a:has(div._23J90q)", timeout=self.timeout)
            reviews_link = self.page.locator("a:has(div._23J90q)").first
            if reviews_link.is_visible():
                reviews_link.click()
                self.page.wait_for_selector("div.EKFha-", timeout=self.timeout)
                time.sleep(2)
                return True
            return False
        except:
            return False

    def _extract_review(self, container) -> Optional[Dict[str, str]]:
        """Extract individual review data"""
        try:
            title_element = container.query_selector("div.row div")
            title = title_element.inner_text().strip() if title_element else "No Title"
            title = title.replace("\n", "")[1:] if title.startswith("\n") else title

            if not title:
                para = container.query_selector("p.z9E0IG")
                title = para.inner_text().strip() if para else "No Title"

            review_element = container.query_selector("div.row div.ZmyHeo")
            review_text = review_element.inner_text().strip() if review_element else "No Review Text"
            
            if review_text in ["READ MORE", title]:
                review_text = "No Review Text"

            rating_element = container.query_selector("div.XQDdHH.Ga3i8K")
            rating = rating_element.inner_text().strip() if rating_element else "No Rating"

            return {
                "title": title,
                "review": review_text,
                "stars": rating
            }
        except Exception as e:
            print(f"Error extracting review: {e}")
            return None

    def get_product_reviews(self, max_pages: int = 5) -> List[str]:
        """Get product reviews with pagination"""
        reviews = []
        
        if not self._navigate_to_reviews():
            print("Could not navigate to reviews page")
            return reviews

        self.most_recent()

        for page_num in range(1, max_pages + 1):
            try:
                self.page.wait_for_selector("div.EKFha-", timeout=self.timeout)
                containers = self.page.query_selector_all("div.EKFha-")
                
                for container in containers:
                    review = self._extract_review(container)
                    if review:
                        # review.pop("stars", None)
                        # review.pop("title", None)  
                        reviews.append(review['review'])

                next_button = self.page.locator("a._9QVEpD:has(span:has-text('Next'))").first
                if not next_button.is_visible() or page_num == max_pages:
                    break
                next_button.click()
                time.sleep(2)
                
            except TimeoutError:
                print(f"Timeout waiting for reviews on page {page_num}")
                break
            except Exception as e:
                print(f"Error processing page {page_num}: {e}")
                break

        return reviews