# from bson import ObjectId 
from datetime import datetime
from pydantic import BaseModel, Field
from typing import List

class InfoDocument(BaseModel):
    user_id: str  
    productId: str 
    docText: str
    vectors: List[float]
    created_at: datetime = Field(default_factory=datetime.now)