import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAccount } from "wagmi"
import { useContract } from "@/hooks/useContract"
import { ethers } from "ethers"
import { UserPlus, Clock, CheckCircle, RefreshCw } from "lucide-react"

interface RequestWhitelistButtonProps {
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
}

export function RequestWhitelistButton({ 
  className, 
  variant = "default", 
  size = "default" 
}: RequestWhitelistButtonProps) {
  const [isRequesting, setIsRequesting] = useState(false)
  const [isWhitelisted, setIsWhitelisted] = useState(false)
  const [hasPendingRequest, setHasPendingRequest] = useState(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  
  const { address, isConnected } = useAccount()
  const contract = useContract(provider)
  const { toast } = useToast()

  // Initialize provider
  useEffect(() => {
    const initProvider = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum)
        setProvider(browserProvider)
      }
    }
    initProvider()
  }, [])

  // Check whitelist status
  useEffect(() => {
    const checkStatus = async () => {
      if (!contract || !address) return
      
      try {
        // Check if already whitelisted
        const whitelisted = await contract.whitelist(address)
        setIsWhitelisted(whitelisted)
        
        // Check if has pending request
        const pending = await contract.hasPendingRequest(address)
        setHasPendingRequest(pending)
      } catch (error) {
        console.error("Failed to check whitelist status:", error)
      }
    }
    checkStatus()
  }, [contract, address])

  const handleRequest = async () => {
    if (!contract || !address) return
    setIsRequesting(true)
    try {
      const tx = await contract.requestWhitelist()
      toast({
        title: "Request Submitted",
        description: "Your whitelist request has been submitted.",
      })
      await tx.wait()
      toast({
        title: "Success",
        description: "Your request is now pending approval.",
      })
      setHasPendingRequest(true)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request.",
        variant: "destructive"
      })
    } finally {
      setIsRequesting(false)
    }
  }

  let buttonText = "Request Access"
  if (!isConnected) buttonText = "Connect Wallet"
  else if (isWhitelisted) buttonText = "Already Whitelisted"
  else if (hasPendingRequest) buttonText = "Request Pending"

  return (
    <Button
      className={className}
      variant={variant}
      size={size}
      onClick={handleRequest}
      disabled={!isConnected || isWhitelisted || hasPendingRequest || isRequesting}
    >
      {isRequesting ? (
        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {buttonText}
    </Button>
  )
}
