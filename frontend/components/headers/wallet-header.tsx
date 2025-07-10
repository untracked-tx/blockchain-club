"use client"

import { Wallet, Shield, User, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

interface WalletHeaderProps {
  isConnected?: boolean
  userAddress?: string
  tokenCount?: number
}

export function WalletHeader({ 
  isConnected = false, 
  userAddress, 
  tokenCount = 0 
}: WalletHeaderProps) {
  
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <section className="relative bg-white py-12 md:py-16 border-b">
      {/* Clean minimal background */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white"></div>
      
      <div className="container relative mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Left - Simple Title */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-3 inline-flex items-center space-x-2 rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              <Wallet className="h-4 w-4" />
              <span>My Membership</span>
            </div>
            
            <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
              Digital Wallet
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl">
              View and manage your University Blockchain Club membership tokens and voting power.
            </p>
          </motion.div>

          {/* Right - Status Cards */}
          <motion.div 
            className="hidden lg:flex space-x-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Connection Status */}
            <div className={`p-4 rounded-xl border-2 transition-colors ${
              isConnected 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {isConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Shield className="h-5 w-5 text-gray-400" />
                )}
                <span className={`text-sm font-medium ${
                  isConnected ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              {isConnected && userAddress && (
                <div className="text-xs text-gray-500 font-mono">
                  {truncateAddress(userAddress)}
                </div>
              )}
            </div>

            {/* Token Count */}
            <div className="p-4 rounded-xl border-2 bg-blue-50 border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Tokens</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">
                {tokenCount}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Status Bar */}
        <motion.div 
          className="lg:hidden mt-6 flex space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className={`flex-1 p-3 rounded-lg text-center ${
            isConnected 
              ? 'bg-green-50 text-green-700' 
              : 'bg-gray-50 text-gray-600'
          }`}>
            <div className="text-xs font-medium">Status</div>
            <div className="text-sm font-bold">
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          
          <div className="flex-1 p-3 rounded-lg bg-blue-50 text-blue-700 text-center">
            <div className="text-xs font-medium">Tokens</div>
            <div className="text-sm font-bold">{tokenCount}</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
