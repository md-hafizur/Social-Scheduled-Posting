from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..schemas import AnalyticsSummary, AIInsight
from .. import crud
# from ..ai_helper import generate_analytics_insight

router = APIRouter()

@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(
    days: Optional[int] = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get analytics summary with AI insights"""
    try:
        # Get basic post statistics
        posts_summary = crud.get_posts_summary(db)
        platform_stats = crud.get_platform_stats(db)
        recent_posts = crud.get_recent_posts(db, limit=5)
        
        # Parse JSON fields for recent posts
        for post in recent_posts:
            if isinstance(post.platforms, str):
                try:
                    import json
                    post.platforms = json.loads(post.platforms)
                except:
                    post.platforms = []
        
        return AnalyticsSummary(
            posts_published=posts_summary["posts_published"],
            posts_scheduled=posts_summary["posts_scheduled"],
            posts_failed=posts_summary["posts_failed"],
            total_posts=posts_summary["total_posts"],
            platform_stats=platform_stats,
            recent_posts=recent_posts
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics: {str(e)}")

@router.get("/insight", response_model=AIInsight)
async def get_ai_insight(db: Session = Depends(get_db)):
    """Get AI-generated insights for social media performance"""
    try:
        # Get current data
        posts_summary = crud.get_posts_summary(db)
        
        # Generate AI insight
        insight_data = await generate_analytics_insight(posts_summary)
        
        return AIInsight(
            insight=insight_data["insight"],
            recommendations=insight_data["recommendations"],
            best_performing_platform=insight_data.get("best_performing_platform")
        )
        
    except Exception as e:
        # Return fallback insight if AI fails
        return AIInsight(
            insight="Your social media analytics show room for growth. Focus on consistent posting and engagement.",
            recommendations=[
                "Schedule posts during peak hours (9-10 AM, 7-9 PM)",
                "Use trending hashtags relevant to your content",
                "Monitor post performance and adjust strategy accordingly"
            ],
            best_performing_platform="Twitter"
        )

@router.get("/platform/{platform}")
def get_platform_analytics(platform: str, db: Session = Depends(get_db)):
    """Get analytics for a specific platform"""
    # Mock platform-specific analytics
    mock_data = {
        "platform": platform,
        "total_posts": 25,
        "engagement_rate": 4.2,
        "average_likes": 45,
        "average_shares": 12,
        "top_performing_posts": [
            {
                "id": 1,
                "content": "Great engagement on this post!",
                "likes": 89,
                "shares": 23,
                "created_at": datetime.now().isoformat()
            }
        ],
        "best_posting_times": ["9:00 AM", "7:00 PM"],
        "hashtag_performance": [
            {"hashtag": "#marketing", "usage_count": 5, "avg_engagement": 4.8},
            {"hashtag": "#socialmedia", "usage_count": 8, "avg_engagement": 3.9}
        ]
    }
    
    return JSONResponse(content=mock_data)

@router.get("/trends")
def get_engagement_trends(
    days: int = Query(7, description="Number of days for trend analysis"),
    db: Session = Depends(get_db)
):
    """Get engagement trends over time"""
    # Generate mock trend data
    from datetime import date
    import random
    
    trends = []
    for i in range(days):
        trend_date = date.today() - timedelta(days=i)
        trends.append({
            "date": trend_date.isoformat(),
            "posts_published": random.randint(1, 5),
            "total_engagement": random.randint(50, 300),
            "avg_engagement_rate": round(random.uniform(2.0, 6.0), 2)
        })
    
    trends.reverse()  # Show oldest to newest
    return JSONResponse(content={"trends": trends})

