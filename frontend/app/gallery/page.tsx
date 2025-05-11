"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, Award, GraduationCap, Star, Clock, Palette, Key, BookOpen, Sparkles } from "lucide-react"
import NFTDetailModal from "@/components/nft-detail-modal"
import { useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/constants";
import { parseEther } from "viem";
import { polygon } from "wagmi/chains";
import Image from "next/image"
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

// NFT data based on the provided mapping
const nftData = {
  governance: [
    {
      role: "Observer",
      type: "POAP / Event Token",
      votingPower: 0,
      tokens: [
        {
          id: "mint_and_slurp",
          name: "Mint & Slurp",
          description: "Attended a blockchain workshop",
          imageUri: "/mint_and_slurp.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/mint_and_slurp",
        },
        {
          id: "quad",
          name: "Quad",
          description: "Attended a speaker event",
          imageUri: "/quad.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/quad",
        },
      ],
    },
    {
      role: "Member",
      type: "Voting NFT",
      votingPower: 1,
      tokens: [
        {
          id: "trader",
          name: "Trader",
          description: "Full digital asset trading membership with voting rights",
          imageUri: "/tradercard.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/trader",
        },
        {
          id: "initiation",
          name: "Initiation",
          description: "Full membership with voting rights",
          imageUri: "/inititation.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/initiation",
        },
        {
          id: "trader_chill",
          name: "Trader Chill",
          description: "Full custom membership with voting rights",
          imageUri: "/trader_chill.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/trader_chill",
        },
        {
          id: "letsgetthispartystarted2k25",
          name: "Let's Get This Party Started",
          description: "Standard 2025 membership with voting rights",
          imageUri: "letsgetthispartystarted2k25.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/letsgetthispartystarted2k25",
        },
        {
          id: "future",
          name: "Custom membership",
          description: "Full custom membership with voting rights",
          imageUri: "/future.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/future",
        },
      ],
    },
    {
      role: "Officer",
      type: "Admin NFT",
      votingPower: "3-5",
      tokens: [
        {
          id: "pres",
          name: "President",
          description: "Club leadership with maximum voting power",
          imageUri: "/pres.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/pres",
        },
        {
          id: "vice_president",
          name: "Vice President",
          description: "Assists the President in club leadership and decision-making.",
          imageUri: "/vp.png",
          ipfsMetadata: "ipfs://placeholder/vice_president",
        },
        {
          id: "cfo",
          name: "CFO",
          description: "Financial officer with treasury access",
          imageUri: "/trader.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/cfo",
        },
        {
          id: "treasurer",
          name: "Treasurer",
          description: "Manages the club's financial records and treasury.",
          imageUri: "/tres.png",
          ipfsMetadata: "ipfs://placeholder/treasurer",
        },
        {
          id: "major_key_alert",
          name: "Major Key Alert",
          description: "Key-holder with administrative access",
          imageUri: "/major_key_alert.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/major_key_alert",
        },
        {
          id: "officer",
          name: "Officer",
          description: "Administrative privileges and enhanced voting power",
          imageUri: "/officer.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/officer",
        },
      ],
    },
  ],
  culture: [
    {
      type: "Alumni",
      mintedBy: "Anyone",
      cost: "0.005+",
      tokens: [
        {
          id: "the_graduate",
          name: "The Graduate",
          description: "For graduating or inactive members",
          imageUri: "/the_graduate.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/the_graduate",
        },
      ],
    },
    {
      type: "Scholarship",
      mintedBy: "Officers",
      cost: "Free",
      tokens: [
        {
          id: "rhodes_scholar",
          name: "Rhodes Scholar",
          description: "Awarded for merit or financial aid",
          imageUri: "/rhodes_scholar.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/rhodes_scholar",
        },
      ],
    },
    
    {
      type: "Founder Series",
      mintedBy: "Club Wallet",
      cost: "Special",
      tokens: [
        {
          id: "hist_glitch",
          name: "Historical Glitch",
          description: "For founding cohort or early backers",
          imageUri: "/hist_glitch.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/hist_glitch",
        },
      ],
    },
    {
      type: "Secret Sauce Token",
      mintedBy: "Officers",
      cost: "0.01-0.03",
      tokens: [
        {
          id: "secret_sauce",
          name: "Secret Sauce",
          description: "Earned from completing internal club course",
          imageUri: "/secret_sauce.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/secret_sauce",
        },
      ],
    },
    {
      type: "Gold Star Award",
      mintedBy: "Officers",
      cost: "Bonus Drop",
      tokens: [
        {
          id: "gold_star",
          name: "Gold Star",
          description: "For special recognition or contribution",
          imageUri: "/gold_star.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/gold_star",
        },
      ],
    },
    {
      type: "Loyalty Token",
      mintedBy: "Officers",
      cost: "Bonus Drop",
      tokens: [
        {
          id: "longrun",
          name: "Long Run",
          description: "For milestones like 1-year membership",
          imageUri: "/longrun.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/longrun",
        },
      ],
    },
    {
      type: "Art Drop",
      mintedBy: "Club Wallet",
      cost: "0.03+",
      tokens: [
        {
          id: "digi_art",
          name: "Digital Art",
          description: "Collectible + cultural fundraiser piece",
          imageUri: "/digi_art.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/digi_art",
        },
      ],
    },
    {
      type: "Replacement",
      mintedBy: "Officers",
      cost: "N/A",
      tokens: [
        {
          id: "the_fool",
          name: "The Fool",
          description: "Burn-and-replace when access is lost",
          imageUri: "/the_fool.png",
          ipfsMetadata: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/the_fool",
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

  const handleMint = async (role: string, price: number, requireWhitelist: boolean) => {
    try {
      // Ensure the user is whitelisted if required
      if (requireWhitelist) {
        const isWhitelisted = await checkWhitelist(); // Implement this function to check whitelist status
        if (!isWhitelisted) {
          alert("You are not whitelisted to mint this token.");
          return;
        }
      }

      // Convert price to bigint and send transaction
      await writeContract({
        address: CONTRACT_ADDRESS, // Updated contract address
        abi: CONTRACT_ABI, // Updated ABI
        functionName: "mintToken",
        args: [role, parseEther(price.toString()), requireWhitelist],
        value: parseEther(price.toString()),
        chain: polygon,
        account: "0xYourWalletAddress",
      });
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
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">Token Gallery</h1>
        <p className="max-w-2xl text-lg text-gray-600">
          Explore the NFT artwork collection of the University Blockchain Club. Each token represents a unique role or
          achievement within our community. Click on any token to view details and mint options.
        </p>
        {/* TODO: Add filter/sort UI here for better UX */}
      </div>

      <div className="mb-16">
        <div className="mb-8 rounded-xl bg-blue-50 p-6">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-2 h-6 w-6 text-blue-600" />
            Governance Track
          </h2>
          <p className="text-gray-600 mb-2">
            These tokens determine your role and voting power within the club's governance system.
          </p>
        </div>

        <div className="space-y-12">
          {nftData.governance.map((category) => (
            <div key={category.role} className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="flex items-center text-xl font-bold text-gray-900">
                  {getCategoryIcon(category)}
                  <span className="ml-2">{category.role}</span>
                  <Badge className="ml-3 bg-blue-100 text-blue-800">{category.type}</Badge>
                  <Badge className="ml-2 bg-green-100 text-green-800">Voting Power: {category.votingPower}</Badge>
                </h3>
              </div>

              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="border-gray-200 bg-white shadow-sm">
                      <CardHeader>
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="mb-4 h-48 w-full rounded-md" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {category.tokens.map((token) => (
                    <Card
                      key={token.id}
                      className="overflow-hidden border-gray-200 bg-white shadow-sm cursor-pointer transition-all hover:shadow-md"
                      onClick={() => handleTokenClick(token, category)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-gray-900">{token.name}</CardTitle>
                        <CardDescription className="text-gray-600">{token.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-hidden rounded-md">
                          <Image
                            src={token.imageUri || "/placeholder.svg"}
                            alt={`${token.name}`}
                            width={300}
                            height={192}
                            className="h-48 w-full object-contain"
                            priority={false}
                          />
                        </div>
                        <Button
                          className="mt-4 w-full"
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
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-8 rounded-xl bg-purple-50 p-6">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 flex items-center">
            <Palette className="mr-2 h-6 w-6 text-purple-600" />
            Culture & Experience Track
          </h2>
          <p className="text-gray-600 mb-2">
            These special tokens recognize achievements, milestones, and contributions to the club community.
          </p>
        </div>

        <div className="space-y-12">
          {nftData.culture.map((category) => (
            <div key={category.type} className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="flex items-center text-xl font-bold text-gray-900">
                  {getCategoryIcon(category)}
                  <span className="ml-2">{category.type}</span>
                  <Badge className="ml-3 bg-purple-100 text-purple-800">Minted By: {category.mintedBy}</Badge>
                  <Badge className="ml-2 bg-amber-100 text-amber-800">Cost: {category.cost}</Badge>
                </h3>
              </div>

              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="border-gray-200 bg-white shadow-sm">
                      <CardHeader>
                        <Skeleton className="h-6 w-24" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="mb-4 h-48 w-full rounded-md" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {category.tokens.map((token) => (
                    <Card
                      key={token.id}
                      className="overflow-hidden border-gray-200 bg-white shadow-sm cursor-pointer transition-all hover:shadow-md"
                      onClick={() => handleTokenClick(token, category)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-gray-900">{token.name}</CardTitle>
                        <CardDescription className="text-gray-600">{token.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-hidden rounded-md">
                          <Image
                            src={token.imageUri || "/placeholder.svg"}
                            alt={`${token.name}`}
                            width={300}
                            height={192}
                            className="h-48 w-full object-contain"
                            priority={false}
                          />
                        </div>
                        <Button
                          className="mt-4 w-full"
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
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Call to action section */}
      <div className="mt-16 text-center">
        <div className="mx-auto max-w-3xl rounded-xl bg-blue-50 p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Explore Our Token Collection</h2>
          <p className="mx-auto mb-6 text-gray-600">
            Click on any token to view details and mint options. Join our community by minting a membership token that
            suits your interests.
          </p>
          <p className="text-sm text-gray-500">
            Membership tokens grant access to club resources, events, and governance participation based on their role
            and type.
          </p>
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
  )
}

// TODO: Add filter/sort controls for role, edition, mint date
// TODO: Allow click to open modal with token metadata + art (already implemented)
// TODO: Tag limited editions or seasonal drops visually
// TODO: Mark all IPFS links and images as placeholders for real metadata
