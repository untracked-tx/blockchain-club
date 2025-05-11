"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Vote, CheckCircle2, Clock, AlertCircle } from "lucide-react"

// Mock proposals data
const mockProposals = [
  {
    id: "PROP-001",
    title: "Fund Blockchain Development Workshop Series",
    description:
      "Allocate 0.5 ETH from the treasury to organize a series of 5 blockchain development workshops for members.",
    status: "active",
    votes: { for: 15, against: 3, abstain: 2 },
    endTime: Date.now() + 172800000, // 2 days from now
    link: "https://snapshot.org/#/proposal/123",
  },
  {
    id: "PROP-002",
    title: "Partner with Computer Science Department",
    description: "Establish an official partnership with the CS department to co-host events and share resources.",
    status: "active",
    votes: { for: 12, against: 5, abstain: 3 },
    endTime: Date.now() + 86400000, // 1 day from now
    link: "https://snapshot.org/#/proposal/124",
  },
  {
    id: "PROP-003",
    title: "Update Club Constitution",
    description: "Amend the club constitution to include new membership tiers and governance procedures.",
    status: "closed",
    votes: { for: 20, against: 2, abstain: 1 },
    endTime: Date.now() - 86400000, // 1 day ago
    link: "https://snapshot.org/#/proposal/125",
    result: "passed",
  },
  {
    id: "PROP-004",
    title: "Add SPX6900 to the Investment Portfolio",
    description: "Proposal to add the SPX6900 index token to the club's investment portfolio as a diversified asset holding.",
    status: "closed",
    votes: { for: 8, against: 12, abstain: 3 },
    endTime: Date.now() - 172800000, // 2 days ago
    link: "https://snapshot.org/#/proposal/126",
    result: "rejected",
  },
]

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState("active")
  // Instead of using wagmi hooks, we'll use a simple state to simulate connection status
  const [isConnected, setIsConnected] = useState(false)

  const activeProposals = mockProposals.filter((p) => p.status === "active")
  const closedProposals = mockProposals.filter((p) => p.status === "closed")

  const handleConnect = () => {
    setIsConnected(true)
  }

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now()
    const diff = endTime - now

    if (diff <= 0) return "Ended"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m remaining`
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Governance</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Participate in the decentralized governance of the Blockchain & Crypto Investing Club.
        </p>
      </div>

      <div className="mb-12 rounded-xl border border-border/40 bg-card p-6">
        <div className="space-y-8">
          <div>
            <h2 className="mb-4 text-2xl font-bold">Officer Roles</h2>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li><strong>President:</strong> Leads the club, oversees all operations, and represents the club externally.</li>
              <li><strong>Vice President:</strong> Assists the president, manages internal affairs, and steps in as acting president when needed.</li>
              <li><strong>Treasurer:</strong> Manages the club treasury, tracks spending, and ensures financial transparency.</li>
              <li><strong>Other Officers:</strong> May include technical leads, education coordinators, and event managers as needed.</li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold">Safe Multi-Sig Wallet</h2>
            <div className="text-muted-foreground mb-2">
              The club's treasury is managed using a Safe multi-signature wallet. This ensures that no single officer can move funds unilaterally—major transactions require approval from multiple officers, providing transparency and security for all club assets.
            </div>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>Funds are only moved with multi-officer approval</li>
              <li>All transactions are visible on-chain</li>
              <li>Supports advanced treasury management and spending proposals</li>
              <li>Learn more: <a href="https://gnosis-safe.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Safe (formerly Gnosis Safe)</a></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold">Voting & Proposals</h2>
            <p className="text-muted-foreground mb-2">
              Our club uses token-based off-chain voting to make important decisions. Your voting power is determined by the type of membership token you hold. Proposals are created by officers and voted on by eligible members. Results are determined by majority vote, with quorum required for passage (see club constitution).
            </p>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li><strong>Observer Tokens:</strong> 0x voting power (can view but not vote)</li>
              <li><strong>Member Tokens:</strong> 1x voting power</li>
              <li><strong>Supporter Tokens:</strong> 3x voting power</li>
              <li><strong>Officer Tokens:</strong> 5x voting power</li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold">Snapshot Governance</h2>
            <p className="text-muted-foreground mb-4">
              We use <a href="https://snapshot.org/#/yourclub.eth" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Snapshot</a> for decentralized, off-chain voting. All proposals and voting results are transparent and verifiable by the community.
            </p>
            <a href="https://snapshot.org/#/yourclub.eth" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full sm:w-auto">
                Visit Snapshot <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Snapshot Demo</h2>
        <p className="mb-4 text-muted-foreground">
          <strong>Demo:</strong> The proposals and voting data below are sample data, showing how real Snapshot governance will appear once integrated.
        </p>
      </div>

      {!isConnected ? (
        <div className="mx-auto max-w-md text-center">
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>You need to connect your wallet to view and participate in governance.</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button onClick={handleConnect}>Connect Wallet</Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div>
          <div className="mb-8 flex justify-end">
            {/* TODO: Only show to officers (role-based gating) */}
            <Button variant="default" disabled>
              Submit Proposal (Officers Only)
            </Button>
          </div>
          <Tabs defaultValue="active" onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="active">Active Proposals</TabsTrigger>
              <TabsTrigger value="closed">Closed Proposals</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeProposals.length > 0 ? (
                <div className="space-y-6">
                  {activeProposals.map((proposal) => (
                    <Card key={proposal.id}>
                      <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <Badge variant="outline" className="mb-2">
                              {proposal.id}
                            </Badge>
                            <CardTitle>{proposal.title}</CardTitle>
                          </div>
                          <Badge className="bg-green-500 hover:bg-green-600">
                            <Clock className="mr-1 h-3 w-3" /> {formatTimeRemaining(proposal.endTime)}
                          </Badge>
                        </div>
                        <CardDescription>{proposal.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">For</span>
                            <span className="text-sm font-medium">{proposal.votes.for} votes</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-green-500"
                              style={{
                                width: `${(proposal.votes.for / (proposal.votes.for + proposal.votes.against + proposal.votes.abstain)) * 100}%`,
                              }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Against</span>
                            <span className="text-sm font-medium">{proposal.votes.against} votes</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-red-500"
                              style={{
                                width: `${(proposal.votes.against / (proposal.votes.for + proposal.votes.against + proposal.votes.abstain)) * 100}%`,
                              }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Abstain</span>
                            <span className="text-sm font-medium">{proposal.votes.abstain} votes</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-yellow-500"
                              style={{
                                width: `${(proposal.votes.abstain / (proposal.votes.for + proposal.votes.against + proposal.votes.abstain)) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <a href={proposal.link} target="_blank" rel="noopener noreferrer" className="w-full">
                          <Button className="w-full">
                            <Vote className="mr-2 h-4 w-4" /> Vote on Snapshot
                          </Button>
                        </a>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Active Proposals</CardTitle>
                    <CardDescription>There are currently no active proposals to vote on.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Check back later or visit our Snapshot space to see when new proposals are created.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="closed">
              {closedProposals.length > 0 ? (
                <div className="space-y-6">
                  {closedProposals.map((proposal) => (
                    <Card key={proposal.id}>
                      <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <Badge variant="outline" className="mb-2">
                              {proposal.id}
                            </Badge>
                            <CardTitle>{proposal.title}</CardTitle>
                          </div>
                          <Badge
                            className={
                              proposal.result === "passed"
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                            }
                          >
                            {proposal.result === "passed" ? (
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                            ) : (
                              <AlertCircle className="mr-1 h-3 w-3" />
                            )}
                            {proposal.result === "passed" ? "Passed" : "Rejected"}
                          </Badge>
                        </div>
                        <CardDescription>{proposal.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">For</span>
                            <span className="text-sm font-medium">{proposal.votes.for} votes</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-green-500"
                              style={{
                                width: `${(proposal.votes.for / (proposal.votes.for + proposal.votes.against + proposal.votes.abstain)) * 100}%`,
                              }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Against</span>
                            <span className="text-sm font-medium">{proposal.votes.against} votes</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-red-500"
                              style={{
                                width: `${(proposal.votes.against / (proposal.votes.for + proposal.votes.against + proposal.votes.abstain)) * 100}%`,
                              }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Abstain</span>
                            <span className="text-sm font-medium">{proposal.votes.abstain} votes</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-yellow-500"
                              style={{
                                width: `${(proposal.votes.abstain / (proposal.votes.for + proposal.votes.against + proposal.votes.abstain)) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <a href={proposal.link} target="_blank" rel="noopener noreferrer" className="w-full">
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="mr-2 h-4 w-4" /> View on Snapshot
                          </Button>
                        </a>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Closed Proposals</CardTitle>
                    <CardDescription>There are no closed proposals to view.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Check the active proposals tab to see current voting opportunities.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
