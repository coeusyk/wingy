"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Game, Message, GameContextType, PreferenceType } from "@/types"

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [selectedGames, setSelectedGames] = useState<Game[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [preference, setPreference] = useState<PreferenceType[]>([])

  return (
    <GameContext.Provider
      value={{
        selectedGames,
        setSelectedGames,
        sessionId,
        setSessionId,
        messages,
        setMessages,
        currentStep,
        setCurrentStep,
        preference,
        setPreference,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGameContext() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGameContext must be used within GameProvider")
  }
  return context
}
