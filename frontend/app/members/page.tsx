"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Vote, Shield, ExternalLink, Wallet, BarChart3, History, Users, Crown, Award, TrendingUp, Eye, RefreshCw } from "lucide-react"
import { useAccount, useConfig } from "wagmi";
import { contracts } from "../../lib/contracts";
import { useContractRead } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { readContract } from 'wagmi/actions';
import { useMyTokens, Token } from "@/hooks/use-mytokens";
import { useVotingPower } from "@/hooks/use-voting-power";
import OwnedNFTModal from "@/components/owned-nft-modal";
import { InlineLoadingSkeleton, TokenCardSkeleton, SectionLoadingSkeleton, PageLoadingSkeleton } from "@/components/ui/loading-skeleton"
import { ethers } from "ethers"

// Extend window object for ethereum
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any
  }
}

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "80002";
const CONTRACT_NAME = "membership";
const CONTRACT_ABI = contracts[CONTRACT_NAME].abi;
const CONTRACT_ADDRESS = contracts[CONTRACT_NAME].address;

// Mock voting history
const mockVotingHistory = [
  {
    id: "vote-001",
    proposal: "PROP-001",
    proposalTitle: "Fund Blockchain Development Workshop Series",
    vote: "for",
    votingPower: 1,
    timestamp: "2023-05-07T15:30:00Z",
  },
  {
    id: "vote-002",
    proposal: "PROP-003",
    proposalTitle: "Update Club Constitution",
    vote: "for",
    votingPower: 1,
    timestamp: "2023-05-02T10:15:00Z",
  },
  {
    id: "vote-003",
    proposal: "PROP-004",
    proposalTitle: "Organize Blockchain Hackathon",
    vote: "against",
    votingPower: 1,
    timestamp: "2023-04-29T14:45:00Z",
  },
]

