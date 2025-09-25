from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.asyncio import AsyncIOExecutor
from sqlalchemy.orm import Session
from datetime import datetime
import httpx
import logging
import json
import random
import asyncio

from .database import SessionLocal, DATABASE_URL
from .models import ScheduledPost
from . import crud

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure job store
if DATABASE_URL.startswith("sqlite"):
    jobstore_url = DATABASE_URL
else:
    jobstore_url = DATABASE_URL

jobstores = {
    'default': SQLAlchemyJobStore(url=jobstore_url)
}

executors = {
    'default': AsyncIOExecutor(),
}

job_defaults = {
    'coalesce': False,
    'max_instances': 3
}

scheduler = AsyncIOScheduler(
    jobstores=jobstores,
    executors=executors,
    job_defaults=job_defaults
)

# Mock social media APIs endpoints
MOCK_APIS = {
    "twitter": "https://jsonplaceholder.typicode.com/posts",  # Using JSONPlaceholder for mock
    "facebook": "https://jsonplaceholder.typicode.com/posts",
    "instagram": "https://jsonplaceholder.typicode.com/posts"
}

async def publish_post(post_id: int):
    """Publish a scheduled post to social media platforms"""
    logger.info(f"!!!!!!!!!!Entered publish_post for post_id: {post_id}")
    logger.info(f"Attempting to publish post {post_id}")
    db = SessionLocal()
    try:
        post = db.query(ScheduledPost).filter(ScheduledPost.id == post_id).first()
        print("post(((())))",post)
        if not post:
            logger.error(f"Post {post_id} not found")
            return
        
        logger.info(f"Publishing post {post_id} to platforms: {post.platforms}")
        
        # Parse platforms JSON
        if isinstance(post.platforms, str):
            try:
                platforms = json.loads(post.platforms)
            except json.JSONDecodeError:
                try:
                    platforms = eval(post.platforms)
                except:
                    platforms = []
        else:
            platforms = post.platforms
        
        success_count = 0
        total_platforms = len(platforms)
        errors = []
        
        for platform in platforms:
            try:
                success = await mock_publish_to_platform(platform, post)
                if success:
                    success_count += 1
                    logger.info(f"Successfully published to {platform}")
                    
                    # Create mock analytics
                    crud.create_post_analytics(
                        db, 
                        post_id, 
                        platform, 
                        views=random.randint(100, 1000),
                        likes=random.randint(10, 100),
                        shares=random.randint(1, 20)
                    )
                else:
                    error_msg = f"Failed to publish to {platform}"
                    errors.append(error_msg)
                    logger.error(error_msg)
            except Exception as e:
                error_msg = f"Error publishing to {platform}: {str(e)}"
                errors.append(error_msg)
                logger.error(error_msg)
        
        # Update post status
        if success_count == total_platforms:
            status = "published"
        elif success_count > 0:
            status = "partially_published"
        else:
            status = "failed"
        
        error_message = "; ".join(errors) if errors else None
        crud.update_post_status(db, post_id, status, error_message)
        
        logger.info(f"Post {post_id} status updated to: {status}")
        
    except Exception as e:
        logger.error(f"Error publishing post {post_id}: {str(e)}")
        crud.update_post_status(db, post_id, "failed", str(e))
    finally:
        db.close()

async def mock_publish_to_platform(platform: str, post: ScheduledPost) -> bool:
    """Mock function to simulate publishing to social media platforms"""
    logger.info(f"!!!!!!!!!!Entered mock_publish_to_platform for platform: {platform} and post_id: {post.id}")
    try:
        # Simulate API delay
        await asyncio.sleep(random.uniform(0.5, 2.0))
        
        # Prepare mock post data
        post_data = {
            "title": post.content[:50] + "..." if len(post.content) > 50 else post.content,
            "body": post.content,
            "userId": 1
        }
        
        # Make mock API call
        async with httpx.AsyncClient() as client:
            response = await client.post(
                MOCK_APIS.get(platform, MOCK_APIS["twitter"]),
                json=post_data,
                timeout=10.0
            )
            
            # Mock success rate (85% success for realistic simulation)
            mock_success = random.random() > 0.15
            return response.status_code < 400 and mock_success
            
    except Exception as e:
        logger.error(f"Mock API call failed for {platform}: {str(e)}")
        return False

def schedule_post(post_id: int, scheduled_time: datetime):
    """Schedule a post for publishing"""
    logger.info(f"Attempting to schedule post {post_id} for {scheduled_time}")
    try:
        # Remove existing job if it exists
        try:
            scheduler.remove_job(f'post_{post_id}')
        except:
            pass
        
        # Add new job
        scheduler.add_job(
            publish_post,
            'date',
            run_date=scheduled_time,
            args=[post_id],
            id=f'post_{post_id}',
            replace_existing=True
        )
        logger.info(f"Post {post_id} scheduled for {scheduled_time}")
        print(scheduler.get_jobs())
    except Exception as e:
        logger.error(f"Error scheduling post {post_id}: {str(e)}")

def cancel_scheduled_post(post_id: int):
    """Cancel a scheduled post"""
    try:
        scheduler.remove_job(f'post_{post_id}')
        logger.info(f"Cancelled scheduled post {post_id}")
    except Exception as e:
        logger.error(f"Error cancelling post {post_id}: {str(e)}")

def get_scheduled_jobs():
    """Get all scheduled jobs"""
    return scheduler.get_jobs()