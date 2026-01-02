"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { SettingsModal } from "@/components/settings-modal"
import { useUser } from "@/contexts/user-context"
import { useThreads } from "@/contexts/thread-context"
import { useGameContext } from "@/contexts/game-context"
import { fetchAllGames } from "@/lib/api"
import type { Game, PreferenceType } from "@/types"

export default function ChatPage() {
  const router = useRouter()
  const { user, isLoading: userLoading, isOnboarded, logout } = useUser()
  const { loadThreads, threads, activeThread, isLoading: threadsLoading, clearActiveThread } = useThreads()
  const { setSelectedGames, setPreference, setSessionId, setCurrentStep } = useGameContext()
  const [mounted, setMounted] = useState(false)
  const [threadsLoaded, setThreadsLoaded] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [gameContextHydrated, setGameContextHydrated] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect to home if not onboarded
  useEffect(() => {
    if (mounted && !userLoading && !isOnboarded) {
      router.push("/")
    }
  }, [mounted, userLoading, isOnboarded, router])

  // Hydrate GameContext from user preferences
  useEffect(() => {
    if (user && user.preferences && !gameContextHydrated) {
      const hydrateGameContext = async () => {
        try {
          const allGames = await fetchAllGames()
          const userGameIds = user.preferences.games || []
          const selectedGames: Game[] = allGames.filter((game) =>
            userGameIds.includes(game.id)
          )
          setSelectedGames(selectedGames)
          const userPreferences = (user.preferences.preferences || []) as PreferenceType[]
          setPreference(userPreferences)
          setGameContextHydrated(true)
        } catch (error) {
          console.error("[ChatPage] Error hydrating GameContext:", error)
        }
      }
      hydrateGameContext()
    }
  }, [user, gameContextHydrated, setSelectedGames, setPreference])

  // Load threads when user is available and onboarded
  useEffect(() => {
    if (user && isOnboarded && !userLoading && !threadsLoaded) {
      loadThreads(user.id)
        .then(() => {
          setThreadsLoaded(true)
          // Clear active thread only after threads are loaded
          clearActiveThread()
        })
        .catch((error) => {
          console.error("[ChatPage] Error loading threads:", error)
          setThreadsLoaded(true) // Set to true even on error to exit loading state
        })
    }
  }, [user, isOnboarded, userLoading, threadsLoaded, loadThreads, clearActiveThread])

  const handleResetPreferences = () => {
    setSelectedGames([])
    setSessionId(null)
    setCurrentStep(1)
    logout()
    router.push("/")
  }

  // Show loading state while initializing
  if (!mounted || userLoading || !user || !isOnboarded || !threadsLoaded || !gameContextHydrated) {
    return (
      <div className="min-h-screen bg-background text-foreground dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading chat...</p>
        </div>
      </div>
    )
  }

  // Render chat interface for empty state (no threads)
  return (
    <div className="min-h-screen bg-background text-foreground dark flex">
      {/* Sidebar */}
      <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header onResetPreferences={handleResetPreferences} onOpenSettings={() => setIsSettingsOpen(true)} />
        <ChatInterface />
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}
