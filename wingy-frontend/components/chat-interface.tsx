"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, Sparkles, Copy, Check, User, Lightbulb } from "lucide-react"
import { useGameContext } from "@/contexts/game-context"
import { sendChatMessage, getSuggestedQuestions, type SuggestedQuestion } from "@/lib/api"
import type { Message } from "@/types"
import { MarkdownMessage } from "./markdown-message"

const QUICK_ACTIONS = ["Ask for tips", "Game mechanics", "Strategy help"]

export function ChatInterface() {
  const { selectedGames, preference, sessionId, setSessionId, messages, setMessages } = useGameContext()
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Generate session ID if not exists
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)
    }
  }, [sessionId, setSessionId])

  // Fetch suggested questions when games are selected
  useEffect(() => {
    const fetchSuggestedQuestions = async () => {
      if (selectedGames.length > 0) {
        try {
          const gameIds = selectedGames.map((g) => g.id)
          const questions = await getSuggestedQuestions(gameIds)
          // Limit to top 3 questions
          setSuggestedQuestions(questions.slice(0, 3))
        } catch (err) {
          console.error("[v0] Error fetching suggested questions:", err)
          // Fallback to empty array if fetch fails
          setSuggestedQuestions([])
        }
      }
    }

    fetchSuggestedQuestions()
  }, [selectedGames])

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
    if (!inputValue.trim() || !sessionId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInputValue("")
    setIsLoading(true)
    setError(null)

    try {
      // Prepare request
      const request = {
        message: inputValue,
        session_id: sessionId,
        games: selectedGames.map((g) => g.name),
        preferences: preference,
      }

      // Send to API
      const response = await sendChatMessage(request)

      // Add agent response
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: "agent",
        timestamp: new Date(),
        isNew: true,
      }
      setMessages([...messages, userMessage, agentMessage])
    } catch (err) {
      console.error("[v0] Error sending message:", err)
      setError(err instanceof Error ? err.message : "Failed to send message")
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error processing your message. Please try again.",
        sender: "agent",
        timestamp: new Date(),
        isNew: true,
      }
      setMessages([...messages, userMessage, errorMessage])
    } finally {
      setIsLoading(false)
    }
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
          >
            <div className={`flex gap-2 items-end ${
              message.sender === "user" 
                ? "max-w-[80%] sm:max-w-[80%] ml-auto mr-4 sm:mr-6" 
                : "max-w-[80%] sm:max-w-[80%] mr-auto ml-4 sm:ml-6"
            }`}>
              {message.sender === "agent" && (
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
              )}

              <div
                className={`px-4 py-3 rounded-lg relative group ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-card border border-border/50 text-foreground rounded-bl-none hover:border-primary/30 transition-colors"
                }`}
              >
                {message.sender === "agent" ? (
                  <MarkdownMessage content={message.content} />
                ) : (
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                )}

                {/* Copy button - always in DOM, hidden with opacity */}
                {message.sender === "agent" && (
                  <button
                    onClick={() => handleCopyMessage(message.content, message.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity p-1 hover:bg-primary/20 rounded will-change-opacity"
                    aria-label="Copy message"
                  >
                    {copiedId === message.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}

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
            <div className="grid gap-1">
              {suggestedQuestions.length > 0 ? (
                suggestedQuestions.map((q) => {
                  // Find the game that this question belongs to
                  const game = selectedGames.find((g) => g.id === q.game_id)
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleSuggestedQuestion(q.question)}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-card border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all text-left text-sm text-foreground hover:text-primary"
                      aria-label={`Ask: ${q.question}`}
                    >
                      <span className="flex-1">{q.question}</span>
                      {game && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full bg-primary/30 border border-primary/50 flex-shrink-0"
                          title={game.name}
                        >
                          {game.abbr}
                        </span>
                      )}
                    </button>
                  )
                })
              ) : (
                <p className="text-muted-foreground text-sm">Select games to see personalized questions</p>
              )}
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
                  className="px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:border-primary/60 hover:bg-primary/30 transition-all text-sm font-medium"
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
      <div className="border-t-2 border-primary/30 bg-card/80 backdrop-blur-sm p-4 md:p-6 shadow-lg">
        <div className="flex gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about gaming strategies..."
            className="flex-1 bg-input border-2 border-primary/40 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none max-h-24 shadow-sm hover:border-primary/60"
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
