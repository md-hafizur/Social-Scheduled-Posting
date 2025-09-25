from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os
import uuid
from datetime import datetime
import aiofiles

from ..database import get_db
from ..models import ScheduledPost
from ..schemas import PostCreate, PostResponse, HashtagSuggestion, HashtagResponse, BestTimeResponse
from .. import crud
from ..scheduler import schedule_post, get_scheduled_jobs, publish_post
from datetime import datetime, timedelta

router = APIRouter()

def parse_platforms(platforms: str):
    try:
        # Try JSON first (e.g. '["facebook","twitter"]')
        return json.loads(platforms)
    except json.JSONDecodeError:
        # Fallback: split by comma (e.g. 'facebook,twitter')
        return [p.strip() for p in platforms.split(",") if p.strip()]

# Ensure upload directory exists
UPLOAD_DIR = "uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=PostResponse)
async def create_scheduled_post(
    content: str = Form(...),
    platforms: str = Form(...),
    scheduled_time: str = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Create a new scheduled post"""
    try:
        # Parse platforms JSON
        platforms_list = parse_platforms(platforms=platforms)
        
        # Parse datetime
        scheduled_dt = datetime.fromisoformat(scheduled_time.replace('Z', '+00:00'))
        current_time = datetime.now()        
        # Handle image upload
        image_url = None
        if image:
            # Generate unique filename
            file_extension = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content_bytes = await image.read()
                await f.write(content_bytes)
            
            image_url = f"/uploads/{unique_filename}"
        
        # Create post
        post_data = PostCreate(
            content=content,
            platforms=platforms_list,
            scheduled_time=scheduled_dt
        )
        
        db_post = crud.create_post(db, post_data, image_url)
        
        # Schedule the post
        schedule_post(db_post.id, scheduled_dt)
        
        # Parse platforms JSON for response
        if isinstance(db_post.platforms, str):
            try:
                db_post.platforms = json.loads(db_post.platforms)
            except json.JSONDecodeError:
                db_post.platforms = []

        return db_post
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid platforms JSON")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid datetime format: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating post: {str(e)}")

@router.get("/", response_model=List[PostResponse])
def get_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all scheduled posts"""
    posts = crud.get_posts(db, skip=skip, limit=limit)
    
    # Parse platforms JSON for each post
    for post in posts:
        if isinstance(post.platforms, str):
            try:
                post.platforms = json.loads(post.platforms)
            except json.JSONDecodeError:
                post.platforms = []
    
    return posts[::-1]