"""FastAPI application for Wingy."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.games import router as games_router


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
    
    # Include routers
    app.include_router(games_router)
    
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

