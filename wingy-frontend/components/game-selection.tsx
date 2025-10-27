"use client"

import { useState, useEffect } from "react"
import { Search, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { GameCard } from "./game-card"
import { GameCardSkeleton } from "@/components/loading-skeleton"
import { ErrorMessage } from "@/components/error-message"
import { fetchAllGames, searchGames } from "@/lib/api"
import type { Game } from "@/types"

interface GameSelectionProps {
  selectedGames: Game[]
  onGameSelect: (games: Game[]) => void
  onContinue: () => void
  onBack: () => void
}

export function GameSelection({ selectedGames, onGameSelect, onContinue, onBack }: GameSelectionProps) {
  const [games, setGames] = useState<Game[]>([])
  const [filteredGames, setFilteredGames] = useState<Game[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customGameInput, setCustomGameInput] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Load all games on mount
  useEffect(() => {
    const loadGames = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchAllGames()
        setGames(data)
        setFilteredGames(data)
      } catch (err) {
        setError("Failed to load games. Please try again.")
        console.error("[v0] Error loading games:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadGames()
  }, [])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setFilteredGames(games)
        return
      }

      try {
        const results = await searchGames(searchQuery)
        setFilteredGames(results)
      } catch (err) {
        console.error("[v0] Error searching games:", err)
        setFilteredGames([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, games])

  const handleGameToggle = (game: Game) => {
    const isSelected = selectedGames.some((g) => g.id === game.id)
    if (isSelected) {
      onGameSelect(selectedGames.filter((g) => g.id !== game.id))
    } else {
      onGameSelect([...selectedGames, game])
    }
  }

  const handleAddCustomGame = () => {
    if (customGameInput.trim()) {
      const customGame: Game = {
        id: `custom-${Date.now()}`,
        name: customGameInput,
        category: "custom",
        abbr: customGameInput.substring(0, 3).toUpperCase(),
      }
      onGameSelect([...selectedGames, customGame])
      setCustomGameInput("")
      setShowCustomInput(false)
    }
  }

  const handleRemoveGame = (gameId: string) => {
    onGameSelect(selectedGames.filter((g) => g.id !== gameId))
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-card overflow-auto flex items-center justify-center p-2 sm:p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl float" />
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <Card className="w-full max-w-4xl border-border/50 bg-card/80 backdrop-blur-sm slide-up relative z-10 mx-auto my-4">
        <div className="p-3 sm:p-4 lg:p-6 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="mb-3 sm:mb-4 flex-shrink-0">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Which games do you play?</h2>
            <p className="text-muted-foreground text-sm">Select your favorites to get personalized tips</p>
          </div>

          {/* Search bar */}
          <div className="mb-3 sm:mb-4 md:mb-6 relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-2 sm:py-3 text-sm"
              aria-label="Search games"
            />
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6">

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <GameCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && <ErrorMessage message={error} onRetry={() => window.location.reload()} />}

          {/* Games grid */}
          {!isLoading && !error && (
            <>
              {/* All games or search results */}
              {(searchQuery || games.length > 0) && (
                <div className="mb-4 sm:mb-6">
                  {searchQuery && (
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2 sm:mb-3 uppercase tracking-wide">
                      Search Results
                    </h3>
                  )}
                  {filteredGames.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                      {filteredGames.map((game) => (
                        <GameCard
                          key={game.id}
                          game={game}
                          isSelected={selectedGames.some((g) => g.id === game.id)}
                          onClick={() => handleGameToggle(game)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-muted-foreground text-sm">No games found</p>
                    </div>
                  )}
                </div>
              )}

              {/* Custom game button */}
              {!showCustomInput && (
                <Button
                  variant="outline"
                  className="w-full mb-4 sm:mb-6 border-dashed bg-transparent hover:text-destructive hover:border-destructive transition-colors text-sm"
                  onClick={() => setShowCustomInput(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Game
                </Button>
              )}

              {/* Custom game input */}
              {showCustomInput && (
                <div className="mb-4 sm:mb-6 flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter game name..."
                    value={customGameInput}
                    onChange={(e) => setCustomGameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddCustomGame()
                    }}
                    autoFocus
                    className="text-sm"
                  />
                  <Button onClick={handleAddCustomGame} size="sm">
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCustomInput(false)
                      setCustomGameInput("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </>
          )}
          </div>

          {/* Bottom actions */}
          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 md:pt-6 border-t border-border/50 flex-shrink-0">
            <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent hover:text-destructive hover:border-destructive transition-colors text-sm">
              Back
            </Button>
            <Button
              onClick={onContinue}
              disabled={selectedGames.length === 0}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-sm"
            >
              Continue
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
