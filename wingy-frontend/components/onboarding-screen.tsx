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
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-background via-background to-card overflow-auto flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl float" />
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <Card className="w-full max-w-5xl max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] border-border/50 bg-card/80 backdrop-blur-sm slide-up relative z-10 overflow-hidden flex flex-col my-auto">
        <div className="p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto">
          {/* Logo and Title */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-block mb-3 sm:mb-4 p-2 sm:p-3 bg-primary/20 rounded-lg glow-accent">
              <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Wingy
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Your Gaming Assistant</h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-4">
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
