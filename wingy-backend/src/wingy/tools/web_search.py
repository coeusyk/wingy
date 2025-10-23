"""Web search tool for agents using Google Custom Search API."""

import logging
import os

import httpx
from agents import function_tool

logger = logging.getLogger(__name__)

# Google Custom Search API endpoint
GOOGLE_SEARCH_API_URL = "https://www.googleapis.com/customsearch/v1"


class GoogleSearchError(Exception):
    """Exception raised for Google Search API errors."""
    pass


def _get_search_config() -> tuple[str, str]:
    """Get Google Search API configuration from environment.
    
    Returns:
        Tuple of (api_key, search_engine_id)
    
    Raises:
        GoogleSearchError: If configuration is missing
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    search_engine_id = os.getenv("GOOGLE_SEARCH_ENGINE_ID")
    
    if not api_key or not search_engine_id:
        raise GoogleSearchError(
            "Google Search API configuration missing. "
            "Please set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID in .env file."
        )
    
    return api_key, search_engine_id


def _perform_search(query: str, max_results: int = 5) -> dict:
    """Perform Google Custom Search API request.
    
    Args:
        query: The search query
        max_results: Maximum number of results to return (1-10)
    
    Returns:
        Search results dictionary
    
    Raises:
        GoogleSearchError: If the API request fails
    """
    api_key, search_engine_id = _get_search_config()
    
    # Limit max_results to API maximum of 10
    num_results = min(max_results, 10)
    
    params = {
        "key": api_key,
        "cx": search_engine_id,
        "q": query,
        "num": num_results,
    }
    
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(GOOGLE_SEARCH_API_URL, params=params)
            response.raise_for_status()
            return response.json()
    
    except httpx.HTTPStatusError as e:
        error_msg = f"Google Search API error: {e.response.status_code}"
        try:
            error_data = e.response.json()
            if "error" in error_data:
                error_msg += f" - {error_data['error'].get('message', '')}"
        except Exception:
            pass
        logger.error(error_msg)
        raise GoogleSearchError(error_msg) from e
    
    except httpx.RequestError as e:
        error_msg = f"Network error during Google Search request: {str(e)}"
        logger.error(error_msg)
        raise GoogleSearchError(error_msg) from e


def _format_search_results(search_data: dict, query: str) -> str:
    """Format Google Search results into a readable string.
    
    Args:
        search_data: Raw search results from Google API
        query: The original search query
    
    Returns:
        Formatted search results string
    """
    items = search_data.get("items", [])
    
    if not items:
        return f'No search results found for: "{query}"'
    
    # Get search metadata
    search_info = search_data.get("searchInformation", {})
    total_results = search_info.get("formattedTotalResults", "Unknown")
    search_time = search_info.get("formattedSearchTime", "Unknown")
    
    # Build formatted output
    output_parts = [
        f'Search Results for: "{query}"',
        f"Found {total_results} results in {search_time} seconds",
        "",
    ]
    
    for idx, item in enumerate(items, 1):
        title = item.get("title", "No title")
        link = item.get("link", "")
        snippet = item.get("snippet", "No description available")
        
        output_parts.append(f"{idx}. {title}")
        output_parts.append(f"   URL: {link}")
        output_parts.append(f"   {snippet}")
        output_parts.append("")
    
    return "\n".join(output_parts)


@function_tool
def web_search_tool(query: str, max_results: int = 5) -> str:
    """Search the web for current game information, strategies, and guides using Google Custom Search.
    
    This tool uses Google Custom Search API to find relevant gaming content including:
    - Game strategies and guides
    - Patch notes and updates
    - Pro player insights
    - Community discussions
    - Tutorial videos and articles
    
    Args:
        query: The search query (e.g., "League of Legends support strategies")
        max_results: Maximum number of results to return (default: 5, max: 10)
    
    Returns:
        Formatted search results with titles, URLs, and snippets
    
    Example:
        >>> web_search_tool("Valorant aim improvement tips", max_results=3)
        Search Results for: "Valorant aim improvement tips"
        Found 1,234,567 results in 0.45 seconds
        
        1. 10 Tips to Improve Your Aim in Valorant
           URL: https://example.com/valorant-aim-tips
           Learn the best techniques to improve your aim...
    """
    logger.info(f"Web search requested: '{query}' (max_results={max_results})")
    
    try:
        # Perform the search
        search_data = _perform_search(query, max_results)
        
        # Format and return results
        formatted_results = _format_search_results(search_data, query)
        logger.info(f"Web search completed: {len(search_data.get('items', []))} results")
        
        return formatted_results
    
    except GoogleSearchError as e:
        error_msg = (
            f"Failed to perform web search: {str(e)}\n\n"
            "Please ensure:\n"
            "1. GOOGLE_API_KEY is set in .env file\n"
            "2. GOOGLE_SEARCH_ENGINE_ID is set in .env file\n"
            "3. Your API key has Custom Search API enabled\n"
            "4. You have remaining quota for today\n\n"
            "Falling back to placeholder response."
        )
        logger.warning(error_msg)
        
        # Return a helpful error message for the agent
        return f"""Web Search Error: Unable to perform real-time search.

Query: "{query}"

To enable web search:
1. Get a Google Custom Search API key from: https://console.cloud.google.com/
2. Create a Custom Search Engine at: https://programmablesearchengine.google.com/
3. Add GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID to your .env file

Error details: {str(e)}"""
    
    except Exception as e:
        logger.error(f"Unexpected error in web_search_tool: {e}", exc_info=True)
        return f'Unexpected error during web search: {str(e)}'

