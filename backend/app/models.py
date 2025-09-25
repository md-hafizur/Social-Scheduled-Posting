from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class ScheduledPost(Base):
    __tablename__ = "scheduled_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    image_url = Column(String(500))
    platforms = Column(JSON)  # ["twitter", "facebook", "instagram"]
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(String(50), default="scheduled")  # scheduled, published, failed, partially_published
    hashtags = Column(Text)  # AI-suggested hashtags
    created_at = Column(DateTime, default=datetime.utcnow)
    published_at = Column(DateTime)
    error_message = Column(Text)

class ProductCustomization(Base):
    __tablename__ = "product_customizations"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String(100), nullable=False, default="tshirt-001")
    custom_text = Column(Text)
    text_position = Column(JSON)  # {"x": 100, "y": 200}
    text_style = Column(JSON)  # {"font": "Arial", "size": 16, "color": "#000", "weight": "normal"}
    created_at = Column(DateTime, default=datetime.utcnow)
    image_url = Column(String(500))  # Generated customization preview

class PostAnalytics(Base):
    __tablename__ = "post_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer)
    platform = Column(String(50))
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    engagement_rate = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)