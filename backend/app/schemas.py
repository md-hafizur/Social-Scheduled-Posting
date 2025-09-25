from pydantic import BaseModel, validator
from datetime import datetime
from typing import List, Optional, Dict, Any
import json

class PostBase(BaseModel):
    content: str
    platforms: List[str]
    scheduled_time: datetime
    hashtags: Optional[str] = None

class PostCreate(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    status: str
    image_url: Optional[str] = None
    created_at: datetime
    published_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

class HashtagSuggestion(BaseModel):
    content: str

class HashtagResponse(BaseModel):
    hashtags: List[str]

class BestTimeResponse(BaseModel):
    recommendation: str
    optimal_times: List[str]

class CustomizationBase(BaseModel):
    product_id: str = "tshirt-001"
    custom_text: str
    text_position: Dict[str, float]
    text_style: Dict[str, Any]

class CustomizationCreate(CustomizationBase):
    image_data: Optional[str] = None

class CustomizationResponse(CustomizationBase):
    id: int
    created_at: datetime
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class AnalyticsSummary(BaseModel):
    posts_published: int
    posts_scheduled: int
    posts_failed: int
    total_posts: int
    platform_stats: List[Dict[str, Any]]
    recent_posts: List[PostResponse]

class AIInsight(BaseModel):
    insight: str
    recommendations: List[str]
    best_performing_platform: Optional[str] = None