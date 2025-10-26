"use client"

import { useState } from "react"
import { Plus, Settings, Trash2, MessageSquare, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/user-context"
import { useThreads } from "@/contexts/thread-context"

interface SidebarProps {
  onOpenSettings: () => void
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const { user } = useUser()
  const { threads, activeThread, createThread, setActiveThread, deleteThread, isLoading } = useThreads()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleNewChat = async () => {
    if (!user) return
    try {
      await createThread(user.id)
    } catch (error) {
      console.error("Error creating thread:", error)
    }
  }

  const handleThreadClick = async (threadId: string) => {
    if (threadId === activeThread?.id) return
    try {
      await setActiveThread(threadId)
      setIsOpen(false) // Close mobile menu after selection
    } catch (error) {
      console.error("Error switching thread:", error)
    }
  }

  const handleDeleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm("Are you sure you want to delete this conversation?")) {
      return
    }

    setDeletingId(threadId)
    try {
      await deleteThread(threadId)
    } catch (error) {
      console.error("Error deleting thread:", error)
      alert("Failed to delete thread. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Wingy
            </h1>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-secondary/50 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <Button
          onClick={handleNewChat}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto p-2">
        {threads.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-xs mt-1">Click "New Chat" to start</p>
          </div>
        ) : (
          <div className="space-y-1">
            {threads.map((thread) => {
              const isActive = activeThread?.id === thread.id
              const isDeleting = deletingId === thread.id

              return (
                <div
                  key={thread.id}
                  onClick={() => !isDeleting && handleThreadClick(thread.id)}
                  className={`w-full p-3 rounded-lg text-left transition-all group relative cursor-pointer ${
                    isActive
                      ? "bg-primary/20 border-2 border-primary/50"
                      : "hover:bg-secondary/50 border-2 border-transparent"
                  } ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isActive ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {thread.title}
                      </p>
                    </div>
                    
                    {!isDeleting && (
                      <button
                        onClick={(e) => handleDeleteThread(thread.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/20 rounded transition-all flex-shrink-0"
                        aria-label="Delete thread"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Settings Button */}
      <div className="p-4 border-t border-border/50">
        <Button
          onClick={onOpenSettings}
          variant="outline"
          className="w-full border-border/50 hover:bg-secondary/50"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border-2 border-border/50 rounded-lg hover:bg-secondary/50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-screen w-64 bg-card border-r border-border/50 
          flex flex-col z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
