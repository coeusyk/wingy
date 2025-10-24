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
