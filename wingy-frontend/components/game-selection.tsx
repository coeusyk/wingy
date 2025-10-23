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
      }
      onGameSelect([...selectedGames, customGame])
      setCustomGameInput("")
      setShowCustomInput(false)
    }
  }

  const handleRemoveGame = (gameId: string) => {
    onGameSelect(selectedGames.filter((g) => g.id !== gameId))
  }

  // Separate popular games (first 12) from others
  const popularGames = games.slice(0, 12)
  const otherGames = games.slice(12)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-card relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl float" />
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <Card className="w-full max-w-5xl border-border/50 bg-card/80 backdrop-blur-sm slide-up relative z-10">
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2">Which games do you play?</h2>
            <p className="text-muted-foreground text-lg">Select your favorites to get personalized tips</p>
          </div>

          {/* Search bar */}
          <div className="mb-8 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-base"
              aria-label="Search games"
            />
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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
              {/* Popular games section */}
              {!searchQuery && popularGames.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
                    Popular Games
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {popularGames.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        isSelected={selectedGames.some((g) => g.id === game.id)}
                        onClick={() => handleGameToggle(game)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All games or search results */}
              {(searchQuery || otherGames.length > 0) && (
                <div className="mb-8">
                  {searchQuery && (
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
                      Search Results
                    </h3>
                  )}
                  {filteredGames.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No games found</p>
                    </div>
                  )}
                </div>
              )}

              {/* Custom game button */}
              {!showCustomInput && (
                <Button
                  variant="outline"
                  className="w-full mb-8 border-dashed bg-transparent"
                  onClick={() => setShowCustomInput(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Game
                </Button>
              )}

              {/* Custom game input */}
              {showCustomInput && (
                <div className="mb-8 flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter game name..."
                    value={customGameInput}
                    onChange={(e) => setCustomGameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddCustomGame()
                    }}
                    autoFocus
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

              {/* Selected games display */}
              {selectedGames.length > 0 && (
                <div className="mb-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm font-semibold mb-3">
                    {selectedGames.length} game{selectedGames.length !== 1 ? "s" : ""} selected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedGames.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center gap-2 bg-primary/20 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{game.name}</span>
                        <button
                          onClick={() => handleRemoveGame(game.id)}
                          className="hover:text-destructive transition-colors"
                          aria-label={`Remove ${game.name}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Bottom actions */}
          <div className="flex gap-4 pt-8 border-t border-border/50">
            <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
              Back
            </Button>
            <Button
              onClick={onContinue}
              disabled={selectedGames.length === 0}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              Continue
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
