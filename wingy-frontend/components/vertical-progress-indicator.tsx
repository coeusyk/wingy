"use client"

import { Check } from "lucide-react"

interface Step {
  number: number
  title: string
  description?: string
}

interface VerticalProgressIndicatorProps {
  currentStep: number
  steps: Step[]
}

export function VerticalProgressIndicator({ currentStep, steps }: VerticalProgressIndicatorProps) {
  return (
    <div className="w-56 lg:w-60 flex-shrink-0 border-r border-border/50 bg-card/30 p-4 lg:p-6">
      <div className="space-y-1">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep
          const isActive = step.number === currentStep
          const isUpcoming = step.number > currentStep

          return (
            <div key={step.number} className="relative">
              {/* Step Item */}
              <div className="flex items-start gap-3">
                {/* Step Circle/Icon */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                      isCompleted
                        ? "bg-green-500/20 border-2 border-green-500 text-green-500"
                        : isActive
                        ? "bg-primary border-2 border-primary text-primary-foreground scale-110"
                        : "bg-muted/50 border-2 border-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>

                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute left-1/2 top-8 w-0.5 h-8 -ml-px transition-colors duration-300 ${
                        isCompleted ? "bg-green-500" : "bg-muted"
                      }`}
                    />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-1 min-w-0">
                  <h3
                    className={`font-semibold text-sm transition-colors duration-300 ${
                      isActive
                        ? "text-primary"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </h3>
                  {step.description && (
                    <p
                      className={`text-xs mt-0.5 transition-colors duration-300 ${
                        isActive ? "text-primary/70" : "text-muted-foreground"
                      }`}
                    >
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Spacing between steps */}
              {index < steps.length - 1 && <div className="h-4" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
