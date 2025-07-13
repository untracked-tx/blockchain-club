import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useContract } from "./useContract"
import { useRolesContract } from "./use-roles-contract"
import { ethers } from "ethers"

export function useMembershipVerification() {
  const [isMember, setIsMember] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [membershipTier, setMembershipTier] = useState<string | null>(null)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  
  const { address, isConnected } = useAccount()
  
  // You'll need to get the provider - this is a simplified version
  // In practice, you'd get this from your Web3 context
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const contract = useContract(provider)
  const rolesContract = useRolesContract(provider)

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
        if (!isConnected || !address || !contract || !rolesContract) {
          setIsMember(false)
          setMembershipTier(null)
          setIsLoading(false) // Set loading to false when no wallet is connected
          return
        }

        // First check for on-chain roles
        let tierFromRole = null
        try {
          // Define role hashes (these should match the ones in the smart contract)
          const ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000" // DEFAULT_ADMIN_ROLE
          const OFFICER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OFFICER_ROLE"))
          const MEMBER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MEMBER_ROLE"))
          
          // Check roles in priority order
          if (await rolesContract.hasRole(ADMIN_ROLE, address)) {
            tierFromRole = "admin"
          } else if (await rolesContract.hasRole(OFFICER_ROLE, address)) {
            tierFromRole = "officer"
          } else if (await rolesContract.hasRole(MEMBER_ROLE, address)) {
            tierFromRole = "member"
          }
          
          console.log("[DEBUG] Role check for", address, "- Result:", tierFromRole)
        } catch (roleError) {
          console.error('Error checking roles:', roleError)
        }

        // Check if user has any membership NFTs
        const balance = await contract.balanceOf(address)
        
        if (balance > 0 || tierFromRole) {
          setIsMember(true)
          
          // Use role-based tier if available, otherwise check NFT metadata
          if (tierFromRole) {
            setMembershipTier(tierFromRole)
            console.log("[DEBUG] Using role-based tier:", tierFromRole)
          } else {
            // Get the first token to determine tier from metadata
            try {
              const tokenId = await contract.tokenOfOwnerByIndex(address, 0)
              const tokenURI = await contract.tokenURI(tokenId)
              
              // Parse metadata to get tier info
              if (tokenURI.includes('founders')) {
                setMembershipTier('founder')
              } else if (tokenURI.includes('officer')) {
                setMembershipTier('officer')
              } else if (tokenURI.includes('president')) {
                setMembershipTier('president')
              } else {
                setMembershipTier('member')
              }
              console.log("[DEBUG] Using NFT-based tier from URI:", tokenURI)
            } catch (error) {
              console.error('Error getting token details:', error)
              setMembershipTier('member') // Default tier
            }
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
  }, [isConnected, address, contract, rolesContract])

  return {
    isMember,
    isLoading,
    membershipTier,
    address,
    isConnected
  }
}
