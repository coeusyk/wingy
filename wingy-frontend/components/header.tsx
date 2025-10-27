"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, Settings, Trash2, Download } from "lucide-react"
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
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="p-1.5 sm:p-2 bg-primary/20 rounded-lg">
              <Image
                src="/wingy-logo-transparent.png"
                alt="Wingy Logo"
                width={24}
                height={24}
                className="w-5 h-5 sm:w-6 sm:h-6"
                loading="eager"
              />
            </div>
            <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Wingy
            </div>
          </div>

          {/* Selected Games */}
          <div className="flex-1 mx-2 sm:mx-4 md:mx-8 hidden md:flex items-center gap-2 flex-wrap overflow-x-auto">
            {selectedGames.slice(0, 3).map((game) => (
              <span
                key={game.id}
                className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/20 text-primary text-xs sm:text-sm font-medium border border-primary/30 hover:border-primary/60 transition-colors whitespace-nowrap"
              >
                {game.name}
              </span>
            ))}
            {selectedGames.length > 3 && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-accent/20 text-accent text-xs sm:text-sm font-medium border border-accent/30 whitespace-nowrap">
                +{selectedGames.length - 3} more
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
            <Button
              onClick={handleExportChat}
              variant="outline"
              size="sm"
              className="border-border/50 hover:bg-secondary/50 bg-transparent hover:border-primary/50 transition-all hidden sm:flex text-xs sm:text-sm px-2 sm:px-3"
              aria-label="Export chat"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden md:inline">Export</span>
            </Button>
            <Button
              onClick={() => setShowClearConfirm(true)}
              variant="outline"
              size="sm"
              className="border-border/50 hover:bg-secondary/50 bg-transparent hover:border-primary/50 transition-all hidden sm:flex text-xs sm:text-sm px-2 sm:px-3"
              aria-label="Clear chat"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden md:inline">Clear</span>
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              size="sm"
              className="border-border/50 hover:bg-secondary/50 bg-transparent hover:border-primary/50 transition-all text-xs sm:text-sm px-2 sm:px-3"
              aria-label="Change games"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden md:inline">Change Games</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setIsModalOpen(false)}
          role="presentation"
        >
          <div
            className="bg-card border border-border/50 rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[85vh] sm:max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-bold">Change Games</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-secondary rounded transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
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
            className="bg-card border border-border/50 rounded-lg p-4 sm:p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base sm:text-lg font-bold mb-2">Clear Chat?</h2>
            <p className="text-sm text-muted-foreground mb-3 sm:mb-4">This action cannot be undone.</p>
            <div className="flex gap-2">
              <Button onClick={() => setShowClearConfirm(false)} variant="outline" className="flex-1 border-border/50 text-xs sm:text-sm">
                Cancel
              </Button>
              <Button onClick={handleClearChat} className="flex-1 bg-red-600 hover:bg-red-700 text-xs sm:text-sm">
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
