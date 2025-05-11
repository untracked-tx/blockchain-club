"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Vote, Shield, ExternalLink, Wallet, BarChart3, History } from "lucide-react"
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/constants";

const AMOY_CHAIN_ID = 80002;

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

type Token = {
  id: number;
  name: string;
  description: string;
  imageUri: string;
  votingPower: number;
  acquired: string;
  isDefault?: boolean;
  type?: string;
  tokenId?: string;
};

export default function MembersPage() {
  const { address, isConnected } = useAccount();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [votingHistory, setVotingHistory] = useState(mockVotingHistory)
  const [selectedDisplayToken, setSelectedDisplayToken] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("tokens")
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [mounted, setMounted] = useState(false); // NEW: track client mount

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch tokens owned by the user
  useEffect(() => {
    let isMounted = true;
    async function fetchTokens() {
      if (!isConnected || !address) {
        if (isMounted) {
          setTokens([]);
          setIsLoading(false);
        }
        return;
      }
      setIsLoading(true);
      setErrorMsg(null);
      setWrongNetwork(false);
      try {
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const network = await provider.getNetwork();
          if (Number(network.chainId) !== AMOY_CHAIN_ID) {
            if (isMounted) {
              setWrongNetwork(true);
              setTokens([]);
              setIsLoading(false);
              setErrorMsg("Please connect your wallet to the Polygon Amoy testnet (chainId 80002). Token fetching is only supported on this network.");
            }
            return;
          }
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
          // Defensive: check if contract has balanceOf and tokenOfOwnerByIndex
          if (typeof contract.balanceOf !== "function" || typeof contract.tokenOfOwnerByIndex !== "function") {
            if (isMounted) {
              setTokens([]);
              setIsLoading(false);
              setErrorMsg("This contract does not support token enumeration. Please contact support.");
            }
            return;
          }
          console.log("[DEBUG] CONTRACT_ADDRESS:", CONTRACT_ADDRESS);
          console.log("[DEBUG] CONTRACT_ABI:", CONTRACT_ABI);
          const balance = await contract.balanceOf(address);
          const ownedTokens: Token[] = [];
          for (let i = 0; i < balance; i++) {
            try {
              const tokenId = await contract.tokenOfOwnerByIndex(address, i);
              let name = `Token #${tokenId}`;
              let description = "Membership NFT";
              let imageUri = "/placeholder.svg";
              let acquired = "";
              // Fetch tokenURI and metadata
              if (typeof contract.tokenURI === "function") {
                const tokenUri = await contract.tokenURI(tokenId);
                if (tokenUri) {
                  // Handle IPFS URIs
                  let fetchUri = tokenUri;
                  if (tokenUri.startsWith("ipfs://")) {
                    fetchUri = `https://ipfs.io/ipfs/${tokenUri.replace("ipfs://", "")}`;
                  }
                  try {
                    const res = await fetch(fetchUri);
                    if (res.ok) {
                      const meta = await res.json();
                      name = meta.name || name;
                      description = meta.description || description;
                      imageUri = meta.image || imageUri;
                      acquired = meta.acquired || "";
                    }
                  } catch (metaErr) {
                    console.warn(`Failed to fetch metadata for token ${tokenId}:`, metaErr);
                  }
                }
              }
              // Fix: Convert IPFS image URIs to gateway URLs
              if (imageUri.startsWith("ipfs://")) {
                imageUri = `https://ipfs.io/ipfs/${imageUri.replace("ipfs://", "")}`;
              }
              ownedTokens.push({
                id: Number(tokenId),
                name,
                description,
                imageUri,
                votingPower: 1, // TODO: fetch real voting power if available
                acquired,
                tokenId: tokenId.toString(),
              });
            } catch (err) {
              if (isMounted) {
                setTokens([]);
                setIsLoading(false);
                setErrorMsg("This contract does not support token enumeration. Please contact support.");
              }
              return;
            }
          }
          if (isMounted) {
            setTokens(ownedTokens);
            setSelectedDisplayToken(ownedTokens[0]?.id?.toString() || undefined);
          }
        } else {
          if (isMounted) setTokens([]);
        }
      } catch (err) {
        if (isMounted) {
          setTokens([]);
          setErrorMsg("Failed to fetch tokens. Please try again or contact support.");
          console.error("Token fetch error:", err);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchTokens();
    return () => { isMounted = false; };
  }, [isConnected, address]);

  const handleDisplayTokenChange = (value: string) => {
    setSelectedDisplayToken(value)
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
    return tokens.reduce((total, token) => total + token.votingPower, 0)
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

  // Utility function to map tokenId/name to correct image based on mapping.md
  function getTokenImage(token: any): string {
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
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">My Membership</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          View your membership tokens, voting power, and governance participation.
        </p>
        {/* TODO: Add a summary of your percentile vs. other members */}
      </div>

      {/* Hydration guard: only render wallet/token UI after client mount */}
      {!mounted ? (
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
      ) :
      !isConnected ? (
        <div className="mx-auto max-w-md text-center">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Connect Your Wallet</CardTitle>
              <CardDescription className="text-gray-600">
                You need to connect your wallet to view your membership details.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button onClick={() => window.localStorage.setItem("walletConnected", "true")}>Connect Wallet</Button>
            </CardFooter>
          </Card>
        </div>
      ) : wrongNetwork ? (
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
        <div>
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-2">
                  <Wallet className="h-5 w-5" />
                </div>
                <CardTitle className="text-gray-900">Membership Status</CardTitle>
                <CardDescription className="text-gray-600">Your current membership level</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      <Shield className="mr-1 h-3 w-3" /> Member
                    </Badge>
                    <span className="text-sm text-gray-600">Since {formatDate(tokens[0]?.acquired)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 mb-2">
                  <Vote className="h-5 w-5" />
                </div>
                <CardTitle className="text-gray-900">Voting Power</CardTitle>
                <CardDescription className="text-gray-600">Your influence in governance</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{getTotalVotingPower()}</span>
                    <span className="text-sm text-gray-600">From {tokens.length} tokens</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-2">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <CardTitle className="text-gray-900">Participation</CardTitle>
                <CardDescription className="text-gray-600">Your governance activity</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{votingHistory.length}</span>
                    <span className="text-sm text-gray-600">Votes cast</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="tokens" onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger value="tokens" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
                My Tokens
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
                Voting History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tokens">
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : tokens.length > 0 ? (
                <div className="mb-6">
                  <Card className="border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-900">My Governance Tokens</CardTitle>
                      <CardDescription className="text-gray-600">
                        You have {tokens.length} tokens with a total voting power of {getTotalVotingPower()}.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="w-full sm:w-64">
                            <Label htmlFor="display-token" className="mb-2 block text-sm font-medium text-gray-700">
                              Display Token
                            </Label>
                            <Select value={selectedDisplayToken} onValueChange={handleDisplayTokenChange}>
                              <SelectTrigger className="border-gray-200">
                                <SelectValue placeholder="Select token to display" />
                              </SelectTrigger>
                              <SelectContent>
                                {tokens.map((token) => (
                                  <SelectItem key={token.id} value={token.id.toString()}>
                                    {token.name} (Power: {token.votingPower})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button variant="outline" className="border-gray-200 text-gray-700">
                            Set as Default
                          </Button>
                          {/* TODO: Add burn, reissue, or request help actions here */}
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {tokens.map((token) => (
                          <Card
                            key={token.id}
                            className={`border-gray-200 bg-white shadow-sm overflow-hidden ${
                              token.id.toString() === selectedDisplayToken ? "ring-2 ring-blue-500" : ""
                            }`}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-gray-900">{token.name}</CardTitle>
                                {token.isDefault && <Badge className="bg-blue-100 text-blue-800">Default</Badge>}
                              </div>
                              <CardDescription className="text-gray-600">{token.type}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="overflow-hidden rounded-md">
                                <img
                                  src={getTokenImage(token)}
                                  alt={token.name}
                                  className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Voting Power:</span>
                                  <span className="font-medium text-gray-900">{token.votingPower}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Acquired:</span>
                                  <span className="font-medium text-gray-900">{formatDate(token.acquired)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Token ID:</span>
                                  <span className="font-mono text-xs text-gray-600">{token.tokenId}</span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="border-t border-gray-100 bg-gray-50 pt-3">
                              <Button
                                variant="outline"
                                className="w-full border-gray-200 text-gray-700"
                                onClick={() => setSelectedDisplayToken(token.id.toString())}
                              >
                                {token.id.toString() === selectedDisplayToken ? "Selected" : "Select"}
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-gray-100 bg-gray-50 pt-3 flex justify-between">
                      <Button
                        variant="outline"
                        className="border-gray-200 text-gray-700"
                        onClick={() => {
                          let url = "https://amoy.polygonscan.com/address/" + CONTRACT_ADDRESS;
                          if (selectedDisplayToken) {
                            url = `https://amoy.polygonscan.com/token/${CONTRACT_ADDRESS}?a=${selectedDisplayToken}`;
                          }
                          window.open(url, "_blank");
                        }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" /> View on Etherscan
                      </Button>
                      <Button onClick={() => window.location.href = "/gallery"}>
                        <Wallet className="mr-2 h-4 w-4" /> Manage Tokens
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-4 text-gray-600">{errorMsg ? errorMsg : "You don't own any tokens yet."}</p>
                  <Button onClick={() => window.location.href = "/gallery"} className="bg-blue-600 text-white">
                    Mint Your First Token
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
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
                    <div className="space-y-4">
                      {Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="rounded-md border border-gray-200 p-4">
                            <Skeleton className="h-6 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        ))}
                    </div>
                  ) : votingHistory.length > 0 ? (
                    <div className="space-y-4">
                      {votingHistory.map((vote) => (
                        <div key={vote.id} className="rounded-md border border-gray-200 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-gray-50 text-gray-700">
                                {vote.proposal}
                              </Badge>
                              <Badge className={getVoteColor(vote.vote)}>
                                {vote.vote.charAt(0).toUpperCase() + vote.vote.slice(1)}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatDate(vote.timestamp)} at {formatTime(vote.timestamp)}
                            </div>
                          </div>
                          <p className="text-gray-900 font-medium">{vote.proposalTitle}</p>
                          <div className="mt-2 text-sm text-gray-600">Voting power used: {vote.votingPower}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center">
                      <p className="text-gray-600">You haven't voted on any proposals yet.</p>
                      <p className="text-sm text-gray-500 mt-1">
                        When you vote on proposals, your voting history will appear here.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-gray-100 bg-gray-50 pt-3">
                  <Button variant="outline" className="w-full border-gray-200 text-gray-700">
                    <ExternalLink className="mr-2 h-4 w-4" /> View All Activity on Snapshot
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

// TODO: Replace mockVotingHistory with real vote data
// TODO: Add logic to calculate total voting power (already implemented)
// TODO: Add buttons to burn, reissue, or request help for tokens
// TODO: Add comparison chart vs. other members (percentile)
// TODO: Add tooltips for badges and actions
