'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ChatMessage {
  id: string
  content: string
  user: {
    name: string
  }
  created_at: string
}

// Mock messages for the chat
const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    content: 'Welcome to the Members Lounge! 🚀',
    user: { name: 'System' },
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  },
  {
    id: '2',
    content: 'Hey everyone! Just minted my first NFT from the collection 🎉',
    user: { name: 'CryptoTrader88' },
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: '3',
    content: 'That\'s awesome! Which one did you get?',
    user: { name: 'BlockchainBull' },
    created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString()
  },
  {
    id: '4',
    content: 'I got the "Digital Art" token! Love the design 🎨',
    user: { name: 'CryptoTrader88' },
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString()
  },
  {
    id: '5',
    content: 'The club\'s portfolio performance has been incredible this quarter',
    user: { name: 'AnalystApe' },
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: '6',
    content: 'Agreed! Our DeFi strategies are really paying off 📈',
    user: { name: 'YieldFarmer' },
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  },
  {
    id: '7',
    content: 'Has anyone checked out the new research articles? The central bank analysis is fascinating',
    user: { name: 'MacroMaven' },
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString()
  },
  {
    id: '8',
    content: 'Yes! Julian\'s writing on the banks vs crypto battle is spot on 💯',
    user: { name: 'RegulationRebel' },
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: '9',
    content: 'Don\'t miss Liam\'s temporal cycle analysis either - pure genius',
    user: { name: 'TimeChainTheory' },
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  },
  {
    id: '10',
    content: 'Looking forward to our next voting session. Democracy in action! 🗳️',
    user: { name: 'DAOVoter' },
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  }
]

// Random member names for generating new messages
const MEMBER_NAMES = [
  'CryptoKnight', 'BlockchainWizard', 'DeFiMaster', 'NFTCollector', 'YieldHunter',
  'TokenTrader', 'SmartContractDev', 'MetaversePioneer', 'DAOBuilder', 'AlphaSeekerr',
  'CryptoWhale', 'BlockchainBull', 'DeFiDealer', 'NFTNinja', 'YieldYogi'
]

// Random message templates
const MESSAGE_TEMPLATES = [
  'Just saw some interesting movement in the markets 👀',
  'Our treasury is looking strong this month! 💪',
  'Anyone else excited about the upcoming governance proposal?',
  'The community is growing so fast! Welcome new members 🤝',
  'Great discussion in yesterday\'s DAO meeting',
  'Love seeing the innovation happening in our space 🚀',
  'The research team is doing incredible work lately',
  'Blockchain technology never ceases to amaze me',
  'Smart contracts are the future of finance 📝',
  'Decentralization is the way forward! ⚡',
  'Web3 is changing everything we know about the internet',
  'The tokenomics of this project are brilliant 🧠',
  'HODL strong, everyone! 💎🙌',
  'Building the future, one block at a time 🔗'
]

export const useMockChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES)
  const [isConnected, setIsConnected] = useState(false)

  // Simulate connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Generate random messages periodically
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      // Randomly decide whether to add a new message (30% chance every 15 seconds)
      if (Math.random() < 0.3) {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          content: MESSAGE_TEMPLATES[Math.floor(Math.random() * MESSAGE_TEMPLATES.length)],
          user: {
            name: MEMBER_NAMES[Math.floor(Math.random() * MEMBER_NAMES.length)]
          },
          created_at: new Date().toISOString()
        }

        setMessages(prev => [...prev, newMessage])
      }
    }, 15000) // Check every 15 seconds

    return () => clearInterval(interval)
  }, [isConnected])

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      user: {
        name: 'You' // In a real app, this would be the user's actual name
      },
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, newMessage])
  }, [])

  return {
    messages,
    isConnected,
    sendMessage
  }
}
