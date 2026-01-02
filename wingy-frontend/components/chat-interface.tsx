"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { Button } from "@/components/ui/button"
import { Send, Sparkles, Copy, Check, User, Lightbulb, AlertCircle, X } from "lucide-react"
import { useGameContext } from "@/contexts/game-context"
import { useThreads } from "@/contexts/thread-context"
import { useUser } from "@/contexts/user-context"
import { getSuggestedQuestions, type SuggestedQuestion } from "@/lib/api"
import { MarkdownMessage } from "./markdown-message"

export function ChatInterface() {
  const { selectedGames, preference } = useGameContext()
  const { activeThread, messages, sendMessage, isLoading: threadLoading } = useThreads()
  const { user } = useUser()
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([])
  const [lastFetchedGameIds, setLastFetchedGameIds] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Generate dynamic quick actions based on selected games and preferences
  const quickActions = useMemo(() => {
    if (selectedGames.length === 0) {
      return [
        { text: "Ask for tips", game: null as typeof selectedGames[0] | null },
        { text: "Game mechanics", game: null as typeof selectedGames[0] | null },
        { text: "Strategy help", game: null as typeof selectedGames[0] | null },
      ]
    }

    const actions: Array<{ text: string; game: typeof selectedGames[0] | null }> = []
    
    // Add preference-based action if available
    if (preference.length > 0) {
      const pref = preference[0]
      const prefMap: Record<string, string> = {
        competitive: "Ranked strategies",
        improvement: "How to improve",
        learning: "Explain mechanics",
        strategy: "Advanced tactics",
        entertainment: "Fun tips",
        general: "General help",
      }
      actions.push({ text: prefMap[pref] || "Ask for tips", game: null })
    }

    // Add game-specific actions for first 2-3 games
    const gamesToShow = selectedGames.slice(0, 2)
    gamesToShow.forEach((game) => {
      if (preference.includes("competitive")) {
        actions.push({ text: `Best builds for`, game })
      } else if (preference.includes("strategy")) {
        actions.push({ text: `Counters and tactics for`, game })
      } else {
        actions.push({ text: `Tips for`, game })
      }
    })

    // If we have space, add a general action
    if (actions.length < 4) {
      actions.push({ text: "Common mistakes to avoid", game: null })
    }

    return actions.slice(0, 4) // Limit to 4 actions
  }, [selectedGames, preference])

  // Check if chat is empty
  const isEmptyChat = messages.length === 0 && !isLoading && !threadLoading

  // Fetch suggested questions when games are selected and chat is empty
  useEffect(() => {
    const fetchSuggestedQuestions = async () => {
      // Create a stable string representation of game IDs
      const gameIds = selectedGames.map((g) => g.id).sort().join(",")
      
      // Skip if no games selected, already fetched for these games, or chat has messages
      if (!gameIds || gameIds === lastFetchedGameIds || !isEmptyChat) {
        return
      }
      
      if (selectedGames.length > 0) {
        try {
          const gameIdArray = selectedGames.map((g) => g.id)
          const questions = await getSuggestedQuestions(gameIdArray)
          // Limit to top 3 questions
          setSuggestedQuestions(questions.slice(0, 3))
          setLastFetchedGameIds(gameIds)
        } catch (err) {
          console.error("[ChatInterface] Error fetching suggested questions:", err)
          // Fallback to empty array if fetch fails
          setSuggestedQuestions([])
        }
      } else {
        setSuggestedQuestions([])
        setLastFetchedGameIds("")
      }
    }

    fetchSuggestedQuestions()
  }, [selectedGames, isEmptyChat, lastFetchedGameIds, isLoading, threadLoading, messages.length])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-scroll textarea to bottom when content changes
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.scrollTop = textarea.scrollHeight
    }
  }, [inputValue])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    setIsLoading(true)
    setError(null)
    const messageContent = inputValue
    setInputValue("")

    try {
      // Pass user info and game context for lazy thread creation
      const gameIds = selectedGames.map(g => g.id)
      await sendMessage(messageContent, user?.id, gameIds, preference)
    } catch (err) {
      console.error("[ChatInterface] Error sending message:", err)
      setError(err instanceof Error ? err.message : "Failed to send message")
      // Restore input on error
      setInputValue(messageContent)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (text: string, game: typeof selectedGames[0] | null) => {
    let fullText = text
    if (game) {
      fullText = `${text} ${game.name}`
    }
    setInputValue(fullText)
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

  return (
    <div className="flex flex-col h-screen lg:h-[calc(100vh-80px)] lg:ml-0">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-4xl mx-auto space-y-4">
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} slide-up`}
          >
            <div className={`flex gap-2 items-end ${
              message.role === "user" 
                ? "max-w-[85%] sm:max-w-[80%] ml-auto mr-4 sm:mr-6" 
                : "max-w-[85%] sm:max-w-[80%] mr-auto ml-4 sm:ml-6"
            }`}>
              {message.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
              )}

              <div
                className={`px-4 py-3 rounded-lg relative group ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-card border border-border/50 text-foreground rounded-bl-none hover:border-primary/30 transition-colors"
                }`}
              >
                {message.role === "assistant" ? (
                  <MarkdownMessage content={message.content} />
                ) : (
                  <p className="text-base sm:text-lg font-medium leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                )}

                {/* Copy button - always in DOM, hidden with opacity */}
                {message.role === "assistant" && (
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
              </div>

              {message.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-primary/30 border border-primary/50 flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
          </div>
        ))}

        {isEmptyChat && (
          <div className="flex flex-col gap-6 mt-8">
            {/* Suggested Questions Section */}
            <div className="flex gap-2 ml-4 sm:ml-6">
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground/70 font-normal mb-3">Suggested questions:</p>
                <div className="grid gap-1.5">
                  {suggestedQuestions.length > 0 ? (
                    suggestedQuestions.map((q) => {
                      // Find the game that this question belongs to
                      const game = selectedGames.find((g) => g.id === q.game_id)
                      
                      return (
                        <button
                          key={q.id}
                          onClick={() => handleSuggestedQuestion(q.question)}
                          className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-transparent border border-border/30 hover:border-primary/40 hover:bg-card/30 transition-all text-left text-xs sm:text-sm text-muted-foreground hover:text-foreground"
                          aria-label={`Ask: ${q.question}`}
                        >
                          <span className="flex-1 break-words">{q.question}</span>
                          {game && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 border border-primary/30 flex-shrink-0"
                              title={game.name}
                            >
                              {game.abbr}
                            </span>
                          )}
                        </button>
                      )
                    })
                  ) : (
                    <p className="text-muted-foreground/60 text-xs sm:text-sm">Select games to see personalized questions</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="flex gap-2 ml-4 sm:ml-6">
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground/70 font-normal mb-3">Quick actions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickActions.map((action, idx) => (
                    <button
                      key={`${action.text}-${idx}`}
                      onClick={() => handleQuickAction(action.text, action.game)}
                      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md bg-transparent text-muted-foreground border border-border/30 hover:border-primary/40 hover:bg-card/30 hover:text-foreground transition-all text-xs sm:text-sm font-normal"
                      aria-label={`Quick action: ${action.text}${action.game ? ` for ${action.game.name}` : ""}`}
                    >
                      <span>{action.text}</span>
                      {action.game && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 border border-primary/30">
                          {action.game.abbr}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start slide-up">
            <div className="flex gap-2 items-end ml-4 sm:ml-6">
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
          </div>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm p-3 sm:p-4 shadow-lg">
        {/* Error Message Banner */}
        {error && (
          <div className="max-w-4xl mx-auto mb-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-destructive/20 rounded transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <TextareaAutosize
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Ask me anything..."
                minRows={1}
                maxRows={10}
                className="w-full bg-input border border-border/50 rounded-lg px-3 sm:px-4 py-3 text-sm sm:text-base text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                style={{ transition: "none" }}
                aria-label="Message input"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-12.75 w-12 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 ml-1">Shift + Enter for new line</p>
        </div>
      </div>
    </div>
  )
}
