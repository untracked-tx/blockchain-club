'use client'

import { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChatMessageItem } from '@/components/chat-message'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import { useMockChat } from '@/hooks/use-mock-chat'
import { cn } from '@/lib/utils'

interface MockRealtimeChatProps {
  className?: string
}

export function MockRealtimeChat({ className }: MockRealtimeChatProps) {
  const [input, setInput] = useState('')
  const { messages, isConnected, sendMessage } = useMockChat()
  const { containerRef, scrollToBottom } = useChatScroll()
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
      setInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Group messages by user and time for better display
  const groupedMessages = messages.reduce((acc, message, index) => {
    const prevMessage = messages[index - 1]
    const showHeader = !prevMessage || 
      prevMessage.user.name !== message.user.name ||
      new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000 // 5 minutes

    acc.push({
      ...message,
      showHeader,
      isOwnMessage: message.user.name === 'You'
    })
    return acc
  }, [] as Array<any>)

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Connection Status */}
      <div className="px-4 py-2 border-b border-gray-700/50 bg-gray-800/50">
        <div className="flex items-center space-x-2">
          <div 
            className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-green-500' : 'bg-red-500'
            )}
          />
          <span className="text-sm text-gray-300">
            {isConnected ? 'Connected to Members Chat' : 'Connecting...'}
          </span>
          <span className="text-xs text-gray-500 ml-auto">
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
      >
        {groupedMessages.map((message) => (
          <ChatMessageItem 
            key={message.id} 
            message={{
              ...message,
              createdAt: message.created_at
            }}
            isOwnMessage={message.isOwnMessage}
            showHeader={message.showHeader}
          />
        ))}
        
        {!isConnected && (
          <div className="flex justify-center">
            <div className="animate-pulse text-muted-foreground">
              Loading chat messages...
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-700/50 bg-gray-800/30">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 bg-gray-900/50 border-gray-600/50 text-white placeholder-gray-400"
            maxLength={500}
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || !isConnected}
            size="icon"
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        {input.length > 450 && (
          <div className="text-xs text-gray-400 mt-1">
            {500 - input.length} characters remaining
          </div>
        )}
      </div>
    </div>
  )
}
