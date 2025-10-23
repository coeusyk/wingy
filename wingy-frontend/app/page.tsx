"use client"

import { useState, useEffect } from "react"
import { OnboardingContainer } from "@/components/onboarding-container"
import { ChatInterface } from "@/components/chat-interface"
import { Header } from "@/components/header"
import { useGameContext } from "@/contexts/game-context"

export default function Home() {
  const { setSelectedGames, setSessionId, setCurrentStep } = useGameContext()
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleOnboardingComplete = () => {
    setIsTransitioning(true)

    setTimeout(() => {
      setIsOnboarded(true)
      setIsTransitioning(false)
    }, 300)
  }

  const handleResetPreferences = () => {
    setIsTransitioning(true)

    setTimeout(() => {
      setIsOnboarded(false)
      setSelectedGames([])
      setSessionId(null)
      setCurrentStep(1)
      setIsTransitioning(false)
    }, 300)
  }

  if (!mounted) {
    return null
  }

  return (
    <div
      className={`min-h-screen bg-background text-foreground dark transition-opacity duration-300 ${isTransitioning ? "opacity-50" : "opacity-100"}`}
    >
      {isOnboarded ? (
        <>
          <Header onResetPreferences={handleResetPreferences} />
          <ChatInterface />
        </>
      ) : (
        <OnboardingContainer onComplete={handleOnboardingComplete} />
      )}
    </div>
  )
}
