export interface Game {
  id: string
  name: string
  category: string
  abbr: string
}

export interface Message {
  id: string
  content: string
  sender: "user" | "agent"
  timestamp: Date
  isNew?: boolean
}

export type PreferenceType = "competitive" | "learning" | "general" | "improvement" | "strategy" | "entertainment"

// User and Session Types
export interface User {
  id: string
  preferences: UserPreferences
  created_at?: string
}

export interface UserPreferences {
  games: string[]
  preferences: string[]
  onboarded?: boolean
}

export interface Thread {
  id: string
  user_id: string
  title: string
  game_ids: string[]
  preferences: string[]
  created_at: string
  updated_at: string
}

export interface ThreadMessage {
  id: string
  thread_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

// Context Types
export interface GameContextType {
  selectedGames: Game[]
  setSelectedGames: (games: Game[]) => void
  sessionId: string | null
  setSessionId: (id: string | null) => void
  messages: Message[]
  setMessages: (messages: Message[]) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  preference: PreferenceType[]
  setPreference: (preference: PreferenceType[]) => void
}

export interface UserContextType {
  user: User | null
  isLoading: boolean
  isOnboarded: boolean
  createUser: () => Promise<void>
  loadUser: (userId: string) => Promise<void>
  updatePreferences: (preferences: UserPreferences) => Promise<void>
  logout: () => void
}

export interface ThreadContextType {
  threads: Thread[]
  activeThread: Thread | null
  messages: ThreadMessage[]
  isLoading: boolean
  createThread: (userId: string, title?: string, gameIds?: string[], preferences?: string[]) => Promise<Thread>
  loadThreads: (userId: string) => Promise<void>
  setActiveThread: (threadId: string) => Promise<void>
  clearActiveThread: () => void
  deleteThread: (threadId: string) => Promise<void>
  updateThreadTitle: (threadId: string, title: string) => Promise<void>
  sendMessage: (content: string, userId?: string, gameIds?: string[], preferences?: string[]) => Promise<Thread | void>
}
