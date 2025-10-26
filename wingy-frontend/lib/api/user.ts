/**
 * User management API functions
 */

import type { User, UserPreferences } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export interface CreateUserResponse {
  id: string
  preferences: UserPreferences
  created_at?: string
}

export async function createUser(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  })

  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.statusText}`)
  }

  const data: CreateUserResponse = await response.json()
  return {
    id: data.id,
    preferences: data.preferences || { games: [], preferences: [], onboarded: false },
    created_at: data.created_at,
  }
}

export async function getUserPreferences(userId: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/preferences`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("User not found")
    }
    throw new Error(`Failed to get user preferences: ${response.statusText}`)
  }

  const data: CreateUserResponse = await response.json()
  return {
    id: data.id,
    preferences: data.preferences || { games: [], preferences: [], onboarded: false },
    created_at: data.created_at,
  }
}

export async function onboardUser(
  userId: string,
  games: string[],
  preferences: string[]
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/onboard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ games, preferences }),
  })

  if (!response.ok) {
    throw new Error(`Failed to onboard user: ${response.statusText}`)
  }
}

export async function updateUserPreferences(
  userId: string,
  games: string[],
  preferences: string[]
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/preferences`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ games, preferences }),
  })

  if (!response.ok) {
    throw new Error(`Failed to update preferences: ${response.statusText}`)
  }
}
