"""FastAPI application for Wingy."""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.games import router as games_router
from .routes.chat import router as chat_router
from ..games.db_manager import get_db

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """Create and configure FastAPI application.
    
    Returns:
        Configured FastAPI application instance
    """
    app = FastAPI(
        title="Wingy API",
        description="Intelligent Game Helper and Learning Assistant API",
        version="0.1.0",
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure appropriately for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Startup event to initialize database
    @app.on_event("startup")
    async def startup_event():
        """Initialize database on startup."""
        logger.info("Initializing games database...")
        db = get_db()
        
        # Check if database is empty and seed if needed
        games = db.get_all_games()
        if not games:
            logger.info("Database is empty, seeding with initial data...")
            db.seed_data()
            logger.info("Database seeded successfully")
        else:
            logger.info(f"Database already contains {len(games)} games")
    
    # Include routers
    app.include_router(games_router)
    app.include_router(chat_router)
    
    @app.get("/")
    async def root():
        """Root endpoint."""
        return {
            "message": "Welcome to Wingy API",
            "docs": "/docs",
            "version": "0.1.0"
        }
    
    @app.get("/health")
    async def health():
        """Health check endpoint."""
        return {"status": "healthy"}
    
    return app


# Create app instance
app = create_app()

__all__ = ["app", "create_app"]
