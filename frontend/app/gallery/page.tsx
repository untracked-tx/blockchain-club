"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, Award, GraduationCap, Star, Clock, Palette, Key, BookOpen, Sparkles } from "lucide-react"
import NFTDetailModal from "@/components/nft-detail-modal"
import { useWriteContract } from "wagmi";
// Use the central contracts object for contract address/ABI
import { contracts } from "@/lib/contracts";
import { parseEther, stringToBytes, fromHex, pad, toHex } from "viem";
import { polygon } from "wagmi/chains";
import Image from "next/image"
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
// Import the useMyTokens hook
import { useMyTokens } from "@/hooks/use-mytokens";
import { useAccount } from "wagmi";

// Token type configurations based on the new structure
const tokenTypeConfigs = {
  // Governance Tokens
  MEMBER: {
    roleGranted: "MEMBER_ROLE",
    expires: "1 year",
    maxSupply: 10,
    mintAccess: "WHITELIST_ONLY",
    cost: "0.01 ETH",
    soulbound: true,
    category: "governance"
  },
  OFFICER: {
    roleGranted: "OFFICER_ROLE", 
    expires: "1 year",
    maxSupply: 2,
    mintAccess: "OFFICER_ONLY",
    cost: "Free",
    soulbound: true,
    category: "governance"
  },
  // Supporter Tokens
  SUPPORTER: {
    roleGranted: "None",
    expires: "Never",
    maxSupply: "Unlimited",
    mintAccess: "PUBLIC",
    cost: "Optional",
    soulbound: false,
    category: "culture"
  },
  // POAP Tokens
  POAP: {
    roleGranted: "None",
    expires: "N/A",
    maxSupply: "Limited",
    mintAccess: "OFFICER_ONLY",
    cost: "Free",
    soulbound: true,
    category: "culture"
  },
  // Awards & Recognition
  AWARD: {
    roleGranted: "None",
    expires: "N/A", 
    maxSupply: "Limited",
    mintAccess: "OFFICER_ONLY",
    cost: "Free",
    soulbound: true,
    category: "culture"
  },
  // Replacement
  REPLACEMENT: {
    roleGranted: "None",
    expires: "N/A",
    maxSupply: "Limited", 
    mintAccess: "OFFICER_ONLY",
    cost: "Free",
    soulbound: false,
    category: "utility"
  }
};

