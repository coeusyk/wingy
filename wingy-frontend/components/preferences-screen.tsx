"use client"

import { Target, TrendingUp, BookOpen, Sparkles, Trophy, Gamepad2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { PreferenceType } from "@/types"

interface PreferencesScreenProps {
  selectedPreference: PreferenceType[]
  onPreferenceSelect: (preferences: PreferenceType[]) => void
  onContinue: () => void
  onBack: () => void
}

export function PreferencesScreen({
  selectedPreference,
  onPreferenceSelect,
  onContinue,
  onBack,
}: PreferencesScreenProps) {
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

  const handleToggle = (prefId: PreferenceType) => {
    const isSelected = selectedPreference.includes(prefId)
    if (isSelected) {
      onPreferenceSelect(selectedPreference.filter((p) => p !== prefId))
    } else {
      onPreferenceSelect([...selectedPreference, prefId])
    }
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
            <div className="mb-4 sm:mb-6 text-center flex-shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 px-2">What kind of help are you looking for?</h2>
              <p className="text-muted-foreground text-sm px-4">Select all that apply - choose multiple options</p>
            </div>

            {/* Preference cards - Fixed grid with consistent heights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6 flex-1 overflow-y-auto">
              {preferences.map((pref) => {
                const Icon = pref.icon
                const isSelected = selectedPreference.includes(pref.id)

                return (
                  <button
                    key={pref.id}
                    onClick={() => handleToggle(pref.id)}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 text-left hover:border-primary/50 flex flex-col h-full min-h-[100px] sm:min-h-[120px] ${
                      isSelected ? "border-primary bg-primary/10" : "border-border/50 bg-card/50 hover:bg-card/70"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-colors duration-300 ${isSelected ? "text-primary" : "text-accent"}`} />
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isSelected ? "bg-primary border-primary" : "border-border/50"
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-start">
                      <h3 className="font-semibold mb-1 text-sm leading-tight">{pref.title}</h3>
                      <p className="text-xs text-muted-foreground leading-snug">{pref.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Bottom actions */}
            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 md:pt-6 border-t border-border/50 flex-shrink-0">
              <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent text-sm">
                Back
              </Button>
              <Button
                onClick={onContinue}
                disabled={selectedPreference.length === 0}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-sm"
              >
                Start Chatting
              </Button>
            </div>
          </div>
        </Card>
    </div>
  )
}
