import openai
import os
from typing import List
import random
import asyncio
from dotenv import load_dotenv

load_dotenv()

# Set OpenAI API key from environment
openai.api_key = os.getenv("OPENAI_API_KEY")

async def suggest_hashtags(content: str) -> List[str]:
    """Generate hashtag suggestions using AI or fallback to mock"""
    try:
        if openai.api_key and openai.api_key.startswith('sk-'):
            # Use OpenAI API
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a social media expert. Generate 5-8 relevant hashtags for the given content. Return only hashtags separated by spaces, each starting with #."
                    },
                    {
                        "role": "user", 
                        "content": f"Generate hashtags for this social media post: {content}"
                    }
                ],
                max_tokens=100,
                temperature=0.7
            )
            hashtags_text = response.choices[0].message.content.strip()
            hashtags = [tag.strip() for tag in hashtags_text.split() if tag.startswith('#')]
            return hashtags[:8] if hashtags else generate_mock_hashtags(content)
        else:
            # Fallback to mock hashtags
            return generate_mock_hashtags(content)
    except Exception as e:
        print(f"Error generating hashtags: {e}")
        return generate_mock_hashtags(content)

def generate_mock_hashtags(content: str) -> List[str]:
    """Generate mock hashtags based on content keywords"""
    # Basic keyword extraction and hashtag generation
    words = content.lower().split()
    
    # Common hashtags
    base_hashtags = [
        "#socialmedia", "#content", "#marketing", "#digital", "#brand",
        "#engagement", "#trending", "#viral", "#creative", "#inspiration",
        "#business", "#entrepreneur", "#success", "#motivation", "#growth"
    ]
    
    # Try to create hashtags from content
    content_hashtags = []
    for word in words:
        if len(word) > 4 and word.isalpha():
            content_hashtags.append(f"#{word}")
    
    # Combine and randomize
    all_hashtags = base_hashtags + content_hashtags[:3]
    return random.sample(all_hashtags, min(6, len(all_hashtags)))

async def suggest_best_posting_time() -> dict:
    """Suggest optimal posting time using AI or return best practices"""
    try:
        if openai.api_key and openai.api_key.startswith('sk-'):
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a social media analytics expert. Provide practical advice about the best times to post on social media for maximum engagement."
                    },
                    {
                        "role": "user",
                        "content": "What are the best times to post on social media platforms (Twitter, Facebook, Instagram) for maximum engagement? Give specific time recommendations."
                    }
                ],
                max_tokens=200,
                temperature=0.5
            )
            recommendation = response.choices[0].message.content.strip()
            return {
                "recommendation": recommendation,
                "optimal_times": ["9:00 AM", "1:00 PM", "7:00 PM"]
            }
        else:
            return get_mock_best_times()
    except Exception as e:
        print(f"Error getting best posting time: {e}")
        return get_mock_best_times()

def get_mock_best_times() -> dict:
    """Return mock best posting times based on social media best practices"""
    recommendations = [
        "Based on social media analytics, the best posting times are typically 9-10 AM and 7-9 PM on weekdays for maximum engagement across all platforms.",
        "Tuesday through Thursday between 9 AM - 10 AM and 7 PM - 9 PM show the highest engagement rates.",
        "For maximum reach, consider posting when your audience is most active: weekday mornings (9-10 AM) and evenings (7-9 PM)."
    ]
    
    return {
        "recommendation": random.choice(recommendations),
        "optimal_times": ["9:00 AM", "10:00 AM", "1:00 PM", "7:00 PM", "8:00 PM"]
    }

async def generate_analytics_insight(posts_data: dict) -> dict:
    """Generate AI insights for analytics dashboard"""
    try:
        if openai.api_key and openai.api_key.startswith('sk-'):
            prompt = f"""
            Based on these social media analytics:
            - Published posts: {posts_data.get('posts_published', 0)}
            - Scheduled posts: {posts_data.get('posts_scheduled', 0)}
            - Failed posts: {posts_data.get('posts_failed', 0)}
            
            Provide a brief insight and 2-3 actionable recommendations to improve social media performance.
            """
            
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a social media analytics expert providing actionable insights."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.6
            )
            
            insight = response.choices[0].message.content.strip()
            return {
                "insight": insight,
                "recommendations": [
                    "Schedule posts during peak engagement hours",
                    "Use AI-suggested hashtags to increase reach",
                    "Monitor failed posts and retry with optimized content"
                ]
            }
        else:
            return get_mock_insights(posts_data)
    except Exception as e:
        print(f"Error generating insights: {e}")
        return get_mock_insights(posts_data)

def get_mock_insights(posts_data: dict) -> dict:
    """Generate mock insights based on data"""
    published = posts_data.get('posts_published', 0)
    scheduled = posts_data.get('posts_scheduled', 0)
    failed = posts_data.get('posts_failed', 0)
    total = published + scheduled + failed
    
    if total == 0:
        insight = "You're just getting started! Begin by scheduling your first posts to build your social media presence."
        recommendations = [
            "Create your first scheduled post to get started",
            "Use AI hashtag suggestions for better reach",
            "Schedule posts during peak hours (9-10 AM, 7-9 PM)"
        ]
    elif failed > published:
        insight = f"You have {failed} failed posts vs {published} published. Focus on improving post reliability and content quality."
        recommendations = [
            "Review failed posts and identify common issues",
            "Test posting during different times",
            "Simplify content and reduce special characters"
        ]
    elif scheduled > published:
        insight = f"Great planning! You have {scheduled} posts scheduled. Your posting strategy is well-organized."
        recommendations = [
            "Continue consistent scheduling",
            "Analyze which scheduled times perform best",
            "Add variety to your content types"
        ]
    else:
        success_rate = (published / total) * 100 if total > 0 else 0
        insight = f"Good performance with {success_rate:.1f}% success rate. Focus on scaling your content strategy."
        recommendations = [
            "Increase posting frequency during successful time slots",
            "Experiment with different content formats",
            "Use analytics to optimize hashtag strategy"
        ]
    
    return {
        "insight": insight,
        "recommendations": recommendations,
        "best_performing_platform": "Twitter"  # Mock data
    }