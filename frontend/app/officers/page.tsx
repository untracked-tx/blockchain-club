"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Shield, 
  Award, 
  Search, 
  Users, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3,
  Copy,
  Plus,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react"
import { useToast } from "../../hooks/use-toast"
import { ethers } from "ethers"
import { contracts } from "@/lib/contracts"
import { useContract } from "../../hooks/useContract"

// Extend window object for ethereum
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any
  }
}

// Contract data interfaces
interface MemberData {
  address: string
  tokenIds: number[]
  joinDate: number
  tokenCount: number
  currentRole: "ADMIN_ROLE" | "OFFICER_ROLE" | "MEMBER_ROLE" | null
  isActive: boolean
  votingPower: number
  customVotingPower?: number
}

interface ContractStats {
  totalMembers: number
  totalOfficers: number
  totalSupply: number
  whitelistedCount: number
}

interface TokenTypeData {
  typeId: string
  name: string
  category: string
  currentSupply: number
  maxSupply: number
  isActive: boolean
  mintAccess: "OFFICER_ONLY" | "WHITELIST_ONLY" | "PUBLIC"
  startTime: number
  endTime: number
}

interface WhitelistEntry {
  address: string
  isWhitelisted: boolean
  addedBy?: string
  addedAt?: number
}

export default function OfficersPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isOfficer, setIsOfficer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [contractStats, setContractStats] = useState<ContractStats | null>(null)
  const [members, setMembers] = useState<MemberData[]>([])
  const [tokenTypes, setTokenTypes] = useState<TokenTypeData[]>([])
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [targetAddress, setTargetAddress] = useState("")
  const [whitelistStatus, setWhitelistStatus] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState("members")
  const { toast } = useToast()

  // Web3 and contract setup
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const membershipContract = useContract(provider)
  const [rolesContract, setRolesContract] = useState<ethers.Contract | null>(null)

  // Role and token type management state
  const [roleAddress, setRoleAddress] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [mintAddress, setMintAddress] = useState("")
  const [selectedTokenType, setSelectedTokenType] = useState<string>("")
  const [isSoulbound, setIsSoulbound] = useState(false)

  // Loading states for real contract calls
  const [whitelistLoading, setWhitelistLoading] = useState(false)
  const [roleLoading, setRoleLoading] = useState(false)

  // Initialize Web3 provider and contracts
  useEffect(() => {
    const initializeWeb3 = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const web3Provider = new ethers.BrowserProvider(window.ethereum)
          setProvider(web3Provider)
          
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            setIsConnected(true)
            await checkOfficerRole(web3Provider)
          }
        } catch (error) {
          console.error("Failed to initialize Web3:", error)
        }
      }
      setIsLoading(false)
    }
    
    initializeWeb3()
  }, [])

  // Initialize roles contract when provider is available
  useEffect(() => {
    const initializeRolesContract = async () => {
      if (provider) {
        try {
          const signer = await provider.getSigner()
          const rolesContractInstance = new ethers.Contract(
            contracts.roles.address,
            contracts.roles.abi,
            signer
          )
          setRolesContract(rolesContractInstance)
        } catch (error) {
          console.error("Failed to initialize roles contract:", error)
        }
      }
    }
    
    initializeRolesContract()
  }, [provider])

  // Check if connected user has officer role
  const checkOfficerRole = async (web3Provider: ethers.BrowserProvider) => {
    try {
      const signer = await web3Provider.getSigner()
      const userAddress = await signer.getAddress()
      
      const rolesContractInstance = new ethers.Contract(
        contracts.roles.address,
        contracts.roles.abi,
        signer
      )
      
      // Check if user has OFFICER_ROLE
      const officerRoleHash = ethers.keccak256(ethers.toUtf8Bytes("OFFICER_ROLE"))
      const hasOfficerRole = await rolesContractInstance.hasRole(officerRoleHash, userAddress)
      
      setIsOfficer(hasOfficerRole)
    } catch (error) {
      console.error("Failed to check officer role:", error)
      setIsOfficer(false)
    }
  }

  // Connect wallet function
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "Error",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive"
      })
      return
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(web3Provider)
      setIsConnected(true)
      await checkOfficerRole(web3Provider)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      toast({
        title: "Error",
        description: "Failed to connect wallet",
        variant: "destructive"
      })
    }
  }

  // Load contract data
  useEffect(() => {
    if (isConnected && isOfficer && membershipContract && rolesContract) {
      loadContractData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isOfficer, membershipContract, rolesContract])

  async function loadContractData() {
    if (!membershipContract || !rolesContract) return

    try {
      setIsLoading(true)
      
      // Get real contract stats
      const [totalMembers, totalOfficers, totalSupply] = await Promise.all([
        membershipContract.getMemberCount(),
        membershipContract.getOfficerCount(),
        membershipContract.totalSupply()
      ])

      setContractStats({
        totalMembers: Number(totalMembers),
        totalOfficers: Number(totalOfficers),
        totalSupply: Number(totalSupply),
        whitelistedCount: 0 // We'll calculate this when we load whitelist entries
      })

      // Load real member data by enumerating tokens
      await loadMemberData()
      
      // Load real token types from contract events or known types
      await loadTokenTypes()
      
      // Load whitelist entries from events
      await loadWhitelistEntries()

    } catch (error) {
      console.error("Failed to load contract data:", error)
      toast({
        title: "Error",
        description: "Failed to load contract data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function loadMemberData() {
    if (!membershipContract || !rolesContract) return

    try {
      const totalSupply = await membershipContract.totalSupply()
      const memberData: MemberData[] = []

      // Enumerate all tokens to get member data
      for (let i = 0; i < Number(totalSupply); i++) {
        try {
          const tokenId = await membershipContract.tokenByIndex(i)
          const owner = await membershipContract.ownerOf(tokenId)
          
          // Skip if we already have this owner
          if (memberData.find(m => m.address.toLowerCase() === owner.toLowerCase())) {
            continue
          }

          // Get member stats
          const memberStats = await membershipContract.memberStats(owner)
          const tokenCount = await membershipContract.balanceOf(owner)
          
          // Get current role
          let currentRole: "ADMIN_ROLE" | "OFFICER_ROLE" | "MEMBER_ROLE" | null = null
          const adminRoleHash = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"))
          const officerRoleHash = ethers.keccak256(ethers.toUtf8Bytes("OFFICER_ROLE"))
          const memberRoleHash = ethers.keccak256(ethers.toUtf8Bytes("MEMBER_ROLE"))

          if (await rolesContract.hasRole(adminRoleHash, owner)) {
            currentRole = "ADMIN_ROLE"
          } else if (await rolesContract.hasRole(officerRoleHash, owner)) {
            currentRole = "OFFICER_ROLE"
          } else if (await rolesContract.hasRole(memberRoleHash, owner)) {
            currentRole = "MEMBER_ROLE"
          }

          // Get voting power
          const votingPower = await rolesContract.getVotingPower(owner)
          const customVotingPower = await rolesContract.customVotingPower(owner)

          // Get all token IDs for this owner
          const tokenIds: number[] = []
          for (let j = 0; j < Number(tokenCount); j++) {
            const tokenId = await membershipContract.tokenOfOwnerByIndex(owner, j)
            tokenIds.push(Number(tokenId))
          }

          memberData.push({
            address: owner,
            tokenIds,
            joinDate: Number(memberStats.joinDate) * 1000, // Convert to milliseconds
            tokenCount: Number(tokenCount),
            currentRole,
            isActive: memberStats.isActive,
            votingPower: Number(votingPower),
            customVotingPower: Number(customVotingPower) > 0 ? Number(customVotingPower) : undefined
          })
        } catch (error) {
          console.error(`Error loading data for token ${i}:`, error)
        }
      }

      setMembers(memberData)
    } catch (error) {
      console.error("Failed to load member data:", error)
    }
  }

  async function loadTokenTypes() {
    if (!membershipContract) return

    try {
      // For now, let's check known token types directly since event parsing is complex
      const knownTypes = [
        { id: "MEMBER", name: "Club Member", category: "Membership" },
        { id: "OFFICER", name: "Club Officer", category: "Leadership" },
        { id: "FOUNDER", name: "Founder", category: "Special" },
        { id: "CUSTOM_ART", name: "Digital Art Collection", category: "Collectible" },
        { id: "SPECIAL", name: "Special Edition", category: "Limited" },
        { id: "SUPPORTER", name: "Supporter", category: "Community" }
      ]
      
      const tokenTypesData: TokenTypeData[] = []

      for (const type of knownTypes) {
        try {
          const typeId = ethers.keccak256(ethers.toUtf8Bytes(type.id))
          const config = await membershipContract.tokenTypeConfigs(typeId)
          
          if (Number(config.maxSupply) > 0) { // Only add if configured
            tokenTypesData.push({
              typeId: type.id,
              name: type.name,
              category: type.category,
              currentSupply: Number(config.currentSupply),
              maxSupply: Number(config.maxSupply),
              isActive: config.isActive,
              mintAccess: config.mintAccess === 0 ? "OFFICER_ONLY" : 
                         config.mintAccess === 1 ? "WHITELIST_ONLY" : "PUBLIC",
              startTime: Number(config.startTime) * 1000,
              endTime: Number(config.endTime) * 1000
            })
          }
        } catch (error) {
          console.error(`Error checking token type ${type.id}:`, error)
        }
      }

      setTokenTypes(tokenTypesData)
    } catch (error) {
      console.error("Failed to load token types:", error)
    }
  }

  async function loadWhitelistEntries() {
    if (!membershipContract) return

    try {
      // Since event parsing is complex, let's check whitelist status for known addresses
      // First, get all unique addresses from members
      const addressesToCheck = new Set<string>()
      
      // Add member addresses
      members.forEach(member => addressesToCheck.add(member.address))
      
      // Add some additional addresses that might be whitelisted
      const additionalAddresses = [
        targetAddress, // Current target address if any
      ].filter(addr => addr && ethers.isAddress(addr))
      
      additionalAddresses.forEach(addr => addressesToCheck.add(addr))

      const whitelistEntries: WhitelistEntry[] = []
      
      for (const address of addressesToCheck) {
        try {
          const isWhitelisted = await membershipContract.whitelist(address)
          whitelistEntries.push({
            address,
            isWhitelisted,
            addedAt: Date.now() // We don't have exact timestamp without events
          })
        } catch (error) {
          console.error(`Failed to check whitelist for ${address}:`, error)
        }
      }
      
      setWhitelist(whitelistEntries)
      
      // Update whitelist count in stats
      const whitelistedCount = whitelistEntries.filter(entry => entry.isWhitelisted).length
      setContractStats(prev => prev ? { ...prev, whitelistedCount } : null)

    } catch (error) {
      console.error("Failed to load whitelist entries:", error)
    }
  }

  // Action handlers - REAL CONTRACT CALLS
  const checkWhitelistStatus = async () => {
    if (!targetAddress) {
      toast({
        title: "Error", 
        description: "Please enter a valid address",
        variant: "destructive"
      })
      return
    }

    if (!membershipContract) {
      toast({
        title: "Error",
        description: "Contract not connected",
        variant: "destructive"
      })
      return
    }

    try {
      setWhitelistLoading(true)
      
      // Validate address format
      if (!ethers.isAddress(targetAddress)) {
        throw new Error("Invalid address format")
      }

      // Call the whitelist function on the membership contract
      const isWhitelisted = await membershipContract.whitelist(targetAddress)
      setWhitelistStatus(isWhitelisted)
      
      toast({
        title: "Status Checked",
        description: `Address is ${isWhitelisted ? "whitelisted" : "not whitelisted"}`,
      })
    } catch (error: unknown) {
      console.error("Failed to check whitelist status:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to check whitelist status"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setWhitelistLoading(false)
    }
  }

  const updateWhitelist = async (address: string, status: boolean) => {
    if (!membershipContract) {
      toast({
        title: "Error",
        description: "Contract not connected",
        variant: "destructive"
      })
      return
    }

    try {
      setWhitelistLoading(true)
      
      // Validate address format
      if (!ethers.isAddress(address)) {
        throw new Error("Invalid address format")
      }

      // Call the updateWhitelist function on the membership contract
      const tx = await membershipContract.updateWhitelist(address, status)
      
      toast({
        title: "Transaction Submitted",
        description: "Waiting for confirmation...",
      })

      // Wait for transaction confirmation
      await tx.wait()
      
      // Update local state
      setWhitelist(prev => {
        const existingIndex = prev.findIndex(entry => entry.address.toLowerCase() === address.toLowerCase())
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = { ...updated[existingIndex], isWhitelisted: status, addedAt: Date.now() }
          return updated
        } else {
          return [...prev, { address, isWhitelisted: status, addedAt: Date.now() }]
        }
      })

      // Update status if this is the target address
      if (address.toLowerCase() === targetAddress.toLowerCase()) {
        setWhitelistStatus(status)
      }

      // Refresh whitelist entries
      await refreshWhitelistEntries()
      
      toast({
        title: "Success",
        description: `Address ${status ? 'added to' : 'removed from'} whitelist`,
      })
    } catch (error: unknown) {
      console.error("Failed to update whitelist:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update whitelist"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setWhitelistLoading(false)
    }
  }

  // Function to refresh whitelist entries after updates
  const refreshWhitelistEntries = async () => {
    if (!membershipContract) return

    try {
      const addressesToCheck = new Set<string>()
      
      // Add member addresses
      members.forEach(member => addressesToCheck.add(member.address))
      
      // Add current target address if valid
      if (targetAddress && ethers.isAddress(targetAddress)) {
        addressesToCheck.add(targetAddress)
      }

      // Add existing whitelist addresses
      whitelist.forEach(entry => addressesToCheck.add(entry.address))

      const updatedWhitelistEntries: WhitelistEntry[] = []
      
      for (const address of addressesToCheck) {
        try {
          const isWhitelisted = await membershipContract.whitelist(address)
          updatedWhitelistEntries.push({
            address,
            isWhitelisted,
            addedAt: Date.now()
          })
        } catch (error) {
          console.error(`Failed to check whitelist for ${address}:`, error)
        }
      }
      
      setWhitelist(updatedWhitelistEntries)
      
      // Update whitelist count in stats
      const whitelistedCount = updatedWhitelistEntries.filter(entry => entry.isWhitelisted).length
      setContractStats(prev => prev ? { ...prev, whitelistedCount } : null)

    } catch (error) {
      console.error("Failed to refresh whitelist entries:", error)
    }
  }

  const checkUserRole = async () => {
    if (!roleAddress || !selectedRole) {
      toast({
        title: "Error",
        description: "Please enter address and select role",
        variant: "destructive"
      })
      return
    }

    if (!rolesContract) {
      toast({
        title: "Error",
        description: "Roles contract not connected",
        variant: "destructive"
      })
      return
    }

    try {
      setRoleLoading(true)
      
      // Validate address format
      if (!ethers.isAddress(roleAddress)) {
        throw new Error("Invalid address format")
      }

      // Get role hash based on selected role
      const roleHash = ethers.keccak256(ethers.toUtf8Bytes(selectedRole))
      
      // Check if user has the role
      const hasRole = await rolesContract.hasRole(roleHash, roleAddress)
      
      toast({
        title: "Role Status",
        description: `Address ${hasRole ? "has" : "does not have"} ${selectedRole}`,
      })
    } catch (error: unknown) {
      console.error("Failed to check role:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to check role"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setRoleLoading(false)
    }
  }

  const grantRole = async () => {
    if (!roleAddress || !selectedRole) {
      toast({
        title: "Error",
        description: "Please enter address and select role",
        variant: "destructive"
      })
      return
    }

    if (!rolesContract) {
      toast({
        title: "Error",
        description: "Roles contract not connected",
        variant: "destructive"
      })
      return
    }

    try {
      setRoleLoading(true)
      
      // Validate address format
      if (!ethers.isAddress(roleAddress)) {
        throw new Error("Invalid address format")
      }

      // Get role hash based on selected role
      const roleHash = ethers.keccak256(ethers.toUtf8Bytes(selectedRole))
      
      // Grant the role
      const tx = await rolesContract.grantRole(roleHash, roleAddress)
      
      toast({
        title: "Transaction Submitted",
        description: "Waiting for confirmation...",
      })

      // Wait for transaction confirmation
      await tx.wait()
      
      toast({
        title: "Success",
        description: `Role ${selectedRole} granted to ${roleAddress.slice(0, 6)}...${roleAddress.slice(-4)}`,
      })
      
      // Optionally reload contract data
      loadContractData()
    } catch (error: unknown) {
      console.error("Failed to grant role:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to grant role"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setRoleLoading(false)
    }
  }

  const revokeRole = async () => {
    if (!roleAddress || !selectedRole) {
      toast({
        title: "Error",
        description: "Please enter address and select role",
        variant: "destructive"
      })
      return
    }

    if (!rolesContract) {
      toast({
        title: "Error",
        description: "Roles contract not connected",
        variant: "destructive"
      })
      return
    }

    try {
      setRoleLoading(true)
      
      // Validate address format
      if (!ethers.isAddress(roleAddress)) {
        throw new Error("Invalid address format")
      }

      // Get role hash based on selected role
      const roleHash = ethers.keccak256(ethers.toUtf8Bytes(selectedRole))
      
      // Revoke the role
      const tx = await rolesContract.revokeRole(roleHash, roleAddress)
      
      toast({
        title: "Transaction Submitted",
        description: "Waiting for confirmation...",
      })

      // Wait for transaction confirmation
      await tx.wait()
      
      toast({
        title: "Success",
        description: `Role ${selectedRole} revoked from ${roleAddress.slice(0, 6)}...${roleAddress.slice(-4)}`,
      })
      
      // Optionally reload contract data
      loadContractData()
    } catch (error: unknown) {
      console.error("Failed to revoke role:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to revoke role"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setRoleLoading(false)
    }
  }

  const mintToken = async () => {
    if (!mintAddress || !selectedTokenType) {
      toast({
        title: "Error",
        description: "Please enter address and select token type",
        variant: "destructive"
      })
      return
    }

    if (!membershipContract) {
      toast({
        title: "Error",
        description: "Contract not connected",
        variant: "destructive"
      })
      return
    }

    try {
      // Validate address format
      if (!ethers.isAddress(mintAddress)) {
        throw new Error("Invalid address format")
      }

      // Convert token type to bytes32
      const tokenTypeBytes = ethers.keccak256(ethers.toUtf8Bytes(selectedTokenType))
      
      // Call mint function
      const tx = await membershipContract.mint(mintAddress, tokenTypeBytes, isSoulbound)
      
      toast({
        title: "Transaction Submitted",
        description: "Waiting for confirmation...",
      })

      await tx.wait()
      
      toast({
        title: "Success",
        description: `Token minted for ${mintAddress.slice(0, 6)}...${mintAddress.slice(-4)}`,
      })
      
      loadContractData()
    } catch (error: unknown) {
      console.error("Failed to mint token:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to mint token"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case "ADMIN_ROLE":
        return <Badge className="bg-red-100 text-red-800"><Shield className="mr-1 h-3 w-3" /> Admin</Badge>
      case "OFFICER_ROLE":
        return <Badge className="bg-amber-100 text-amber-800"><Award className="mr-1 h-3 w-3" /> Officer</Badge>
      case "MEMBER_ROLE":
        return <Badge className="bg-blue-100 text-blue-800"><Users className="mr-1 h-3 w-3" /> Member</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">No Role</Badge>
    }
  }

  const filteredMembers = members.filter(member => 
    member.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.currentRole && member.currentRole.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading officer dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to access officer tools and manage club operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={connectWallet} className="w-full">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isOfficer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <CardTitle>Officer Access Required</CardTitle>
            <CardDescription>
              This dashboard is restricted to club officers. You need an officer token to access these tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                If you believe you should have access, please contact another officer to grant you the required permissions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 py-20 md:py-28">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-36 h-36 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Floating Badge */}
            <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-purple-100 backdrop-blur-sm border border-white/30">
              <Shield className="mr-2 h-4 w-4" />
              Officer Dashboard
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              ⚡ Administrative Controls
            </h1>
            
            <p className="mb-8 text-xl text-purple-100 leading-relaxed">
              Manage membership, tokens, and governance for the blockchain club.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contractStats?.totalMembers || 0}</div>
              <p className="text-xs text-muted-foreground">Active club members</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Officers</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contractStats?.totalOfficers || 0}</div>
              <p className="text-xs text-muted-foreground">Leadership team</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contractStats?.totalSupply || 0}</div>
              <p className="text-xs text-muted-foreground">Tokens minted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Whitelisted</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contractStats?.whitelistedCount || 0}</div>
              <p className="text-xs text-muted-foreground">Approved addresses</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="whitelist">Whitelist</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Club Members</CardTitle>
                <CardDescription>
                  View and manage all club members with their token holdings and roles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by address or role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  {filteredMembers.map(member => (
                    <div key={member.address} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {member.address.slice(0, 6)}...{member.address.slice(-4)}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(member.address)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {getRoleBadge(member.currentRole)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Tokens:</span> {member.tokenCount}
                          </div>
                          <div>
                            <span className="font-medium">Voting Power:</span> {member.customVotingPower || member.votingPower}
                          </div>
                          <div>
                            <span className="font-medium">Joined:</span> {formatDate(member.joinDate)}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span> 
                            <Badge variant={member.isActive ? "default" : "secondary"} className="ml-1">
                              {member.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-600">Token IDs:</span>
                          <div className="flex gap-1 mt-1">
                            {member.tokenIds.map(id => (
                              <Badge key={id} variant="outline" className="text-xs">#{id}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whitelist" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Check Whitelist Status</CardTitle>
                  <CardDescription>
                    Verify if an address is whitelisted for token minting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="targetAddress">Wallet Address</Label>
                    <Input
                      id="targetAddress"
                      placeholder="0x..."
                      value={targetAddress}
                      onChange={(e) => setTargetAddress(e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={checkWhitelistStatus} className="w-full" disabled={whitelistLoading}>
                    <Search className="mr-2 h-4 w-4" />
                    {whitelistLoading ? "Checking..." : "Check Status"}
                  </Button>
                  
                  {whitelistStatus !== null && (
                    <Alert>
                      {whitelistStatus ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>
                        {whitelistStatus ? "Whitelisted" : "Not Whitelisted"}
                      </AlertTitle>
                      <AlertDescription>
                        {whitelistStatus 
                          ? "This address is approved for token minting."
                          : "This address is not currently whitelisted."
                        }
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {targetAddress && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => updateWhitelist(targetAddress, true)}
                        variant="default"
                        className="flex-1"
                        disabled={whitelistLoading}
                      >
                        {whitelistLoading ? "Processing..." : "Add to Whitelist"}
                      </Button>
                      <Button 
                        onClick={() => updateWhitelist(targetAddress, false)}
                        variant="destructive"
                        className="flex-1"
                        disabled={whitelistLoading}
                      >
                        {whitelistLoading ? "Processing..." : "Remove from Whitelist"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Whitelist Entries</CardTitle>
                  <CardDescription>
                    Current whitelist status for tracked addresses. Add new addresses to check their status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label htmlFor="newAddress">Add Address to Check</Label>
                    <div className="flex gap-2">
                      <Input
                        id="newAddress"
                        placeholder="0x..."
                        value={targetAddress}
                        onChange={(e) => setTargetAddress(e.target.value)}
                      />
                      <Button 
                        onClick={async () => {
                          if (targetAddress && ethers.isAddress(targetAddress)) {
                            await refreshWhitelistEntries()
                          }
                        }}
                        variant="outline"
                        disabled={!targetAddress || !ethers.isAddress(targetAddress)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {whitelist.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No addresses tracked yet. Add an address above to check its whitelist status.
                      </p>
                    ) : (
                      whitelist.map(entry => (
                        <div key={entry.address} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <code className="text-sm">{entry.address.slice(0, 8)}...{entry.address.slice(-6)}</code>
                            {entry.addedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Checked {formatDate(entry.addedAt)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={entry.isWhitelisted ? "default" : "secondary"}>
                              {entry.isWhitelisted ? "Whitelisted" : "Not Whitelisted"}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateWhitelist(entry.address, !entry.isWhitelisted)}
                              disabled={whitelistLoading}
                            >
                              {entry.isWhitelisted ? "Remove" : "Add"}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tokens" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mint Tokens</CardTitle>
                <CardDescription>
                  Mint new tokens for whitelisted addresses or members.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mintAddress">Recipient Address</Label>
                    <Input
                      id="mintAddress"
                      placeholder="0x..."
                      value={mintAddress}
                      onChange={(e) => setMintAddress(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tokenType">Token Type</Label>
                    <Select value={selectedTokenType} onValueChange={setSelectedTokenType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select token type" />
                      </SelectTrigger>
                      <SelectContent>
                        {tokenTypes.filter(type => type.isActive).map(type => (
                          <SelectItem key={type.typeId} value={type.typeId}>
                            {type.name} ({type.currentSupply}/{type.maxSupply})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="soulbound"
                    checked={isSoulbound}
                    onChange={(e) => setIsSoulbound(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="soulbound">Make token soulbound (non-transferable)</Label>
                </div>
                
                <Button onClick={mintToken} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Mint Token
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Role Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Role Management</CardTitle>
                  <CardDescription>
                    Grant or revoke roles for club members.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="roleAddress">Member Address</Label>
                    <Input
                      id="roleAddress"
                      placeholder="0x..."
                      value={roleAddress}
                      onChange={(e) => setRoleAddress(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER_ROLE">Member Role</SelectItem>
                        <SelectItem value="OFFICER_ROLE">Officer Role</SelectItem>
                        <SelectItem value="ADMIN_ROLE">Admin Role (Use with caution)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      onClick={checkUserRole} 
                      variant="outline" 
                      disabled={roleLoading || !roleAddress || !selectedRole}
                      className="w-full"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {roleLoading ? "Checking..." : "Check Role Status"}
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={grantRole} 
                        disabled={roleLoading || !roleAddress || !selectedRole}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        {roleLoading ? "Processing..." : "Grant Role"}
                      </Button>
                      
                      <Button 
                        onClick={revokeRole} 
                        variant="destructive" 
                        disabled={roleLoading || !roleAddress || !selectedRole}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        {roleLoading ? "Processing..." : "Revoke Role"}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Role Hierarchy:</strong> Admin {'>'}  Officer {'>'} Member
                      <br />
                      <strong>Permissions:</strong> Only admins can grant/revoke officer roles. Officers can manage member roles.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Role Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Role Holders</CardTitle>
                  <CardDescription>
                    Overview of members and their assigned roles.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Admins */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Administrators</h4>
                      <div className="space-y-2">
                        {members.filter(m => m.currentRole === "ADMIN_ROLE").length === 0 ? (
                          <p className="text-sm text-gray-500">No administrators found</p>
                        ) : (
                          members.filter(m => m.currentRole === "ADMIN_ROLE").map(member => (
                            <div key={member.address} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                              <code className="text-xs">{member.address.slice(0, 8)}...{member.address.slice(-6)}</code>
                              <Badge className="bg-red-100 text-red-800">
                                <Shield className="mr-1 h-3 w-3" /> Admin
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Officers */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Officers</h4>
                      <div className="space-y-2">
                        {members.filter(m => m.currentRole === "OFFICER_ROLE").length === 0 ? (
                          <p className="text-sm text-gray-500">No officers found</p>
                        ) : (
                          members.filter(m => m.currentRole === "OFFICER_ROLE").map(member => (
                            <div key={member.address} className="flex items-center justify-between p-2 bg-amber-50 rounded border border-amber-200">
                              <code className="text-xs">{member.address.slice(0, 8)}...{member.address.slice(-6)}</code>
                              <Badge className="bg-amber-100 text-amber-800">
                                <Award className="mr-1 h-3 w-3" /> Officer
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Members */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Members ({members.filter(m => m.currentRole === "MEMBER_ROLE").length})</h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {members.filter(m => m.currentRole === "MEMBER_ROLE").length === 0 ? (
                          <p className="text-sm text-gray-500">No members found</p>
                        ) : (
                          members.filter(m => m.currentRole === "MEMBER_ROLE").slice(0, 5).map(member => (
                            <div key={member.address} className="flex items-center justify-between p-1 text-xs">
                              <code>{member.address.slice(0, 8)}...{member.address.slice(-6)}</code>
                              <Badge variant="outline" className="text-xs">Member</Badge>
                            </div>
                          ))
                        )}
                        {members.filter(m => m.currentRole === "MEMBER_ROLE").length > 5 && (
                          <p className="text-xs text-gray-500 text-center">
                            ... and {members.filter(m => m.currentRole === "MEMBER_ROLE").length - 5} more
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={loadContractData} 
                    variant="outline" 
                    className="w-full mt-4"
                    disabled={isLoading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {isLoading ? "Refreshing..." : "Refresh Role Data"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  )
}