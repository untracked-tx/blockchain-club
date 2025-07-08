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
    "ACCESS GRANTED"
  ]

  useEffect(() => {
    const stepDuration = 500 // 500ms per step
    
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
      }, 30) // 30ms per character for typing effect

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
                className="flex items-center space-x-2"
              >
                <span className="text-green-500">
                  {index === currentStep ? ">" : "✓"}
                </span>
                <span className={`${
                  index === currentStep 
                    ? "text-green-400" 
                    : index === steps.length - 1 && currentStep === steps.length - 1
                      ? "text-green-300 font-bold animate-pulse" 
                      : "text-gray-400"
                }`}>
                  {index === currentStep ? displayText : step}
                  {index === currentStep && (
                    <span className="animate-pulse">█</span>
                  )}
                </span>
              </motion.div>
            ))}

            {/* Success message */}
            {currentStep === steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="mt-6 p-4 border border-green-500 rounded bg-green-500/10"
              >
                <div className="text-green-300 font-bold text-center">
                  🎉 WELCOME TO THE MEMBERS LOUNGE 🎉
                </div>
                <div className="text-green-400 text-center text-sm mt-2">
                  Redirecting to secure area...
                </div>
              </motion.div>
            )}
          </div>

          {/* Loading bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Loading...</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-green-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
