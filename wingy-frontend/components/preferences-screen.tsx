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
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-background via-background to-card overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl float" />
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <Card className="w-full max-w-4xl border-border/50 bg-card/80 backdrop-blur-sm slide-up relative z-10">
          <div className="p-8 md:p-12">
            {/* Header */}
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-bold mb-3">What kind of help are you looking for?</h2>
              <p className="text-muted-foreground text-lg">Select all that apply - choose multiple options</p>
            </div>

            {/* Preference cards - Fixed grid with consistent heights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {preferences.map((pref) => {
                const Icon = pref.icon
                const isSelected = selectedPreference.includes(pref.id)

                return (
                  <button
                    key={pref.id}
                    onClick={() => handleToggle(pref.id)}
                    className={`p-6 rounded-lg border-2 transition-all duration-200 text-left hover:border-primary/50 flex flex-col h-full min-h-[140px] ${
                      isSelected ? "border-primary bg-primary/10" : "border-border/50 bg-card/50 hover:bg-card/70"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Icon className={`w-8 h-8 flex-shrink-0 transition-colors duration-300 ${isSelected ? "text-primary" : "text-accent"}`} />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isSelected ? "bg-primary border-primary" : "border-border/50"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-start">
                      <h3 className="font-semibold mb-2 text-base leading-tight">{pref.title}</h3>
                      <p className="text-sm text-muted-foreground leading-snug">{pref.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Bottom actions */}
            <div className="flex gap-4 pt-8 border-t border-border/50">
              <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
                Back
              </Button>
              <Button
                onClick={onContinue}
                disabled={selectedPreference.length === 0}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                Start Chatting
              </Button>
            </div>
          </div>
        </Card>
    </div>
  )
}
