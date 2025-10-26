"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { User, UserContextType, UserPreferences } from "@/types"
import { createUser, getUserPreferences, onboardUser, updateUserPreferences as apiUpdatePreferences } from "@/lib/api"

const UserContext = createContext<UserContextType | undefined>(undefined)

const STORAGE_KEY = "wingy_user_id"

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOnboarded, setIsOnboarded] = useState(false)

  // Initialize user on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const storedUserId = localStorage.getItem(STORAGE_KEY)
        
        if (storedUserId) {
          // Try to load existing user
          try {
            const userData = await getUserPreferences(storedUserId)
            setUser(userData)
            setIsOnboarded(userData.preferences?.onboarded || false)
          } catch (error) {
            console.error("[UserProvider] Failed to load user, creating new one:", error)
            // User not found on backend, create new one
            const newUser = await createUser()
            localStorage.setItem(STORAGE_KEY, newUser.id)
            setUser(newUser)
            setIsOnboarded(false)
          }
        } else {
          // No user ID in storage, create new user
          const newUser = await createUser()
          localStorage.setItem(STORAGE_KEY, newUser.id)
          setUser(newUser)
          setIsOnboarded(false)
        }
      } catch (error) {
        console.error("[UserProvider] Error initializing user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeUser()
  }, [])

  const handleCreateUser = useCallback(async () => {
    try {
      const newUser = await createUser()
      localStorage.setItem(STORAGE_KEY, newUser.id)
      setUser(newUser)
      setIsOnboarded(false)
    } catch (error) {
      console.error("[UserProvider] Error creating user:", error)
      throw error
    }
  }, [])

  const loadUser = useCallback(async (userId: string) => {
    try {
      setIsLoading(true)
      const userData = await getUserPreferences(userId)
      localStorage.setItem(STORAGE_KEY, userId)
      setUser(userData)
      setIsOnboarded(userData.preferences?.onboarded || false)
    } catch (error) {
      console.error("[UserProvider] Error loading user:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updatePreferences = useCallback(async (preferences: UserPreferences) => {
    if (!user) {
      throw new Error("No user loaded")
    }

    try {
      // If this is the first onboarding
      if (!user.preferences?.onboarded) {
        await onboardUser(user.id, preferences.games, preferences.preferences)
      } else {
        await apiUpdatePreferences(user.id, preferences.games, preferences.preferences)
      }

      // Update local state
      setUser({
        ...user,
        preferences: {
          ...preferences,
          onboarded: true,
        },
      })
      setIsOnboarded(true)
    } catch (error) {
      console.error("[UserProvider] Error updating preferences:", error)
      throw error
    }
  }, [user])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
    setIsOnboarded(false)
  }, [])

  const value: UserContextType = {
    user,
    isLoading,
    isOnboarded,
    createUser: handleCreateUser,
    loadUser,
    updatePreferences,
    logout,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
