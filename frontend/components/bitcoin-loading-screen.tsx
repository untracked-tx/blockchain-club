"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Bitcoin, Sparkles, Zap, TrendingUp } from "lucide-react"

// Loading messages for the Bitcoin-themed loading screen
const loadingMessages = [
   "🚀 Indexing Data Please HODL...",
   "🌍 Borderless money syncing...",
   "💸 Fun fact: USD lost 95% value since Federal Reserve creation!",
   "🌐 Peer-to-peer magic happening...",
   "🏃‍♂️ Opting out of fiat...",
   "🗝️ Verifying, not trusting...",
  "📈 Calculating those sweet gains...",
]

interface BitcoinLoadingScreenProps {
  message?: string
}

export const BitcoinLoadingScreen: React.FC<BitcoinLoadingScreenProps> = ({ message }) => {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [shuffledMessages, setShuffledMessages] = useState<string[]>([])
  const [messageIndex, setMessageIndex] = useState(0)

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Initialize shuffled messages on component mount
  useEffect(() => {
    setShuffledMessages(shuffleArray(loadingMessages))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => {
        const nextIndex = prev + 1
        // If we've shown all messages, reshuffle and start over
        if (nextIndex >= shuffledMessages.length) {
          setShuffledMessages(shuffleArray(loadingMessages))
          return 0
        }
        return nextIndex
      })
    }, 3200)

    return () => clearInterval(interval)
  }, [shuffledMessages])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto border-border/50 shadow-2xl">
        <CardContent className="p-8 text-center space-y-6">
          {/* Animated Bitcoin Icon */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <Bitcoin className="h-16 w-16 mx-auto text-orange-500/30" />
            </div>
            <Bitcoin className="h-16 w-16 mx-auto text-orange-500 relative z-10" />
          </div>

          {/* Loading Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
              Portfolio Loading
              <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
            </h2>
            <p className="text-muted-foreground">Preparing your blockchain dashboard</p>
          </div>

          {/* Loading Icons */}
          <div className="flex justify-center space-x-4">
            <Zap className="h-8 w-8 text-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <TrendingUp className="h-8 w-8 text-green-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <Bitcoin className="h-8 w-8 text-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>

          {/* Rotating Messages */}
          <div className="min-h-[3rem] flex items-center justify-center">
            <p className="text-lg font-medium text-foreground animate-pulse">
              {message || (shuffledMessages.length > 0 ? shuffledMessages[messageIndex] : loadingMessages[0])}
            </p>
          </div>

          {/* Subtle hint */}
          <p className="text-xs text-muted-foreground/70">
            Building your personalized crypto experience...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
