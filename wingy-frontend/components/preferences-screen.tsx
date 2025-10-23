"use client"

import { Target, BookOpen, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { PreferenceType } from "@/types"

interface PreferencesScreenProps {
  selectedPreference: PreferenceType
  onPreferenceSelect: (preference: PreferenceType) => void
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
      icon: Target,
      title: "Competitive Strategies",
      description: "Ranked play, meta analysis, pro tips",
    },
    {
      id: "learning" as const,
      icon: BookOpen,
      title: "Learning & Tutorials",
      description: "Beginner guides, mechanics, basics",
    },
    {
      id: "general" as const,
      icon: Lightbulb,
      title: "General Tips",
      description: "Everything from basics to advanced",
    },
  ]

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

      <Card className="w-full max-w-3xl border-border/50 bg-card/80 backdrop-blur-sm slide-up relative z-10">
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold mb-3">What kind of help are you looking for?</h2>
            <p className="text-muted-foreground text-lg">Choose your preferred gaming assistance style</p>
          </div>

          {/* Preference cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {preferences.map((pref) => {
              const Icon = pref.icon
              const isSelected = selectedPreference === pref.id

              return (
                <button
                  key={pref.id}
                  onClick={() => onPreferenceSelect(pref.id)}
                  className={`p-6 rounded-lg border-2 transition-all duration-300 text-left hover:border-primary/50 ${
                    isSelected ? "border-primary bg-primary/10" : "border-border/50 bg-card/50 hover:bg-card/70"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Icon className={`w-8 h-8 ${isSelected ? "text-primary" : "text-accent"}`} />
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2">{pref.title}</h3>
                  <p className="text-sm text-muted-foreground">{pref.description}</p>
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
              disabled={!selectedPreference}
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
