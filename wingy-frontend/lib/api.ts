const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export interface ApiError {
  message: string
  status: number
}

// Mock data for development/fallback
const MOCK_POPULAR_GAMES = [
  { id: "1", name: "League of Legends", category: "MOBA" },
  { id: "2", name: "Valorant", category: "FPS" },
  { id: "3", name: "Counter-Strike 2", category: "FPS" },
  { id: "4", name: "Dota 2", category: "MOBA" },
  { id: "5", name: "Fortnite", category: "Battle Royale" },
  { id: "6", name: "Call of Duty", category: "FPS" },
]

const MOCK_ALL_GAMES = [
  { id: "1", name: "League of Legends", category: "MOBA" },
  { id: "2", name: "Valorant", category: "FPS" },
  { id: "3", name: "Counter-Strike 2", category: "FPS" },
  { id: "4", name: "Dota 2", category: "MOBA" },
  { id: "5", name: "Fortnite", category: "Battle Royale" },
  { id: "6", name: "Call of Duty", category: "FPS" },
  { id: "7", name: "Elden Ring", category: "RPG" },
  { id: "8", name: "Dark Souls", category: "RPG" },
  { id: "9", name: "Baldur's Gate 3", category: "RPG" },
  { id: "10", name: "Starfield", category: "RPG" },
  { id: "11", name: "Cyberpunk 2077", category: "RPG" },
  { id: "12", name: "Minecraft", category: "Sandbox" },
]

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = {
      message: `API Error: ${response.statusText}`,
      status: response.status,
    }
    throw error
  }
  return response.json()
}

export async function fetchPopularGames(): Promise<any[]> {
  if (!API_BASE_URL) {
    console.log("[v0] Using mock popular games data (no API configured)")
    return MOCK_POPULAR_GAMES
  }

  try {
    const response = await fetch(`${API_BASE_URL}/games/popular`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    return handleResponse(response)
  } catch (error) {
    console.warn(
      "[v0] Failed to fetch popular games from API, using mock data:",
      error instanceof Error ? error.message : String(error),
    )
    return MOCK_POPULAR_GAMES
  }
}

export async function fetchAllGames(): Promise<any[]> {
  if (!API_BASE_URL) {
    console.log("[v0] Using mock all games data (no API configured)")
    return MOCK_ALL_GAMES
  }

  try {
    const response = await fetch(`${API_BASE_URL}/games/all`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    return handleResponse(response)
  } catch (error) {
    console.warn(
      "[v0] Failed to fetch all games from API, using mock data:",
      error instanceof Error ? error.message : String(error),
    )
    return MOCK_ALL_GAMES
  }
}

export async function searchGames(query: string): Promise<any[]> {
  if (!API_BASE_URL) {
    console.log("[v0] Searching mock games data (no API configured)")
    const lowerQuery = query.toLowerCase()
    return MOCK_ALL_GAMES.filter(
      (game) => game.name.toLowerCase().includes(lowerQuery) || game.category.toLowerCase().includes(lowerQuery),
    )
  }

  try {
    const response = await fetch(`${API_BASE_URL}/games/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    return handleResponse(response)
  } catch (error) {
    console.warn(
      "[v0] Failed to search games from API, using mock data:",
      error instanceof Error ? error.message : String(error),
    )
    const lowerQuery = query.toLowerCase()
    return MOCK_ALL_GAMES.filter(
      (game) => game.name.toLowerCase().includes(lowerQuery) || game.category.toLowerCase().includes(lowerQuery),
    )
  }
}
