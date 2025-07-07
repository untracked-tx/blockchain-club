"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { CalendarClock, Vote, Shield, Users, Coins, Award, Wallet, Sparkles } from "lucide-react"
import { EnhancedCard, IconWrapper, FloatingBadge } from "@/components/ui/enhanced-card"
import ConnectWalletButton from "@/components/connect-wallet-button";
import { useAccount } from "wagmi";

// Mock token data for demonstration
const mockTokens = [
  {
    id: 1,
    role: "Observer",
    votingPower: 0,
    expiry: Math.floor(Date.now() / 1000) + 31536000, // 1 year from now
    imageUri: "/observer-token-blue-nft.png",
  },
  {
    id: 2,
    role: "Member",
    votingPower: 1,
    expiry: Math.floor(Date.now() / 1000) + 31536000, // 1 year from now
    imageUri: "/purple-member-nft.png",
  },
  {
    id: 3,
    role: "Supporter",
    votingPower: 3,
    expiry: Math.floor(Date.now() / 1000) + 31536000, // 1 year from now
    imageUri: "/supporter-token-gold-nft.png",
  },
]

interface Token {
  id: number
  role: string
  votingPower: number
  expiry: number
  imageUri: string
}

export default function WalletPage() {
  const { isConnected } = useAccount();
  const [tokens, setTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setTokens(mockTokens)
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "observer":
        return <Users className="h-5 w-5" />
      case "member":
        return <Shield className="h-5 w-5" />
      case "supporter":
        return <Coins className="h-5 w-5" />
      case "officer":
        return <Award className="h-5 w-5" />
      default:
        return <Shield className="h-5 w-5" />
    }
  }

  const formatExpiry = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  // TODO: Rename this page to "My Membership" for clarity (see audit checklist)
  // TODO: Replace mockTokens with real wallet integration
  // Color map for role badges
  const roleColors: Record<string, string> = {
    observer: "bg-blue-500",
    member: "bg-purple-500",
    supporter: "bg-yellow-500",
    officer: "bg-green-600",
  }

  return (
    <div className="flex flex-col">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-20 md:py-28">
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
              <Wallet className="mr-2 h-4 w-4" />
              My Membership
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              💳 Your Digital Membership
            </h1>
            
            <p className="mb-8 text-xl text-purple-100 leading-relaxed">
              View and manage your University Blockchain Club membership tokens. Each NFT represents your unique role and voting power in our community.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">

      <div className="container mx-auto px-4 py-16">

      {!isConnected ? (
        <div className="mx-auto max-w-md text-center">
          <EnhancedCard variant="gradient" className="p-6">
            <div className="flex justify-center mb-4">
              <IconWrapper color="blue" size="md">
                <Wallet className="h-5 w-5" />
              </IconWrapper>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Connect Your Wallet
              </CardTitle>
              <CardDescription>
                You need to connect your wallet to view your membership tokens.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center pt-4">
              <ConnectWalletButton />
            </CardFooter>
          </EnhancedCard>
        </div>
      ) : (
        <div>
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <EnhancedCard key={i} variant="glass">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="mb-4 h-48 w-full rounded-xl" />
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full rounded-lg" />
                      <Skeleton className="h-12 w-full rounded-lg" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 flex-1 rounded-md" />
                        <Skeleton className="h-8 flex-1 rounded-md" />
                      </div>
                    </div>
                  </CardContent>
                </EnhancedCard>
              ))}
            </div>
          ) : tokens.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tokens.map((token) => (
                <EnhancedCard key={token.id} variant="gradient" className="overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <FloatingBadge color={token.role.toLowerCase() === 'observer' ? 'blue' : token.role.toLowerCase() === 'member' ? 'purple' : token.role.toLowerCase() === 'supporter' ? 'orange' : 'green'}>
                      #{token.id}
                    </FloatingBadge>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <IconWrapper 
                        color={token.role.toLowerCase() === 'observer' ? 'blue' : token.role.toLowerCase() === 'member' ? 'purple' : token.role.toLowerCase() === 'supporter' ? 'orange' : 'green'} 
                        size="sm"
                      >
                        {getRoleIcon(token.role)}
                      </IconWrapper>
                      <div>
                        <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                          {token.role} Token
                        </CardTitle>
                        <CardDescription className="text-sm">University Blockchain Club</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="overflow-hidden rounded-xl border-2 border-gray-200/50">
                      <img
                        src={token.imageUri || "/placeholder.svg"}
                        alt={`${token.role} Token #${token.id}`}
                        className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-3">
                        <Vote className="h-4 w-4 text-indigo-600" />
                        <span className="text-gray-600">Voting Power:</span>
                        <span className="font-bold text-indigo-600">{token.votingPower}x</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-3">
                        <CalendarClock className="h-4 w-4 text-emerald-600" />
                        <span className="text-gray-600">Expires:</span>
                        <span className="font-bold text-emerald-600">{formatExpiry(token.expiry)}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Renew
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                          Upgrade
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </EnhancedCard>
              ))}
            </div>
          ) : (
            <div className="text-center max-w-md mx-auto">
              <EnhancedCard variant="gradient" className="p-8">
                <div className="flex justify-center mb-6">
                  <IconWrapper color="blue" size="lg">
                    <Wallet className="h-8 w-8" />
                  </IconWrapper>
                </div>
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                    No Tokens Found
                  </CardTitle>
                  <CardDescription className="text-lg">
                    You don't have any membership tokens yet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-gray-600">
                    Visit the Mint page to get your first University Blockchain Club membership token.
                  </p>
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Your First Token
                  </Button>
                </CardContent>
              </EnhancedCard>
            </div>
          )}
        </div>
      )}
      </div>
      </div>
    </div>
  )
}
