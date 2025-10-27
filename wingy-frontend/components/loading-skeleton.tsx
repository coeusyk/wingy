import { Card } from "@/components/ui/card"

export function GameCardSkeleton() {
  return (
    <Card className="p-2.5 sm:p-3 bg-secondary/50 border-border/30 animate-pulse">
      <div className="h-5 sm:h-6 bg-secondary rounded w-3/4" />
    </Card>
  )
}

export function GameGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  )
}

export const LoadingSkeleton = GameCardSkeleton
