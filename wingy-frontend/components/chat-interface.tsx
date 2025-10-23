"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, Sparkles, Copy, Check, User, Lightbulb } from "lucide-react"
import { useGameContext } from "@/contexts/game-context"
import type { Message } from "@/types"

const SAMPLE_RESPONSES = [
  "That's a great question! Based on your game preferences, here's what I recommend...",
  "I can help you with that! Let me share some pro tips for your favorite games.",
  "Interesting! Here are some strategies that work well in competitive play.",
  "Great choice! Here's what top players are doing right now.",
  "I've got some insights that might help you improve your gameplay.",
]

const QUICK_ACTIONS = ["Ask for tips", "Game mechanics", "Strategy help"]

const SUGGESTED_QUESTIONS = [
  "How do I improve my aim in Valorant?",
  "What's the best starter build in Elden Ring?",
  "Teach me redstone basics in Minecraft",
]

export function ChatInterface() {
  const { selectedGames, messages, setMessages } = useGameContext()
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize welcome message on mount
  useEffect(() => {
    if (messages.length === 0 && selectedGames.length > 0) {
      const welcomeMessage: Message = {
        id: "1",
        content: `Welcome to Wingy! I'm your gaming assistant. I see you're interested in ${selectedGames.map((g) => g.name).join(", ")}. Ask me anything about strategies, tips, or game mechanics!`,
        sender: "agent",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [selectedGames, messages.length, setMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInputValue("")
    setIsLoading(true)

    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)],
        sender: "agent",
        timestamp: new Date(),
        isNew: true,
      }
      setMessages([...messages, userMessage, agentMessage])
      setIsLoading(false)
    }, 800)
  }

  const handleQuickAction = (action: string) => {
    setInputValue(action)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question)
  }

  const handleCopyMessage = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(messageId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const isEmptyChat = messages.length === 1 && !isLoading

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} slide-up`}
            onMouseEnter={() => setHoveredMessageId(message.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            <div className="flex gap-2 items-end max-w-xs md:max-w-md lg:max-w-lg">
              {message.sender === "agent" && (
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
              )}

              <div
                className={`px-4 py-3 rounded-lg relative group ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none glow-accent"
                    : "bg-card border border-border/50 text-foreground rounded-bl-none hover:border-primary/30 transition-colors"
                }`}
              >
                <p className="text-sm md:text-base leading-relaxed">{message.content}</p>

                <div className="flex items-center justify-between gap-2 mt-2">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {message.sender === "agent" && hoveredMessageId === message.id && (
                    <button
                      onClick={() => handleCopyMessage(message.content, message.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-primary/20 rounded"
                      aria-label="Copy message"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {message.isNew && message.sender === "agent" && (
                  <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
                    New
                  </div>
                )}
              </div>

              {message.sender === "user" && (
                <div className="w-6 h-6 rounded-full bg-primary/30 border border-primary/50 flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
          </div>
        ))}

        {isEmptyChat && (
          <div className="flex flex-col gap-6 mt-8">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              <p className="text-muted-foreground font-medium">Suggested questions:</p>
            </div>
            <div className="grid gap-3">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="p-3 rounded-lg bg-card border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all text-left text-sm text-foreground hover:text-primary"
                  aria-label={`Ask: ${question}`}
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="text-muted-foreground font-medium">Quick actions:</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  className="px-3 py-2 rounded-full bg-primary/20 text-primary border border-primary/30 hover:border-primary/60 hover:bg-primary/30 transition-all text-sm font-medium"
                  aria-label={`Quick action: ${action}`}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start slide-up">
            <div className="flex gap-2 items-end">
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3 h-3 text-primary" />
              </div>
              <div className="bg-card border border-border/50 text-foreground rounded-lg rounded-bl-none px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground ml-1">Wingy is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm p-4 md:p-6">
        <div className="flex gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about gaming strategies..."
            className="flex-1 bg-input border border-border/50 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none max-h-24"
            rows={1}
            aria-label="Message input"
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed pulse-glow"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </Button>
            {isLoading && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-border/50 hover:bg-secondary/50 bg-transparent"
                aria-label="Stop generating"
              >
                Stop
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Shift + Enter for new line</p>
      </div>
    </div>
  )
}
