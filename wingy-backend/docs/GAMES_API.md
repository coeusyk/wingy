# Wingy Games API

## Overview

The Wingy Games API provides endpoints to access a comprehensive catalog of games across multiple categories. This API is part of the Wingy intelligent game helper and learning assistant.

## Base URL

```
http://localhost:8000
```

## API Endpoints

### 1. Root Endpoint

**GET** `/`

Welcome message and API information.

**Response:**
```json
{
  "message": "Welcome to Wingy API",
  "docs": "/docs",
  "version": "0.1.0"
}
```

---

### 2. Health Check

**GET** `/health`

Check if the API is running properly.

**Response:**
```json
{
  "status": "healthy"
}
```

---

### 3. Get Popular Games

**GET** `/games/popular`

Retrieve a list of the most popular games.

**Response:**
```json
{
  "games": [
    {
      "id": "valorant",
      "name": "Valorant",
      "category": "FPS"
    },
    {
      "id": "league-of-legends",
      "name": "League of Legends",
      "category": "MOBA"
    }
    // ... more games
  ],
  "count": 12
}
```

**Example:**
```bash
curl http://localhost:8000/games/popular
```

---

### 4. Get All Games

**GET** `/games/all`

Retrieve all games from the catalog across all categories.

**Response:**
```json
{
  "games": [
    {
      "id": "age-of-empires",
      "name": "Age of Empires",
      "category": "Strategy"
    },
    {
      "id": "apex-legends",
      "name": "Apex Legends",
      "category": "Battle Royale"
    }
    // ... all games sorted alphabetically
  ],
  "count": 41
}
```

**Example:**
```bash
curl http://localhost:8000/games/all
```

---

### 5. Search Games

**GET** `/games/search`

Search for games by name (case-insensitive).

**Query Parameters:**
- `q` (required): Search query string (minimum 1 character)

**Response:**
```json
{
  "games": [
    {
      "id": "league-of-legends",
      "name": "League of Legends",
      "category": "MOBA"
    },
    {
      "id": "rocket-league",
      "name": "Rocket League",
      "category": "Sports"
    }
  ],
  "count": 2,
  "query": "league"
}
```

**Examples:**
```bash
# Search for "league"
curl "http://localhost:8000/games/search?q=league"

# Search for "souls"
curl "http://localhost:8000/games/search?q=souls"

# Search for "craft"
curl "http://localhost:8000/games/search?q=craft"
```

**Error Response (invalid query):**
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["query", "q"],
      "msg": "Field required"
    }
  ]
}
```

---

## Game Categories

The catalog includes games from the following categories:

- **Popular**: Top 12 most played games
- **FPS**: First-Person Shooter games
- **MOBA**: Multiplayer Online Battle Arena
- **Battle Royale**: Last-player-standing games
- **RPG**: Role-Playing Games
- **Strategy**: Strategic simulation games
- **MMO**: Massively Multiplayer Online games
- **Indie**: Independent games
- **Sports**: Sports simulation games
- **Action**: Action/Adventure games
- **Sandbox**: Open-world building games

---

## Game Object Structure

Each game object contains:

| Field    | Type   | Description                           |
|----------|--------|---------------------------------------|
| id       | string | Unique game identifier (kebab-case)   |
| name     | string | Display name of the game              |
| category | string | Game category                         |

---

## Running the API

### Start the Server

```bash
# Using Python
python run_api.py

# Or using uvicorn directly
uvicorn wingy.api:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs (Swagger): http://localhost:8000/docs
- Alternative docs (ReDoc): http://localhost:8000/redoc

### Run Tests

```bash
# Make sure the server is running first
python test_games_api.py
```

---

## Interactive Documentation

FastAPI automatically generates interactive API documentation:

### Swagger UI
Visit http://localhost:8000/docs to:
- View all endpoints
- Test API calls directly in the browser
- See request/response schemas
- Try out different parameters

### ReDoc
Visit http://localhost:8000/redoc for:
- Clean, readable API documentation
- Detailed schema information
- Exportable documentation

---

## CORS Configuration

The API is configured with CORS middleware to allow cross-origin requests. In production, update the `allow_origins` setting in `src/wingy/api/__init__.py` to restrict access to specific domains:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Example Usage in Python

```python
import httpx
import asyncio

async def get_games():
    async with httpx.AsyncClient() as client:
        # Get popular games
        response = await client.get("http://localhost:8000/games/popular")
        popular = response.json()
        print(f"Found {popular['count']} popular games")
        
        # Search for a game
        response = await client.get(
            "http://localhost:8000/games/search",
            params={"q": "valorant"}
        )
        results = response.json()
        print(f"Search results: {results['games']}")

asyncio.run(get_games())
```

---

## Error Handling

The API uses standard HTTP status codes:

- `200 OK`: Request successful
- `422 Unprocessable Entity`: Invalid parameters (e.g., missing required query param)
- `500 Internal Server Error`: Server error

FastAPI provides detailed error messages with validation information for debugging.

---

## Next Steps

Potential enhancements:
- Add filtering by category
- Add pagination for large result sets
- Add game details endpoint (descriptions, platforms, etc.)
- Add favorite games management
- Integrate with Wingy agent system for personalized recommendations
