"""Run the Wingy FastAPI server."""

import uvicorn


def main():
    """Start the FastAPI server."""
    uvicorn.run(
        "wingy.api:app",
        host="localhost",
        port=8000,
        reload=True,
        log_level="info",
    )


if __name__ == "__main__":
    main()