export default function MembersPage() {
  const { address, isConnected } = useAccount();
  const config = useConfig();
  const [votingHistory, setVotingHistory] = useState(mockVotingHistory)
  const [activeTab, setActiveTab] = useState("tokens")
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [mounted, setMounted] = useState(false); // NEW: track client mount
  const [selectedModalToken, setSelectedModalToken] = useState<Token | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Role-based access control
  const [isMember, setIsMember] = useState(false)
  const [isCheckingRole, setIsCheckingRole] = useState(true)
  
  // Community stats state
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    totalAdmins: 0,
    totalOfficers: 0,
    totalSupply: 0,
    totalVotingPower: 0
  });
  const [communityLoading, setCommunityLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load community stats when component mounts
    if (mounted) {
      loadCommunityStats();
    }
    // Check member role when wallet is connected
    if (mounted && isConnected && address) {
      checkMemberRole();
    }
  }, [mounted, isConnected, address]);

  // Function to check if user has MEMBER_ROLE
  const checkMemberRole = async () => {
    if (!address || !window.ethereum) {
      setIsMember(false);
      setIsCheckingRole(false);
      return;
    }

    try {
      setIsCheckingRole(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      const rolesContractInstance = new ethers.Contract(
        contracts.roles.address,
        contracts.roles.abi,
        signer
      );
      
      // Check if user has MEMBER_ROLE
      const memberRoleHash = ethers.keccak256(ethers.toUtf8Bytes("MEMBER_ROLE"));
      const hasMemberRole = await rolesContractInstance.hasRole(memberRoleHash, userAddress);
      
      // Check if user has OFFICER_ROLE (officers are also members)
      const officerRoleHash = ethers.keccak256(ethers.toUtf8Bytes("OFFICER_ROLE"));
      const hasOfficerRole = await rolesContractInstance.hasRole(officerRoleHash, userAddress);
      
      // Check if user has ADMIN_ROLE (admins are also members)
      const adminRoleHash = ethers.ZeroHash; // DEFAULT_ADMIN_ROLE is bytes32(0)
      const hasAdminRole = await rolesContractInstance.hasRole(adminRoleHash, userAddress);
      
      setIsMember(hasMemberRole || hasOfficerRole || hasAdminRole); // Allow members, officers, and admins
    } catch (error) {
      console.error("Failed to check member role:", error);
      setIsMember(false);
    } finally {
      setIsCheckingRole(false);
    }
  };

  // Function to load community statistics
  const loadCommunityStats = async () => {
    if (communityLoading) return;
    setCommunityLoading(true);
    
    try {
      // Get total supply from membership contract
      const totalSupply = await readContract(config, {
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "totalSupply",
        args: [],
      });

      // Get role counts from Roles contract
      const rolesContract = contracts["roles"];
      
      // Generate role hashes dynamically (same method as officers page)
      const adminRoleHash = ethers.ZeroHash; // DEFAULT_ADMIN_ROLE is bytes32(0)
      const officerRoleHash = ethers.keccak256(ethers.toUtf8Bytes("OFFICER_ROLE"));
      const memberRoleHash = ethers.keccak256(ethers.toUtf8Bytes("MEMBER_ROLE"));

      const [adminCount, officerCount, memberCount] = await Promise.all([
        readContract(config, {
          address: rolesContract.address,
          abi: rolesContract.abi,
          functionName: "getRoleMemberCount",
          args: [adminRoleHash],
        }),
        readContract(config, {
          address: rolesContract.address,
          abi: rolesContract.abi,
          functionName: "getRoleMemberCount",
          args: [officerRoleHash],
        }),
        readContract(config, {
          address: rolesContract.address,
          abi: rolesContract.abi,
          functionName: "getRoleMemberCount",
          args: [memberRoleHash],
        }),
      ]);

      // Calculate total voting power (this is an approximation)
      const totalVotingPower = Number(adminCount) * 5 + Number(officerCount) * 3 + Number(memberCount) * 1;

      setCommunityStats({
        totalMembers: Number(memberCount),
        totalAdmins: Number(adminCount),
        totalOfficers: Number(officerCount),
        totalSupply: Number(totalSupply),
        totalVotingPower: totalVotingPower
      });

    } catch (error) {
      console.error("Error loading community stats:", error);
    } finally {
      setCommunityLoading(false);
    }
  };

  // Fetch balanceOf using wagmi - only when connected
  const { data: balance, isLoading: isBalanceLoading, error: balanceError } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address, // Only execute when wallet is connected
    },
  });

  const { tokens, isLoading, error } = useMyTokens(address);
  const { votingPower, isLoading: isVotingPowerLoading } = useVotingPower(address);

  // Only show full loading on initial mount before wallet connection status is determined
  const showFullLoading = !mounted || (isConnected && isCheckingRole)

  // Show full page loading for consistent experience
  if (showFullLoading) {
    return (
      <PageLoadingSkeleton 
        title="My Membership" 
        showStats={true}
        showContent={true}
        showBanner={true}
        bannerGradient="from-blue-600 via-purple-600 to-indigo-600"
        bannerIcon={Vote}
        bannerBadgeText="Member Dashboard"
        className="bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50"
      />
    )
  }

  const handleDisplayTokenChange = (value: string) => {
    // This function is no longer needed but keeping for compatibility
  }

  const handleTokenClick = (token: Token) => {
    setSelectedModalToken(token);
    setIsModalOpen(true);
  }

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedModalToken(null);
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTotalVotingPower = () => {
    // Return the actual voting power from the Roles contract, not sum of token powers
    return votingPower;
  }

  const getMembershipLevel = () => {
    if (votingPower >= 5) return { level: "Officer", color: "bg-purple-100 text-purple-800", icon: "⭐" };
    if (votingPower >= 1) return { level: "Member", color: "bg-blue-100 text-blue-800", icon: "🏛️" };
    return { level: "Guest", color: "bg-gray-100 text-gray-800", icon: "👤" };
  }

  const getVoteColor = (vote: string) => {
    switch (vote) {
      case "for":
        return "bg-green-100 text-green-800"
      case "against":
        return "bg-red-100 text-red-800"
      case "abstain":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Utility function to get token image - prefer IPFS metadata image over hardcoded paths
  function getTokenImage(token: any): string {
    // First check if we have an IPFS imageUri from the contract metadata
    if (token.imageUri && token.imageUri.trim() !== "") {
      // Convert IPFS URI to HTTPS gateway if needed
      if (token.imageUri.startsWith("ipfs://")) {
        return token.imageUri.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      return token.imageUri;
    }
    
    // Fallback to hardcoded images based on token name (for backwards compatibility)
    // Governance Track
    if (token.name === "Member Token") return "/trader.png"; // or rotate: /initiation.png, /trader_chill.png, /letsgetthispartystarted2k25.png, /future.png
    if (token.name === "Supporter Token") return "/abstract-gold-token-officer.png";
    if (token.name === "Gold Star Award") return "/gold_star.png";
    if (token.name === "Officer Token") return "/officer.png";
    if (token.name === "Observer Token") return "/mint_and_slurp.png"; // or /quad.png
    // Culture/Experience Track
    if (token.name === "Alumni Token") return "/the_graduate.png";
    if (token.name === "Scholarship Token") return "/rhodes_scholar.png";
    if (token.name === "Replacement Token") return "/the_fool.png";
    if (token.name === "Founder Series Token") return "/hist_glitch.png";
    if (token.name === "Secret Sauce Token") return "/secret_sauce.png";
    if (token.name === "Loyalty Token") return "/longrun.png";
    if (token.name === "Art Drop Token") return "/digi_art.png";
    return "/placeholder.svg";
  }

  return (
    <div className="flex flex-col">
      {/* Enhanced Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 py-20 md:py-28">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-36 h-36 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Floating Badge */}
            <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur-sm border border-white/30">
              <Users className="mr-2 h-4 w-4" />
              Community Dashboard
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              🏛️ My Membership
            </h1>
            
            <p className="mb-8 text-xl text-blue-100 leading-relaxed">
              Your blockchain governance dashboard. View your NFT membership tokens, role-based voting power, and governance participation history.

            </p>
          </div>
        </div>
      </section>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      
      <div className="container mx-auto px-4 py-12">

      {/* Conditional content based on connection and officer status */}
      {!mounted ? (
        // Initial loading state
        <div className="mx-auto max-w-md text-center">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Loading...</CardTitle>
              <CardDescription className="text-gray-600">
                Please wait while we load your membership details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : !isConnected ? (
        // Not connected - show connect wallet prompt
        <div className="mx-auto max-w-md text-center">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Connect Your Wallet</CardTitle>
              <CardDescription className="text-gray-600">
                Connect your wallet to access member features and view your membership tokens.
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
      ) : !isMember ? (
        // Access denied - not a member
        <div className="mx-auto max-w-md text-center">
          <Card className="border-amber-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">Member Access Required</CardTitle>
              <CardDescription className="text-amber-700">
                This page is restricted to blockchain club members only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 mb-3">
                  You need to have the MEMBER_ROLE to access this page.
                </p>
                <p className="text-xs text-amber-700">
                  If you believe you should have access, please contact a club officer to grant you the required permissions.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                onClick={() => window.location.href = "/gallery"}
                className="w-full bg-[#CFB87C] hover:bg-[#B8A569] text-black font-semibold"
              >
                <Award className="mr-2 h-4 w-4" />
                Mint Membership Token
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/"}
                className="w-full"
              >
                Return to Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : wrongNetwork ? (
        // Wrong network
        <div className="mx-auto max-w-md text-center">
          <Card className="border-red-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-900">Wrong Network</CardTitle>
              <CardDescription className="text-red-600">
                Please connect your wallet to the Polygon Amoy testnet (chainId 80002) to view your membership tokens.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        // Connected and ready - show main content
        <div>
          {/* Community Overview Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Community Overview</h2>
                <p className="text-gray-600">Explore our blockchain community's growth and engagement</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
                onClick={loadCommunityStats}
                disabled={communityLoading}
              >
                <RefreshCw className={`h-4 w-4 ${communityLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>

            {/* Community Stats Grid */}
            <div className="grid gap-6 md:grid-cols-4 mb-6">
              <Card className="border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-2">
                    <Users className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm font-medium text-gray-700">Total Members</CardTitle>
                </CardHeader>
                <CardContent>
                  {communityLoading ? (
                    <InlineLoadingSkeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-gray-900">{communityStats.totalMembers}</div>
                  )}
                  <p className="text-xs text-gray-500">Active community members</p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-2">
                    <Award className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm font-medium text-gray-700">Officers</CardTitle>
                </CardHeader>
                <CardContent>
                  {communityLoading ? (
                    <InlineLoadingSkeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-gray-900">{communityStats.totalOfficers}</div>
                  )}
                  <p className="text-xs text-gray-500">Active club officers</p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 mb-2">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm font-medium text-gray-700">NFTs Minted</CardTitle>
                </CardHeader>
                <CardContent>
                  {communityLoading ? (
                    <InlineLoadingSkeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-gray-900">{communityStats.totalSupply}</div>
                  )}
                  <p className="text-xs text-gray-500">Total tokens created</p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-2">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm font-medium text-gray-700">Voting Power</CardTitle>
                </CardHeader>
                <CardContent>
                  {communityLoading ? (
                    <InlineLoadingSkeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-gray-900">{communityStats.totalVotingPower}</div>
                  )}
                  <p className="text-xs text-gray-500">Total community votes</p>
                </CardContent>
              </Card>
            </div>

            {/* Community Insights */}
            <div className="grid gap-6 md:grid-cols-2 items-start">
              <Card className="border-gray-200 bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 mr-3">
                      <History className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900">Voting History</CardTitle>
                      <CardDescription className="text-gray-600">
                        Your past votes and governance participation
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array(2)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="rounded-md border border-gray-200 p-3">
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-3 w-3/4" />
                          </div>
                        ))}
                    </div>
                  ) : votingHistory.length > 0 ? (
                    <div className="space-y-3">
                      {votingHistory.slice(0, 2).map((vote: any) => (
                        <div key={vote.id} className="rounded-md border border-gray-200 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-gray-50 text-gray-700 text-xs">
                                {vote.proposal}
                              </Badge>
                              <Badge className={`text-xs ${getVoteColor(vote.vote)}`}>
                                {vote.vote.charAt(0).toUpperCase() + vote.vote.slice(1)}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(vote.timestamp)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-900 font-medium">{vote.proposalTitle}</p>
                          <div className="mt-1 text-xs text-gray-600">Voting power: {vote.votingPower}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center">
                      <p className="text-sm text-gray-600">No votes yet.</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Your voting history will appear here.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-gray-100 bg-gray-50 pt-3">
                  <Button 
                    variant="outline" 
                    className="w-full text-gray-900 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => window.open("https://snapshot.box/#/explore", "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> View All Activity on Snapshot
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-gray-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
                    Community Activity
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    See how our community is growing and engaging
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Member Engagement</span>
                        <span className="font-medium">High</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Token Distribution</span>
                        <span className="font-medium">Growing</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full w-3/5"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Governance Participation</span>
                        <span className="font-medium">Active</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-gray-100 bg-gray-50 pt-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = "/governance"}
                  >
                    <Vote className="mr-2 h-4 w-4" />
                    View Governance
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* My Tokens Section */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My Tokens</h2>
              <p className="text-gray-600">View and manage your membership NFT collection</p>
            </div>

            {isLoading ? (
              <TokenCardSkeleton count={6} />
            ) : tokens.length > 0 ? (
              <Card className="border-gray-200 bg-white shadow-sm">
                <CardContent className="pt-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence>
                          {tokens.map((token: any) => (
                            <motion.div
                              key={token.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Card
                                className="border-gray-200 bg-white shadow-sm overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:border-blue-300"
                                onClick={() => handleTokenClick(token)}
                              >
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-gray-900">{token.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="overflow-hidden rounded-md relative group">
                                    <img
                                      src={getTokenImage(token)}
                                      alt={token.name}
                                      className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                      <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        Click to view details
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Token ID:</span>
                                      <span className="font-medium text-gray-900">{token.id}</span>
                                    </div>
                                    {token.expires && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Expires:</span>
                                        <span className="font-medium text-gray-900">{formatDate(token.expires)}</span>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-gray-100 bg-gray-50 pt-3 flex justify-between">
                      <Button
                        className="border-gray-200 text-gray-700"
                        onClick={() => {
                          window.open(`https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}`, "_blank");
                        }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" /> View on Polygonscan
                      </Button>
                      <Button 
                        onClick={() => window.location.href = "/gallery"}
                        className="bg-[#CFB87C] hover:bg-[#B8A569] text-black font-semibold"
                      >
                        <Wallet className="mr-2 h-4 w-4" /> Manage Tokens
                      </Button>
                    </CardFooter>
                  </Card>
              ) : (
                <div className="text-center">
                  <p className="mb-4 text-gray-600">{error ? `Error: ${error.message}` : "You don't own any tokens yet."}</p>
                  <Button 
                    onClick={() => window.location.href = "/gallery"} 
                    className="bg-[#CFB87C] hover:bg-[#B8A569] text-black font-semibold"
                  >
                    Mint Your First Token
                  </Button>
                </div>
              )}
          </div>
        </div>
      )}
      
      {/* Owned NFT Display Modal */}
      {selectedModalToken && (
        <OwnedNFTModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          token={selectedModalToken}
        />
      )}
      </div>
      </div>
    </div>
  );
}

// TODO: Replace mockVotingHistory with real vote data
// TODO: Add logic to calculate total voting power (already implemented)
// TODO: Add buttons to burn, reissue, or request help for tokens
// TODO: Add comparison chart vs. other members (percentile)
// TODO: Add tooltips for badges and actions