// Updated NFT data structure based on new token types
const nftData = {
  governance: [
    {
      tokenType: "MEMBER",
      name: "Member Tokens",
      description: "Full membership with voting rights and governance participation",
      tokens: [
        {
          id: "trader",
          name: "Trader",
          description: "Full digital asset trading membership with voting rights",
          imageUri: "/tradercard.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/trader",
          tokenType: "MEMBER"
        },
        {
          id: "trader_chill",
          name: "Trader Chill", 
          description: "Full custom membership with voting rights",
          imageUri: "/trader_chill.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/trader_chill",
          tokenType: "MEMBER"
        },
        {
          id: "letsgetthispartystarted2k25",
          name: "Let's Get This Party Started",
          description: "Standard 2025 membership with voting rights", 
          imageUri: "letsgetthispartystarted2k25.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/letsgetthispartystarted2k25",
          tokenType: "MEMBER"
        },
        {
          id: "future",
          name: "Custom membership",
          description: "Full custom membership with voting rights",
          imageUri: "/custom.png", 
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/future",
          tokenType: "MEMBER"
        },
      ],
    },
    {
      tokenType: "OFFICER",
      name: "Officer Tokens",
      description: "Leadership positions with administrative privileges and enhanced governance power",
      tokens: [
        {
          id: "pres",
          name: "President",
          description: "Club leadership with maximum voting power",
          imageUri: "/pres.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/pres",
          tokenType: "OFFICER"
        },
        {
          id: "vice_president",
          name: "Vice President",
          description: "Assists the President in club leadership and decision-making.",
          imageUri: "/vp.png",
          ipfsMetadata: "ipfs://placeholder/vice_president",
          tokenType: "OFFICER"
        },
        {
          id: "cfo",
          name: "CFO",
          description: "Financial officer with treasury access",
          imageUri: "/cfo.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/cfo",
          tokenType: "OFFICER"
        },
        {
          id: "treasurer",
          name: "Treasurer",
          description: "Manages the club's financial records and treasury.",
          imageUri: "/tres.png",
          ipfsMetadata: "ipfs://placeholder/treasurer",
          tokenType: "OFFICER"
        },
        {
          id: "major_key_alert",
          name: "Major Key Alert",
          description: "Key-holder with administrative access",
          imageUri: "/major_key_alert.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/major_key_alert",
          tokenType: "OFFICER"
        },
        {
          id: "officer",
          name: "Officer",
          description: "Administrative privileges and enhanced voting power",
          imageUri: "/officer.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/officer",
          tokenType: "OFFICER"
        },
      ],
    },
  ],
  culture: [
    {
      tokenType: "POAP",
      name: "POAP / Event Tokens",
      description: "Proof of attendance tokens for special events and workshops",
      tokens: [
        {
          id: "mint_and_slurp",
          name: "Mint & Slurp",
          description: "Attended a blockchain workshop",
          imageUri: "/mint_and_slurp.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/mint_and_slurp",
          tokenType: "POAP"
        },
        {
          id: "quad",
          name: "Quad",
          description: "Attended a speaker event",
          imageUri: "/quad.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/quad",
          tokenType: "POAP"
        },
        {
          id: "secret_sauce",
          name: "Secret Sauce",
          description: "Earned from completing internal club course",
          imageUri: "/secret_sauce.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/secret_sauce",
          tokenType: "POAP"
        },
      ],
    },
    {
      tokenType: "SUPPORTER",
      name: "Supporter Tokens",
      description: "Support the club through donations and contributions",
      tokens: [
        {
          id: "the_graduate",
          name: "The Graduate",
          description: "For graduating or inactive members",
          imageUri: "/the_graduate.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/the_graduate",
          tokenType: "SUPPORTER"
        },
        {
          id: "digi_art",
          name: "Digital Art",
          description: "Collectible + cultural fundraiser piece",
          imageUri: "/digi_art.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/digi_art",
          tokenType: "SUPPORTER"
        },
      ],
    },
    {
      tokenType: "AWARD",
      name: "Awards & Recognition",
      description: "Special recognition tokens for achievements and contributions",
      tokens: [
        {
          id: "rhodes_scholar",
          name: "Rhodes Scholar",
          description: "Awarded for merit or financial aid",
          imageUri: "/rhodes_scholar.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/rhodes_scholar",
          tokenType: "AWARD"
        },
        {
          id: "hist_glitch",
          name: "Historical Glitch",
          description: "For founding cohort or early backers",
          imageUri: "/hist_glitch.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/hist_glitch",
          tokenType: "AWARD"
        },
        {
          id: "gold_star",
          name: "Gold Star",
          description: "For special recognition or contribution",
          imageUri: "/gold_star.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/gold_star",
          tokenType: "AWARD"
        },
        {
          id: "longrun",
          name: "Long Run",
          description: "For milestones like 1-year membership",
          imageUri: "/longrun.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/longrun",
          tokenType: "AWARD"
        },
      ],
    },
    {
      tokenType: "REPLACEMENT",
      name: "Replacement Tokens",
      description: "Special replacement tokens for lost access situations",
      tokens: [
        {
          id: "the_fool",
          name: "The Fool",
          description: "Burn-and-replace when access is lost",
          imageUri: "/the_fool.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/the_fool",
          tokenType: "REPLACEMENT"
        },
      ],
    },
  ],
}

