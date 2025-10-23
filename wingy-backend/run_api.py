"""Run the Wingy FastAPI server."""

import uvicorn
from wingy.api import app


def main():
    """Start the FastAPI server."""
    uvicorn.run(
        "wingy.api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )


if __name__ == "__main__":
    main()
