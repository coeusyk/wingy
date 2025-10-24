"use client"

import { Card } from "@/components/ui/card"
import { Gamepad2 } from "lucide-react"
import { GameSelector } from "./game-selector"
import type { Game } from "@/types"

interface OnboardingScreenProps {
  onGameSelection: (games: Game[]) => void
}

export function OnboardingScreen({ onGameSelection }: OnboardingScreenProps) {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-background via-background to-card overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl float" />
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <Card className="w-full max-w-5xl border-border/50 bg-card/80 backdrop-blur-sm slide-up relative z-10">
        <div className="p-8 md:p-12">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4 p-3 bg-primary/20 rounded-lg glow-accent">
              <Gamepad2 className="w-8 h-8 text-primary" />
            </div>
            <div className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Wingy
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Gaming Assistant</h1>
            <p className="text-muted-foreground text-lg">
              Select your favorite games to get personalized gaming tips and strategies
            </p>
          </div>

          {/* Game Selector */}
          <GameSelector onGameSelection={onGameSelection} />
        </div>
      </Card>
    </div>
  )
}