export default function GalleryPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedToken, setSelectedToken] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const { writeContract, isPending, isSuccess, error } = useWriteContract();
  const { toast } = useToast();

  // Filter state
  const [roleFilter, setRoleFilter] = useState<string>("All");

  // Get connected wallet address
  const { address } = useAccount();
  // Fetch tokens for the connected user
  const { tokens } = useMyTokens(address);

  // Compute ownedTokens from tokens (token.id or token.tokenId)
  const ownedTokens = tokens.reduce((acc: { [tokenId: string]: boolean }, token: any) => {
    acc[token.tokenId || token.id] = true;
    return acc;
  }, {});

  // Filter logic - updated for new structure
  const filteredGovernance = nftData.governance.filter(category => {
    if (roleFilter === "All") return true;
    return category.tokenType && category.tokenType.toLowerCase() === roleFilter.toLowerCase();
  });

  // Helper function to get token type config
  const getTokenTypeConfig = (tokenType: string) => {
    return tokenTypeConfigs[tokenType as keyof typeof tokenTypeConfigs] || tokenTypeConfigs.MEMBER;
  };

  // Special/limited types
  const limitedTypes = ["AWARD", "POAP", "REPLACEMENT"];

  const handleMint = async (tokenType: string, tokenId: string) => {
    try {
      const config = getTokenTypeConfig(tokenType);
      
      // Use appropriate mint function based on token type
      const isSoulbound = config.soulbound;
      const mintValue = config.cost === "Free" ? "0" : 
                       config.cost === "0.01 ETH" ? "0.01" : "0";
      
      // Check mint access permissions
      if (config.mintAccess === "OFFICER_ONLY") {
        alert("Only officers can mint this token type.");
        return;
      }
      
      if (config.mintAccess === "WHITELIST_ONLY") {
        alert("You must be whitelisted to mint this token type.");
        return;
      }
      
      // Call the appropriate contract function
      let tx;
      if (config.mintAccess === "PUBLIC") {
        // Use publicMint for public tokens
        tx = await writeContract({
          address: contracts.membership.address,
          abi: contracts.membership.abi,
          functionName: "publicMint",
          args: [tokenType, isSoulbound],
          value: mintValue !== "0" ? parseEther(mintValue) : undefined,
        });
      } else {
        // Use mint for restricted tokens
        tx = await writeContract({
          address: contracts.membership.address,
          abi: contracts.membership.abi,
          functionName: "mint",
          args: [tokenType, isSoulbound],
          value: mintValue !== "0" ? parseEther(mintValue) : undefined,
        });
      }
      
      toast({
        title: "Success!",
        description: "Token minted successfully!",
      });
    } catch (error: any) {
      if (error?.code === 4001 || error?.message?.includes("User denied")) {
        toast({
          title: "Transaction Cancelled",
          description: "You rejected the transaction in your wallet.",
        });
      } else {
        toast({
          title: "Minting Failed",
          description: error.message || "An error occurred while minting.",
          variant: "destructive",
        });
      }
    }
  };

  async function checkWhitelist() {
    // Implement logic to check if the user is whitelisted
    // This could involve calling a read function on the contract
    return true; // Placeholder
  }

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Simulate wallet connection status
      setIsConnected(localStorage.getItem("walletConnected") === "true")
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleTokenClick = (token: any, category: any) => {
    setSelectedToken(token)
    setSelectedCategory(category)
    setIsDetailModalOpen(true)
  }

  const handleModalClose = () => {
    setIsDetailModalOpen(false);
    // Delay clearing state until after modal close animation (300ms typical)
    setTimeout(() => {
      setSelectedToken(null);
      setSelectedCategory(null);
    }, 300);
  };

  const getCategoryIcon = (category: any) => {
    if (category.role) {
      switch (category.role.toLowerCase()) {
        case "observer":
          return <Users className="h-5 w-5" />
        case "member":
          return <Shield className="h-5 w-5" />
        case "officer":
          return <Award className="h-5 w-5" />
        default:
          return <Shield className="h-5 w-5" />
      }
    } else if (category.type) {
      switch (category.type.toLowerCase()) {
        case "alumni":
          return <GraduationCap className="h-5 w-5" />
        case "scholarship":
          return <BookOpen className="h-5 w-5" />
        case "replacement":
          return <Sparkles className="h-5 w-5" />
        case "founder series":
          return <Key className="h-5 w-5" />
        case "secret sauce token":
          return <Sparkles className="h-5 w-5" />
        case "gold star award":
          return <Star className="h-5 w-5" />
        case "loyalty token":
          return <Clock className="h-5 w-5" />
        case "art drop":
          return <Palette className="h-5 w-5" />
        default:
          return <Shield className="h-5 w-5" />
      }
    }
    return <Shield className="h-5 w-5" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 py-20 md:py-28">
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
              <Sparkles className="mr-2 h-4 w-4" />
              NFT Membership Collection
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              🎨 Membership Gallery
            </h1>
            
            <p className="mb-8 text-xl text-purple-100 leading-relaxed">
              Discover our unique NFT collection! Each membership token represents different roles and privileges within our blockchain community. 
              Choose your path and join the future of decentralized education.
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Content Section */}
      <div className="container mx-auto px-4 py-12 pb-20">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Token Gallery
        </h1>
        <p className="max-w-4xl mx-auto text-xl text-gray-600 leading-relaxed">
          Explore the NFT artwork collection of the University Blockchain Club. Each token represents a unique role or
          achievement within our community. Click on any token to view details and mint options.
        </p>
      </div>

      <div className="mb-12">
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-100">
          <h2 className="mb-3 text-3xl font-bold text-gray-900 flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg mr-3">
              <Shield className="h-6 w-6 text-white" />
            </div>
            Governance Track
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            These tokens determine your role and voting power within the club's governance system.
          </p>
        </div>

        <div className="space-y-8">
          {filteredGovernance.map((category) => (
            <div key={category.tokenType} className="space-y-4">
              <div className="border-b border-gray-200 pb-3">
                <h3 className="flex items-center text-xl font-bold text-gray-900 mb-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg mr-3">
                    {getCategoryIcon(category)}
                  </div>
                  <span>{category.name}</span>
                </h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>

              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="flex flex-col h-full min-h-[480px] border-gray-200 bg-white shadow-sm">
                      <CardHeader className="pb-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between">
                        <div className="flex-1 flex items-center justify-center">
                          <Skeleton className="h-48 w-full rounded-md" />
                        </div>
                        <Skeleton className="mt-4 h-10 w-full rounded-md" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <AnimatePresence>
                    {category.tokens.map((token) => {
                      const isOwned = !!ownedTokens[token.id];
                      const config = getTokenTypeConfig(category.tokenType);
                      const isLimited = config.mintAccess === 'OFFICER_ONLY' || config.mintAccess === 'WHITELIST_ONLY';
                      return (
                        <motion.div
                          key={token.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                          <Card
                            className={cn(
                              "group flex flex-col h-full min-h-[480px] overflow-hidden border-gray-200 bg-white shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                              isOwned && "opacity-70 bg-gray-50"
                            )}
                            onClick={() => handleTokenClick(token, category)}
                          >
                            <CardHeader className="pb-3 flex-shrink-0">
                              <div className="flex items-start justify-between gap-2 min-h-[24px]">
                                <CardTitle className="text-gray-900 text-lg font-semibold line-clamp-1 group-hover:text-blue-600 transition-colors">
                                  {token.name}
                                </CardTitle>
                                {isOwned && (
                                  <Badge className="bg-green-100 text-green-800 text-xs font-medium">Owned</Badge>
                                )}
                              </div>
                              <CardDescription className="text-gray-600 text-sm line-clamp-2 min-h-[40px]">
                                {token.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between p-6 pt-0">
                              <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-3 mb-4 min-h-[240px]">
                                <Image
                                  src={token.imageUri || "/placeholder.svg"}
                                  alt={`${token.name}`}
                                  width={400}
                                  height={240}
                                  className="max-h-56 max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                  priority={false}
                                />
                              </div>
                              <Button
                                className={cn(
                                  "w-full transition-all duration-300 shadow-sm",
                                  isOwned ? "bg-gray-200 text-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedToken(token);
                                  setSelectedCategory(category);
                                  setIsDetailModalOpen(true);
                                }}
                                disabled={isOwned}
                              >
                                {isOwned ? "Already Owned" : `Mint ${token.name}`}
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>      <div>
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 p-6 border border-purple-100">
          <h2 className="mb-3 text-3xl font-bold text-gray-900 flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg mr-3">
              <Palette className="h-6 w-6 text-white" />
            </div>
            Culture & Experience Track
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            These special tokens recognize achievements, milestones, and contributions to the club community.
          </p>
        </div>

        <div className="space-y-12">
          {nftData.culture.map((category) => (
            <div key={category.tokenType} className="space-y-6">
              <div className="border-b border-gray-200 pb-3">
                <h3 className="flex items-center text-2xl font-bold text-gray-900 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    {getCategoryIcon(category)}
                  </div>
                  <span>{category.name}</span>
                </h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>

              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="flex flex-col h-full min-h-[480px] border-gray-200 bg-white shadow-sm">
                      <CardHeader className="pb-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between">
                        <div className="flex-1 flex items-center justify-center">
                          <Skeleton className="h-48 w-full rounded-md" />
                        </div>
                        <Skeleton className="mt-4 h-10 w-full rounded-md" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {category.tokens.map((token) => (
                    <motion.div
                      key={token.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      <Card
                        className="group flex flex-col h-full min-h-[480px] overflow-hidden border-gray-200 bg-white shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        onClick={() => handleTokenClick(token, category)}
                      >
                        <CardHeader className="pb-3 flex-shrink-0">
                          <CardTitle className="text-gray-900 text-lg font-semibold line-clamp-1 group-hover:text-purple-600 transition-colors">
                            {token.name}
                          </CardTitle>
                          <CardDescription className="text-gray-600 text-sm line-clamp-2 min-h-[40px]">
                            {token.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between p-6 pt-0">
                          <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-3 mb-4 min-h-[240px]">
                            <Image
                              src={token.imageUri || "/placeholder.svg"}
                              alt={`${token.name}`}
                              width={400}
                              height={240}
                              className="max-h-56 max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                              priority={false}
                            />
                          </div>
                          <Button
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedToken(token);
                              setSelectedCategory(category);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            Mint {token.name}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <NFTDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleModalClose}
        token={selectedToken}
        category={selectedCategory}
      />
      </div>
    </div>
  );
}

// TODO: Add filter/sort controls for role, edition, mint date
// TODO: Allow click to open modal with token metadata + art (already implemented)
// TODO: Tag limited editions or seasonal drops visually
// TODO: Mark all IPFS links and images as placeholders for real metadata
