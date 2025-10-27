"use client"

import { WelcomeScreen } from "./welcome-screen"
import { GameSelection } from "./game-selection"
import { PreferencesScreen } from "./preferences-screen"
import { VerticalProgressIndicator } from "./vertical-progress-indicator"
import { useGameContext } from "@/contexts/game-context"
import type { Game, PreferenceType } from "@/types"

interface OnboardingContainerProps {
  onComplete: (games: string[], preferences: string[]) => void
}

const ONBOARDING_STEPS = [
  { number: 1, title: "Welcome", description: "Get started" },
  { number: 2, title: "Select Games", description: "Choose your games" },
  { number: 3, title: "Preferences", description: "Set your goals" },
]

export function OnboardingContainer({ onComplete }: OnboardingContainerProps) {
  const { currentStep, setCurrentStep, selectedGames, setSelectedGames, preference, setPreference } = useGameContext()

  const handleGameSelection = (games: Game[]) => {
    setSelectedGames(games)
  }

  const handlePreferenceSelect = (prefs: PreferenceType[]) => {
    setPreference(prefs)
  }

  const handleComplete = () => {
    // Convert selected games to game IDs (strings)
    const gameIds = selectedGames.map((game) => game.id)
    // Pass both games and preferences to the parent
    onComplete(gameIds, preference)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Vertical Progress Indicator - Hidden on step 1, visible on steps 2-3 */}
      {currentStep > 1 && (
        <div className="hidden lg:block">
          <VerticalProgressIndicator currentStep={currentStep} steps={ONBOARDING_STEPS} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
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
