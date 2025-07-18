"use client"

import { useState } from "react"
import { useAccount, useBalance } from "wagmi"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Wallet, Zap, Coins, ArrowRight, ExternalLink, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RequestWhitelistButton } from "@/components/ui/RequestWhitelistButton"

interface NewUserOnboardingProps {
  isOpen: boolean
  onClose: () => void
}

export function NewUserOnboarding({ isOpen, onClose }: NewUserOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isAddingChain, setIsAddingChain] = useState(false)
  const [isRequestingPol, setIsRequestingPol] = useState(false)
  const [chainAdded, setChainAdded] = useState(false)
  const [polRequested, setPolRequested] = useState(false)
  const [polRequestStatus, setPolRequestStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'rate-limited'>('idle')
  const [polRequestMessage, setPolRequestMessage] = useState('')
  
  const { toast } = useToast()
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address,
    chainId: 80002, // Polygon Amoy
  })

  const addPolygonAmoy = async () => {
    setIsAddingChain(true)
    try {
      await window.ethereum?.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x13882', // 80002 in hex
          chainName: 'Polygon Amoy',
          nativeCurrency: {
            name: 'Polygon',
            symbol: 'POL',
            decimals: 18,
          },
          rpcUrls: ['https://polygon-amoy.g.alchemy.com/v2/BKOaUhVk2Adt-aEqV-3AaKd4nmnfdaGa'],
          blockExplorerUrls: ['https://amoy.polygonscan.com'],
        }],
      })
      setChainAdded(true)
      setCurrentStep(2)
      toast({
        title: "✅ Network Added Successfully!",
        description: "Polygon Amoy network is now available in MetaMask. You can proceed to get POL.",
        duration: 5000,
      })
    } catch (error: any) {
      console.error("Failed to add Amoy:", error)
      if (error.code === 4902) {
        toast({
          title: "ℹ️ Network Already Added",
          description: "Polygon Amoy is already configured in your MetaMask. Proceeding to next step.",
          duration: 4000,
        })
        setChainAdded(true)
        setCurrentStep(2)
      } else {
        toast({
          title: "❌ Network Error",
          description: "Failed to add network. Please try manually or check your MetaMask.",
          variant: "destructive",
          duration: 6000,
        })
      }
    } finally {
      setIsAddingChain(false)
    }
  }

  const handleRequestPol = async () => {
    if (!address) return
    
    setIsRequestingPol(true)
    setPolRequestStatus('loading')
    setPolRequestMessage('Submitting your POL request...')
    
    try {
      const response = await fetch("/api/request-pol", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          address,
          timestamp: Date.now()
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setPolRequested(true)
        setPolRequestStatus('success')
        // Don't auto-advance to step 3 - let user see the success message
        
        if (data.status === "pending") {
          setPolRequestMessage('✅ POL request submitted successfully! Usually processed within a few hours.')
          toast({
            title: "🪙 POL Request Submitted!",
            description: data.message || "Your request has been submitted. Usually processed within a few hours.",
            duration: 6000,
          })
        } else {
          setPolRequestMessage('✅ Request already exists! You have a pending request.')
          toast({
            title: "✅ Request Already Exists",
            description: "You already have a pending request. Check back soon!",
            duration: 6000,
          })
        }
      } else {
        setPolRequestStatus('error')
        if (response.status === 429) {
          setPolRequestStatus('rate-limited')
          const waitTime = data.waitTime ? `Please wait ${data.waitTime} more hours.` : 'Please wait before requesting again.'
          setPolRequestMessage(`⏰ Rate limited: ${waitTime}`)
          toast({
            title: "⏰ Too Soon",
            description: data.error || "You've recently received POL. Please wait before requesting again.",
            variant: "destructive",
            duration: 8000,
          })
        } else {
          setPolRequestMessage(`❌ Request failed: ${data.error || 'Unknown error'}`)
          toast({
            title: "❌ Request Failed",
            description: data.error || "Something went wrong. Please try again.",
            variant: "destructive",
            duration: 6000,
          })
        }
      }
    } catch (err) {
      setPolRequestStatus('error')
      const errorMessage = err instanceof Error ? err.message : "Network error occurred"
      setPolRequestMessage(`❌ Error: ${errorMessage}`)
      toast({
        title: "Request Failed",
        description: err instanceof Error ? err.message : "Something went wrong. Try again or contact support.",
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setIsRequestingPol(false)
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: "📋 Address Copied!",
        description: "Your wallet address has been copied to clipboard.",
        duration: 3000,
      })
    }
  }

  const hasBalance = balance && parseFloat(balance.formatted) > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] bg-black border border-green-400/30 overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-black pb-4 border-b border-green-400/20">
          <DialogTitle className="text-xl sm:text-2xl font-mono text-green-400 flex items-center gap-2">
            🚀 <span className="terminal-glow">PROTOCOL_ONBOARDING.EXE</span>
          </DialogTitle>
          <DialogDescription className="text-white/80 font-mono text-xs sm:text-sm">
            // Initialize your Web3 setup for blockchain club access
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 pb-4">
          {/* Progress Indicator with Navigation */}
          <div className="flex items-center justify-between px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className="font-mono text-xs p-1 h-6 w-6"
            >
              ←
            </Button>
            
            <div className="flex items-center">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step)}
                    className={`
                      w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-mono text-xs sm:text-sm transition-all duration-200 hover:scale-105
                      ${currentStep >= step 
                        ? 'bg-green-500/20 border-green-400 text-green-400' 
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                      }
                    `}
                  >
                    {currentStep > step ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : step}
                  </button>
                  {step < 3 && (
                    <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-colors duration-300 ${
                      currentStep > step ? 'bg-green-400' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => currentStep < 3 && setCurrentStep(currentStep + 1)}
              disabled={currentStep === 3}
              className="font-mono text-xs p-1 h-6 w-6"
            >
              →
            </Button>
          </div>

          {/* Step Title */}
          <div className="text-center">
            <h3 className="font-mono text-sm text-gray-400">
              {currentStep === 1 && "Step 1: Add Network"}
              {currentStep === 2 && "Step 2: Get POL Tokens"}
              {currentStep === 3 && "Step 3: Mint Membership"}
            </h3>
          </div>

          {/* Current Step Content */}
          <div className="min-h-[300px]">
            {/* Step 1: Add Network */}
            {currentStep === 1 && (
              <Card className="border border-green-400/50 bg-green-500/5">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-base sm:text-lg font-mono text-white flex items-center gap-2">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                    Step 1: Add Polygon Amoy Network
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-white/70 mb-3 sm:mb-4 font-mono text-xs sm:text-sm">
                    // Add the testnet to your MetaMask for minting and governance
                  </p>
                  <Button 
                    onClick={addPolygonAmoy}
                    disabled={isAddingChain || chainAdded}
                    className="w-full font-mono text-xs sm:text-sm bg-green-500/20 border border-green-400/50 text-green-400 hover:bg-green-500/30 transition-all duration-200"
                  >
                    {isAddingChain ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                        Adding Network...
                      </div>
                    ) : chainAdded ? (
                      <>✅ Network Added Successfully</>
                    ) : (
                      <>🌐 Add Polygon Amoy to MetaMask</>
                    )}
                  </Button>
                  {chainAdded && (
                    <Button 
                      onClick={() => setCurrentStep(2)}
                      className="w-full mt-3 font-mono text-xs sm:text-sm bg-gray-500/20 border border-gray-400/50 text-gray-300 hover:bg-gray-500/30"
                    >
                      Continue to Next Step
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Get POL */}
            {currentStep === 2 && (
              <Card className="border border-blue-400/50 bg-blue-500/5">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-base sm:text-lg font-mono text-white flex items-center gap-2">
                    <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                    Step 2: Get Free Test POL
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    {isConnected && (
                      <div className="bg-black/40 p-2 sm:p-3 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-gray-400">Your Wallet:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyAddress}
                            className="h-5 sm:h-6 px-1 sm:px-2 text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <p className="font-mono text-xs sm:text-sm text-white truncate">
                          {address}
                        </p>
                        <div className="mt-1 sm:mt-2 flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-400">POL Balance:</span>
                          <Badge variant={hasBalance ? "secondary" : "destructive"} className="font-mono text-xs">
                            {balance ? `${parseFloat(balance.formatted).toFixed(4)} POL` : "0 POL"}
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-white/70 text-xs sm:text-sm font-mono">
                      // Request free testnet POL for minting membership tokens
                    </p>
                    
                    {/* POL Request Status Display */}
                    {polRequestStatus !== 'idle' && (
                      <div className={`p-3 rounded-lg border font-mono text-xs sm:text-sm ${
                        polRequestStatus === 'loading' ? 'bg-blue-500/10 border-blue-400/30 text-blue-400' :
                        polRequestStatus === 'success' ? 'bg-green-500/10 border-green-400/30 text-green-400' :
                        polRequestStatus === 'rate-limited' ? 'bg-yellow-500/10 border-yellow-400/30 text-yellow-400' :
                        'bg-red-500/10 border-red-400/30 text-red-400'
                      }`}>
                        <div className="flex items-center gap-2">
                          {polRequestStatus === 'loading' && (
                            <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                          )}
                          <span>{polRequestMessage}</span>
                        </div>
                      </div>
                    )}
                    
                    {!hasBalance && (
                      <Button 
                        onClick={handleRequestPol}
                        disabled={!isConnected || isRequestingPol || polRequested}
                        className={`w-full font-mono text-xs sm:text-sm transition-all duration-200 ${
                          polRequestStatus === 'success' ? 'bg-green-500/20 border-green-400/50 text-green-400' :
                          polRequestStatus === 'error' || polRequestStatus === 'rate-limited' ? 'bg-red-500/20 border-red-400/50 text-red-400' :
                          'bg-blue-500/20 border-blue-400/50 text-blue-400 hover:bg-blue-500/30'
                        }`}
                      >
                        {isRequestingPol ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                            Requesting POL...
                          </div>
                        ) : polRequested ? (
                          <>✅ POL Requested</>
                        ) : polRequestStatus === 'rate-limited' ? (
                          <>⏰ Rate Limited - Try Later</>
                        ) : polRequestStatus === 'error' ? (
                          <>🔄 Try Again</>
                        ) : (
                          <>🪙 Request Free POL (Testnet)</>
                        )}
                      </Button>
                    )}
                    
                    {hasBalance && (
                      <div className="bg-green-500/10 border border-green-400/30 p-2 sm:p-3 rounded-lg">
                        <p className="text-green-400 font-mono text-xs sm:text-sm">
                          ✅ You have POL! Ready to mint your membership.
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setCurrentStep(1)}
                        variant="outline"
                        className="flex-1 font-mono text-xs sm:text-sm"
                      >
                        ← Back
                      </Button>
                      
                      {/* Show continue button when POL is available OR requested successfully */}
                      {(hasBalance || polRequestStatus === 'success') && (
                        <Button 
                          onClick={() => setCurrentStep(3)}
                          className="flex-1 font-mono text-xs sm:text-sm bg-violet-500/20 border border-violet-400/50 text-violet-400 hover:bg-violet-500/30"
                        >
                          {hasBalance ? 'Ready to Mint!' : 'Continue to Minting'}
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                        </Button>
                      )}
                      
                      {/* Show help text if POL request is pending */}
                      {polRequestStatus === 'success' && !hasBalance && (
                        <div className="flex-1 bg-violet-500/10 border border-violet-400/30 p-2 rounded-lg">
                          <p className="text-violet-400 font-mono text-xs text-center">
                            💡 Your POL request is being processed. You can continue to learn about minting!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Mint Membership */}
            {currentStep === 3 && (
              <Card className="border border-violet-400/50 bg-violet-500/5">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-base sm:text-lg font-mono text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                    Step 3: Mint Your Membership
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-white/70 mb-3 sm:mb-4 font-mono text-xs sm:text-sm">
                    // NFT-based membership grants access to governance and exclusive features
                  </p>
                  <div className="mb-3 sm:mb-4">
                    <RequestWhitelistButton className="w-full mb-2" variant="default" size="lg" />
                  </div>
                  <Button 
                    onClick={() => {
                      onClose()
                      // Navigate to gallery page
                      window.location.href = '/gallery'
                    }}
                    disabled={!hasBalance}
                    className="w-full font-mono text-xs sm:text-sm bg-violet-500/20 border border-violet-400/50 text-violet-400 hover:bg-violet-500/30 mb-3"
                  >
                    🎫 Go to Gallery & Mint
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(2)}
                    variant="outline"
                    className="w-full font-mono text-xs sm:text-sm"
                  >
                    ← Back
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Help Section */}
          <div className="bg-gray-800/50 border border-gray-600 p-3 sm:p-4 rounded-lg">
            <h4 className="font-mono text-xs sm:text-sm text-gray-300 mb-2">💡 Need Help?</h4>
            <div className="space-y-1 sm:space-y-2 text-xs font-mono text-gray-400">
              <p>• Testnet tokens are free and have no real value</p>
              <p>• POL is needed for transaction fees on Polygon</p>
              <p>• Your membership NFT grants voting rights and club access</p>
              <p>• <span className="text-green-400 font-semibold">Text dev @ 7206363585</span></p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
