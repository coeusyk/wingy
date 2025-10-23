"use client"

import { WelcomeScreen } from "./welcome-screen"
import { GameSelection } from "./game-selection"
import { PreferencesScreen } from "./preferences-screen"
import { ProgressIndicator } from "./progress-indicator"
import { useGameContext } from "@/contexts/game-context"
import type { Game } from "@/types"

interface OnboardingContainerProps {
  onComplete: () => void
}

export function OnboardingContainer({ onComplete }: OnboardingContainerProps) {
  const { currentStep, setCurrentStep, selectedGames, setSelectedGames, preference, setPreference } = useGameContext()

  const handleGameSelection = (games: Game[]) => {
    setSelectedGames(games)
    setCurrentStep(3)
  }

  const handlePreferenceSelect = (pref: string | null) => {
    setPreference(pref as any)
  }

  const handleComplete = () => {
    onComplete()
  }

  return (
    <div>
      {currentStep > 1 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4">
          <div className="max-w-7xl mx-auto">
            <ProgressIndicator currentStep={currentStep} totalSteps={3} />
          </div>
        </div>
      )}

      <div className={currentStep > 1 ? "pt-24" : ""}>
        {currentStep === 1 && <WelcomeScreen onContinue={() => setCurrentStep(2)} />}

        {currentStep === 2 && (
          <GameSelection
            selectedGames={selectedGames}
            onGameSelect={handleGameSelection}
            onContinue={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <PreferencesScreen
            selectedPreference={preference}
            onPreferenceSelect={handlePreferenceSelect}
            onContinue={handleComplete}
            onBack={() => setCurrentStep(2)}
          />
        )}
      </div>
    </div>
  )
}
