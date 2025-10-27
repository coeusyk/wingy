"use client"

import Image from "next/image"
import { Zap, BookOpen, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface WelcomeScreenProps {
  onContinue: () => void
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 bg-gradient-to-br from-background via-background to-card relative overflow-auto">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl float" />
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="w-full max-w-2xl relative z-10 my-8">
        {/* Main content card */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm slide-up">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Logo and title */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-block mb-3 sm:mb-4 p-2 sm:p-3 bg-primary/20 rounded-lg glow-accent">
                <Image
                  src="/wingy-logo-transparent.png"
                  alt="Wingy Logo"
                  width={48}
                  height={48}
                  className="w-8 h-8 sm:w-10 sm:h-10"
                  loading="eager"
                />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 sm:mb-3 leading-tight">
                Wingy
              </h1>
              <p className="text-lg sm:text-xl font-semibold text-foreground mb-2">Your Personal Gaming Assistant</p>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                Get expert tips, strategies, and help for any game—powered by AI
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
              <Card className="bg-card/50 border-border/30 p-3 sm:p-4 hover:border-primary/50 transition-all duration-300 hover:bg-card/70">
                <div className="flex flex-col items-center text-center">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-accent mb-2" />
                  <h3 className="font-semibold mb-1 text-sm">Expert Strategies</h3>
                  <p className="text-xs text-muted-foreground">Get competitive tips and advanced tactics</p>
                </div>
              </Card>

              <Card className="bg-card/50 border-border/30 p-3 sm:p-4 hover:border-primary/50 transition-all duration-300 hover:bg-card/70">
                <div className="flex flex-col items-center text-center">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-accent mb-2" />
                  <h3 className="font-semibold mb-1 text-sm">Learn Faster</h3>
                  <p className="text-xs text-muted-foreground">Beginner-friendly guides and tutorials</p>
                </div>
              </Card>

              <Card className="bg-card/50 border-border/30 p-3 sm:p-4 hover:border-primary/50 transition-all duration-300 hover:bg-card/70">
                <div className="flex flex-col items-center text-center">
                  <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-accent mb-2" />
                  <h3 className="font-semibold mb-1 text-sm">Any Game</h3>
                  <p className="text-xs text-muted-foreground">Support for thousands of games</p>
                </div>
              </Card>
            </div>

            {/* CTA button */}
            <div className="flex justify-center">
              <Button
                onClick={onContinue}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base pulse-glow w-full sm:w-auto"
              >
                Get Started
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
