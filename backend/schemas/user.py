from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from werkzeug.security import generate_password_hash


class ProductDetails(BaseModel):
    productId: str
    name: str
    image: str
    price: str
    rating: float


class ReviewSummary(BaseModel):
    reviewCount: int
    summaryText: str
    wordCount: int


class SentimentSummary(BaseModel):
    avg_score: float
    negative: int
    neutral: int
    positive: int
    scores: List[float]


class RecentSearch(BaseModel):
    product_details: ProductDetails
    review_summary: ReviewSummary
    sentiment_summary: SentimentSummary
    created_at: datetime = Field(default_factory=datetime.now)


class User(BaseModel):
    username: str
    password: str
    recentSearches: Optional[List[dict]] = Field(default_factory=list, max_items=2) 

    # Auto-hash password
    @field_validator("password")
    def hash_password(cls, v: str) -> str:
        """Automatically hash passwords before saving."""
        return generate_password_hash(v)
