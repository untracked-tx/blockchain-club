import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useContract } from "./useContract"
import { ethers } from "ethers"

export function useMembershipVerification() {
  const [isMember, setIsMember] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [membershipTier, setMembershipTier] = useState<string | null>(null)
  
  const { address, isConnected } = useAccount()
  
  // You'll need to get the provider - this is a simplified version
  // In practice, you'd get this from your Web3 context
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const contract = useContract(provider)

  useEffect(() => {
    // Initialize provider
    const initProvider = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum)
        setProvider(browserProvider)
      }
    }
    
    initProvider()
  }, [])

  useEffect(() => {
    const checkMembership = async () => {
      setIsLoading(true)
      
      try {
        if (!isConnected || !address || !contract) {
          setIsMember(false)
          setMembershipTier(null)
          return
        }

        // Check if user has any membership NFTs
        const balance = await contract.balanceOf(address)
        
        if (balance > 0) {
          setIsMember(true)
          
          // Get the first token to determine tier
          // This is simplified - you might want to check all tokens
          try {
            const tokenId = await contract.tokenOfOwnerByIndex(address, 0)
            const tokenURI = await contract.tokenURI(tokenId)
            
            // Parse metadata to get tier info
            // This is a simplified example - adjust based on your metadata structure
            if (tokenURI.includes('founders')) {
              setMembershipTier('Founder')
            } else if (tokenURI.includes('officer')) {
              setMembershipTier('Officer')
            } else if (tokenURI.includes('president')) {
              setMembershipTier('President')
            } else {
              setMembershipTier('Member')
            }
          } catch (error) {
            console.error('Error getting token details:', error)
            setMembershipTier('Member') // Default tier
          }
        } else {
          setIsMember(false)
          setMembershipTier(null)
        }
      } catch (error) {
        console.error('Error checking membership:', error)
        setIsMember(false)
        setMembershipTier(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkMembership()
  }, [isConnected, address, contract])

  return {
    isMember,
    isLoading,
    membershipTier,
    address,
    isConnected
  }
}
