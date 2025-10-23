"""
Test script for Google Custom Search integration.

This script tests the web_search_tool to ensure it's properly configured
and working with the Google Custom Search API.
"""

from dotenv import load_dotenv

import os
from pathlib import Path
import sys

load_dotenv()

# Add src to path
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

from wingy.tools.web_search import _perform_search, _format_search_results, _get_search_config
from wingy.utils import setup_logging, load_config


def test_search_config():
    """Test if Google Search API is configured."""
    print("🔍 Testing Google Search Configuration...")
    print("-" * 60)
    
    google_api_key = os.getenv("GOOGLE_API_KEY")
    google_engine_id = os.getenv("GOOGLE_SEARCH_ENGINE_ID")
    
    if google_api_key:
        print(f"✓ GOOGLE_API_KEY: {'*' * 20}{google_api_key[-4:]}")
    else:
        print("✗ GOOGLE_API_KEY: Not set")
    
    if google_engine_id:
        print(f"✓ GOOGLE_SEARCH_ENGINE_ID: {google_engine_id[:10]}...")
    else:
        print("✗ GOOGLE_SEARCH_ENGINE_ID: Not set")
    
    print()
    
    if google_api_key and google_engine_id:
        print("✅ Google Search API is configured!")
        return True
    else:
        print("⚠️  Google Search API is NOT configured")
        print("\nTo enable web search:")
        print("1. Get API key: https://console.cloud.google.com/")
        print("2. Create search engine: https://programmablesearchengine.google.com/")
        print("3. Add to .env file:")
        print("   GOOGLE_API_KEY=your_key_here")
        print("   GOOGLE_SEARCH_ENGINE_ID=your_engine_id_here")
        return False


def test_basic_search():
    """Test basic search functionality."""
    print("\n" + "=" * 60)
    print("🔍 Testing Basic Web Search")
    print("=" * 60)
    
    test_queries = [
        ("League of Legends support strategies", 3),
        ("Valorant aim training tips", 2),
    ]
    
    for query, max_results in test_queries:
        print(f"\n📝 Query: '{query}' (max_results={max_results})")
        print("-" * 60)
        
        try:
            # Perform search using internal function
            search_data = _perform_search(query, max_results)
            result = _format_search_results(search_data, query)
            print(result)
            print("\n✅ Search completed successfully!")
        except Exception as e:
            print(f"❌ Error: {e}")


def test_gaming_queries():
    """Test game-specific search queries."""
    print("\n" + "=" * 60)
    print("🎮 Testing Gaming-Specific Queries")
    print("=" * 60)
    
    gaming_queries = [
        "Counter-Strike 2 best weapons",
        "Dota 2 patch 7.35 meta",
        "Apex Legends season 19 tier list",
    ]
    
    for query in gaming_queries:
        print(f"\n📝 Query: '{query}'")
        print("-" * 60)
        
        try:
            # Perform search using internal function
            search_data = _perform_search(query, 2)
            result = _format_search_results(search_data, query)
            
            # Show first few lines
            lines = result.split("\n")
            for line in lines[:10]:
                print(line)
            
            if len(lines) > 10:
                print(f"... ({len(lines) - 10} more lines)")
            
            print("\n✅ Gaming query successful!")
        
        except Exception as e:
            print(f"❌ Error: {e}")


def main():
    """Main test function."""
    print("\n" + "=" * 60)
    print("🧪 Google Custom Search Integration Test")
    print("=" * 60)
    
    # Setup logging
    setup_logging(level="INFO")
    
    # Load configuration
    try:
        config = load_config()
        print("✓ Configuration loaded")
    except Exception as e:
        print(f"✗ Configuration error: {e}")
        return
    
    # Test configuration
    is_configured = test_search_config()
    
    if not is_configured:
        print("\n⚠️  Skipping search tests (API not configured)")
        print("The tool will still work but return error messages to agents.")
        return
    
    # Run search tests
    test_basic_search()
    test_gaming_queries()
    
    # Summary
    print("\n" + "=" * 60)
    print("✅ Test Complete!")
    print("=" * 60)
    print("\nThe web_search_tool is ready to use with agents.")
    print("Agents can now search for real-time gaming information!")


if __name__ == "__main__":
    main()
