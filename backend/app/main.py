from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import os
from contextlib import asynccontextmanager

from .database import engine, Base
from .scheduler import scheduler
from .routes import posts, products, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown"""
    # Startup
    print("Starting Social Media Scheduler API...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Start the scheduler
    if not scheduler.running:
        scheduler.start()
        print("Background scheduler started")
    
    print("Application startup complete")
    
    yield
    
    # Shutdown
    print("Shutting down application...")
    if scheduler.running:
        scheduler.shutdown()
        print("Background scheduler stopped")


# Create FastAPI app with lifespan
app = FastAPI(
    title="Social Media Scheduler API",
    description="AI-powered social media scheduling platform with analytics",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js development server
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # Alternative port
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Static file serving for uploads
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Include API routers
app.include_router(posts.router, prefix="/api/posts", tags=["Posts"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

# Health check endpoints
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Social Media Scheduler API",
        "version": "1.0.0",
        "status": "running",
        "scheduler_status": "running" if scheduler.running else "stopped",
        "endpoints": {
            "posts": "/api/posts",
            "products": "/api/products", 
            "analytics": "/api/analytics",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "scheduler": "running" if scheduler.running else "stopped",
        "database": "connected"
    }

@app.get("/api/status")
async def api_status():
    """Detailed API status"""
    try:
        from .database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "api": "running",
        "database": db_status,
        "scheduler": {
            "running": scheduler.running,
            "jobs_count": len(scheduler.get_jobs())
        },
        "features": {
            "post_scheduling": True,
            "ai_hashtags": True,
            "product_customization": True,
            "analytics": True
        }
    }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {"error": "Not found", "message": "The requested resource was not found"}

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return {"error": "Internal server error", "message": "An internal server error occurred"}


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )