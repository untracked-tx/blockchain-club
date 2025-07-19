"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
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
  Eye,
  Lock,
  UserPlus,
  Trash2,
  Settings,
  Info,
  Crown,
  Star,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Code,
  FileText,
  ExternalLink,
  Wallet
} from "lucide-react"
import { useToast } from "../../hooks/use-toast"
import { ethers } from "ethers"
import { contracts } from "@/lib/contracts"
import { useAccount, useWalletClient, usePublicClient } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { InlineLoadingSkeleton, MemberCardSkeleton, SectionLoadingSkeleton } from "@/components/ui/loading-skeleton"
import PolRequestsDashboard from "@/components/pol-requests-dashboard"
import { getBlockchainErrorMessage, isPermissionError } from "@/lib/error-utils"

// Extend window object for ethereum
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any
  }
}

// Contract data interfaces
interface Token {
  id: number
  tokenId: string
  name: string
  description: string
  imageUri: string
  votingPower: number
  acquired: string
  isDefault?: boolean
  type?: string
  category?: string
  metadata?: {
    image?: string
    attributes?: Array<{trait_type: string, value: string}>
  }
}

interface MemberData {
  address: string
  tokenIds: number[]
  joinDate: number
  tokenCount: number
  currentRole: "ADMIN_ROLE" | "OFFICER_ROLE" | "MEMBER_ROLE" | null
  roles: ("ADMIN_ROLE" | "OFFICER_ROLE" | "MEMBER_ROLE")[]
  isActive: boolean
  votingPower: number
  customVotingPower?: number
}

