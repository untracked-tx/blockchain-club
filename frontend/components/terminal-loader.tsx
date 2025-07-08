"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export function TerminalLoader({ 
  onComplete,
  membershipTier,
  nftBalance = 0,
  walletAddress,
  isOfficersClub = false,
  shouldFailAuth = false
}: { 
  onComplete?: () => void
  membershipTier?: string
  nftBalance?: number 
  walletAddress?: string
  isOfficersClub?: boolean
  shouldFailAuth?: boolean
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [bootSequence, setBootSequence] = useState(0)
  const [promptReady, setPromptReady] = useState(false)
  const [promptText, setPromptText] = useState("")
  const [typingComplete, setTypingComplete] = useState(false)
  const [skipRequested, setSkipRequested] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessages, setErrorMessages] = useState<string[]>([])
  const [errorStep, setErrorStep] = useState(0)

  const bootMessages = isOfficersClub ? [
    "BIOS v3.2.1 - Blockchain Club Command Systems",
    "Checking officer authentication modules...",
    "Loading secure command protocols...",
    "",
    "Starting Officer Command Portal...",
  ] : [
    "BIOS v3.2.1 - Blockchain Club Systems",
    "Checking hardware configuration...",
    "Loading secure kernel modules...",
    "",
    "Starting Membership Portal Service...",
  ]

  const steps = isOfficersClub ? [
    "Establishing secure command link...",
    "Verifying officer credentials...", 
    "Checking clearance level...",
    "Scanning command permissions...", 
    "Decrypting officer access keys...",
    "Elevating to command privileges...",
    "Loading officer command center...",
    "COMMAND ACCESS GRANTED"
  ] : [
    "Initializing secure connection...",
    "Verifying blockchain membership...", 
    "Checking NFT ownership...",
    "Scanning wallet permissions...", 
    "Decrypting access keys...",
    "Elevating permissions...",
    "Loading secure environment...",
    "ACCESS GRANTED"
  ]

  // Error messages for when authentication fails
  const authErrorMessages = isOfficersClub ? [
    "ERROR: Officer credentials verification failed",
    "SECURITY ALERT: Insufficient clearance level detected",
    "WARNING: Command access denied - officer rank required",
    "SYSTEM: Authentication module terminated",
    "ERROR: Access violation logged",
    "",
    "DISCONNECTING FROM COMMAND SYSTEMS...",
    "Connection terminated by security protocol"
  ] : [
    "ERROR: Membership verification failed", 
    "SECURITY ALERT: No valid NFT tokens detected",
    "WARNING: Wallet does not contain required membership",
    "SYSTEM: Authentication module terminated",
    "ERROR: Access violation logged",
    "",
    "DISCONNECTING FROM SECURE SYSTEMS...",
    "Connection terminated by security protocol"
  ]

  // More natural timing with realistic pauses and slight randomization - made faster
  const stepPauses = [
    400 + Math.random() * 150,   // 0.4-0.55s - initial connection
    700 + Math.random() * 200,   // 0.7-0.9s - blockchain verification  
    500 + Math.random() * 150,   // 0.5-0.65s - NFT check
    900 + Math.random() * 250,   // 0.9-1.15s - permission scan (longer)
    600 + Math.random() * 200,   // 0.6-0.8s - decryption
    500 + Math.random() * 150,   // 0.5-0.65s - validation
    600 + Math.random() * 200,   // 0.6-0.8s - environment setup
    0                            // immediate access granted
  ]

  // Keyboard skip functionality
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        setSkipRequested(true)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Boot sequence effect
  useEffect(() => {
    if (bootSequence < bootMessages.length) {
      const timeout = setTimeout(() => {
        setBootSequence(prev => prev + 1)
      }, bootSequence === 0 ? 300 : 150) // Faster boot messages
      return () => clearTimeout(timeout)
    } else if (!promptReady) {
      // Type in the command prompt after boot sequence
      const promptCommand = isOfficersClub ? "./officer-access --verify-command-clearance" : "./secure-access --verify-membership"
      let charIndex = 0
      const typePrompt = setInterval(() => {
        if (charIndex <= promptCommand.length) {
          setPromptText(promptCommand.slice(0, charIndex))
          charIndex++
        } else {
          clearInterval(typePrompt)
          setPromptReady(true)
        }
      }, 70) // Faster typing speed for prompt
      return () => clearInterval(typePrompt)
    }
  }, [bootSequence, promptReady])

  // Hide cursor on final step
  useEffect(() => {
    if (currentStep === steps.length - 1) {
      setShowCursor(false)
    }
  }, [currentStep])

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530) // Slightly irregular blink for authenticity
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    const scheduleNextStep = () => {
      if (currentStep < steps.length - 1) {
        // Wait for typing to complete before scheduling next step
        if (typingComplete || currentStep === 0) {
          // Check if we should fail authentication at step 1 or 2 (after initial connection)
          if (shouldFailAuth && currentStep >= 1 && !showError) {
            setShowError(true)
            setErrorMessages(authErrorMessages)
            return
          }
          
          const pauseDuration = skipRequested ? 50 : (stepPauses[currentStep] || 800) // Much faster if skipping
          timeout = setTimeout(() => {
            setCurrentStep(prev => prev + 1)
            setTypingComplete(false) // Reset for next step
            setSkipRequested(false) // Reset skip request
            scheduleNextStep()
          }, pauseDuration)
        } else {
          // Check again in a bit if typing isn't complete
          timeout = setTimeout(scheduleNextStep, 100)
        }
      }
    }
    
    // Wait for boot sequence and prompt to complete before starting main sequence
    if (bootSequence >= bootMessages.length && promptReady && !showError) {
      scheduleNextStep()
    }
    
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [bootSequence, promptReady, typingComplete, currentStep, skipRequested, shouldFailAuth, showError]) // Add new dependencies

  useEffect(() => {
    if (currentStep < steps.length && bootSequence >= bootMessages.length && promptReady && !showError) {
      const text = steps[currentStep]
      let charIndex = 0
      setDisplayText("")
      setTypingComplete(false)
      
      // Dynamic typing speed based on text length with randomness
      const baseSpeed = skipRequested ? 10 : 40 // Much faster typing if skipping
      const lengthFactor = text.length > 30 ? 10 : text.length < 15 ? -10 : 0
      const typingSpeed = baseSpeed + lengthFactor + Math.random() * 15
      
      const typeInterval = setInterval(() => {
        if (charIndex < text.length) {
          setDisplayText(text.slice(0, charIndex + 1))
          charIndex++
        } else {
          clearInterval(typeInterval)
          setTypingComplete(true) // Mark typing as complete
        }
      }, typingSpeed)

      return () => clearInterval(typeInterval)
    }
  }, [currentStep, bootSequence, promptReady, showError])

  // Error message typing effect
  useEffect(() => {
    if (showError && errorStep < errorMessages.length) {
      const timeout = setTimeout(() => {
        setErrorStep(prev => prev + 1)
      }, errorStep === 0 ? 500 : 400) // Slight delay before starting errors
      return () => clearTimeout(timeout)
    } else if (showError && errorStep >= errorMessages.length) {
      // All error messages shown, trigger completion after a delay
      const timeout = setTimeout(() => {
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [showError, errorStep, errorMessages.length, onComplete])

  return (
    <div className="min-h-screen bg-black flex items-start justify-center font-mono text-green-400 pt-12">
      <div className="w-full max-w-4xl p-8">
        {/* Raw Terminal - No Window Frame */}
        <div className="bg-black p-8 min-h-[600px] relative">
          {/* Subtle scan lines effect */}
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <div className="h-full w-full bg-gradient-to-b from-transparent via-green-400/20 to-transparent bg-[length:100%_2px] animate-pulse"></div>
          </div>
          
          {/* Grain overlay for realism */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(20,255,71,0.1)_1px,transparent_1px)] bg-[length:3px_3px]"></div>
          </div>
          
          <div className="space-y-1 relative z-10" style={{ textShadow: '0 0 4px #14ff47cc, 0 0 1px #39ff14' }}>
            {/* Boot Sequence */}
            {bootMessages.slice(0, bootSequence).map((msg, index) => (
              <motion.div
                key={`boot-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-gray-500 text-sm ${msg === "" ? "h-2" : ""}`}
              >
                {msg}
              </motion.div>
            ))}

            {/* Main Terminal Session */}
            {bootSequence >= bootMessages.length && (
              <>
                {/* Command prompt with typing effect */}
                <div className="text-green-400 mb-4 mt-6">
                  <span className="text-green-500">{isOfficersClub ? 'officer@blockchain-club:~$' : 'member@blockchain-club:~$'}</span> {promptText}
                  {!promptReady && <span className="animate-pulse text-green-400">█</span>}
                </div>
                
                {promptReady && (
                  <div className="text-gray-300 mb-6">
                    <span className="text-cyan-400">Blockchain Club</span> {isOfficersClub ? 'Command Portal' : 'Members Portal'} <span className="text-yellow-400">v2.3.1</span>
                    <br />
                    <span className="text-gray-500 text-sm">Security Protocol: {isOfficersClub ? 'MAXIMUM' : 'ENHANCED'} | Encryption: AES-256</span>
                  </div>
                )}

                {/* Dynamic loading steps */}
                {promptReady && steps.slice(0, currentStep + 1).map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-mono"
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500">
                        {index === currentStep && index !== steps.length - 1 ? ">" : "✓"}
                      </span>
                      <span className={`${
                        index === currentStep && index !== steps.length - 1
                          ? "text-green-400" 
                          : index === steps.length - 1 && currentStep === steps.length - 1
                            ? "text-green-300 font-bold" 
                            : "text-gray-400"
                      }`}>
                        {index === currentStep ? displayText : step}
                        {index === currentStep && index !== steps.length - 1 && showCursor && (
                          <span className="animate-pulse text-green-400">█</span>
                        )}
                      </span>
                    </div>
                    
                    {/* Add simple terminal output for completed steps */}
                    {index < currentStep && index !== steps.length - 1 && (
                      <div className="text-gray-500 text-sm ml-6 mt-1">
                        {isOfficersClub ? (
                          <>
                            {index === 0 && "  Command link established on secure channel"}
                            {index === 1 && `  Officer wallet verified: ${walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '0x742d...a8f2'}`}
                            {index === 2 && `  Clearance level: ${membershipTier?.toUpperCase() || 'OFFICER'}`}
                            {index === 3 && "  Command permissions: GRANTED"}
                            {index === 4 && "  Officer access keys decrypted"}
                            {index === 5 && "  Command privileges elevated"}
                            {index === 6 && "  Officer command center ready"}
                          </>
                        ) : (
                          <>
                            {index === 0 && "  Connection established on port 8545"}
                            {index === 1 && `  Found wallet: ${walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '0x742d...a8f2'}`}
                            {index === 2 && `  NFT balance: ${nftBalance} tokens`}
                            {index === 3 && `  Permission level: ${membershipTier?.toUpperCase() || 'MEMBER'}`}
                            {index === 4 && "  Decryption complete"}
                            {index === 5 && "  Root access obtained"}
                            {index === 6 && "  Environment ready"}
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Error messages */}
                {showError && errorMessages.slice(0, errorStep).map((msg, index) => (
                  <motion.div
                    key={`error-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`${msg.startsWith('ERROR') || msg.startsWith('SECURITY') || msg.startsWith('WARNING') 
                      ? 'text-red-400' 
                      : msg.startsWith('SYSTEM') 
                        ? 'text-yellow-400'
                        : msg.includes('DISCONNECTING') || msg.includes('terminated')
                          ? 'text-gray-500'
                          : 'text-red-300'
                    }`}
                  >
                    {msg}
                  </motion.div>
                ))}

                {/* Success message */}
                {currentStep === steps.length - 1 && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      className="mt-4 text-gray-500 text-sm space-y-1"
                    >
                      <div>  {isOfficersClub ? 'Command session' : 'Session'} authenticated at {new Date().toLocaleTimeString()}</div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                      onAnimationComplete={() => {
                        // Call onComplete after final animation finishes
                        setTimeout(() => {
                          onComplete?.()
                        }, 1000) // Give 1 second after final animation for effect
                      }}
                      className="mt-6 space-y-2"
                    >
                    </motion.div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
