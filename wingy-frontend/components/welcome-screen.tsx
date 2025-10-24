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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-card relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl float" />
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Main content card */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm slide-up">
          <div className="p-8 md:p-12">
            {/* Logo and title */}
            <div className="text-center mb-12">
              <div className="inline-block mb-6 p-4 bg-primary/20 rounded-lg glow-accent">
                <Image
                  src="/wingy-logo-transparent.png"
                  alt="Wingy Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                  loading="eager"
                />
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4 leading-tight">
                Wingy
              </h1>
              <p className="text-2xl font-semibold text-foreground mb-3">Your Personal Gaming Assistant</p>
              <p className="text-lg text-muted-foreground">
                Get expert tips, strategies, and help for any game—powered by AI
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <Card className="bg-card/50 border-border/30 p-6 hover:border-primary/50 transition-all duration-300 hover:bg-card/70">
                <div className="flex flex-col items-center text-center">
                  <Zap className="w-8 h-8 text-accent mb-3" />
                  <h3 className="font-semibold mb-2">Expert Strategies</h3>
                  <p className="text-sm text-muted-foreground">Get competitive tips and advanced tactics</p>
                </div>
              </Card>

              <Card className="bg-card/50 border-border/30 p-6 hover:border-primary/50 transition-all duration-300 hover:bg-card/70">
                <div className="flex flex-col items-center text-center">
                  <BookOpen className="w-8 h-8 text-accent mb-3" />
                  <h3 className="font-semibold mb-2">Learn Faster</h3>
                  <p className="text-sm text-muted-foreground">Beginner-friendly guides and tutorials</p>
                </div>
              </Card>

              <Card className="bg-card/50 border-border/30 p-6 hover:border-primary/50 transition-all duration-300 hover:bg-card/70">
                <div className="flex flex-col items-center text-center">
                  <Lightbulb className="w-8 h-8 text-accent mb-3" />
                  <h3 className="font-semibold mb-2">Any Game</h3>
                  <p className="text-sm text-muted-foreground">Support for thousands of games</p>
                </div>
              </Card>
            </div>

            {/* CTA button */}
            <div className="flex justify-center">
              <Button
                onClick={onContinue}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-8 py-6 text-lg pulse-glow"
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
