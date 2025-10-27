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

export default function ChatPage() {
  const router = useRouter()
  const { user, isLoading: userLoading, isOnboarded, logout } = useUser()
  const { loadThreads, createThread, activeThread, threads, isLoading: threadsLoading } = useThreads()
  const { setSelectedGames, setSessionId, setCurrentStep } = useGameContext()
  const [mounted, setMounted] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [threadsLoaded, setThreadsLoaded] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect to home if not onboarded
  useEffect(() => {
    if (mounted && !userLoading && !isOnboarded) {
      router.push("/")
    }
  }, [mounted, userLoading, isOnboarded, router])

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

  // Create first thread only if no threads exist after loading
  useEffect(() => {
    if (user && isOnboarded && threadsLoaded && threads.length === 0 && !activeThread && !threadsLoading) {
      createThread(user.id, "My First Chat").catch((error) => {
        console.error("Error creating first thread:", error)
      })
    }
  }, [user, isOnboarded, threadsLoaded, threads.length, activeThread, threadsLoading, createThread])

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
