"""Test script for the games API endpoints."""

import httpx
import asyncio


async def test_games_api():
    """Test all games API endpoints."""
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        print("="*60)
        print("Testing Wingy Games API")
        print("="*60)
        
        # Test root endpoint
        print("\n1. Testing root endpoint (/)...")
        response = await client.get(f"{base_url}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}\n")
        
        # Test health check
        print("2. Testing health endpoint (/health)...")
        response = await client.get(f"{base_url}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}\n")
        
        # Test popular games
        print("3. Testing popular games (/games/popular)...")
        response = await client.get(f"{base_url}/games/popular")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Count: {data['count']}")
        print(f"First 3 games: {data['games'][:3]}\n")
        
        # Test all games
        print("4. Testing all games (/games/all)...")
        response = await client.get(f"{base_url}/games/all")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Total games: {data['count']}")
        print(f"First 5 games: {data['games'][:5]}\n")
        
        # Test search - League
        print("5. Testing search (/games/search?q=league)...")
        response = await client.get(f"{base_url}/games/search?q=league")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Query: {data['query']}")
        print(f"Results: {data['count']}")
        print(f"Games: {data['games']}\n")
        
        # Test search - Souls
        print("6. Testing search (/games/search?q=souls)...")
        response = await client.get(f"{base_url}/games/search?q=souls")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Query: {data['query']}")
        print(f"Results: {data['count']}")
        print(f"Games: {data['games']}\n")
        
        # Test search - Minecraft
        print("7. Testing search (/games/search?q=mine)...")
        response = await client.get(f"{base_url}/games/search?q=mine")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Query: {data['query']}")
        print(f"Results: {data['count']}")
        print(f"Games: {data['games']}\n")
        
        print("="*60)
        print("All tests completed!")
        print("="*60)


if __name__ == "__main__":
    print("\nMake sure the API server is running on http://localhost:8000")
    print("Run 'python run_api.py' in a separate terminal first.\n")
    input("Press Enter to start tests...")
    asyncio.run(test_games_api())
