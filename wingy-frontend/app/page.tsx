"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { OnboardingContainer } from "@/components/onboarding-container"
import { useUser } from "@/contexts/user-context"

export default function Home() {
  const router = useRouter()
  const { user, isLoading: userLoading, isOnboarded, updatePreferences } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect to chat if already onboarded
  useEffect(() => {
    if (mounted && !userLoading && isOnboarded) {
      router.push("/chat")
    }
  }, [mounted, userLoading, isOnboarded, router])

  const handleOnboardingComplete = async (games: string[], preferences: string[]) => {
    if (!user) return

    try {
      // Save preferences to backend
      await updatePreferences({
        games,
        preferences,
        onboarded: true,
      })

      // Navigate to chat page
      router.push("/chat")
    } catch (error) {
      console.error("Error completing onboarding:", error)
    }
  }

  if (!mounted || userLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render onboarding if already onboarded (will redirect)
  if (isOnboarded) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <OnboardingContainer onComplete={handleOnboardingComplete} />
    </div>
  )
}
