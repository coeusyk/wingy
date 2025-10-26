"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type { Thread, ThreadContextType, ThreadMessage } from "@/types"
import {
  createThread as apiCreateThread,
  getUserThreads,
  getThreadMessages,
  deleteThread as apiDeleteThread,
  updateThreadTitle as apiUpdateThreadTitle,
} from "@/lib/api"
import { sendChatMessage } from "@/lib/api"

const ThreadContext = createContext<ThreadContextType | undefined>(undefined)

const STORAGE_KEY = "wingy_active_thread"

export function ThreadProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeThread, setActiveThreadState] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const createThread = useCallback(async (userId: string, title?: string): Promise<Thread> => {
    try {
      setIsLoading(true)
      const newThread = await apiCreateThread(userId, title)
      setThreads((prev) => [newThread, ...prev])
      
      // Set as active thread and load its (empty) messages
      setActiveThreadState(newThread)
      localStorage.setItem(STORAGE_KEY, newThread.id)
      setMessages([])
      
      return newThread
    } catch (error) {
      console.error("[ThreadProvider] Error creating thread:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadThreads = useCallback(async (userId: string) => {
    try {
      setIsLoading(true)
      const userThreads = await getUserThreads(userId)
      setThreads(userThreads)

      // Auto-load last active thread or most recent
      const lastActiveId = localStorage.getItem(STORAGE_KEY)
      if (lastActiveId && userThreads.some((t) => t.id === lastActiveId)) {
        // Use userThreads directly instead of state
        const thread = userThreads.find((t) => t.id === lastActiveId)
        if (thread) {
          setActiveThreadState(thread)
          localStorage.setItem(STORAGE_KEY, thread.id)
          const threadMessages = await getThreadMessages(thread.id)
          setMessages(threadMessages)
        }
      } else if (userThreads.length > 0) {
        // Use userThreads directly instead of state
        const thread = userThreads[0]
        setActiveThreadState(thread)
        localStorage.setItem(STORAGE_KEY, thread.id)
        const threadMessages = await getThreadMessages(thread.id)
        setMessages(threadMessages)
      }
    } catch (error) {
      console.error("[ThreadProvider] Error loading threads:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setActiveThread = useCallback(
    async (threadId: string) => {
      try {
        setIsLoading(true)
        // Access threads from state via functional update
        setThreads((currentThreads) => {
          const thread = currentThreads.find((t) => t.id === threadId)
          if (thread) {
            setActiveThreadState(thread)
            localStorage.setItem(STORAGE_KEY, threadId)
            
            // Load messages for this thread
            getThreadMessages(threadId)
              .then(setMessages)
              .catch((error) => {
                console.error("[ThreadProvider] Error loading messages:", error)
              })
              .finally(() => setIsLoading(false))
          } else {
            console.error("[ThreadProvider] Thread not found:", threadId)
            setIsLoading(false)
          }
          return currentThreads
        })
      } catch (error) {
        console.error("[ThreadProvider] Error setting active thread:", error)
        setIsLoading(false)
        throw error
      }
    },
    []
  )

  const deleteThread = useCallback(
    async (threadId: string) => {
      try {
        await apiDeleteThread(threadId)
        setThreads((prev) => prev.filter((t) => t.id !== threadId))

        // If deleted thread was active, clear it
        if (activeThread?.id === threadId) {
          setActiveThreadState(null)
          setMessages([])
          localStorage.removeItem(STORAGE_KEY)

          // Load another thread if available
          const remainingThreads = threads.filter((t) => t.id !== threadId)
          if (remainingThreads.length > 0) {
            await setActiveThread(remainingThreads[0].id)
          }
        }
      } catch (error) {
        console.error("[ThreadProvider] Error deleting thread:", error)
        throw error
      }
    },
    [activeThread, threads]
  )

  const updateThreadTitle = useCallback(async (threadId: string, title: string) => {
    try {
      await apiUpdateThreadTitle(threadId, title)
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, title } : t))
      )

      if (activeThread?.id === threadId) {
        setActiveThreadState((prev) => (prev ? { ...prev, title } : null))
      }
    } catch (error) {
      console.error("[ThreadProvider] Error updating thread title:", error)
      throw error
    }
  }, [activeThread])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeThread) {
        throw new Error("No active thread")
      }

      try {
        // Optimistically add user message
        const userMessage: ThreadMessage = {
          id: `temp-${Date.now()}`,
          thread_id: activeThread.id,
          role: "user",
          content,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, userMessage])

        // Send to API
        const response = await sendChatMessage({
          message: content,
          session_id: activeThread.id,
          thread_id: activeThread.id,
        })

        // Add agent response
        const agentMessage: ThreadMessage = {
          id: `temp-${Date.now() + 1}`,
          thread_id: activeThread.id,
          role: "assistant",
          content: response.message,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, agentMessage])

        // Reload messages from backend to get proper IDs
        const updatedMessages = await getThreadMessages(activeThread.id)
        setMessages(updatedMessages)
      } catch (error) {
        console.error("[ThreadProvider] Error sending message:", error)
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => !m.id.startsWith("temp-")))
        throw error
      }
    },
    [activeThread]
  )

  const value: ThreadContextType = {
    threads,
    activeThread,
    messages,
    isLoading,
    createThread,
    loadThreads,
    setActiveThread,
    deleteThread,
    updateThreadTitle,
    sendMessage,
  }

  return <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
}

export function useThreads() {
  const context = useContext(ThreadContext)
  if (context === undefined) {
    throw new Error("useThreads must be used within a ThreadProvider")
  }
  return context
}
