"use client"

import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-destructive/10 border border-destructive/30 rounded-lg">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <p className="font-medium text-sm sm:text-base break-words">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-2 bg-transparent text-xs sm:text-sm">
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}
