"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Send, Sparkles, Copy, Check, User, Lightbulb } from "lucide-react"
import { useGameContext } from "@/contexts/game-context"
import { useThreads } from "@/contexts/thread-context"
import { getSuggestedQuestions, type SuggestedQuestion } from "@/lib/api"
import { MarkdownMessage } from "./markdown-message"

export function ChatInterface() {
  const { selectedGames, preference } = useGameContext()
  const { activeThread, messages, sendMessage, isLoading: threadLoading } = useThreads()
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([])
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
          console.error("[ChatInterface] Error fetching suggested questions:", err)
          // Fallback to empty array if fetch fails
          setSuggestedQuestions([])
        }
      }
    }

    fetchSuggestedQuestions()
  }, [selectedGames])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px" // Reset to min height
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`
    }
  }, [inputValue])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeThread) return

    setIsLoading(true)
    setError(null)
    const messageContent = inputValue
    setInputValue("")

    try {
      await sendMessage(messageContent)
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

  const isEmptyChat = messages.length === 0 && !isLoading && !threadLoading

  return (
    <div className="flex flex-col h-screen lg:h-[calc(100vh-80px)] lg:ml-0">
      {/* No Active Thread State */}
      {!activeThread ? (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">No Chat Selected</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
              Select a conversation from the sidebar or create a new chat to get started.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        
        {/* Initial greeting message - only shows when no messages */}
        {isEmptyChat && (
          <div className="flex justify-start slide-up">
            <div className="flex gap-2 items-end max-w-[85%] sm:max-w-[80%] mr-auto ml-4 sm:ml-6">
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3 h-3 text-primary" />
              </div>
              <div className="bg-card border border-border/50 text-foreground rounded-lg rounded-bl-none px-4 py-3">
                <div className="space-y-2">
                  {selectedGames.length > 0 ? (
                    <>
                      <p className="text-sm sm:text-base leading-relaxed">
                        👋 I can help you with{" "}
                        <span className="font-medium text-primary">
                          {selectedGames.map((g, idx) => (
                            <span key={g.id}>
                              {g.name}
                              {idx < selectedGames.length - 2 ? ", " : idx === selectedGames.length - 2 ? " and " : ""}
                            </span>
                          ))}
                        </span>
                        {preference.length > 0 && (
                          <span>
                            {" - focusing on "}
                            <span className="font-medium text-accent">
                              {preference.map(p => p.replace(/_/g, " ")).join(", ")}
                            </span>
                          </span>
                        )}.
                      </p>
                      <p className="text-sm sm:text-base leading-relaxed">
                        Ask me anything - tips, strategies, mechanics, or just chat about your favorite games! 🎮
                      </p>
                    </>
                  ) : (
                    <p className="text-sm sm:text-base leading-relaxed">
                      👋 Ask me anything - tips, strategies, mechanics, or just chat about your favorite games! 🎮
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
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
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
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
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              <p className="text-sm sm:text-base text-muted-foreground font-medium">Suggested questions:</p>
            </div>
            <div className="grid gap-2">
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
                      <span className="flex-1 break-words">{q.question}</span>
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

            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="text-sm sm:text-base text-muted-foreground font-medium">Quick actions:</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, idx) => (
                <button
                  key={`${action.text}-${idx}`}
                  onClick={() => handleQuickAction(action.text, action.game)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:border-primary/60 hover:bg-primary/30 transition-all text-xs sm:text-sm font-medium"
                  aria-label={`Quick action: ${action.text}${action.game ? ` for ${action.game.name}` : ""}`}
                >
                  <span>{action.text}</span>
                  {action.game && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/30 border border-primary/50">
                      {action.game.abbr}
                    </span>
                  )}
                </button>
              ))}
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

      {/* Input Area */}
      <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm p-3 sm:p-4 shadow-lg">
        {!activeThread ? (
          <div className="text-center text-muted-foreground text-xs sm:text-sm py-2">
            Select or create a chat to start messaging
          </div>
        ) : (
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="w-full bg-input border border-border/50 rounded-lg px-3 sm:px-4 py-3 text-sm sm:text-base text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none overflow-y-auto min-h-[48px] max-h-[200px]"
                style={{ height: "48px" }}
                aria-label="Message input"
              />
              <p className="text-[10px] text-muted-foreground mt-1 ml-1">Shift + Enter for new line</p>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 w-12 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  )
}
