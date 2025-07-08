"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export function TerminalLoader() {
  const [currentStep, setCurrentStep] = useState(0)
  const [displayText, setDisplayText] = useState("")

  const steps = [
    "Initializing secure connection...",
    "Verifying blockchain membership...",
    "Checking NFT ownership...",
    "Scanning wallet permissions...", 
    "Decrypting access keys...",
    "Validating member privileges...",
    "Loading secure environment...",
    "ACCESS GRANTED"
  ]

  useEffect(() => {
    const stepDuration = 800 // 800ms per step (slower)
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, stepDuration)

    return () => clearInterval(interval)
  }, [steps.length])

  useEffect(() => {
    if (currentStep < steps.length) {
      const text = steps[currentStep]
      let charIndex = 0
      setDisplayText("")
      
      const typeInterval = setInterval(() => {
        if (charIndex < text.length) {
          setDisplayText(text.slice(0, charIndex + 1))
          charIndex++
        } else {
          clearInterval(typeInterval)
        }
      }, 50) // 50ms per character for slower typing effect

      return () => clearInterval(typeInterval)
    }
  }, [currentStep])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono">
      <div className="w-full max-w-2xl p-8">
        {/* Terminal Header */}
        <div className="bg-gray-800 rounded-t-lg px-4 py-2 flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-400 ml-4 text-sm">blockchain-club-terminal</span>
        </div>

        {/* Terminal Body */}
        <div className="bg-gray-900 rounded-b-lg p-6 min-h-[300px]">
          <div className="space-y-2">
            {/* Static welcome message */}
            <div className="text-green-400">
              <span className="text-green-500">$</span> ./members-lounge-access
            </div>
            <div className="text-gray-300 mb-4">
              Blockchain Club Members Portal v2.1.0
            </div>

            {/* Dynamic loading steps */}
            {steps.slice(0, currentStep + 1).map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start space-x-2 font-mono"
              >
                <span className="text-green-500 mt-0.5">
                  {index === currentStep && index !== steps.length - 1 ? ">" : 
                   index === steps.length - 1 && currentStep === steps.length - 1 ? "✓" : "✓"}
                </span>
                <div className="flex-1">
                  <span className={`${
                    index === currentStep && index !== steps.length - 1
                      ? "text-green-400" 
                      : index === steps.length - 1 && currentStep === steps.length - 1
                        ? "text-green-300 font-bold" 
                        : "text-gray-400"
                  }`}>
                    {index === currentStep ? displayText : step}
                    {index === currentStep && index !== steps.length - 1 && (
                      <span className="animate-pulse text-green-400">█</span>
                    )}
                  </span>
                  
                  {/* Add realistic terminal output for completed steps */}
                  {index < currentStep && index !== steps.length - 1 && (
                    <div className="text-xs text-gray-500 mt-1 ml-4">
                      {index === 0 && "Connection established on port 8545"}
                      {index === 1 && "Found wallet: 0x742d...a8f2"}
                      {index === 2 && "NFT balance: 3 tokens"}
                      {index === 3 && "Permission level: MEMBER"}
                      {index === 4 && "RSA-2048 decryption complete"}
                      {index === 5 && "Member since: 2024-03-15"}
                      {index === 6 && "Environment loaded successfully"}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Success message */}
            {currentStep === steps.length - 1 && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="mt-4 text-xs text-gray-500"
                >
                  <div>Session authenticated at {new Date().toLocaleTimeString()}</div>
                  <div>Loading member dashboard...</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  className="mt-6 p-4 border border-green-500 rounded bg-green-500/10"
                >
                  <div className="text-green-300 font-bold text-center font-mono">
                    🎉 WELCOME TO THE MEMBERS LOUNGE 🎉
                  </div>
                  <div className="text-green-400 text-center text-sm mt-2 font-mono">
                    Redirecting to secure area...
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
