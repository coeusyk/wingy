const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export interface ApiError {
  message: string
  status: number
}

// Mock data for development/fallback
const MOCK_ALL_GAMES = [
  { id: "league-of-legends", name: "League of Legends", category: "MOBA", abbr: "LoL" },
  { id: "valorant", name: "Valorant", category: "FPS", abbr: "VAL" },
  { id: "cs2", name: "Counter-Strike 2", category: "FPS", abbr: "CS2" },
  { id: "dota2", name: "Dota 2", category: "MOBA", abbr: "Dota" },
  { id: "fortnite", name: "Fortnite", category: "Battle Royale", abbr: "FN" },
  { id: "cod-warzone", name: "Call of Duty: Warzone", category: "FPS", abbr: "WZ" },
  { id: "elden-ring", name: "Elden Ring", category: "RPG", abbr: "ER" },
  { id: "dark-souls", name: "Dark Souls", category: "RPG", abbr: "DS" },
  { id: "baldurs-gate-3", name: "Baldur's Gate 3", category: "RPG", abbr: "BG3" },
  { id: "starfield", name: "Starfield", category: "RPG", abbr: "SF" },
  { id: "cyberpunk-2077", name: "Cyberpunk 2077", category: "RPG", abbr: "CP77" },
  { id: "minecraft", name: "Minecraft", category: "Sandbox", abbr: "MC" },
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
    const data = await handleResponse<{ games: any[]; count: number }>(response)
    return data.games
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
    const data = await handleResponse<{ games: any[]; count: number; query: string }>(response)
    return data.games
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


// Chat API
export interface ChatMessage {
  role: string
  content: string
}

export interface ChatRequest {
  message: string
  session_id: string
  user_id?: string
  games?: string[]
  preferences?: string[]
}

export interface ChatResponse {
  message: string
  session_id: string
  agent_name: string | null
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  if (!API_BASE_URL) {
    throw new Error("API URL not configured")
  }

  const response = await fetch(`${API_BASE_URL}/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `Failed to send message: ${response.statusText}`)
  }

  return response.json()
}

export async function getChatHistory(sessionId: string, limit?: number): Promise<ChatMessage[]> {
  if (!API_BASE_URL) {
    throw new Error("API URL not configured")
  }

  const url = new URL(`${API_BASE_URL}/chat/history/${sessionId}`)
  if (limit) {
    url.searchParams.append("limit", limit.toString())
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Failed to get chat history: ${response.statusText}`)
  }

  const data = await response.json()
  return data.messages
}

export async function clearChatHistory(sessionId: string): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error("API URL not configured")
  }

  const response = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Failed to clear chat history: ${response.statusText}`)
  }
}

// Suggested Questions API
export interface SuggestedQuestion {
  id: number
  question: string
  game_id: string
  game_name: string
  priority: number
}

export async function getSuggestedQuestions(gameIds: string[]): Promise<SuggestedQuestion[]> {
  if (!API_BASE_URL) {
    console.log("[v0] No API configured, returning empty suggested questions")
    return []
  }

  try {
    const response = await fetch(`${API_BASE_URL}/games/suggested-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_ids: gameIds }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch suggested questions: ${response.statusText}`)
    }

    const data = await handleResponse<{ questions: SuggestedQuestion[]; count: number }>(response)
    return data.questions
  } catch (error) {
    console.warn(
      "[v0] Failed to fetch suggested questions from API:",
      error instanceof Error ? error.message : String(error),
    )
    return []
  }
}
