"""FastAPI application for Wingy."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.games import router as games_router
from .routes.chat import router as chat_router
from .routes.users import router as users_router
from .routes.threads import router as threads_router
from ..games.db_manager import get_db
from ..sessions.db_manager import get_db as get_sessions_db

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events.
    
    Startup: Initialize databases and seed data if needed.
    Shutdown: Cleanup resources.
    """
    # Startup logic
    logger.info("Initializing databases...")
    
    # Initialize games database
    db = get_db()
    games = db.get_all_games()
    if not games:
        logger.info("Games database is empty, seeding with initial data...")
        db.seed_data()
        logger.info("Games database seeded successfully")
    else:
        logger.info(f"Games database already contains {len(games)} games")
    
    # Initialize sessions database
    sessions_db = get_sessions_db()
    logger.info("Sessions database initialized successfully")
    
    yield  # Application is running
    
    # Shutdown logic (if needed)
    logger.info("Application shutting down...")


def create_app() -> FastAPI:
    """Create and configure FastAPI application.
    
    Returns:
        Configured FastAPI application instance
    """
    app = FastAPI(
        title="Wingy API",
        description="Intelligent Game Helper and Learning Assistant API",
        version="0.1.0",
        lifespan=lifespan,
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure appropriately for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(games_router)
    app.include_router(chat_router)
    app.include_router(users_router)
    app.include_router(threads_router)
    
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
