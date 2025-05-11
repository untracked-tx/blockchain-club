"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { CalendarClock, Vote, Shield, Users, Coins, Award } from "lucide-react"
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
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">My Wallet</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          View your University Blockchain Club membership tokens and their details.
        </p>
      </div>

      {!isConnected ? (
        <div className="mx-auto max-w-md text-center">
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>You need to connect your wallet to view your tokens.</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <ConnectWalletButton />
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div>
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="mb-4 h-48 w-full rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tokens.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tokens.map((token) => (
                <Card key={token.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getRoleIcon(token.role)}
                        {token.role} Token
                        <span className={`ml-2 rounded px-2 py-0.5 text-xs font-semibold text-white ${roleColors[token.role.toLowerCase()] || 'bg-gray-400'}`}>{token.role}</span>
                      </CardTitle>
                      <Badge variant="outline">#{token.id}</Badge>
                    </div>
                    <CardDescription>University Blockchain Club Membership</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="overflow-hidden rounded-md">
                      <img
                        src={token.imageUri || "/placeholder.svg"}
                        alt={`${token.role} Token #${token.id}`}
                        className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Vote className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Voting Power:</span>
                        <span className="font-medium">{token.votingPower}x</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Expires:</span>
                        <span className="font-medium">{formatExpiry(token.expiry)}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        {/* TODO: Implement real actions for membership management */}
                        <Button size="sm" variant="secondary">Renew Membership</Button>
                        <Button size="sm" variant="outline">Upgrade Role</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Tokens Found</CardTitle>
                <CardDescription>You don't have any membership tokens yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Visit the Mint page to get your first University Blockchain Club membership token.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
