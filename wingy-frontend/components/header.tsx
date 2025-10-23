"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Gamepad2, Settings, Trash2, Download } from "lucide-react"
import { useGameContext } from "@/contexts/game-context"
import { GameSelector } from "@/components/game-selector"
import type { Game } from "@/types"

interface HeaderProps {
  onResetPreferences: () => void
}

export function Header({ onResetPreferences }: HeaderProps) {
  const { selectedGames, setSelectedGames, setMessages } = useGameContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleSaveChanges = (games: Game[]) => {
    if (games.length > 0) {
      setSelectedGames(games)
      setIsModalOpen(false)
    }
  }

  const handleExportChat = () => {
    const chatContent = "Chat export feature - to be integrated with actual chat data"
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(chatContent))
    element.setAttribute("download", "wingy-chat.txt")
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleClearChat = () => {
    setMessages([])
    setShowClearConfirm(false)
  }

  return (
    <>
      <header className="border-b border-border/50 bg-gradient-to-r from-card/50 via-card/30 to-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg glow-accent">
              <Gamepad2 className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Wingy
            </div>
          </div>

          {/* Selected Games */}
          <div className="flex-1 mx-8 hidden md:flex items-center gap-2 flex-wrap">
            {selectedGames.slice(0, 3).map((game) => (
              <span
                key={game.id}
                className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium border border-primary/30 hover:border-primary/60 transition-colors"
              >
                {game.name}
              </span>
            ))}
            {selectedGames.length > 3 && (
              <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium border border-accent/30">
                +{selectedGames.length - 3} more
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleExportChat}
              variant="outline"
              size="sm"
              className="border-border/50 hover:bg-secondary/50 bg-transparent hover:border-primary/50 transition-all hidden sm:flex"
              aria-label="Export chat"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => setShowClearConfirm(true)}
              variant="outline"
              size="sm"
              className="border-border/50 hover:bg-secondary/50 bg-transparent hover:border-primary/50 transition-all hidden sm:flex"
              aria-label="Clear chat"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              size="sm"
              className="border-border/50 hover:bg-secondary/50 bg-transparent hover:border-primary/50 transition-all"
              aria-label="Change games"
            >
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Change Games</span>
              <span className="sm:hidden">
                <X className="w-4 h-4" />
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
          role="presentation"
        >
          <div
            className="bg-card border border-border/50 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Change Games</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-secondary rounded transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <GameSelector onGameSelection={handleSaveChanges} />
          </div>
        </div>
      )}

      {/* Clear Chat Confirmation */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={() => setShowClearConfirm(false)}
          role="presentation"
        >
          <div
            className="bg-card border border-border/50 rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">Clear Chat?</h2>
            <p className="text-muted-foreground mb-4">This action cannot be undone.</p>
            <div className="flex gap-2">
              <Button onClick={() => setShowClearConfirm(false)} variant="outline" className="flex-1 border-border/50">
                Cancel
              </Button>
              <Button onClick={handleClearChat} className="flex-1 bg-red-600 hover:bg-red-700">
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