interface ContractStats {
  totalMembers: number
  totalAdmins: number
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
  // WAGMI hooks for Web3 connection
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [isOfficer, setIsOfficer] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userAddress, setUserAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [membersLoading, setMembersLoading] = useState(true)
  const [publicStatsLoading, setPublicStatsLoading] = useState(true)
  const [contractStats, setContractStats] = useState<ContractStats | null>(null)
  const [members, setMembers] = useState<MemberData[]>([])
  const [tokenTypes, setTokenTypes] = useState<TokenTypeData[]>([])
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [targetAddress, setTargetAddress] = useState("")
  const [whitelistStatus, setWhitelistStatus] = useState<boolean | null>(null)
  const [selectedWalletWhitelistStatus, setSelectedWalletWhitelistStatus] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showHowItWorksDropdown, setShowHowItWorksDropdown] = useState(false)
  const { toast } = useToast()

  // Web3 and contract setup - using WAGMI instead of raw ethers
  const [membershipContract, setMembershipContract] = useState<ethers.Contract | null>(null)
  const [rolesContract, setRolesContract] = useState<ethers.Contract | null>(null)

  // Role and token type management state
  const [roleAddress, setRoleAddress] = useState("")
  const [roleType, setRoleType] = useState<'admin' | 'officer'>('admin')
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [mintAddress, setMintAddress] = useState("")
  const [selectedTokenType, setSelectedTokenType] = useState<string>("")
  const [isSoulbound, setIsSoulbound] = useState(false)

  // Collapsible sections state
  const [showQuickSetupHelp, setShowQuickSetupHelp] = useState(false)
  const [showEmergencyHelp, setShowEmergencyHelp] = useState(false)
  const [showOfficerWhitelistHelp, setShowOfficerWhitelistHelp] = useState(false)
  const [showOfficerTokenHelp, setShowOfficerTokenHelp] = useState(false)
  const [showCreateTokenTypeHelp, setShowCreateTokenTypeHelp] = useState(false)

  // Create Token Type state
  const [createTokenTypeLoading, setCreateTokenTypeLoading] = useState(false)
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [newTokenType, setNewTokenType] = useState({
    typeId: "",
    name: "",
    category: "",
    startTime: "",
    endTime: "",
    maxSupply: "",
    mintAccess: "OFFICER_ONLY" as "OFFICER_ONLY" | "WHITELIST_ONLY" | "PUBLIC"
  })

  // Loading states for real contract calls
  const [whitelistLoading, setWhitelistLoading] = useState(false)
  const [roleLoading, setRoleLoading] = useState(false)

  // Role management state
  const [roleCheckResult, setRoleCheckResult] = useState<string | null>(null)

  // Token burning state
  const [burnTokenId, setBurnTokenId] = useState("")
  const [burnLoading, setBurnLoading] = useState(false)
  const [burnStatus, setBurnStatus] = useState<string>("")
  const [retryCount, setRetryCount] = useState(0)

  // Token management mode state
  const [tokenManagementMode, setTokenManagementMode] = useState<"mint" | "burn">("mint")

  // Status tracking for key operations
  const [createTokenTypeStatus, setCreateTokenTypeStatus] = useState<{
    loading: boolean
    message: string
    type: "idle" | "loading" | "success" | "error"
    txHash?: string
  }>({ loading: false, message: "", type: "idle" })

  const [tokenManagementStatus, setTokenManagementStatus] = useState<{
    loading: boolean
    message: string
    type: "idle" | "loading" | "success" | "error"
    txHash?: string
  }>({ loading: false, message: "", type: "idle" })

  const [quickRoleSetupStatus, setQuickRoleSetupStatus] = useState<{
    loading: boolean
    message: string
    type: "idle" | "loading" | "success" | "error"
    txHash?: string
  }>({ loading: false, message: "", type: "idle" })

  const [emergencyFunctionStatus, setEmergencyFunctionStatus] = useState<{
    loading: boolean
    message: string
    type: "idle" | "loading" | "success" | "error"
    txHash?: string
  }>({ loading: false, message: "", type: "idle" })

  // Wallet tokens modal state
  const [selectedWallet, setSelectedWallet] = useState<MemberData | null>(null)
  const [showTokensModal, setShowTokensModal] = useState(false)
  const [walletTokens, setWalletTokens] = useState<Token[]>([])
  const [walletTokensLoading, setWalletTokensLoading] = useState(false)
  const [walletTokensData, setWalletTokensData] = useState<any[]>([])
  const [tokenDataLoading, setTokenDataLoading] = useState(false)

  // Initialize contracts when wallet is connected
  useEffect(() => {
    const initializeContracts = async () => {
      if (!walletClient || !isConnected || !address) {
        setMembershipContract(null)
        setRolesContract(null)
        setUserAddress("")
        setIsOfficer(false)
        setIsAdmin(false)
        return
      }

      try {
        setUserAddress(address)
        
        // Use WAGMI's wallet client directly (it already has fallback RPC configured)
        // Convert WAGMI wallet client to ethers signer for contract interactions
        const provider = new ethers.BrowserProvider(walletClient.transport)
        const signer = await provider.getSigner()
        
        // Initialize contracts with the WAGMI-based signer (benefits from fallback RPC)
        const membershipContractInstance = new ethers.Contract(
          contracts.membership.address,
          contracts.membership.abi,
          signer
        )
        
        const rolesContractInstance = new ethers.Contract(
          contracts.roles.address,
          contracts.roles.abi,
          signer
        )
        
        setMembershipContract(membershipContractInstance)
        setRolesContract(rolesContractInstance)
        
        // Check user roles
        await checkOfficerRole(rolesContractInstance, address)
        
      } catch (error) {
        console.error("Failed to initialize contracts:", error)
      }
    }
    
    initializeContracts()
  }, [walletClient, isConnected, address])

  // Check if connected user has officer role
  const checkOfficerRole = async (rolesContractInstance: ethers.Contract, userAddress: string) => {
    try {
      // Check if user has OFFICER_ROLE
      const officerRoleHash = ethers.keccak256(ethers.toUtf8Bytes("OFFICER_ROLE"))
      const hasOfficerRole = await rolesContractInstance.hasRole(officerRoleHash, userAddress)
      
      // Check if user has ADMIN_ROLE (using DEFAULT_ADMIN_ROLE which is bytes32(0))
      const adminRoleHash = ethers.ZeroHash // DEFAULT_ADMIN_ROLE is bytes32(0)
      const hasAdminRole = await rolesContractInstance.hasRole(adminRoleHash, userAddress)
      
      setIsOfficer(hasOfficerRole || hasAdminRole) // Allow both officers and admins to access this dashboard
      setIsAdmin(hasAdminRole)
    } catch (error) {
      console.error("Failed to check officer role:", error)
      setIsOfficer(false)
      setIsAdmin(false)
    }
  }

  // Load public contract stats for everyone
  useEffect(() => {
    if (membershipContract && rolesContract) {
      loadPublicContractStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membershipContract, rolesContract])

  // Load full contract data only for officers
  useEffect(() => {
    if (isConnected && isOfficer && membershipContract && rolesContract) {
      loadContractData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isOfficer, membershipContract, rolesContract])

  // Update admin/officer counts when members data changes
  useEffect(() => {
    if (members.length > 0) {
      updateStatsFromMembers()
    }
  }, [members])

  // Update stats when whitelist changes
  useEffect(() => {
    if (members.length > 0) {
      updateStatsFromMembers()
    }
  }, [whitelist])

  // Centralized function to update all stats from members data
  const updateStatsFromMembers = () => {
    const adminCount = members.filter(m => m.roles.includes("ADMIN_ROLE")).length
    // Count all users with OFFICER_ROLE (independent of admin status)
    const officerCount = members.filter(m => m.roles.includes("OFFICER_ROLE")).length
    
    // Also update whitelist count from current whitelist data
    const whitelistedCount = whitelist.length
    
    console.log(`[DEBUG] Updating stats: ${members.length} members, ${adminCount} admins, ${officerCount} officers, ${whitelistedCount} whitelisted`)
    
    setContractStats(prev => prev ? {
      ...prev,
      totalMembers: members.length, // Update with actual unique member count
      totalAdmins: adminCount,
      totalOfficers: officerCount,
      whitelistedCount: whitelistedCount
    } : null)
  }

  async function loadPublicContractStats() {
    if (!membershipContract || !rolesContract) return

    setPublicStatsLoading(true)
    try {
      console.log("[DEBUG] Loading public contract stats...")
      
      // Get basic contract stats
      const [totalSupply] = await Promise.all([
        membershipContract.totalSupply()
      ])

      // Get role counts by enumerating through tokens (simplified version)
      const memberAddresses = new Set<string>()
      const adminAddresses = new Set<string>()
      const officerAddresses = new Set<string>()
      
      // Enumerate tokens to get unique member addresses and their roles
      for (let i = 0; i < Math.min(Number(totalSupply), 100); i++) { // Limit to first 100 for performance
        try {
          const tokenId = await membershipContract.tokenByIndex(i)
          const owner = await membershipContract.ownerOf(tokenId)
          
          memberAddresses.add(owner.toLowerCase())
          
          // Check roles for this member
          const adminRoleHash = ethers.ZeroHash // DEFAULT_ADMIN_ROLE is bytes32(0)
          const officerRoleHash = ethers.keccak256(ethers.toUtf8Bytes("OFFICER_ROLE"))

          if (await rolesContract.hasRole(adminRoleHash, owner)) {
            adminAddresses.add(owner.toLowerCase())
          }
          if (await rolesContract.hasRole(officerRoleHash, owner)) {
            officerAddresses.add(owner.toLowerCase())
          }
        } catch (error) {
          console.error(`Error checking token ${i}:`, error)
        }
      }

      setContractStats({
        totalMembers: memberAddresses.size,
        totalAdmins: adminAddresses.size,
        totalOfficers: officerAddresses.size,
        totalSupply: Number(totalSupply),
        whitelistedCount: 0 // Will be updated if user is an officer
      })

      console.log(`[DEBUG] Public stats loaded: ${memberAddresses.size} members, ${adminAddresses.size} admins, ${officerAddresses.size} officers, ${Number(totalSupply)} total supply`)
    } catch (error) {
      console.error("Failed to load public contract stats:", error)
    } finally {
      setPublicStatsLoading(false)
    }
  }

  async function loadContractData() {
    if (!membershipContract || !rolesContract) return

    try {
      setMembersLoading(true)
      setWhitelistLoading(true)
      
      // Get basic contract stats first
      const [memberCount, tokenSupply] = await Promise.all([
        membershipContract.getMemberCount(),
        membershipContract.totalSupply()
      ])

      // Set initial stats with loading indicators
      setContractStats({
        totalMembers: 0, // Will be updated after member data loads 
        totalAdmins: 0, // Will be updated after member data loads
        totalOfficers: 0, // Will be updated after member data loads
        totalSupply: Number(tokenSupply),
        whitelistedCount: 0 // Will be updated after whitelist data loads
      })

      // Load member data first (this provides role counts and addresses for whitelist)
      await loadMemberData()
      setMembersLoading(false)
      
      // Load token types and whitelist in parallel since they don't depend on each other
      await Promise.all([
        loadTokenTypes(),
        loadWhitelistEntries()
      ])
      setWhitelistLoading(false)

    } catch (error) {
      console.error("Failed to load contract data:", error)
      toast({
        title: "Error",
        description: "Failed to load contract data",
        variant: "destructive"
      })
    } finally {
      // Keep individual loading states for granular UI feedback
    }
  }

  async function loadMemberData() {
    if (!membershipContract || !rolesContract) return

    try {
      const totalSupply = await membershipContract.totalSupply()
      console.log(`[DEBUG] Loading member data for ${totalSupply} tokens`)
      const memberData: MemberData[] = []
      const processedAddresses = new Set<string>()

      // First, enumerate all tokens to get token holders
      for (let i = 0; i < Number(totalSupply); i++) {
        try {
          const tokenId = await membershipContract.tokenByIndex(i)
          const owner = await membershipContract.ownerOf(tokenId)
          
          // Skip if we already have this owner
          if (processedAddresses.has(owner.toLowerCase())) {
            continue
          }
          processedAddresses.add(owner.toLowerCase())

          const memberInfo = await loadMemberInfo(owner)
          if (memberInfo) {
            memberData.push(memberInfo)
          }
        } catch (error) {
          console.error(`Error loading data for token ${i}:`, error)
        }
      }

      // Then, check for role holders who might not have NFTs
      const additionalAddresses = new Set<string>()
      
      // Add current user if connected and not already processed
      if (userAddress && !processedAddresses.has(userAddress.toLowerCase())) {
        additionalAddresses.add(userAddress)
      }

      // Try to get role members using AccessControlEnumerable functions
      try {
        const adminRoleHash = ethers.ZeroHash // DEFAULT_ADMIN_ROLE is bytes32(0)
        const officerRoleHash = ethers.keccak256(ethers.toUtf8Bytes("OFFICER_ROLE"))
        const memberRoleHash = ethers.keccak256(ethers.toUtf8Bytes("MEMBER_ROLE"))

        // Get all role holders
        const roles = [adminRoleHash, officerRoleHash, memberRoleHash]
        for (const roleHash of roles) {
          try {
            const roleCount = await rolesContract.getRoleMemberCount(roleHash)
            for (let i = 0; i < Number(roleCount); i++) {
              try {
                const roleMember = await rolesContract.getRoleMember(roleHash, i)
                if (!processedAddresses.has(roleMember.toLowerCase())) {
                  additionalAddresses.add(roleMember)
                }
              } catch (error) {
                console.error(`Error getting role member ${i} for role ${roleHash}:`, error)
              }
            }
          } catch (error) {
            console.error(`Error getting role members for role ${roleHash}:`, error)
          }
        }
      } catch (error) {
        console.error("Error enumerating role members:", error)
      }

      // Check these additional addresses for roles
      for (const address of additionalAddresses) {
        try {
          const memberInfo = await loadMemberInfo(address)
          if (memberInfo && memberInfo.roles.length > 0) {
            memberData.push(memberInfo)
            processedAddresses.add(address.toLowerCase())
          }
        } catch (error) {
          console.error(`Error loading role data for ${address}:`, error)
        }
      }

      console.log(`[DEBUG] Found ${memberData.length} unique members`)
      console.log(`[DEBUG] Admin count: ${memberData.filter(m => m.roles.includes("ADMIN_ROLE")).length}`)
      console.log(`[DEBUG] Officer count: ${memberData.filter(m => m.roles.includes("OFFICER_ROLE")).length}`)
      
      setMembers(memberData)
    } catch (error) {
      console.error("Failed to load member data:", error)
    }
  }

  // Helper function to load member information for a given address
  async function loadMemberInfo(owner: string): Promise<MemberData | null> {
    if (!membershipContract || !rolesContract) return null

    try {

      // Get member stats (default values if no NFT)
      let memberStats, tokenCount
      try {
        memberStats = await membershipContract.memberStats(owner)
        tokenCount = await membershipContract.balanceOf(owner)
      } catch (error) {
        // If member stats fail, use defaults (for role-only members)
        memberStats = { joinDate: 0, isActive: true }
        tokenCount = 0
      }
      
      // Get current roles (users can have multiple roles)
      const roles: ("ADMIN_ROLE" | "OFFICER_ROLE" | "MEMBER_ROLE")[] = []
      const adminRoleHash = ethers.ZeroHash // DEFAULT_ADMIN_ROLE is bytes32(0)
      const officerRoleHash = ethers.keccak256(ethers.toUtf8Bytes("OFFICER_ROLE"))
      const memberRoleHash = ethers.keccak256(ethers.toUtf8Bytes("MEMBER_ROLE"))

      if (await rolesContract.hasRole(adminRoleHash, owner)) {
        roles.push("ADMIN_ROLE")
      }
      if (await rolesContract.hasRole(officerRoleHash, owner)) {
        roles.push("OFFICER_ROLE")
      }
      if (await rolesContract.hasRole(memberRoleHash, owner)) {
        roles.push("MEMBER_ROLE")
      }

      // Skip if this address has no roles and no NFTs
      if (roles.length === 0 && Number(tokenCount) === 0) {
        return null
      }

      // For display purposes, show the highest role as currentRole
      // Priority order for display: Admin > Officer > Member
      // Note: These are independent roles - having admin doesn't grant officer privileges automatically
      const currentRole = roles.includes("ADMIN_ROLE") ? "ADMIN_ROLE" : 
                         roles.includes("OFFICER_ROLE") ? "OFFICER_ROLE" :
                         roles.includes("MEMBER_ROLE") ? "MEMBER_ROLE" : null

      // Get voting power
      const votingPower = await rolesContract.getVotingPower(owner)
      const customVotingPower = await rolesContract.customVotingPower(owner)

      // Get all token IDs for this owner
      const tokenIds: number[] = []
      for (let j = 0; j < Number(tokenCount); j++) {
        try {
          const tokenId = await membershipContract.tokenOfOwnerByIndex(owner, j)
          tokenIds.push(Number(tokenId))
        } catch (error) {
          console.error(`Error getting token ${j} for ${owner}:`, error)
        }
      }

      return {
        address: owner,
        tokenIds,
        joinDate: Number(memberStats.joinDate) * 1000, // Convert to milliseconds
        tokenCount: Number(tokenCount),
        currentRole,
        roles,
        isActive: memberStats.isActive,
        votingPower: Number(votingPower),
        customVotingPower: Number(customVotingPower) > 0 ? Number(customVotingPower) : undefined
      }
    } catch (error) {
      console.error(`Error loading member info for ${owner}:`, error)
      return null
    }
  }

  async function loadTokenTypes() {
    if (!membershipContract) {
      console.log("[DEBUG] No membership contract available for loading token types")
      return
    }

    console.log("[DEBUG] Loading token types from contract...")
    try {
      // Get all token type IDs that actually exist in the contract
      const allTokenTypeIds = await membershipContract.getAllTokenTypeIds()
      console.log(`[DEBUG] Found ${allTokenTypeIds.length} token types in contract:`, allTokenTypeIds)
      
      const tokenTypesData: TokenTypeData[] = []

      for (const typeId of allTokenTypeIds) {
        try {
          const config = await membershipContract.tokenTypeConfigs(typeId)
          console.log(`[DEBUG] Token type ${typeId} config:`, config)
          
          if (Number(config.maxSupply) > 0) { // Only add if configured
            // Use the config.name as the typeId since that's what the mint function expects
            // The mint function will convert it back to bytes32 using keccak256
            
            tokenTypesData.push({
              typeId: config.name, // Use the actual token name for minting
              name: config.name,
              category: config.category,
              currentSupply: Number(config.currentSupply),
              maxSupply: Number(config.maxSupply),
              isActive: config.isActive,
              mintAccess: config.mintAccess === 0 ? "OFFICER_ONLY" : 
                         config.mintAccess === 1 ? "WHITELIST_ONLY" : "PUBLIC",
              startTime: Number(config.startTime) * 1000,
              endTime: Number(config.endTime) * 1000
            })
          } else {
            console.log(`[DEBUG] Skipping ${typeId} - maxSupply is 0`)
          }
        } catch (error) {
          console.error(`Error loading config for token type ${typeId}:`, error)
        }
      }

      console.log(`[DEBUG] Final token types data:`, tokenTypesData)
      setTokenTypes(tokenTypesData)
      
      if (tokenTypesData.length === 0) {
        console.log("[DEBUG] No configured token types found. Use 'Create Token Type' to add some!")
      }
    } catch (error) {
      console.error("Failed to load token types:", error)
    }
  }

  async function loadWhitelistEntries() {
    if (!membershipContract) return

    try {
      // Get all unique addresses that might be whitelisted
      const addressesToCheck = new Set<string>()
      
      // Add member addresses if available
      if (members.length > 0) {
        members.forEach(member => addressesToCheck.add(member.address))
      }
      
      // Add current user address
      if (userAddress && ethers.isAddress(userAddress)) {
        addressesToCheck.add(userAddress)
      }
      
      // Add additional addresses that might be whitelisted
      const additionalAddresses = [
        targetAddress, // Current target address if any
      ].filter(addr => addr && ethers.isAddress(addr))
      
      additionalAddresses.forEach(addr => addressesToCheck.add(addr))

      // If we don't have any addresses to check, try to get some from the contract
      if (addressesToCheck.size === 0) {
        try {
          const totalSupply = await membershipContract.totalSupply()
          // Check first few token owners
          for (let i = 0; i < Math.min(10, Number(totalSupply)); i++) {
            try {
              const tokenId = await membershipContract.tokenByIndex(i)
              const owner = await membershipContract.ownerOf(tokenId)
              addressesToCheck.add(owner)
            } catch (error) {
              console.error(`Error getting token owner for index ${i}:`, error)
            }
          }
        } catch (error) {
          console.error("Failed to get token owners for whitelist check:", error)
        }
      }

      const whitelistEntries: WhitelistEntry[] = []
      
      for (const address of addressesToCheck) {
        try {
          const isWhitelisted = await membershipContract.whitelist(address)
          if (isWhitelisted) { // Only add whitelisted addresses to reduce noise
            whitelistEntries.push({
              address,
              isWhitelisted,
              addedAt: Date.now() // We don't have exact timestamp without events
            })
          }
        } catch (error) {
          console.error(`Failed to check whitelist for ${address}:`, error)
        }
      }
      
      setWhitelist(whitelistEntries)
      
      // Stats will be updated by the useEffect watching whitelist changes

    } catch (error) {
      console.error("Failed to load whitelist entries:", error)
    }
  }

  // Role management functions
  const checkUserRole = async () => {
    if (!rolesContract || !roleAddress || !selectedRole) return
    
    setRoleLoading(true)
    try {
      const hasRole = await rolesContract.hasRole(
        selectedRole === "ADMIN_ROLE" ? ethers.ZeroHash : // DEFAULT_ADMIN_ROLE is bytes32(0)
        selectedRole === "OFFICER_ROLE" ? ethers.keccak256(ethers.toUtf8Bytes("OFFICER_ROLE")) :
        ethers.keccak256(ethers.toUtf8Bytes("MEMBER_ROLE")),
        roleAddress
      )
      
      setRoleCheckResult(hasRole ? `✅ User has ${selectedRole}` : `❌ User does not have ${selectedRole}`)
      
      toast({
        title: "Role Check Complete",
        description: hasRole ? `User has ${selectedRole}` : `User does not have ${selectedRole}`,
        variant: hasRole ? "default" : "destructive"
      })
    } catch (error) {
      console.error("Error checking role:", error)
      toast({
        title: "Role Check Failed", 
        description: "Failed to check user role",
        variant: "destructive"
      })
    }
    setRoleLoading(false)
  }

  const grantRole = async () => {
    if (!rolesContract || !roleAddress || !selectedRole) return
    
    setQuickRoleSetupStatus({
      loading: true,
      message: "Preparing to grant role...",
      type: "loading"
    })
    
    try {
      const roleBytes = selectedRole === "ADMIN_ROLE" ? ethers.ZeroHash : // DEFAULT_ADMIN_ROLE is bytes32(0)
                       selectedRole === "OFFICER_ROLE" ? ethers.keccak256(ethers.toUtf8Bytes("OFFICER_ROLE")) :
                       ethers.keccak256(ethers.toUtf8Bytes("MEMBER_ROLE"))
      
      // Check if user already has this role
      const hasRole = await rolesContract.hasRole(roleBytes, roleAddress)
      if (hasRole) {
        setQuickRoleSetupStatus({
          loading: false,
          message: `User already has ${selectedRole}`,
          type: "error"
        })
        toast({
          title: "Role Already Assigned",
          description: `${roleAddress.slice(0, 8)}...${roleAddress.slice(-6)} already has ${selectedRole}! No need to grant it again. 🎭`,
          variant: "destructive"
        })
        return
      }

      setQuickRoleSetupStatus({
        loading: true,
        message: "Submitting transaction...",
        type: "loading"
      })

      const tx = await rolesContract.grantRole(roleBytes, roleAddress)
      
      setQuickRoleSetupStatus({
        loading: true,
        message: "Transaction submitted! Waiting for confirmation...",
        type: "loading",
        txHash: tx.hash
      })

      await tx.wait()
      
      setQuickRoleSetupStatus({
        loading: false,
        message: `${selectedRole} successfully granted!`,
        type: "success",
        txHash: tx.hash
      })

      toast({
        title: "Role Granted Successfully",
        description: `${selectedRole} granted to ${roleAddress.slice(0, 8)}...${roleAddress.slice(-6)}`,
      })
      
      // Refresh data
      await loadContractData()
      
      // Clear form and reset status after 5 seconds
      setTimeout(() => {
        setQuickRoleSetupStatus({ loading: false, message: "", type: "idle" })
        setRoleAddress("")
        setSelectedRole("")
        setRoleCheckResult(null)
      }, 5000)

    } catch (error: any) {
      console.error("Error granting role:", error)
      
      let userFriendlyMessage = "Failed to grant role"
      let statusMessage = "Role grant failed"
      
      if (error.code === 4001) {
        userFriendlyMessage = "Transaction was cancelled by user"
        statusMessage = "Transaction cancelled"
      } else if (error.message?.includes("AccessControl: account") && error.message?.includes("is missing role")) {
        userFriendlyMessage = "You don't have permission to grant this role. Admin access required."
        statusMessage = "Permission denied"
      } else if (error.message?.includes("insufficient funds")) {
        userFriendlyMessage = "Insufficient funds for gas fees"
        statusMessage = "Insufficient gas fees"
      } else if (error.message?.includes("could not coalesce error")) {
        userFriendlyMessage = "Polygon Amoy is having a moment 🎭 - try again in a few seconds!"
        statusMessage = "Network being dramatic"
      } else if (error.shortMessage) {
        userFriendlyMessage = error.shortMessage
        statusMessage = "Transaction failed"
      } else if (error.message) {
        userFriendlyMessage = error.message
      }

      setQuickRoleSetupStatus({
        loading: false,
        message: statusMessage,
        type: "error"
      })

      toast({
        title: "Failed to Grant Role",
        description: userFriendlyMessage,
        variant: "destructive"
      })
    }
  }

  const revokeRole = async () => {
    if (!rolesContract || !roleAddress || !selectedRole) return
    
    setQuickRoleSetupStatus({
      loading: true,
      message: "Preparing to revoke role...",
      type: "loading"
    })
    
    try {
      const roleBytes = selectedRole === "ADMIN_ROLE" ? ethers.ZeroHash : // DEFAULT_ADMIN_ROLE is bytes32(0)
                       selectedRole === "OFFICER_ROLE" ? ethers.keccak256(ethers.toUtf8Bytes("OFFICER_ROLE")) :
                       ethers.keccak256(ethers.toUtf8Bytes("MEMBER_ROLE"))
      
      // Check if user has this role first
      const hasRole = await rolesContract.hasRole(roleBytes, roleAddress)
      if (!hasRole) {
        setQuickRoleSetupStatus({
          loading: false,
          message: `User doesn't have ${selectedRole}`,
          type: "error"
        })
        toast({
          title: "Role Not Found",
          description: `${roleAddress.slice(0, 8)}...${roleAddress.slice(-6)} doesn't have ${selectedRole}! Nothing to revoke. 🤷‍♀️`,
          variant: "destructive"
        })
        return
      }

      setQuickRoleSetupStatus({
        loading: true,
        message: "Submitting transaction...",
        type: "loading"
      })

      const tx = await rolesContract.revokeRole(roleBytes, roleAddress)
      
      setQuickRoleSetupStatus({
        loading: true,
        message: "Transaction submitted! Waiting for confirmation...",
        type: "loading",
        txHash: tx.hash
      })

      await tx.wait()
      
      setQuickRoleSetupStatus({
        loading: false,
        message: `${selectedRole} successfully revoked!`,
        type: "success",
        txHash: tx.hash
      })

      toast({
        title: "Role Revoked Successfully",
        description: `${selectedRole} revoked from ${roleAddress.slice(0, 8)}...${roleAddress.slice(-6)}`,
      })
      
      // Refresh data
      await loadContractData()
      
      // Clear form and reset status after 5 seconds
      setTimeout(() => {
        setQuickRoleSetupStatus({ loading: false, message: "", type: "idle" })
        setRoleAddress("")
        setSelectedRole("")
        setRoleCheckResult(null)
      }, 5000)

    } catch (error: any) {
      console.error("Error revoking role:", error)
      
      let userFriendlyMessage = "Failed to revoke role"
      let statusMessage = "Role revoke failed"
      
      if (error.code === 4001) {
        userFriendlyMessage = "Transaction was cancelled by user"
        statusMessage = "Transaction cancelled"
      } else if (error.message?.includes("AccessControl: account") && error.message?.includes("is missing role")) {
        userFriendlyMessage = "You don't have permission to revoke this role. Admin access required."
        statusMessage = "Permission denied"
      } else if (error.message?.includes("insufficient funds")) {
        userFriendlyMessage = "Insufficient funds for gas fees"
        statusMessage = "Insufficient gas fees"
      } else if (error.message?.includes("could not coalesce error")) {
        userFriendlyMessage = "Polygon Amoy is having a moment 🎭 - try again in a few seconds!"
        statusMessage = "Network being dramatic"
      } else if (error.shortMessage) {
        userFriendlyMessage = error.shortMessage
        statusMessage = "Transaction failed"
      } else if (error.message) {
        userFriendlyMessage = error.message
      }

      setQuickRoleSetupStatus({
        loading: false,
        message: statusMessage,
        type: "error"
      })

      toast({
        title: "Failed to Revoke Role",
        description: userFriendlyMessage,
        variant: "destructive"
      })
    }
  }

  // Whitelist management functions
  const checkWhitelistStatus = async () => {
    if (!targetAddress || !membershipContract) {
      toast({
        title: "Error",
        description: "Please enter a valid address",
        variant: "destructive"
      })
      return
    }

    setWhitelistLoading(true)
    try {
      if (!ethers.isAddress(targetAddress)) {
        throw new Error("Invalid address format")
      }

      const isWhitelisted = await membershipContract.whitelist(targetAddress)
      setWhitelistStatus(isWhitelisted)
      
      toast({
        title: "Status Retrieved",
        description: `Address is ${isWhitelisted ? "whitelisted" : "not whitelisted"}`,
      })
    } catch (error: any) {
      console.error("Failed to check whitelist status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to check whitelist status",
        variant: "destructive"
      })
    }
    setWhitelistLoading(false)
  }

  const addToWhitelist = async () => {
    if (!targetAddress || !membershipContract) {
      toast({
        title: "Error",
        description: "Please enter a valid address and ensure wallet is connected",
        variant: "destructive"
      })
      return
    }

    setWhitelistLoading(true)
    try {
      if (!ethers.isAddress(targetAddress)) {
        throw new Error("Invalid address format")
      }

      // Use the existing contract instance instead of creating a fresh one
      const tx = await membershipContract.updateWhitelist(targetAddress, true)
      
      toast({
        title: "Transaction Submitted",
        description: "Adding to whitelist...",
      })

      await tx.wait()
      
      toast({
        title: "Success",
        description: `Address added to whitelist`,
      })
      
      // Update local state and refresh data
      setWhitelistStatus(true)
      await loadContractData()
    } catch (error: any) {
      console.error("Failed to add to whitelist:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add to whitelist",
        variant: "destructive"
      })
    }
    setWhitelistLoading(false)
  }

  const removeFromWhitelist = async () => {
    if (!targetAddress || !membershipContract) {
      toast({
        title: "Error",
        description: "Please enter a valid address and ensure wallet is connected",
        variant: "destructive"
      })
      return
    }

    setWhitelistLoading(true)
    try {
      if (!ethers.isAddress(targetAddress)) {
        throw new Error("Invalid address format")
      }

      // Use the existing contract instance instead of creating a fresh one
      const tx = await membershipContract.updateWhitelist(targetAddress, false)
      
      toast({
        title: "Transaction Submitted",
        description: "Removing from whitelist...",
      })

      await tx.wait()
      
      toast({
        title: "Success",
        description: `Address removed from whitelist`,
      })
      
      // Update local state and refresh data
      setWhitelistStatus(false)
      await loadContractData()
    } catch (error: any) {
      console.error("Failed to remove from whitelist:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove from whitelist",
        variant: "destructive"
      })
    }
    setWhitelistLoading(false)
  }

  // Token burning function
  const burnToken = async () => {
    if (!burnTokenId) {
      setBurnStatus("Please enter a token ID")
      toast({
        title: "Error",
        description: "Please enter a token ID",
        variant: "destructive"
      })
      return
    }

    if (!window.ethereum) {
      setBurnStatus("Error: MetaMask not found - please install MetaMask")
      toast({
        title: "Error",
        description: "MetaMask not found - please install MetaMask",
        variant: "destructive"
      })
      return
    }

    setBurnLoading(true)
    setBurnStatus("Burning token...")
    
    try {
      const tokenId = BigInt(burnTokenId)
      
      // Create fresh contract instances like the working nft-detail-modal
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()

      const freshMembershipContract = new ethers.Contract(
        contracts.membership.address,
        contracts.membership.abi,
        signer
      )

      const freshRolesContract = new ethers.Contract(
        contracts.roles.address,
        contracts.roles.abi,
        signer
      )

      // Verify token exists and get owner
      try {
        const tokenOwner = await freshMembershipContract.ownerOf(tokenId)
        console.log(`Token ${tokenId} is owned by: ${tokenOwner}`)
      } catch (ownerError: any) {
        if (ownerError.message?.includes("ERC721NonexistentToken") || ownerError.message?.includes("invalid token ID")) {
          throw new Error(`Token #${tokenId} doesn't exist or has already been burned`)
        }
        throw ownerError
      }

      // Check user permissions
      const officerRoleHash = ethers.keccak256(ethers.toUtf8Bytes("OFFICER_ROLE"))
      const adminRoleHash = ethers.ZeroHash
      
      const hasOfficerRole = await freshRolesContract.hasRole(officerRoleHash, userAddress)
      const hasAdminRole = await freshRolesContract.hasRole(adminRoleHash, userAddress)
      
      if (!hasOfficerRole && !hasAdminRole) {
        throw new Error("You need OFFICER_ROLE or ADMIN_ROLE to burn tokens")
      }

      // Pre-flight checks to avoid revert
      setBurnStatus("Validating requirements...")

      // Check if contract is paused
      try {
        const isPaused = await freshMembershipContract.paused()
        console.log("- Contract is paused:", isPaused)
        if (isPaused) {
          throw new Error("Contract is currently paused. Cannot burn tokens.")
        }
      } catch (pausedError) {
        console.log("- Could not check paused status (might not have paused function)")
      }

      // Submit transaction using fresh contract instance
      const tx = await freshMembershipContract.burnToken(tokenId)
      
      setBurnStatus(`Transaction submitted: ${tx.hash.slice(0, 10)}...`)
      toast({
        title: "Transaction Submitted",
        description: `Transaction ${tx.hash.slice(0, 10)}... submitted. Waiting for confirmation...`,
      })

      const receipt = await tx.wait()
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`)
      
      setBurnStatus("Token burned successfully!")
      toast({
        title: "Token Burned Successfully",
        description: `Token #${tokenId} has been burned`,
      })
      
      // Refresh data and clear form
      await loadContractData()
      setBurnTokenId("")
      setBurnStatus("")
      
    } catch (error: any) {
      console.error("Failed to burn token:", error)
      setBurnStatus("Error: Transaction failed - see details below")
      
      // Provide more specific error messages
      let errorMessage = error.message || "Transaction failed"
      
      if (error.message?.includes("Internal JSON-RPC error") || error.message?.includes("could not coalesce error") || error.message?.includes("Polygon Amoy is being dramatic")) {
        setBurnStatus("Error: Polygon Amoy is being moody 🙄 - not your fault!")
        errorMessage = `🤖 Polygon Amoy Testnet is Having a Moment™

Don't worry, it's not you, it's them! The Amoy testnet is just being a bit dramatic right now.

Quick fixes to try:
1. Hit that retry button below (sometimes it just needs a gentle nudge)
2. Wait 30-60 seconds for the network to chill out
3. If you're feeling fancy, try switching to mainnet and back in MetaMask
4. Take a coffee break - testnets are known to have commitment issues 😅

Your transaction is perfectly valid, the network is just having one of those days!`
      } else if (error.message?.includes("OFFICER_ROLE")) {
        setBurnStatus("Error: Missing permissions")
        errorMessage = "You need OFFICER_ROLE permissions to burn tokens. Please contact an admin."
      } else if (error.message?.includes("ERC721: invalid token ID") || error.message?.includes("ERC721NonexistentToken") || error.message?.includes("invalid token ID") || error.message?.includes("doesn't exist or has already been burned")) {
        setBurnStatus("Error: Token doesn't exist or already burned")
        errorMessage = `Oops! Token #${burnTokenId} doesn't exist or has already been burned. 

Maybe someone beat you to it? 🤷‍♀️ Try checking what tokens actually exist first!`
      } else if (error.message?.includes("execution reverted")) {
        setBurnStatus("Error: Contract rejected transaction")
        errorMessage = "Transaction was reverted by the contract. This token might have special restrictions or you may not have permission to burn it."
      } else if (error.message?.includes("Network connection")) {
        setBurnStatus("Error: Network connection issue")
        errorMessage = error.message
      } else if (error.code === 4001) {
        setBurnStatus("Cancelled by user")
        errorMessage = "Transaction was rejected by user"
      } else if (error.code === -32603) {
        setBurnStatus("Error: Internal JSON-RPC error")
        errorMessage = "Internal JSON-RPC error: This is a network-level issue. Please try again in a few moments."
      } else {
        setBurnStatus("Error: Unknown issue")
      }
      
      toast({
        title: "Failed to Burn Token",
        description: errorMessage,
        variant: "destructive"
      })
    }
    setBurnLoading(false)
  }

  const mintToken = async () => {
    if (!mintAddress || !selectedTokenType) {
      setTokenManagementStatus({
        loading: false,
        message: "Please enter address and select token type",
        type: "error"
      })
      toast({
        title: "Error",
        description: "Please enter address and select token type",
        variant: "destructive"
      })
      return
    }

    if (!window.ethereum) {
      setTokenManagementStatus({
        loading: false,
        message: "MetaMask not found - please install MetaMask",
        type: "error"
      })
      toast({
        title: "Error",
        description: "MetaMask not found - please install MetaMask",
        variant: "destructive"
      })
      return
    }

    setTokenManagementStatus({
      loading: true,
      message: "Preparing transaction...",
      type: "loading"
    })

    try {
      // Validate address format
      if (!ethers.isAddress(mintAddress)) {
        throw new Error("Invalid address format")
      }

      setTokenManagementStatus({
        loading: true,
        message: "Converting token type to blockchain format...",
        type: "loading"
      })

      // Convert token type to bytes32 (using keccak256 hash like in nft-detail-modal)
      const tokenNameBytes32 = ethers.keccak256(ethers.toUtf8Bytes(selectedTokenType))
      
      setTokenManagementStatus({
        loading: true,
        message: "Creating fresh contract instance...",
        type: "loading"
      })

      // Create fresh contract instance like the working nft-detail-modal
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const freshMembershipContract = new ethers.Contract(
        contracts.membership.address,
        contracts.membership.abi,
        signer
      )

      // Check if this is a PUBLIC token
      const selectedToken = tokenTypes.find(t => t.typeId === selectedTokenType)
      const isPublicToken = selectedToken?.mintAccess === "PUBLIC"
      const userAddress = await signer.getAddress()

      setTokenManagementStatus({
        loading: true,
        message: "Submitting transaction to blockchain...",
        type: "loading"
      })

      let tx
      if (isPublicToken && mintAddress.toLowerCase() === userAddress.toLowerCase()) {
        // Use publicMint for self-minting PUBLIC tokens
        tx = await freshMembershipContract.publicMint(tokenNameBytes32, isSoulbound)
      } else {
        // Use regular mint function (requires whitelist or MEMBER_ROLE)
        tx = await freshMembershipContract.mint(mintAddress, tokenNameBytes32, isSoulbound)
      }
      
      setTokenManagementStatus({
        loading: true,
        message: "Transaction submitted! Waiting for confirmation...",
        type: "loading",
        txHash: tx.hash
      })

      toast({
        title: "Transaction Submitted",
        description: "Waiting for confirmation...",
      })

      await tx.wait()
      
      setTokenManagementStatus({
        loading: false,
        message: `Token successfully minted for ${mintAddress.slice(0, 6)}...${mintAddress.slice(-4)}!`,
        type: "success",
        txHash: tx.hash
      })

      toast({
        title: "Success",
        description: `Token minted for ${mintAddress.slice(0, 6)}...${mintAddress.slice(-4)}`,
      })
      
      loadContractData()

      // Clear form and reset status after 5 seconds
      setTimeout(() => {
        setTokenManagementStatus({ loading: false, message: "", type: "idle" })
        setMintAddress("")
        setSelectedTokenType("")
        setIsSoulbound(false)
      }, 5000)

    } catch (error: any) {
      console.error("Failed to mint token:", error)
      
      // Get user-friendly error message
      const errorMessage = getBlockchainErrorMessage(error)
      
      setTokenManagementStatus({
        loading: false,
        message: errorMessage,
        type: "error"
      })

      toast({
        title: "Minting Failed",
        description: errorMessage,
        variant: "destructive"
      })

      // Clear status after 10 seconds on error
      setTimeout(() => {
        setTokenManagementStatus({ loading: false, message: "", type: "idle" })
      }, 10000)
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
        return <Badge className="bg-red-100 text-red-800"><Shield className="mr-1 h-3 w-3" /> Administrator</Badge>
      case "OFFICER_ROLE":
        return <Badge className="bg-amber-100 text-amber-800"><Award className="mr-1 h-3 w-3" /> Officer</Badge>
      case "MEMBER_ROLE":
        return <Badge className="bg-blue-100 text-blue-800"><Users className="mr-1 h-3 w-3" /> Member</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">No Role</Badge>
    }
  }

  const getAllRoleBadges = (roles: ("ADMIN_ROLE" | "OFFICER_ROLE" | "MEMBER_ROLE")[]) => {
    return (
      <div className="flex flex-wrap gap-1">
        {roles.map(role => (
          <div key={role}>
            {getRoleBadge(role)}
          </div>
        ))}
        {roles.length === 0 && getRoleBadge(null)}
      </div>
    )
  }

  // Load wallet tokens with metadata
  const loadWalletTokens = async (wallet: MemberData) => {
    if (!membershipContract) return
    
    setWalletTokensLoading(true)
    setSelectedWalletWhitelistStatus(null) // Reset whitelist status
    
    try {
      // Check whitelist status for this wallet
      const isWhitelisted = await membershipContract.whitelist(wallet.address)
      setSelectedWalletWhitelistStatus(isWhitelisted)
      
      const tokens: Token[] = []
      
      for (const tokenId of wallet.tokenIds) {
        try {
          // Get token URI
          const tokenURI = await membershipContract.tokenURI(tokenId)
          
          // Fetch metadata
          let metadata: any = {}
          let name = `Token #${tokenId}`
          let description = ""
          let imageUri = "/placeholder.svg"
          
          if (tokenURI && tokenURI !== "") {
            try {
              // Handle IPFS URLs
              let metadataURL = tokenURI
              if (tokenURI.startsWith("ipfs://")) {
                metadataURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
              }
              
              const response = await fetch(metadataURL)
              if (response.ok) {
                metadata = await response.json()
                name = metadata.name || name
                description = metadata.description || ""
                imageUri = metadata.image || imageUri
                
                // Handle IPFS image URLs
                if (imageUri.startsWith("ipfs://")) {
                  imageUri = imageUri.replace("ipfs://", "https://ipfs.io/ipfs/")
                }
              }
            } catch (metadataError) {
              console.error(`Failed to fetch metadata for token ${tokenId}:`, metadataError)
            }
          }
          
          tokens.push({
            id: tokenId,
            tokenId: tokenId.toString(),
            name,
            description,
            imageUri,
            votingPower: 1, // Default voting power
            acquired: new Date().toISOString(), // We don't have exact date from current data
            metadata
          })
        } catch (error) {
          console.error(`Error loading token ${tokenId}:`, error)
        }
      }
      
      setWalletTokens(tokens)
    } catch (error) {
      console.error("Failed to load wallet tokens:", error)
    } finally {
      setWalletTokensLoading(false)
    }
  }

  // Function to get token image (similar to members page)
  const getTokenImage = (token: Token) => {
    // Priority 1: Use the actual image from metadata
    if (token.imageUri && token.imageUri !== "/placeholder.svg" && !token.imageUri.includes("placeholder")) {
      return token.imageUri
    }
    
    // Priority 2: Check metadata for image
    if (token.metadata?.image) {
      let imageUri = token.metadata.image
      if (imageUri.startsWith("ipfs://")) {
        imageUri = imageUri.replace("ipfs://", "https://ipfs.io/ipfs/")
      }
      return imageUri
    }
    
    // Fallback to hardcoded images based on token name
    if (token.name === "Member Token") return "/trader.png"
    if (token.name === "Supporter Token") return "/abstract-gold-token-officer.png"
    if (token.name === "Gold Star Award") return "/gold_star.png"
    if (token.name === "Officer Token") return "/officer.png"
    if (token.name === "Observer Token") return "/mint_and_slurp.png"
    if (token.name === "Alumni Token") return "/the_graduate.png"
    if (token.name === "Scholarship Token") return "/rhodes_scholar.png"
    if (token.name === "Replacement Token") return "/the_fool.png"
    if (token.name === "Founder Series Token") return "/hist_glitch.png"
    if (token.name === "Secret Sauce Token") return "/secret_sauce.png"
    if (token.name === "Loyalty Token") return "/longrun.png"
    if (token.name === "Art Drop Token") return "/digi_art.png"
    return "/placeholder.svg"
  }

  // Status Indicator Component
  const StatusIndicator = ({ status, title }: { 
    status: { loading: boolean; message: string; type: "idle" | "loading" | "success" | "error"; txHash?: string }
    title: string
  }) => {
    if (status.type === "idle") return null

    const getIcon = () => {
      switch (status.type) {
        case "loading":
          return <RefreshCw className="h-4 w-4 animate-spin" />
        case "success":
          return <CheckCircle className="h-4 w-4" />
        case "error":
          return <XCircle className="h-4 w-4" />
        default:
          return null
      }
    }

    const getStyles = () => {
      switch (status.type) {
        case "loading":
          return "bg-blue-50 border-blue-200 text-blue-800"
        case "success":
          return "bg-green-50 border-green-200 text-green-800"
        case "error":
          return "bg-red-50 border-red-200 text-red-800"
        default:
          return "bg-gray-50 border-gray-200 text-gray-800"
      }
    }

    return (
      <div className={`p-3 rounded-lg border ${getStyles()} mt-3`}>
        <div className="flex items-start space-x-2">
          {getIcon()}
          <div className="flex-1">
            <div className="font-medium text-sm">{title} Status</div>
            <div className="text-sm mt-1">{status.message}</div>
            {status.txHash && (
              <div className="mt-2">
                <a
                  href={`https://amoy.polygonscan.com/tx/${status.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>View on Polygon Amoy Scan</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const filteredMembers = members.filter(member => 
    member.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.currentRole && member.currentRole.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="flex flex-col">
      {/* Enhanced Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-600 via-gray-700 to-zinc-800 py-20 md:py-28">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-36 h-36 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Floating Badge */}
            <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-gray-100 backdrop-blur-sm border border-white/30">
              <Shield className="mr-2 h-4 w-4" />
              Officer Dashboard
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              🏛️ Administrative Controls
            </h1>
            
            <p className="mb-8 text-xl text-gray-100 leading-relaxed">
              Manage membership, tokens, and governance for the blockchain club. Officer-level access and administrative tools.
            </p>
          </div>
        </div>
      </section>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      
      <div className="container mx-auto px-4 py-12">

      {/* Conditional content based on connection and officer status */}
      {isConnected && isOfficer && membersLoading && publicStatsLoading ? (
        // Show loading when officer is connected but data is still loading
        <div className="space-y-6">
          <SectionLoadingSkeleton title="Loading officer dashboard...">
            <MemberCardSkeleton count={5} />
          </SectionLoadingSkeleton>
        </div>
      ) : !isConnected ? (
        <div className="mx-auto max-w-md text-center">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Connect Your Wallet</CardTitle>
              <CardDescription className="text-gray-600">
                Connect your wallet to access officer tools and view detailed management controls.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-[#CFB87C] hover:bg-[#B8A569] text-black font-semibold"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : !isOfficer ? (
        <div className="mx-auto max-w-md text-center">
          <Card className="border-amber-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">Officer Access Required</CardTitle>
              <CardDescription className="text-amber-700">
                The advanced dashboard tools are restricted to club officers. You can view basic stats above.
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
      ) : (
        <div>
        {/* User Status Banner */}
        <div className="mb-8">
          <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardContent className="p-6">                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-amber-100 rounded-full">
                    {isAdmin ? <Crown className="h-6 w-6 text-amber-700" /> : <Star className="h-6 w-6 text-amber-700" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Welcome, {isAdmin ? "Administrator" : "Officer"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Connected as: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{userAddress.slice(0, 8)}...{userAddress.slice(-6)}</code>
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {(() => {
                    const currentUser = members.find(m => m.address.toLowerCase() === userAddress.toLowerCase())
                    return currentUser ? getAllRoleBadges(currentUser.roles) : (
                      <Badge className={isAdmin ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}>
                        {isAdmin ? <Shield className="mr-1 h-3 w-3" /> : <Award className="mr-1 h-3 w-3" />}
                        {isAdmin ? "Administrator" : "Officer"}
                      </Badge>
                    )
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="officer-tools">Officer Tools</TabsTrigger>
            <TabsTrigger value="admin-tools">
              <Lock className="mr-2 h-4 w-4" />
              Admin Tools
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common tasks and frequently used tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => setActiveTab("officer-tools")} 
                    className="w-full justify-start" 
                    variant="outline"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Manage Whitelist
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("officer-tools")} 
                    className="w-full justify-start" 
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Mint Tokens
                  </Button>
                  {isAdmin && (
                    <Button 
                      onClick={() => setActiveTab("admin-tools")} 
                      className="w-full justify-start" 
                      variant="outline"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Manage Roles
                    </Button>
                  )}
                  <Button 
                    onClick={loadContractData} 
                    className="w-full justify-start" 
                    variant="outline"
                    disabled={isLoading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Data
                  </Button>
                </CardContent>
              </Card>

              {/* Role Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Current Role Holders
                  </CardTitle>
                  <CardDescription>
                    Overview of club leadership and members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {membersLoading ? (
                    <SectionLoadingSkeleton title="Loading role holders...">
                      <MemberCardSkeleton count={3} />
                    </SectionLoadingSkeleton>
                  ) : (
                    <div className="space-y-4">
                      {/* Admins */}
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                          <Crown className="mr-1 h-4 w-4 text-red-600" />
                          Administrators ({members.filter(m => m.roles.includes("ADMIN_ROLE")).length})
                        </h4>
                        <div className="space-y-2 max-h-24 overflow-y-auto">
                          {members.filter(m => m.roles.includes("ADMIN_ROLE")).length === 0 ? (
                            <p className="text-sm text-gray-500">No administrators found</p>
                          ) : (
                            members.filter(m => m.roles.includes("ADMIN_ROLE")).map(member => (
                              <div key={member.address} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                                <div className="flex flex-col">
                                  <code className="text-xs">{member.address.slice(0, 8)}...{member.address.slice(-6)}</code>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {getAllRoleBadges(member.roles)}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Officers */}
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                          <Award className="mr-1 h-4 w-4 text-amber-600" />
                          Officers ({members.filter(m => m.roles.includes("OFFICER_ROLE")).length})
                        </h4>
                        <div className="space-y-2 max-h-24 overflow-y-auto">
                          {members.filter(m => m.roles.includes("OFFICER_ROLE")).length === 0 ? (
                            <p className="text-sm text-gray-500">No officers found</p>
                          ) : (
                            members.filter(m => m.roles.includes("OFFICER_ROLE")).map(member => (
                              <div key={member.address} className="flex items-center justify-between p-2 bg-amber-50 rounded border border-amber-200">
                                <div className="flex flex-col">
                                  <code className="text-xs">{member.address.slice(0, 8)}...{member.address.slice(-6)}</code>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {getAllRoleBadges(member.roles)}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Member Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Member Overview
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHowItWorksDropdown(!showHowItWorksDropdown)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    <HelpCircle className="mr-1 h-4 w-4" />
                    How this works
                    {showHowItWorksDropdown ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </Button>
                </CardTitle>
                <CardDescription>
                  View and search through all club members and their roles. Click on any address to view their tokens.
                </CardDescription>
                {showHowItWorksDropdown && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="space-y-2 text-sm text-blue-900">
                      <div className="flex items-start space-x-2">
                        <Code className="h-4 w-4 mt-0.5 text-blue-600" />
                        <div>
                          <strong>On-Chain Data Tracking:</strong> All member data is stored directly on the blockchain, ensuring transparency and immutability.
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Shield className="h-4 w-4 mt-0.5 text-blue-600" />
                        <div>
                          <strong>Role-Based Access:</strong> Members are assigned roles (Admin, Officer, Member) which determine their permissions and voting power.
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Award className="h-4 w-4 mt-0.5 text-blue-600" />
                        <div>
                          <strong>Token-Based Membership:</strong> Each member holds NFT tokens that represent their membership status and special privileges.
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <BarChart3 className="h-4 w-4 mt-0.5 text-blue-600" />
                        <div>
                          <strong>Voting Power:</strong> Calculated based on token holdings and roles, with optional custom overrides for special cases.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search members by address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={loadContractData} 
                    variant="outline" 
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {membersLoading ? (
                    <SectionLoadingSkeleton title="Loading members...">
                      <MemberCardSkeleton count={5} />
                    </SectionLoadingSkeleton>
                  ) : filteredMembers.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No members found</p>
                  ) : (
                    filteredMembers.slice(0, 10).map((member: MemberData) => (
                      <div 
                        key={member.address} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                        onClick={() => {
                          setSelectedWallet(member)
                          setShowTokensModal(true)
                          loadWalletTokens(member)
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <code className="text-sm font-mono group-hover:text-blue-600">
                              {member.address.slice(0, 12)}...{member.address.slice(-8)}
                            </code>
                            <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                          </div>
                          <p className="text-xs text-gray-500">
                            {member.tokenCount} tokens • Voting Power: {member.customVotingPower || member.votingPower}
                            {member.customVotingPower && <span className="text-amber-600"> (Custom)</span>}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getAllRoleBadges(member.roles)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {!membersLoading && filteredMembers.length > 10 && (
                  <p className="text-sm text-gray-500 text-center">
                    Showing 10 of {filteredMembers.length} members
                  </p>
                )}
              </CardContent>
            </Card>

            {/* POL Requests Management */}
            <PolRequestsDashboard />
          </TabsContent>

          {/* Admin-Only Tools */}
          <TabsContent value="admin-tools" className="space-y-6">
            {!isAdmin ? (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-900 flex items-center">
                    <Lock className="mr-2 h-5 w-5" />
                    Admin Access Required
                  </CardTitle>
                  <CardDescription className="text-red-700">
                    These tools are restricted to administrators only.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                      You need admin privileges to access these tools. Contact an existing administrator to grant you admin access.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Alert className="border-red-200 bg-red-50">
                  <Shield className="h-4 w-4" />
                  <AlertTitle className="text-red-900">Administrator Tools</AlertTitle>
                  <AlertDescription className="text-red-700">
                    These tools have elevated permissions and can significantly impact the contract. Use with caution.
                  </AlertDescription>
                </Alert>

                <Alert className="border-blue-200 bg-blue-50 mb-6">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="text-blue-900">Role Management Guidelines</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    <strong>Best Practice:</strong> Grant multiple roles for proper access hierarchy. For example:
                    <ul className="mt-2 ml-4 list-disc space-y-1">
                      <li>Admins should also have Officer and Member roles</li>
                      <li>Officers should also have Member roles</li>
                      <li>This ensures users have access to all appropriate functions</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="text-blue-900">Role Architecture</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    <strong>Key Point:</strong> Admin and Officer are completely independent roles. Each grants different privileges and neither inherits from the other. 
                    Users can have one, both, or neither role. For full access and to appear in all listings, grant ADMIN_ROLE, OFFICER_ROLE, and MEMBER_ROLE.
                  </AlertDescription>
                </Alert>

                {/* Quick Role Setup */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Crown className="mr-2 h-5 w-5" />
                      Quick Role Setup
                    </CardTitle>
                    <CardDescription>
                      Grant necessary roles and whitelist access for admins or officers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Role Type Selection */}
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="roleType"
                          value="admin"
                          checked={roleType === 'admin'}
                          onChange={(e) => setRoleType(e.target.value as 'admin' | 'officer')}
                          className="form-radio text-blue-600"
                        />
                        <Crown className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Full Admin</span>
                        <span className="text-sm text-gray-500">(ADMIN + OFFICER + MEMBER)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="roleType"
                          value="officer"
                          checked={roleType === 'officer'}
                          onChange={(e) => setRoleType(e.target.value as 'admin' | 'officer')}
                          className="form-radio text-green-600"
                        />
                        <Award className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Officer</span>
                        <span className="text-sm text-gray-500">(OFFICER + MEMBER)</span>
                      </label>
                    </div>

                    {/* Address Input and Setup Button */}
                    <div className="flex space-x-2">
                      <Input
                        placeholder={`Enter ${roleType} address`}
                        value={roleAddress}
                        onChange={(e) => setRoleAddress(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={async () => {
                          if (!rolesContract || !membershipContract || !roleAddress) {
                            setQuickRoleSetupStatus({
                              loading: false,
                              message: "Please enter a valid address",
                              type: "error"
                            })
                            return
                          }
                          
                          setQuickRoleSetupStatus({
                            loading: true,
                            message: "Setting up roles and permissions...",
                            type: "loading"
                          })

                          setRoleLoading(true)
                          try {
                            const officerHash = ethers.keccak256(ethers.toUtf8Bytes("OFFICER_ROLE"))
                            const memberHash = ethers.keccak256(ethers.toUtf8Bytes("MEMBER_ROLE"))
                            
                            // Check and grant whitelist if needed
                            setQuickRoleSetupStatus({
                              loading: true,
                              message: "Checking whitelist status...",
                              type: "loading"
                            })

                            const isWhitelisted = await membershipContract.whitelist(roleAddress)
                            if (!isWhitelisted) {
                              setQuickRoleSetupStatus({
                                loading: true,
                                message: "Adding to whitelist...",
                                type: "loading"
                              })
                              const whitelistTx = await membershipContract.updateWhitelist(roleAddress, true)
                              await whitelistTx.wait()
                            }
                            
                            if (roleType === 'admin') {
                              // Grant all three roles for admin
                              setQuickRoleSetupStatus({
                                loading: true,
                                message: "Granting admin roles (ADMIN + OFFICER + MEMBER)...",
                                type: "loading"
                              })

                              const adminHash = ethers.ZeroHash
                              const tx1 = await rolesContract.grantRole(adminHash, roleAddress)
                              await tx1.wait()
                              const tx2 = await rolesContract.grantRole(officerHash, roleAddress)
                              await tx2.wait()
                              const tx3 = await rolesContract.grantRole(memberHash, roleAddress)
                              await tx3.wait()
                              
                              setQuickRoleSetupStatus({
                                loading: false,
                                message: `Full admin setup complete! All roles and whitelist granted to ${roleAddress.slice(0, 8)}...${roleAddress.slice(-6)}`,
                                type: "success",
                                txHash: tx3.hash
                              })

                              toast({
                                title: "Full Admin Setup Complete",
                                description: `All roles and whitelist granted to ${roleAddress.slice(0, 8)}...${roleAddress.slice(-6)}`,
                              })
                            } else {
                              // Grant officer and member roles only
                              setQuickRoleSetupStatus({
                                loading: true,
                                message: "Granting officer roles (OFFICER + MEMBER)...",
                                type: "loading"
                              })

                              const tx1 = await rolesContract.grantRole(officerHash, roleAddress)
                              await tx1.wait()
                              const tx2 = await rolesContract.grantRole(memberHash, roleAddress)
                              await tx2.wait()

                              setQuickRoleSetupStatus({
                                loading: false,
                                message: `Officer setup complete! Officer and member roles + whitelist granted to ${roleAddress.slice(0, 8)}...${roleAddress.slice(-6)}`,
                                type: "success",
                                txHash: tx2.hash
                              })
                              
                              toast({
                                title: "Officer Setup Complete",
                                description: `Officer and member roles + whitelist granted to ${roleAddress.slice(0, 8)}...${roleAddress.slice(-6)}`,
                              })
                            }
                            
                            await loadContractData()

                            // Clear form and reset status after 5 seconds
                            setTimeout(() => {
                              setQuickRoleSetupStatus({ loading: false, message: "", type: "idle" })
                              setRoleAddress("")
                            }, 5000)

                          } catch (error: any) {
                            console.error(`Error setting up ${roleType}:`, error)
                            setQuickRoleSetupStatus({
                              loading: false,
                              message: `Failed to setup ${roleType === 'admin' ? 'admin' : 'officer'}: ${error.message || "Transaction failed"}`,
                              type: "error"
                            })
                            toast({
                              title: `Failed to Setup ${roleType === 'admin' ? 'Admin' : 'Officer'}`,
                              description: error.message || "Transaction failed",
                              variant: "destructive"
                            })
                          }
                          setRoleLoading(false)
                        }}
                        disabled={roleLoading || !roleAddress || quickRoleSetupStatus.loading}
                        className={roleType === 'admin' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
                      >
                        {(roleLoading || quickRoleSetupStatus.loading) ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : roleType === 'admin' ? (
                          <Crown className="mr-2 h-4 w-4" />
                        ) : (
                          <Award className="mr-2 h-4 w-4" />
                        )}
                        Setup {roleType === 'admin' ? 'Full Admin' : 'Officer'}
                      </Button>
                    </div>

                    {/* Quick Role Setup Status */}
                    <StatusIndicator status={quickRoleSetupStatus} title="Role Setup" />

                    {/* How this works section */}
                    <div className="border-t pt-4">
                      <button
                        onClick={() => setShowQuickSetupHelp(!showQuickSetupHelp)}
                        className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" />
                          How this works
                        </div>
                        {showQuickSetupHelp ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      
                      {showQuickSetupHelp && (
                        <div className="mt-3 space-y-3 p-4 bg-gray-50 rounded-lg border">
                          <div className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                            Contract Functions Called
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-start gap-3 p-2 bg-white rounded border">
                              <Code className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-mono text-sm text-blue-700">membershipContract.updateWhitelist()</div>
                                <div className="text-xs text-gray-600">Grants whitelist access for token minting</div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Lock className="h-3 w-3 text-orange-500" />
                                  <span className="text-xs text-orange-600">Requires signature</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3 p-2 bg-white rounded border">
                              <Code className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-mono text-sm text-green-700">rolesContract.grantRole(OFFICER_ROLE)</div>
                                <div className="text-xs text-gray-600">Grants officer dashboard access</div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Lock className="h-3 w-3 text-orange-500" />
                                  <span className="text-xs text-orange-600">Requires signature</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3 p-2 bg-white rounded border">
                              <Code className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-mono text-sm text-purple-700">rolesContract.grantRole(MEMBER_ROLE)</div>
                                <div className="text-xs text-gray-600">Appears in member listings</div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Lock className="h-3 w-3 text-orange-500" />
                                  <span className="text-xs text-orange-600">Requires signature</span>
                                </div>
                              </div>
                            </div>
                            
                            {roleType === 'admin' && (
                              <div className="flex items-start gap-3 p-2 bg-white rounded border border-blue-200 bg-blue-50">
                                <Code className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="font-mono text-sm text-blue-700">rolesContract.grantRole(ADMIN_ROLE)</div>
                                  <div className="text-xs text-gray-600">Full admin privileges (Admin setup only)</div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Lock className="h-3 w-3 text-orange-500" />
                                    <span className="text-xs text-orange-600">Requires signature</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Role Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="mr-2 h-5 w-5" />
                      Individual Role Management
                    </CardTitle>
                    <CardDescription>
                      Grant or revoke individual roles with fine-grained control
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert className="border-amber-200 bg-amber-50">
                      <Info className="h-4 w-4" />
                      <AlertTitle className="text-amber-900">Precise Role Control</AlertTitle>
                      <AlertDescription className="text-amber-700">
                        Use this for precise role management. Unlike Quick Setup, this allows you to grant or revoke individual roles without affecting others.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Address Input */}
                      <div className="space-y-2">
                        <Label htmlFor="role-address">Wallet Address</Label>
                        <Input
                          id="role-address"
                          placeholder="0x..."
                          value={roleAddress}
                          onChange={(e) => setRoleAddress(e.target.value)}
                        />
                      </div>

                      {/* Role Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="role-selection">Role</Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                          <SelectTrigger id="role-selection">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN_ROLE">
                              <div className="flex items-center">
                                <Crown className="mr-2 h-4 w-4 text-red-600" />
                                Admin Role
                              </div>
                            </SelectItem>
                            <SelectItem value="OFFICER_ROLE">
                              <div className="flex items-center">
                                <Award className="mr-2 h-4 w-4 text-amber-600" />
                                Officer Role
                              </div>
                            </SelectItem>
                            <SelectItem value="MEMBER_ROLE">
                              <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4 text-blue-600" />
                                Member Role
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button 
                        onClick={checkUserRole}
                        disabled={roleLoading || !roleAddress || !selectedRole || quickRoleSetupStatus.loading}
                        variant="outline"
                        className="flex-1"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Check Role
                      </Button>
                      <Button 
                        onClick={grantRole}
                        disabled={roleLoading || !roleAddress || !selectedRole || quickRoleSetupStatus.loading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {(roleLoading || quickRoleSetupStatus.loading) ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus className="mr-2 h-4 w-4" />
                        )}
                        Grant Role
                      </Button>
                      <Button 
                        onClick={revokeRole}
                        disabled={roleLoading || !roleAddress || !selectedRole || quickRoleSetupStatus.loading}
                        variant="destructive"
                        className="flex-1"
                      >
                        {(roleLoading || quickRoleSetupStatus.loading) ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Revoke Role
                      </Button>
                    </div>

                    {/* Role Check Result */}
                    {roleCheckResult && (
                      <Alert className={roleCheckResult.includes("✅") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Role Check Result</AlertTitle>
                        <AlertDescription>{roleCheckResult}</AlertDescription>
                      </Alert>
                    )}

                    {/* Individual Role Management Status */}
                    <StatusIndicator status={quickRoleSetupStatus} title="Role Management" />

                    {/* How this works section */}
                    <div className="border-t pt-4">
                      <button
                        onClick={() => setShowOfficerWhitelistHelp(!showOfficerWhitelistHelp)}
                        className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" />
                          Role Management Guide
                        </div>
                        {showOfficerWhitelistHelp ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      
                      {showOfficerWhitelistHelp && (
                        <div className="mt-3 space-y-3 p-4 bg-gray-50 rounded-lg border">
                          <div className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                            Role Hierarchy & Best Practices
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-start gap-3 p-2 bg-white rounded border">
                              <Crown className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium text-sm text-red-700">ADMIN_ROLE</div>
                                <div className="text-xs text-gray-600">Full contract control, can grant/revoke all roles, access admin tools</div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3 p-2 bg-white rounded border">
                              <Award className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium text-sm text-amber-700">OFFICER_ROLE</div>
                                <div className="text-xs text-gray-600">Dashboard access, token minting, limited admin functions</div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3 p-2 bg-white rounded border">
                              <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium text-sm text-blue-700">MEMBER_ROLE</div>
                                <div className="text-xs text-gray-600">Appears in member listings, basic club membership</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-2">
                              💡 Pro Tip
                            </div>
                            <div className="text-sm text-blue-700">
                              For full functionality, users typically need multiple roles. For example, an officer should have both OFFICER_ROLE and MEMBER_ROLE to appear in all relevant lists and have full access.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Functions */}
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-900">
                      <AlertCircle className="mr-2 h-5 w-5" />
                      Emergency Functions
                    </CardTitle>
                    <CardDescription className="text-red-700">
                      Critical admin-only functions for emergency situations. Use with extreme caution.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert className="border-red-300 bg-red-100">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="text-red-900">⚠️ Emergency Use Only</AlertTitle>
                      <AlertDescription className="text-red-800">
                        These functions bypass normal security measures and should only be used in genuine emergencies like security breaches or critical bugs.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pause Membership Contract */}
                      <div className="space-y-3">
                        <Label className="text-red-900 font-medium">Pause Membership Contract</Label>
                        <p className="text-sm text-red-700">
                          Stops all minting, burning, and transfers of membership NFTs
                        </p>
                        <Button 
                          variant="destructive"
                          className="w-full"
                          onClick={async () => {
                            if (!membershipContract) return
                            
                            setEmergencyFunctionStatus({
                              loading: true,
                              message: "Preparing to pause membership contract...",
                              type: "loading"
                            })
                            setIsLoading(true)
                            
                            try {
                              setEmergencyFunctionStatus({
                                loading: true,
                                message: "Submitting pause transaction...",
                                type: "loading"
                              })

                              const tx = await membershipContract.pause()

                              setEmergencyFunctionStatus({
                                loading: true,
                                message: "Transaction submitted! Waiting for confirmation...",
                                type: "loading",
                                txHash: tx.hash
                              })

                              await tx.wait()
                              
                              setEmergencyFunctionStatus({
                                loading: false,
                                message: "Membership contract has been paused! All NFT operations are now suspended.",
                                type: "success",
                                txHash: tx.hash
                              })

                              toast({
                                title: "Membership Contract Paused",
                                description: "All NFT operations have been suspended",
                                variant: "destructive"
                              })
                              
                              await loadContractData()

                              // Clear status after 10 seconds (longer for emergency actions)
                              setTimeout(() => {
                                setEmergencyFunctionStatus({ loading: false, message: "", type: "idle" })
                              }, 10000)

                            } catch (error: any) {
                              console.error("Error pausing contract:", error)
                              
                              setEmergencyFunctionStatus({
                                loading: false,
                                message: `Failed to pause contract: ${error.message || "Transaction failed"}`,
                                type: "error"
                              })

                              toast({
                                title: "Failed to Pause Contract",
                                description: error.message || "Transaction failed",
                                variant: "destructive"
                              })
                            }
                            setIsLoading(false)
                          }}
                          disabled={isLoading || emergencyFunctionStatus.loading}
                        >
                          {(isLoading || emergencyFunctionStatus.loading) ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Lock className="mr-2 h-4 w-4" />
                          )}
                          Pause Contract
                        </Button>
                      </div>

                      {/* Unpause Membership Contract */}
                      <div className="space-y-3">
                        <Label className="text-red-900 font-medium">Unpause Membership Contract</Label>
                        <p className="text-sm text-red-700">
                          Restores normal operations for membership NFTs
                        </p>
                        <Button 
                          variant="outline"
                          className="w-full border-red-300 text-red-700 hover:bg-red-100"
                          onClick={async () => {
                            if (!membershipContract) return
                            
                            setEmergencyFunctionStatus({
                              loading: true,
                              message: "Preparing to unpause membership contract...",
                              type: "loading"
                            })
                            setIsLoading(true)
                            
                            try {
                              setEmergencyFunctionStatus({
                                loading: true,
                                message: "Submitting unpause transaction...",
                                type: "loading"
                              })

                              const tx = await membershipContract.unpause()

                              setEmergencyFunctionStatus({
                                loading: true,
                                message: "Transaction submitted! Waiting for confirmation...",
                                type: "loading",
                                txHash: tx.hash
                              })

                              await tx.wait()
                              
                              setEmergencyFunctionStatus({
                                loading: false,
                                message: "Membership contract has been unpaused! Normal operations have been restored.",
                                type: "success",
                                txHash: tx.hash
                              })

                              toast({
                                title: "Membership Contract Unpaused",
                                description: "Normal NFT operations have been restored"
                              })
                              
                              await loadContractData()

                              // Clear status after 10 seconds
                              setTimeout(() => {
                                setEmergencyFunctionStatus({ loading: false, message: "", type: "idle" })
                              }, 10000)

                            } catch (error: any) {
                              console.error("Error unpausing contract:", error)
                              
                              setEmergencyFunctionStatus({
                                loading: false,
                                message: `Failed to unpause contract: ${error.message || "Transaction failed"}`,
                                type: "error"
                              })

                              toast({
                                title: "Failed to Unpause Contract",
                                description: error.message || "Transaction failed",
                                variant: "destructive"
                              })
                            }
                            setIsLoading(false)
                          }}
                          disabled={isLoading || emergencyFunctionStatus.loading}
                        >
                          {(isLoading || emergencyFunctionStatus.loading) ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          Unpause Contract
                        </Button>
                      </div>

                      {/* Emergency Treasury Withdrawal */}
                      <div className="space-y-3">
                        <Label className="text-red-900 font-medium">Emergency Treasury Withdrawal</Label>
                        <p className="text-sm text-red-700">
                          Immediately withdraw all pending funds from TreasuryRouter (bypasses 24h delay)
                        </p>
                        <Button 
                          variant="destructive"
                          className="w-full"
                          onClick={async () => {
                            if (!walletClient) return
                            
                            setEmergencyFunctionStatus({
                              loading: true,
                              message: "Preparing emergency treasury withdrawal...",
                              type: "loading"
                            })
                            setIsLoading(true)
                            
                            try {
                              setEmergencyFunctionStatus({
                                loading: true,
                                message: "Connecting to treasury contract...",
                                type: "loading"
                              })

                              // Use WAGMI wallet client (benefits from fallback RPC)
                              const provider = new ethers.BrowserProvider(walletClient.transport)
                              const signer = await provider.getSigner()
                              const treasuryContract = new ethers.Contract(
                                contracts.treasury.address,
                                contracts.treasury.abi,
                                signer
                              )
                              
                              setEmergencyFunctionStatus({
                                loading: true,
                                message: "Submitting emergency withdrawal transaction...",
                                type: "loading"
                              })

                              const tx = await treasuryContract.emergencyWithdraw()

                              setEmergencyFunctionStatus({
                                loading: true,
                                message: "Transaction submitted! Processing emergency withdrawal...",
                                type: "loading",
                                txHash: tx.hash
                              })

                              await tx.wait()
                              
                              setEmergencyFunctionStatus({
                                loading: false,
                                message: "Emergency withdrawal complete! All treasury funds have been withdrawn to your address.",
                                type: "success",
                                txHash: tx.hash
                              })

                              toast({
                                title: "Emergency Withdrawal Complete",
                                description: "All treasury funds have been withdrawn to your address",
                                variant: "destructive"
                              })
                              
                              await loadContractData()

                              // Clear status after 10 seconds
                              setTimeout(() => {
                                setEmergencyFunctionStatus({ loading: false, message: "", type: "idle" })
                              }, 10000)

                            } catch (error: any) {
                              console.error("Error during emergency withdrawal:", error)
                              
                              setEmergencyFunctionStatus({
                                loading: false,
                                message: `Emergency withdrawal failed: ${error.message || "Transaction failed"}`,
                                type: "error"
                              })

                              toast({
                                title: "Emergency Withdrawal Failed",
                                description: error.message || "Transaction failed",
                                variant: "destructive"
                              })
                            }
                            setIsLoading(false)
                          }}
                          disabled={isLoading || emergencyFunctionStatus.loading}
                        >
                          {(isLoading || emergencyFunctionStatus.loading) ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <AlertCircle className="mr-2 h-4 w-4" />
                          )}
                          Emergency Withdraw
                        </Button>
                      </div>

                      {/* Update Treasury Address */}
                      <div className="space-y-3">
                        <Label className="text-red-900 font-medium">Update Treasury Address</Label>
                        <p className="text-sm text-red-700">
                          Change where treasury funds are sent after the 24h delay
                        </p>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="New treasury address"
                            value={targetAddress}
                            onChange={(e) => setTargetAddress(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-100"
                            onClick={async () => {
                              if (!walletClient || !targetAddress) return
                              
                              setEmergencyFunctionStatus({
                                loading: true,
                                message: "Preparing to update treasury address...",
                                type: "loading"
                              })
                              setIsLoading(true)
                              
                              try {
                                setEmergencyFunctionStatus({
                                  loading: true,
                                  message: "Connecting to treasury contract...",
                                  type: "loading"
                                })

                                // Use WAGMI wallet client (benefits from fallback RPC)
                                const provider = new ethers.BrowserProvider(walletClient.transport)
                                const signer = await provider.getSigner()
                                const treasuryContract = new ethers.Contract(
                                  contracts.treasury.address,
                                  contracts.treasury.abi,
                                  signer
                                )
                                
                                setEmergencyFunctionStatus({
                                  loading: true,
                                  message: "Submitting treasury update transaction...",
                                  type: "loading"
                                })

                                const tx = await treasuryContract.updateTreasury(targetAddress)

                                setEmergencyFunctionStatus({
                                  loading: true,
                                  message: "Transaction submitted! Waiting for confirmation...",
                                  type: "loading",
                                  txHash: tx.hash
                                })

                                await tx.wait()
                                
                                setEmergencyFunctionStatus({
                                  loading: false,
                                  message: `Treasury address successfully updated to ${targetAddress.slice(0, 8)}...${targetAddress.slice(-6)}`,
                                  type: "success",
                                  txHash: tx.hash
                                })

                                toast({
                                  title: "Treasury Address Updated",
                                  description: `Treasury address changed to ${targetAddress.slice(0, 8)}...${targetAddress.slice(-6)}`
                                })
                                
                                setTargetAddress("")
                                await loadContractData()

                                // Clear status after 10 seconds
                                setTimeout(() => {
                                  setEmergencyFunctionStatus({ loading: false, message: "", type: "idle" })
                                }, 10000)

                              } catch (error: any) {
                                console.error("Error updating treasury:", error)
                                
                                setEmergencyFunctionStatus({
                                  loading: false,
                                  message: `Failed to update treasury: ${error.message || "Transaction failed"}`,
                                  type: "error"
                                })

                                toast({
                                  title: "Failed to Update Treasury",
                                  description: error.message || "Transaction failed",
                                  variant: "destructive"
                                })
                              }
                              setIsLoading(false)
                            }}
                            disabled={isLoading || !targetAddress || emergencyFunctionStatus.loading}
                          >
                            {(isLoading || emergencyFunctionStatus.loading) ? (
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Settings className="mr-2 h-4 w-4" />
                            )}
                            Update
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Functions Status */}
                    <StatusIndicator status={emergencyFunctionStatus} title="Emergency Function" />

                    {/* How this works section for Emergency Functions */}
                    <div className="border-t border-red-200 pt-4">
                      <button
                        onClick={() => setShowEmergencyHelp(!showEmergencyHelp)}
                        className="flex items-center justify-between w-full text-left text-sm font-medium text-red-700 hover:text-red-900 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" />
                          How this works
                        </div>
                        {showEmergencyHelp ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      
                      {showEmergencyHelp && (
                        <div className="mt-3 space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-xs font-semibold text-red-800 uppercase tracking-wide">
                            Emergency Contract Functions
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-start gap-3 p-3 bg-white rounded border border-red-200">
                              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-mono text-sm text-red-700">membershipContract.pause()</div>
                                <div className="text-xs text-gray-600">Immediately stops all minting and transfers</div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Lock className="h-3 w-3 text-orange-500" />
                                  <span className="text-xs text-orange-600">Requires ADMIN_ROLE signature</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3 p-3 bg-white rounded border border-green-200">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-mono text-sm text-green-700">membershipContract.unpause()</div>
                                <div className="text-xs text-gray-600">Resumes normal contract operations</div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Lock className="h-3 w-3 text-orange-500" />
                                  <span className="text-xs text-orange-600">Requires ADMIN_ROLE signature</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3 p-3 bg-white rounded border border-yellow-200">
                              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-mono text-sm text-yellow-700">treasuryRouter.emergencyWithdraw()</div>
                                <div className="text-xs text-gray-600">Bypasses 24h delay for immediate fund access</div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Lock className="h-3 w-3 text-orange-500" />
                                  <span className="text-xs text-orange-600">Requires ADMIN_ROLE signature</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3 p-3 bg-white rounded border border-blue-200">
                              <Settings className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-mono text-sm text-blue-700">treasuryRouter.updateTreasuryAddress()</div>
                                <div className="text-xs text-gray-600">Changes destination for future fund withdrawals</div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Lock className="h-3 w-3 text-orange-500" />
                                  <span className="text-xs text-orange-600">Requires ADMIN_ROLE signature</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-yellow-800">
                                <strong>Security Note:</strong> All emergency functions require ADMIN_ROLE privileges and should only be used in critical situations.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

              </div>
            )}
          </TabsContent>

          {/* Officer Tools */}
          <TabsContent value="officer-tools" className="space-y-6">
            <Alert className="border-amber-200 bg-amber-50">
              <Award className="h-4 w-4" />
              <AlertTitle className="text-amber-900">Officer Tools</AlertTitle>
              <AlertDescription className="text-amber-700">
                These tools are available to all officers and admins for managing club operations.
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              {/* Top Row - Token Management and Whitelist Management */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Token Management */}
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Award className="mr-2 h-5 w-5" />
                        Token Management
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadTokenTypes}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh Types
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Mint new membership tokens and burn existing ones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Mode Selector */}
                    <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
                      <button
                        onClick={() => setTokenManagementMode("mint")}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                          tokenManagementMode === "mint"
                            ? "bg-white text-green-700 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        Mint Token
                      </button>
                      <button
                        onClick={() => setTokenManagementMode("burn")}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                          tokenManagementMode === "burn"
                            ? "bg-white text-red-700 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <Trash2 className="w-4 h-4 inline mr-1" />
                        Burn Token
                      </button>
                    </div>

                    {/* Mint Token Mode */}
                    {tokenManagementMode === "mint" && (
                      <div className="space-y-3">
                        <Label>Mint New Token</Label>
                        <Input
                          placeholder="Recipient address"
                          value={mintAddress}
                          onChange={(e) => setMintAddress(e.target.value)}
                        />
                        <div className="space-y-2">
                          <Label>Token Type</Label>
                          <Select value={selectedTokenType} onValueChange={setSelectedTokenType}>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                isLoading ? "Loading token types..." : 
                                tokenTypes.length === 0 ? "No token types available" : 
                                "Select token type"
                              } />
                            </SelectTrigger>
                            <SelectContent>
                              {tokenTypes.length === 0 ? (
                                <SelectItem value="loading" disabled>
                                  {isLoading ? "Loading token types..." : "No token types available"}
                                </SelectItem>
                              ) : (
                                tokenTypes
                                  .filter(tokenType => tokenType.isActive && tokenType.currentSupply < tokenType.maxSupply)
                                  .map(tokenType => (
                                    <SelectItem key={tokenType.typeId} value={tokenType.typeId}>
                                      {tokenType.name} ({tokenType.category}) - {tokenType.currentSupply}/{tokenType.maxSupply}
                                    </SelectItem>
                                  ))
                              )}
                            </SelectContent>
                          </Select>
                          {tokenTypes.length === 0 && !isLoading && (
                            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>No token types exist yet. Create your first token type below!</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setActiveTab("officer-tools")}
                                  className="text-xs h-6"
                                >
                                  Create Types
                                </Button>
                              </div>
                            </div>
                          )}
                          {tokenTypes.length > 0 && tokenTypes.filter(t => t.isActive && t.currentSupply < t.maxSupply).length === 0 && (
                            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                              <div className="flex items-center space-x-1">
                                <AlertCircle className="h-3 w-3" />
                                <span>No mintable token types available. All types may be at max supply or inactive.</span>
                              </div>
                            </div>
                          )}
                          {tokenTypes.length > 0 && tokenTypes.filter(t => t.isActive && t.currentSupply < t.maxSupply).length > 0 && (
                            <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded p-2">
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3" />
                                <span>
                                  Ready to mint: {tokenTypes.filter(t => t.isActive && t.currentSupply < t.maxSupply).length} token type(s) available.
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="soulbound"
                            checked={isSoulbound}
                            onChange={(e) => setIsSoulbound(e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor="soulbound" className="text-sm">Make soulbound (non-transferable)</Label>
                        </div>
                        <Button 
                          onClick={mintToken} 
                          disabled={!mintAddress || !selectedTokenType || tokenManagementStatus.loading}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {tokenManagementStatus.loading ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="mr-2 h-4 w-4" />
                          )}
                          Mint Token
                        </Button>

                        {/* Token Management Status */}
                        <StatusIndicator status={tokenManagementStatus} title="Token Minting" />
                      </div>
                    )}

                    {/* Burn Token Mode */}
                    {tokenManagementMode === "burn" && (
                      <div className="space-y-3">
                        <Label>Burn Token</Label>
                        <Input
                          placeholder="Token ID to burn"
                          value={burnTokenId}
                          onChange={(e) => setBurnTokenId(e.target.value)}
                          type="number"
                        />
                        <Button 
                          onClick={burnToken} 
                          disabled={burnLoading || !burnTokenId}
                          variant="destructive"
                          className="w-full"
                        >
                          {burnLoading ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Burn Token
                        </Button>
                        
                        {/* Status Bar */}
                        {(burnLoading || burnStatus) && (
                          <div className={`p-3 border rounded-md ${
                            burnStatus.includes('Error') || burnStatus.includes('failed') 
                              ? 'bg-red-50 border-red-200' 
                              : burnStatus.includes('successfully') 
                              ? 'bg-green-50 border-green-200'
                              : 'bg-blue-50 border-blue-200'
                          }`}>
                            <div className="flex items-center space-x-2">
                              {burnLoading ? (
                                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                              ) : burnStatus.includes('Error') || burnStatus.includes('failed') ? (
                                <XCircle className="h-4 w-4 text-red-600" />
                              ) : burnStatus.includes('successfully') ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : null}
                              <span className={`text-sm ${
                                burnStatus.includes('Error') || burnStatus.includes('failed')
                                  ? 'text-red-800'
                                  : burnStatus.includes('successfully')
                                  ? 'text-green-800'
                                  : 'text-blue-800'
                              }`}>
                                {burnStatus}
                              </span>
                            </div>
                            {(burnStatus.includes('Error') || burnStatus.includes('failed')) && (
                              <div className="mt-2 flex space-x-2">
                                <button 
                                  onClick={() => setBurnStatus("")}
                                  className="text-xs text-red-600 hover:text-red-800 underline"
                                >
                                  Clear status
                                </button>
                                {burnStatus.includes('Polygon Amoy is being moody') && (
                                  <button 
                                    onClick={burnToken}
                                    className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                                  >
                                    Try again (wait 60s first) ⏱️
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* How this works section */}
                    <div className="border-t pt-4">
                      <button
                        onClick={() => setShowOfficerTokenHelp(!showOfficerTokenHelp)}
                        className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" />
                          How this works
                        </div>
                        {showOfficerTokenHelp ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      
                      {showOfficerTokenHelp && (
                        <div className="mt-3 space-y-3 p-4 bg-gray-50 rounded-lg border">
                          <div className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                            Contract Functions Called
                          </div>
                          
                          <div className="space-y-2">
                            {tokenManagementMode === "mint" && (
                              <div className="flex items-start gap-3 p-2 bg-white rounded border">
                                <Plus className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="font-mono text-sm text-green-700">membershipContract.mintToken()</div>
                                  <div className="text-xs text-gray-600">Creates new membership token for specified address</div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Lock className="h-3 w-3 text-orange-500" />
                                    <span className="text-xs text-orange-600">Requires OFFICER_ROLE signature</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {tokenManagementMode === "burn" && (
                              <div className="flex items-start gap-3 p-2 bg-white rounded border border-red-200">
                                <Trash2 className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="font-mono text-sm text-red-700">membershipContract.burnToken()</div>
                                  <div className="text-xs text-gray-600">Permanently destroys an existing token</div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Lock className="h-3 w-3 text-orange-500" />
                                    <span className="text-xs text-orange-600">Requires OFFICER_ROLE signature</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-yellow-800">
                                <strong>Note:</strong> {tokenManagementMode === "mint" 
                                  ? "Minting may require recipient to be whitelisted depending on token type."
                                  : "Burning is irreversible and will permanently destroy the token."
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Whitelist Management */}
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Whitelist Management
                    </CardTitle>
                    <CardDescription>
                      Manage address whitelist for exclusive token minting privileges
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Check Whitelist Status */}
                    <div className="space-y-4">
                      <Label htmlFor="whitelist-address">Address to Check/Modify</Label>
                      <div className="space-y-3">
                        <Input
                          id="whitelist-address"
                          placeholder="Enter wallet address (0x...)"
                          value={targetAddress}
                          onChange={(e) => {
                            setTargetAddress(e.target.value)
                            setWhitelistStatus(null) // Reset status when address changes
                          }}
                        />
                        <Button 
                          onClick={checkWhitelistStatus} 
                          disabled={whitelistLoading || !targetAddress}
                          variant="outline"
                          className="w-full"
                        >
                          {whitelistLoading ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="mr-2 h-4 w-4" />
                          )}
                          Check Status
                        </Button>
                      </div>
                      
                      {whitelistStatus !== null && (
                        <div className={`p-4 rounded-lg border ${
                          whitelistStatus ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                        }`}>
                          <p className="text-sm font-medium flex items-center">
                            {whitelistStatus ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Address is whitelisted
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                Address is not whitelisted
                              </>
                            )}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {targetAddress.slice(0, 12)}...{targetAddress.slice(-10)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Add/Remove Buttons - Only show after status check */}
                    {whitelistStatus !== null && (
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={addToWhitelist} 
                          disabled={whitelistLoading || !targetAddress || whitelistStatus === true}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          {whitelistLoading ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="mr-2 h-4 w-4" />
                          )}
                          {whitelistStatus === true ? "Already Whitelisted" : "Add to Whitelist"}
                        </Button>
                        <Button 
                          onClick={removeFromWhitelist} 
                          disabled={whitelistLoading || !targetAddress || whitelistStatus === false}
                          variant="destructive"
                          className="disabled:opacity-50"
                        >
                          {whitelistLoading ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          {whitelistStatus === false ? "Not Whitelisted" : "Remove from Whitelist"}
                        </Button>
                      </div>
                    )}

                    {/* How this works section */}
                    <div className="border-t pt-4">
                      <button
                        onClick={() => setShowOfficerWhitelistHelp(!showOfficerWhitelistHelp)}
                        className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" />
                          How this works
                        </div>
                        {showOfficerWhitelistHelp ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      
                      {showOfficerWhitelistHelp && (
                        <div className="mt-3 space-y-3 p-4 bg-gray-50 rounded-lg border">
                          <div className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                            Contract Functions Called
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-start gap-3 p-2 bg-white rounded border">
                              <Search className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-mono text-sm text-blue-700">membershipContract.whitelist(address)</div>
                                <div className="text-xs text-gray-600">Checks if an address is whitelisted (read-only)</div>
                                <div className="text-xs text-green-600 mt-1">No signature required</div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3 p-2 bg-white rounded border">
                              <UserPlus className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-mono text-sm text-green-700">membershipContract.updateWhitelist()</div>
                                <div className="text-xs text-gray-600">Adds or removes addresses from whitelist</div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Lock className="h-3 w-3 text-orange-500" />
                                  <span className="text-xs text-orange-600">Requires OFFICER_ROLE signature</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Row - Create Token Type (Full Width) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Token Type
                  </CardTitle>
                  <CardDescription>
                    Define new membership token categories with custom properties and minting rules
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Token Type ID and Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Token Type ID</Label>
                      <Input
                        placeholder="e.g., FOUNDER_SERIES"
                        value={newTokenType.typeId}
                        onChange={(e) => setNewTokenType({...newTokenType, typeId: e.target.value.toUpperCase()})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input
                        placeholder="e.g., Founder Series"
                        value={newTokenType.name}
                        onChange={(e) => setNewTokenType({...newTokenType, name: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Category and Supply */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      {/* Toggle between preset and custom */}
                      <div className="flex items-center space-x-4 mb-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="categoryType"
                            checked={!isCustomCategory}
                            onChange={() => {
                              setIsCustomCategory(false)
                              setNewTokenType({...newTokenType, category: ""})
                            }}
                            className="form-radio text-blue-600"
                          />
                          <span className="text-sm">Preset</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="categoryType"
                            checked={isCustomCategory}
                            onChange={() => {
                              setIsCustomCategory(true)
                              setNewTokenType({...newTokenType, category: ""})
                            }}
                            className="form-radio text-green-600"
                          />
                          <span className="text-sm">Custom</span>
                        </label>
                      </div>

                      {/* Category selection */}
                      {!isCustomCategory ? (
                        <Select 
                          value={newTokenType.category} 
                          onValueChange={(value) => setNewTokenType({...newTokenType, category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select preset category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Leadership">
                              <div className="flex items-center">
                                <Crown className="mr-2 h-4 w-4 text-blue-600" />
                                Leadership
                              </div>
                            </SelectItem>
                            <SelectItem value="Membership">
                              <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4 text-green-600" />
                                Membership
                              </div>
                            </SelectItem>
                            <SelectItem value="Event">
                              <div className="flex items-center">
                                <Star className="mr-2 h-4 w-4 text-yellow-600" />
                                Event
                              </div>
                            </SelectItem>
                            <SelectItem value="Achievement">
                              <div className="flex items-center">
                                <Award className="mr-2 h-4 w-4 text-purple-600" />
                                Achievement
                              </div>
                            </SelectItem>
                            <SelectItem value="Special">
                              <div className="flex items-center">
                                <Settings className="mr-2 h-4 w-4 text-red-600" />
                                Special
                              </div>
                            </SelectItem>
                            <SelectItem value="Trading">
                              <div className="flex items-center">
                                <BarChart3 className="mr-2 h-4 w-4 text-orange-600" />
                                Trading
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder="Enter custom category name"
                          value={newTokenType.category}
                          onChange={(e) => setNewTokenType({...newTokenType, category: e.target.value})}
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Supply</Label>
                      <Input
                        placeholder="e.g., 100 (0 = unlimited)"
                        type="number"
                        value={newTokenType.maxSupply}
                        onChange={(e) => setNewTokenType({...newTokenType, maxSupply: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Time Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time (Optional)</Label>
                      <Input
                        type="datetime-local"
                        value={newTokenType.startTime}
                        onChange={(e) => setNewTokenType({...newTokenType, startTime: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time (Optional)</Label>
                      <Input
                        type="datetime-local"
                        value={newTokenType.endTime}
                        onChange={(e) => setNewTokenType({...newTokenType, endTime: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Mint Access */}
                  <div className="space-y-2">
                    <Label>Minting Access</Label>
                    <Select 
                      value={newTokenType.mintAccess} 
                      onValueChange={(value: "OFFICER_ONLY" | "WHITELIST_ONLY" | "PUBLIC") => 
                        setNewTokenType({...newTokenType, mintAccess: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OFFICER_ONLY">
                          <div className="flex items-center">
                            <Crown className="mr-2 h-4 w-4 text-blue-600" />
                            Officer Only - Only officers can mint
                          </div>
                        </SelectItem>
                        <SelectItem value="WHITELIST_ONLY">
                          <div className="flex items-center">
                            <Shield className="mr-2 h-4 w-4 text-green-600" />
                            Whitelist Only - Whitelisted addresses can mint
                          </div>
                        </SelectItem>
                        <SelectItem value="PUBLIC">
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-purple-600" />
                            Public - Anyone can mint
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Create Button */}
                  <Button 
                    onClick={async () => {
                      if (!membershipContract || !newTokenType.typeId || !newTokenType.name || !newTokenType.category) {
                        setCreateTokenTypeStatus({
                          loading: false,
                          message: "Please fill in Type ID, Name, and Category",
                          type: "error"
                        })
                        toast({
                          title: "Missing Information",
                          description: "Please fill in Type ID, Name, and Category",
                          variant: "destructive"
                        })
                        return
                      }

                      setCreateTokenTypeStatus({
                        loading: true,
                        message: "Preparing token type creation...",
                        type: "loading"
                      })
                      setCreateTokenTypeLoading(true)
                      
                      try {
                        setCreateTokenTypeStatus({
                          loading: true,
                          message: "Converting parameters to blockchain format...",
                          type: "loading"
                        })

                        const typeIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(newTokenType.typeId))
                        const startTimeUnix = newTokenType.startTime ? Math.floor(new Date(newTokenType.startTime).getTime() / 1000) : 0
                        const endTimeUnix = newTokenType.endTime ? Math.floor(new Date(newTokenType.endTime).getTime() / 1000) : 0
                        const maxSupply = newTokenType.maxSupply ? parseInt(newTokenType.maxSupply) : 0
                        
                        // Convert mintAccess to enum value (0, 1, 2)
                        const mintAccessEnum = newTokenType.mintAccess === "OFFICER_ONLY" ? 0 : 
                                             newTokenType.mintAccess === "WHITELIST_ONLY" ? 1 : 2

                        setCreateTokenTypeStatus({
                          loading: true,
                          message: "Submitting transaction to blockchain...",
                          type: "loading"
                        })

                        const tx = await membershipContract.createTokenType(
                          typeIdBytes32,
                          newTokenType.name,
                          newTokenType.category,
                          startTimeUnix,
                          endTimeUnix,
                          maxSupply,
                          mintAccessEnum
                        )

                        setCreateTokenTypeStatus({
                          loading: true,
                          message: "Transaction submitted! Waiting for confirmation...",
                          type: "loading",
                          txHash: tx.hash
                        })

                        await tx.wait()

                        setCreateTokenTypeStatus({
                          loading: false,
                          message: `Token type "${newTokenType.name}" created successfully!`,
                          type: "success",
                          txHash: tx.hash
                        })

                        toast({
                          title: "Token Type Created",
                          description: `${newTokenType.name} token type created successfully`,
                        })

                        // Reset form
                        setNewTokenType({
                          typeId: "",
                          name: "",
                          category: "",
                          startTime: "",
                          endTime: "",
                          maxSupply: "",
                          mintAccess: "OFFICER_ONLY"
                        })
                        setIsCustomCategory(false)

                        await loadContractData()

                        // Clear status after 5 seconds
                        setTimeout(() => {
                          setCreateTokenTypeStatus({ loading: false, message: "", type: "idle" })
                        }, 5000)

                      } catch (error: any) {
                        console.error("Error creating token type:", error)
                        
                        setCreateTokenTypeStatus({
                          loading: false,
                          message: `Failed to create token type: ${error.message || "Transaction failed"}`,
                          type: "error"
                        })

                        toast({
                          title: "Failed to Create Token Type",
                          description: error.message || "Transaction failed",
                          variant: "destructive"
                        })
                      }
                      setCreateTokenTypeLoading(false)
                    }}
                    disabled={createTokenTypeLoading || !newTokenType.typeId || !newTokenType.name || !newTokenType.category || createTokenTypeStatus.loading}
                    className="w-full"
                  >
                    {(createTokenTypeLoading || createTokenTypeStatus.loading) ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Create Token Type
                  </Button>

                  {/* Create Token Type Status */}
                  <StatusIndicator status={createTokenTypeStatus} title="Token Type Creation" />

                  {/* How this works section */}
                  <div className="border-t pt-4">
                    <button
                      onClick={() => setShowCreateTokenTypeHelp(!showCreateTokenTypeHelp)}
                      className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        How this works
                      </div>
                      {showCreateTokenTypeHelp ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    
                    {showCreateTokenTypeHelp && (
                      <div className="mt-3 space-y-3 p-4 bg-gray-50 rounded-lg border">
                        <div className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                          Contract Function Called
                        </div>
                        
                        <div className="flex items-start gap-3 p-2 bg-white rounded border">
                          <Code className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-mono text-sm text-green-700">membershipContract.createTokenType()</div>
                            <div className="text-xs text-gray-600">Creates a new token category with specified rules and properties</div>
                            <div className="flex items-center gap-1 mt-1">
                              <Lock className="h-3 w-3 text-orange-500" />
                              <span className="text-xs text-orange-600">Requires OFFICER_ROLE signature</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-blue-800">
                              <strong>Parameters:</strong> Type ID (unique identifier), Name, Category, Start/End times, Max Supply, and Mint Access level determine who can mint these tokens.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
        )}

        {/* Wallet Tokens Modal */}
        <Dialog open={showTokensModal} onOpenChange={setShowTokensModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                Wallet Tokens
              </DialogTitle>
              <DialogDescription>
                {selectedWallet && (
                  <span>
                    Viewing tokens owned by{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {selectedWallet.address.slice(0, 8)}...{selectedWallet.address.slice(-6)}
                    </code>
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            
            {selectedWallet && (
              <div className="space-y-4">
                {/* Wallet Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Tokens</p>
                      <p className="text-2xl font-bold">{selectedWallet.tokenCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Voting Power</p>
                      <p className="text-2xl font-bold">
                        {selectedWallet.customVotingPower || selectedWallet.votingPower}
                        {selectedWallet.customVotingPower && (
                          <span className="text-sm text-amber-600 ml-2">(Custom)</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="flex items-center">
                        {selectedWallet.isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="mr-1 h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Whitelist</p>
                      <div className="flex items-center">
                        {selectedWalletWhitelistStatus === null ? (
                          <Badge className="bg-gray-100 text-gray-600">
                            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                            Checking...
                          </Badge>
                        ) : selectedWalletWhitelistStatus ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Whitelisted
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="mr-1 h-3 w-3" />
                            Not Whitelisted
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Joined</p>
                      <p className="text-sm font-medium">{formatDate(selectedWallet.joinDate)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Roles</p>
                    {getAllRoleBadges(selectedWallet.roles)}
                  </div>
                </div>

                {/* Token Collection */}
                <div>
                  <h4 className="font-medium mb-3">Token Collection ({selectedWallet.tokenIds.length})</h4>
                  <div className="max-h-80 overflow-y-auto">
                    {walletTokensLoading ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {Array(6).fill(0).map((_, i) => (
                          <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-32"></div>
                        ))}
                      </div>
                    ) : walletTokens.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No tokens found</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {walletTokens.map((token) => (
                          <div
                            key={token.id}
                            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
                          >
                            <div className="relative">
                              <img
                                src={getTokenImage(token)}
                                alt={token.name}
                                className="w-full h-24 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg"
                                }}
                              />
                              <div className="absolute top-2 right-2">
                                <Badge variant="secondary" className="text-xs">
                                  #{token.tokenId}
                                </Badge>
                              </div>
                            </div>
                            <div className="p-2">
                              <h5 className="font-medium text-sm text-gray-900 truncate">
                                {token.name}
                              </h5>
                              {token.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {token.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedWallet.address)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Address
                  </Button>
                  
                  <div className="flex space-x-2">
                    {/* Whitelist Quick Actions */}
                    {selectedWalletWhitelistStatus !== null && (
                      <>
                        {selectedWalletWhitelistStatus ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={async () => {
                              if (!membershipContract || !selectedWallet) return
                              setWhitelistLoading(true)
                              try {
                                const tx = await membershipContract.updateWhitelist(selectedWallet.address, false)
                                await tx.wait()
                                setSelectedWalletWhitelistStatus(false)
                                toast({
                                  title: "Removed from Whitelist",
                                  description: `${selectedWallet.address.slice(0, 8)}...${selectedWallet.address.slice(-6)} has been removed from whitelist`
                                })
                                await loadContractData()
                              } catch (error: any) {
                                toast({
                                  title: "Failed to Remove from Whitelist",
                                  description: error.message || "Transaction failed",
                                  variant: "destructive"
                                })
                              }
                              setWhitelistLoading(false)
                            }}
                            disabled={whitelistLoading}
                          >
                            {whitelistLoading ? (
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="mr-2 h-4 w-4" />
                            )}
                            Remove Whitelist
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={async () => {
                              if (!membershipContract || !selectedWallet) return
                              setWhitelistLoading(true)
                              try {
                                const tx = await membershipContract.updateWhitelist(selectedWallet.address, true)
                                await tx.wait()
                                setSelectedWalletWhitelistStatus(true)
                                toast({
                                  title: "Added to Whitelist",
                                  description: `${selectedWallet.address.slice(0, 8)}...${selectedWallet.address.slice(-6)} has been added to whitelist`
                                })
                                await loadContractData()
                              } catch (error: any) {
                                toast({
                                  title: "Failed to Add to Whitelist",
                                  description: error.message || "Transaction failed",
                                  variant: "destructive"
                                })
                              }
                              setWhitelistLoading(false)
                            }}
                            disabled={whitelistLoading}
                          >
                            {whitelistLoading ? (
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <UserPlus className="mr-2 h-4 w-4" />
                            )}
                            Add to Whitelist
                          </Button>
                        )}
                      </>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedWallet) {
                          setMintAddress(selectedWallet.address)
                          setShowTokensModal(false)
                          setActiveTab("officer-tools")
                        }
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Mint Token
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
      </div>
    </div>
  )
}