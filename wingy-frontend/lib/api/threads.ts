/**
 * Thread management API functions
 */

import type { Thread, ThreadMessage } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function createThread(userId: string, title?: string, gameIds?: string[], preferences?: string[]): Promise<Thread> {
  const response = await fetch(`${API_BASE_URL}/threads/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      user_id: userId, 
      title,
      game_ids: gameIds,
      preferences
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create thread: ${response.statusText}`)
  }

  return response.json()
}

export async function getUserThreads(userId: string): Promise<Thread[]> {
  const response = await fetch(`${API_BASE_URL}/threads/user/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Failed to get threads: ${response.statusText}`)
  }

  return response.json()
}

export async function getThread(threadId: string): Promise<Thread> {
  const response = await fetch(`${API_BASE_URL}/threads/${threadId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Failed to get thread: ${response.statusText}`)
  }

  return response.json()
}

export async function getThreadMessages(
  threadId: string,
  limit?: number
): Promise<ThreadMessage[]> {
  const url = new URL(`${API_BASE_URL}/threads/${threadId}/messages`)
  if (limit) {
    url.searchParams.append("limit", limit.toString())
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Failed to get thread messages: ${response.statusText}`)
  }

  return response.json()
}

export async function updateThreadTitle(threadId: string, title: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/threads/${threadId}/title`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  })

  if (!response.ok) {
    throw new Error(`Failed to update thread title: ${response.statusText}`)
  }
}

export async function deleteThread(threadId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/threads/${threadId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete thread: ${response.statusText}`)
  }
}
