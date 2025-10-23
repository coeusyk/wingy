"use client"

import { Check } from "lucide-react"
import type { Game } from "@/types"

interface GameCardProps {
  game: Game
  isSelected: boolean
  onClick: () => void
}

export function GameCard({ game, isSelected, onClick }: GameCardProps) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg font-medium transition-all duration-200 border relative group ${
        isSelected
          ? "bg-primary text-primary-foreground border-primary glow-accent"
          : "bg-secondary text-secondary-foreground border-border hover:border-primary/50 hover:bg-secondary/80"
      }`}
      aria-pressed={isSelected}
    >
      <span className="relative z-10 text-sm md:text-base">{game.name}</span>
      {isSelected && (
        <>
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Check className="absolute top-1 right-1 w-4 h-4" />
        </>
      )}
    </button>
  )
}
