from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
import json
from datetime import datetime, timedelta
import base64
import uuid
import os

from . import models, schemas

# Posts CRUD
def create_post(db: Session, post: schemas.PostCreate, image_url: Optional[str] = None):
    platforms_json = json.dumps(post.platforms) if isinstance(post.platforms, list) else post.platforms
    
    db_post = models.ScheduledPost(
        content=post.content,
        platforms=platforms_json,
        scheduled_time=post.scheduled_time,
        hashtags=post.hashtags,
        image_url=image_url
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_posts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ScheduledPost).offset(skip).limit(limit).all()

def get_post(db: Session, post_id: int):
    return db.query(models.ScheduledPost).filter(models.ScheduledPost.id == post_id).first()

def update_post_status(db: Session, post_id: int, status: str, error_message: Optional[str] = None):
    db_post = db.query(models.ScheduledPost).filter(models.ScheduledPost.id == post_id).first()
    if db_post:
        db_post.status = status
        if error_message:
            db_post.error_message = error_message
        if status == "published":
            db_post.published_at = datetime.utcnow()
        db.commit()
        db.refresh(db_post)
    return db_post

def get_posts_by_status(db: Session, status: str):
    return db.query(models.ScheduledPost).filter(models.ScheduledPost.status == status).all()

# Product Customizations CRUD
def create_customization(db: Session, customization: schemas.CustomizationCreate, image_data: Optional[str] = None):
    image_url = None
    if image_data:
        try:
            # Decode base64 image data
            header, encoded = image_data.split(",", 1)
            binary_data = base64.b64decode(encoded)

            # Generate unique filename
            filename = f"{uuid.uuid4()}.png"
            file_path = os.path.join("uploads", filename)

            # Save the image
            with open(file_path, "wb") as f:
                f.write(binary_data)
            image_url = f"/{file_path}"
        except Exception as e:
            print(f"Error saving image: {e}")
            # Continue without image if saving fails

    db_customization = models.ProductCustomization(
        product_id=customization.product_id,
        custom_text=customization.custom_text,
        text_position=json.dumps(customization.text_position),
        text_style=json.dumps(customization.text_style),
        image_url=image_url
    )
    db.add(db_customization)
    db.commit()
    db.refresh(db_customization)
    return db_customization

def get_customizations(db: Session, skip: int = 0, limit: int = 20):
    return db.query(models.ProductCustomization).order_by(desc(models.ProductCustomization.created_at)).offset(skip).limit(limit).all()

def get_customization(db: Session, customization_id: int):
    return db.query(models.ProductCustomization).filter(models.ProductCustomization.id == customization_id).first()

# Analytics CRUD
def get_posts_summary(db: Session):
    published = db.query(models.ScheduledPost).filter(models.ScheduledPost.status == "published").count()
    scheduled = db.query(models.ScheduledPost).filter(models.ScheduledPost.status == "scheduled").count()
    failed = db.query(models.ScheduledPost).filter(models.ScheduledPost.status == "failed").count()
    total = published + scheduled + failed
    
    return {
        "posts_published": published,
        "posts_scheduled": scheduled,
        "posts_failed": failed,
        "total_posts": total
    }

def get_platform_stats(db: Session):
    # This would need more complex JSON querying in production
    # For now, return mock data
    return [
        {"platform": "Twitter", "count": 15},
        {"platform": "Facebook", "count": 12},
        {"platform": "Instagram", "count": 8}
    ]

def get_recent_posts(db: Session, limit: int = 10):
    return db.query(models.ScheduledPost).order_by(desc(models.ScheduledPost.created_at)).limit(limit).all()

def create_post_analytics(db: Session, post_id: int, platform: str, views: int = 0, likes: int = 0, shares: int = 0):
    analytics = models.PostAnalytics(
        post_id=post_id,
        platform=platform,
        views=views,
        likes=likes,
        shares=shares,
        engagement_rate=(likes + shares) / max(views, 1) * 100
    )
    db.add(analytics)
    db.commit()
    db.refresh(analytics)