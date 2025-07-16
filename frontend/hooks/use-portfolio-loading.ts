import { useState, useEffect, useCallback } from 'react'

interface LoadingState {
  portfolio: boolean
  transactions: boolean
  cryptoMarket: boolean
  insights: boolean
}

interface LoadingCoordinator {
  isLoading: boolean
  loadingMessage: string
  progress: number
  updateLoadingState: (component: keyof LoadingState, isLoading: boolean) => void
  setCurrentMessage: (message: string) => void
}

const LOADING_MESSAGES = [
  "🚀 Firing up the rocket to the moon...",
  "🍕 Remembering Pizza Day (May 22nd, 2010)...", 
  "⚡ Mining some fresh data blocks...",
  "🔐 Securing the blockchain fortress...", 
  "💎 Polishing those diamond hands...",
  "📈 Calculating moon trajectory...",
  "🎯 HODLing while we load...",
  "🌙 When Lambo? Soon! Loading...",
  "⛏️ Digging through the blockchain...",
  "🔥 This is fine... just loading...",
  "💰 Counting satoshis...",
  "🎲 Rolling for crypto luck...",
  "🚗 Vroom vroom, Lambo loading...",
  "📊 Analyzing market sentiment...",
  "🌊 Surfing the volatility waves...",
  "🎪 Welcome to the crypto circus...",
  "🎢 Buckle up for the crypto ride...",
  "🎯 Targeting the next ATH...",
  "🔮 Reading the crystal blockchain...",
  "💎 Diamond hands activated..."
]

const getRandomMessage = () => {
  return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
}

export function usePortfolioLoadingCoordinator(): LoadingCoordinator {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({
    portfolio: true,
    transactions: true,
    cryptoMarket: true,
    insights: true
  })
  
  const [loadingMessage, setLoadingMessage] = useState(getRandomMessage())
  const [messageInterval, setMessageInterval] = useState<NodeJS.Timeout | null>(null)

  // Calculate if any component is still loading
  const isLoading = Object.values(loadingStates).some(state => state)
  
  // Calculate progress based on completed components
  const totalComponents = Object.keys(loadingStates).length
  const completedComponents = Object.values(loadingStates).filter(state => !state).length
  const progress = Math.round((completedComponents / totalComponents) * 100)

  // Update loading state for a specific component
  const updateLoadingState = useCallback((component: keyof LoadingState, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [component]: isLoading
    }))
  }, [])

  // Set a custom loading message
  const setCurrentMessage = useCallback((message: string) => {
    setLoadingMessage(message)
  }, [])

  // Rotate loading messages while loading
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessage(getRandomMessage())
      }, 2500) // Change message every 2.5 seconds
      
      setMessageInterval(interval)
      
      return () => {
        clearInterval(interval)
      }
    } else {
      if (messageInterval) {
        clearInterval(messageInterval)
        setMessageInterval(null)
      }
      setLoadingMessage("🎉 All systems loaded! Ready to HODL!")
    }
  }, [isLoading, messageInterval])

  return {
    isLoading,
    loadingMessage,
    progress,
    updateLoadingState,
    setCurrentMessage
  }
}
