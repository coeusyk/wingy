"use client"

import { useState, useEffect } from "react"
import { X, Save, Target, TrendingUp, BookOpen, Sparkles, Trophy, Gamepad2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/user-context"
import { fetchAllGames } from "@/lib/api"
import type { Game, PreferenceType } from "@/types"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const preferences = [
  {
    id: "competitive" as const,
    icon: Trophy,
    title: "Competitive Play",
    description: "Ranked strategies and pro tips",
  },
  {
    id: "improvement" as const,
    icon: TrendingUp,
    title: "Skill Improvement",
    description: "Level up your gameplay",
  },
  {
    id: "learning" as const,
    icon: BookOpen,
    title: "Learn Mechanics",
    description: "Game mechanics and basics",
  },
  {
    id: "strategy" as const,
    icon: Target,
    title: "Strategy & Tactics",
    description: "Advanced decision making",
  },
  {
    id: "entertainment" as const,
    icon: Sparkles,
    title: "Fun & Entertainment",
    description: "Casual tips and tricks",
  },
  {
    id: "general" as const,
    icon: Gamepad2,
    title: "General Assistance",
    description: "All-around gaming help",
  },
]

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, updatePreferences } = useUser()
  const [allGames, setAllGames] = useState<Game[]>([])
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [selectedPreferences, setSelectedPreferences] = useState<PreferenceType[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      // Load current preferences
      if (user?.preferences) {
        setSelectedGames(user.preferences.games || [])
        setSelectedPreferences(user.preferences.preferences as PreferenceType[] || [])
      }

      // Load all games
      const loadGames = async () => {
        try {
          const games = await fetchAllGames()
          setAllGames(games)
        } catch (error) {
          console.error("Error loading games:", error)
        } finally {
          setIsLoading(false)
        }
      }
      loadGames()
    }
  }, [isOpen, user])

  const handleGameToggle = (gameId: string) => {
    setSelectedGames((prev) =>
      prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]
    )
  }

  const handlePreferenceToggle = (prefId: PreferenceType) => {
    setSelectedPreferences((prev) =>
      prev.includes(prefId) ? prev.filter((id) => id !== prefId) : [...prev, prefId]
    )
  }

  const handleSave = async () => {
    if (selectedGames.length === 0 || selectedPreferences.length === 0) {
      alert("Please select at least one game and one preference")
      return
    }

    setIsSaving(true)
    try {
      await updatePreferences({
        games: selectedGames,
        preferences: selectedPreferences,
        onboarded: true,
      })
      onClose()
    } catch (error) {
      console.error("Error saving preferences:", error)
      alert("Failed to save preferences. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-card border-2 border-border/50 rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Games Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Your Games</h3>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-24 bg-secondary/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {allGames.map((game) => {
                  const isSelected = selectedGames.includes(game.id)
                  return (
                    <button
                      key={game.id}
                      onClick={() => handleGameToggle(game.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        isSelected
                          ? "border-primary bg-primary/20"
                          : "border-border/50 hover:border-primary/50"
                      }`}
                    >
                      <div className="text-2xl mb-1">{game.abbr}</div>
                      <div className="text-xs font-medium truncate">{game.name}</div>
                    </button>
                  )
                })}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {selectedGames.length} game{selectedGames.length !== 1 ? "s" : ""} selected
            </p>
          </div>

          {/* Preferences Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Assistant Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {preferences.map((pref) => {
                const Icon = pref.icon
                const isSelected = selectedPreferences.includes(pref.id)

                return (
                  <button
                    key={pref.id}
                    onClick={() => handlePreferenceToggle(pref.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/50 hover:bg-card/70"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Icon
                        className={`w-6 h-6 ${isSelected ? "text-primary" : "text-accent"}`}
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? "bg-primary border-primary" : "border-border/50"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{pref.title}</h4>
                    <p className="text-xs text-muted-foreground">{pref.description}</p>
                  </button>
                )
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {selectedPreferences.length} preference{selectedPreferences.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border/50">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-border/50"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || selectedGames.length === 0 || selectedPreferences.length === 0}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
