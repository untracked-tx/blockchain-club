"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Bitcoin, Sparkles, Zap, TrendingUp } from "lucide-react"

// Loading messages for the Bitcoin-themed loading screen
const loadingMessages = [
  "🚀 Sending API calls to the moon...",
  "🍕 Remember Bitcoin Pizza Day? 10,000 BTC for 2 pizzas!",
  "💎 Diamond hands loading portfolio data...",
  "⚡ Lightning fast blockchain sync in progress...",
  "🌙 To the moon! Fetching your crypto gains...", 
  "🔥 Portfolio having a bullish moment...",
  "📈 Calculating those sweet gains...",
  "⭐ Hodling while we load your data...",
  "🚨 Breaking: Your portfolio is loading...",
  "💰 Satoshi would be proud... Loading complete soon!"
]

interface BitcoinLoadingScreenProps {
  message?: string
}

export const BitcoinLoadingScreen: React.FC<BitcoinLoadingScreenProps> = ({ message }) => {
  const [currentMessage, setCurrentMessage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % loadingMessages.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

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

          {/* Simple Loading Spinner */}
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>

          {/* Rotating Messages */}
          <div className="min-h-[3rem] flex items-center justify-center">
            <p className="text-lg font-medium text-foreground animate-pulse">
              {message || loadingMessages[currentMessage]}
            </p>
          </div>

          {/* Loading Icons */}
          <div className="flex justify-center space-x-4">
            <Zap className="h-5 w-5 text-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <TrendingUp className="h-5 w-5 text-green-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <Bitcoin className="h-5 w-5 text-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
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
