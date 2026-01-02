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
  const [lastLoadedThreadId, setLastLoadedThreadId] = useState<string | null>(null)

  const createThread = useCallback(async (userId: string, title?: string, gameIds?: string[], preferences?: string[]): Promise<Thread> => {
    try {
      setIsLoading(true)
      const newThread = await apiCreateThread(userId, title, gameIds, preferences)
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
      // Don't automatically set an active thread - let the route handle navigation
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
        // Skip if already loading messages for this thread
        if (lastLoadedThreadId === threadId && messages.length > 0) {
          console.log("[ThreadProvider] Messages already loaded for thread:", threadId)
          return
        }
        
        setIsLoading(true)
        // Access threads from state via functional update
        setThreads((currentThreads) => {
          const thread = currentThreads.find((t) => t.id === threadId)
          if (thread) {
            setActiveThreadState(thread)
            localStorage.setItem(STORAGE_KEY, threadId)
            
            // Load messages for this thread
            getThreadMessages(threadId)
              .then((msgs) => {
                setMessages(msgs)
                setLastLoadedThreadId(threadId)
              })
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
    [lastLoadedThreadId, messages.length]
  )

  const deleteThread = useCallback(
    async (threadId: string) => {
      try {
        await apiDeleteThread(threadId)
        
        // Update threads state and get the filtered result
        setThreads((prev) => {
          const remainingThreads = prev.filter((t) => t.id !== threadId)
          
          // If deleted thread was active, clear it and load another if available
          if (activeThread?.id === threadId) {
            setActiveThreadState(null)
            setMessages([])
            setLastLoadedThreadId(null)
            localStorage.removeItem(STORAGE_KEY)

            // Load another thread if available
            if (remainingThreads.length > 0) {
              setActiveThread(remainingThreads[0].id)
            }
          }
          
          return remainingThreads
        })
      } catch (error) {
        console.error("[ThreadProvider] Error deleting thread:", error)
        throw error
      }
    },
    [activeThread]
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
    async (content: string, userId?: string, gameIds?: string[], preferences?: string[]) => {
      try {
        let threadToUse = activeThread

        // If no active thread, create one with first message as title
        if (!threadToUse && userId) {
          // Truncate message for title (max 50 chars, add ellipsis if longer)
          const title = content.length > 50 ? content.substring(0, 50) + "..." : content
          
          threadToUse = await apiCreateThread(userId, title, gameIds, preferences)
          setThreads((prev) => [threadToUse!, ...prev])
          setActiveThreadState(threadToUse)
          localStorage.setItem(STORAGE_KEY, threadToUse.id)
        }

        if (!threadToUse) {
          throw new Error("No active thread and no userId provided to create one")
        }

        // Optimistically add user message
        const userMessage: ThreadMessage = {
          id: `temp-${Date.now()}`,
          thread_id: threadToUse.id,
          role: "user",
          content,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, userMessage])

        // Send to API
        const response = await sendChatMessage({
          message: content,
          session_id: threadToUse.id,
          thread_id: threadToUse.id,
        })

        // Add agent response
        const agentMessage: ThreadMessage = {
          id: `temp-${Date.now() + 1}`,
          thread_id: threadToUse.id,
          role: "assistant",
          content: response.message,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, agentMessage])

        // Reload messages from backend to get proper IDs
        const updatedMessages = await getThreadMessages(threadToUse.id)
        setMessages(updatedMessages)
        setLastLoadedThreadId(threadToUse.id)

        return threadToUse
      } catch (error) {
        console.error("[ThreadProvider] Error sending message:", error)
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => !m.id.startsWith("temp-")))
        throw error
      }
    },
    [activeThread]
  )

  const clearActiveThread = useCallback(() => {
    setActiveThreadState(null)
    setMessages([])
    setLastLoadedThreadId(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value: ThreadContextType = {
    threads,
    activeThread,
    messages,
    isLoading,
    createThread,
    loadThreads,
    setActiveThread,
    clearActiveThread,
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
