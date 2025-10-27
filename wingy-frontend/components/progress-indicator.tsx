"use client"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 max-w-5xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center flex-1">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center flex-1">
            {/* Step circle */}
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 flex-shrink-0 ${
                index + 1 <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            {/* Connector line */}
            {index < totalSteps - 1 && (
              <div
                className={`flex-1 h-0.5 sm:h-1 rounded-full transition-all duration-300 ${
                  index + 1 < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      {/* Step text */}
      <div className="ml-2 sm:ml-3 md:ml-4 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  )
}
