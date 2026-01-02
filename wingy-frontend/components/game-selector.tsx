"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GameCard } from "./game-card"
import { GameGridSkeleton } from "@/components/loading-skeleton"
import { ErrorMessage } from "@/components/error-message"
import { fetchAllGames, searchGames } from "@/lib/api"
import type { Game } from "@/types"

interface GameSelectorProps {
  onGameSelection: (games: Game[]) => void
}

export function GameSelector({ onGameSelection }: GameSelectorProps) {
  const [selectedGames, setSelectedGames] = useState<Game[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customGameInput, setCustomGameInput] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  useEffect(() => {
    const loadGames = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchAllGames()
        setGames(data)
      } catch (err) {
        setError("Failed to load games. Please try again.")
        console.error("[v0] Error loading games:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadGames()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false)
      const loadGames = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const data = await fetchAllGames()
          setGames(data)
        } catch (err) {
          setError("Failed to load games. Please try again.")
          console.error("[v0] Error loading games:", err)
        } finally {
          setIsLoading(false)
        }
      }
      loadGames()
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      setError(null)
      try {
        const results = await searchGames(searchQuery)
        setGames(results)
      } catch (err) {
        setError("Search failed. Please try again.")
        console.error("[v0] Error searching games:", err)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const toggleGame = useCallback((game: Game) => {
    setSelectedGames((prev) =>
      prev.some((g) => g.id === game.id) ? prev.filter((g) => g.id !== game.id) : [...prev, game],
    )
  }, [])

  const addCustomGame = useCallback(() => {
    if (customGameInput.trim()) {
      const customGame: Game = {
        id: `custom-${Date.now()}`,
        name: customGameInput,
        category: "custom",
        abbr: customGameInput,
      }
      setSelectedGames((prev) => [...prev, customGame])
      setCustomGameInput("")
      setShowCustomInput(false)
    }
  }, [customGameInput])

  const handleContinue = () => {
    if (selectedGames.length > 0) {
      onGameSelection(selectedGames)
    }
  }

  const handleRetry = () => {
    setError(null)
    window.location.reload()
  }

  const filteredGames = searchQuery.trim() ? games : games

  return (
    <div className="w-full space-y-4 sm:space-y-6 flex flex-col max-h-[calc(100vh-8rem)] overflow-hidden">
      {/* Search Bar */}
      <div className="relative flex-shrink-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search for games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 sm:pl-10 pr-10 sm:pr-4 py-2.5 sm:py-3 bg-input border border-border/50 rounded-lg text-sm sm:text-base text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          aria-label="Search games"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {/* Game Selection */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">Choose Your Games</h2>
        </div>

        {error ? (
          <ErrorMessage message={error} onRetry={handleRetry} />
        ) : isLoading || isSearching ? (
          <GameGridSkeleton />
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <p className="text-sm sm:text-base text-muted-foreground">
              {searchQuery ? `No games found matching "${searchQuery}"` : "No games available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isSelected={selectedGames.some((g) => g.id === game.id)}
                onClick={() => toggleGame(game)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected Games Display */}
      {selectedGames.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2.5 sm:p-3 bg-primary/10 border border-primary/30 rounded-lg flex-shrink-0 max-h-32 sm:max-h-40 overflow-y-auto">
          {selectedGames.map((game) => (
            <div
              key={game.id}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-primary/20 border border-primary/50 rounded-full text-xs sm:text-sm"
            >
              <span className="truncate max-w-[120px] sm:max-w-none">{game.name}</span>
              <button
                onClick={() => setSelectedGames((prev) => prev.filter((g) => g.id !== game.id))}
                className="hover:text-destructive transition-colors flex-shrink-0"
                aria-label={`Remove ${game.name}`}
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Custom Game Input */}
      <div className="space-y-2 flex-shrink-0">
        {!showCustomInput ? (
          <Button
            onClick={() => setShowCustomInput(true)}
            variant="outline"
            className="w-full border-border/50 hover:bg-secondary/50 text-sm sm:text-base"
          >
            + Add Custom Game
          </Button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter game name..."
              value={customGameInput}
              onChange={(e) => setCustomGameInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCustomGame()}
              className="flex-1 px-2.5 sm:px-3 py-2 bg-input border border-border/50 rounded-lg text-sm sm:text-base text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
              aria-label="Custom game name"
            />
            <Button onClick={addCustomGame} className="bg-primary hover:bg-primary/90 text-sm sm:text-base px-3 sm:px-4">
              Add
            </Button>
            <Button
              onClick={() => {
                setShowCustomInput(false)
                setCustomGameInput("")
              }}
              variant="outline"
              className="border-border/50 text-sm sm:text-base px-3 sm:px-4"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Selection Count */}
      <div className="text-center flex-shrink-0">
        <p className="text-xs sm:text-sm text-muted-foreground">
          {selectedGames.length === 0
            ? "Select at least one game to continue"
            : `${selectedGames.length} game${selectedGames.length !== 1 ? "s" : ""} selected`}
        </p>
      </div>

      {/* Continue Button */}
      <Button
        onClick={handleContinue}
        disabled={selectedGames.length === 0}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 sm:py-6 text-base sm:text-lg rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed pulse-glow flex-shrink-0"
      >
        Continue to Chat
      </Button>
    </div>
  )
}
