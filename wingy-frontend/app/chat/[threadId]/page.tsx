"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { SettingsModal } from "@/components/settings-modal"
import { useUser } from "@/contexts/user-context"
import { useThreads } from "@/contexts/thread-context"
import { useGameContext } from "@/contexts/game-context"
import { fetchAllGames } from "@/lib/api"
import type { Game, PreferenceType } from "@/types"

export default function ThreadPage() {
  const router = useRouter()
  const params = useParams()
  const threadId = params.threadId as string
  
  const { user, isLoading: userLoading, isOnboarded, logout } = useUser()
  const { loadThreads, setActiveThread, activeThread, threads, isLoading: threadsLoading } = useThreads()
  const { setSelectedGames, setSessionId, setCurrentStep, setPreference } = useGameContext()
  const [mounted, setMounted] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [threadsLoaded, setThreadsLoaded] = useState(false)
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

  // Hydrate GameContext from active thread's game context
  useEffect(() => {
    if (activeThread && !gameContextHydrated) {
      const hydrateFromThread = async () => {
        try {
          // Fetch all available games
          const allGames = await fetchAllGames()
          
          // Use thread's game_ids if available, otherwise fall back to user preferences
          const gameIds = activeThread.game_ids && activeThread.game_ids.length > 0
            ? activeThread.game_ids
            : user?.preferences?.games || []
          
          const selectedGames: Game[] = allGames.filter((game) =>
            gameIds.includes(game.id)
          )
          
          // Use thread's preferences if available, otherwise fall back to user preferences
          const threadPreferences = activeThread.preferences && activeThread.preferences.length > 0
            ? activeThread.preferences
            : user?.preferences?.preferences || []
          
          // Hydrate GameContext
          setSelectedGames(selectedGames)
          setPreference(threadPreferences as PreferenceType[])
          
          setGameContextHydrated(true)
          
          console.log("[ThreadPage] GameContext hydrated from thread:", {
            threadId: activeThread.id,
            games: selectedGames.map(g => g.name),
            preferences: threadPreferences,
            usedThreadData: activeThread.game_ids && activeThread.game_ids.length > 0
          })
        } catch (error) {
          console.error("[ThreadPage] Error hydrating GameContext:", error)
        }
      }
      
      hydrateFromThread()
    }
  }, [activeThread, user, gameContextHydrated, setSelectedGames, setPreference])

  // Reset hydration flag when thread changes
  useEffect(() => {
    setGameContextHydrated(false)
  }, [activeThread?.id])

  // Load threads when user is available and onboarded
  useEffect(() => {
    if (user && isOnboarded && !userLoading && !threadsLoaded) {
      loadThreads(user.id)
        .then(() => setThreadsLoaded(true))
        .catch((error) => {
          console.error("Error loading threads:", error)
        })
    }
  }, [user, isOnboarded, userLoading, threadsLoaded, loadThreads])

  // Set active thread from URL parameter
  useEffect(() => {
    if (threadsLoaded && threadId && threads.length > 0) {
      // Check if thread exists
      const thread = threads.find(t => t.id === threadId)
      if (thread) {
        // Only set active if it's not already active
        if (!activeThread || activeThread.id !== threadId) {
          setActiveThread(threadId).catch((error) => {
            console.error("Error setting active thread:", error)
            // Redirect to /chat if thread not found or error
            router.push("/chat")
          })
        }
      } else {
        // Thread not found, redirect to /chat
        console.warn(`Thread ${threadId} not found, redirecting to /chat`)
        router.push("/chat")
      }
    }
  }, [threadsLoaded, threadId, threads, activeThread, setActiveThread, router])

  const handleResetPreferences = () => {
    setSelectedGames([])
    setSessionId(null)
    setCurrentStep(1)
    logout()
    router.push("/")
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

  // Don't render chat if not onboarded (will redirect)
  if (!isOnboarded) {
    return null
  }

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
