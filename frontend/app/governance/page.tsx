"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  ExternalLink, 
  Vote, 
  Shield, 
  Users, 
  Wallet, 
  Crown, 
  Key, 
  Award, 
  User,
  ChevronDown,
  GitBranch,
  Timer,
  Code,
  Github,
  ArrowDown,
  ArrowRight,
  FileText,
  Settings
} from "lucide-react"
import { contracts } from "@/lib/contracts"

export default function GovernancePage() {
  const [expandedContract, setExpandedContract] = useState<string | null>(null)
  const [contractAddresses, setContractAddresses] = useState({
    membership: "",
    roles: "",
    treasury: ""
  })

  useEffect(() => {
    // Get contract addresses from the single source of truth
    setContractAddresses({
      membership: contracts.membership.address,
      roles: contracts.roles.address,
      treasury: contracts.treasury.address,
    })
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 py-20 md:py-28">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-36 h-36 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Floating Badge */}
            <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-emerald-100 backdrop-blur-sm border border-white/30">
              <Vote className="mr-2 h-4 w-4" />
              Governance & Operations
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              How Our Club Actually Works
            </h1>
            
            <p className="mb-8 text-xl text-emerald-100 leading-relaxed">
              Explore our transparent governance structure, smart contract architecture, and decentralized operations. 
              Everything is on-chain, auditable, and designed for maximum transparency.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
      {/* Smart Contract Architecture Overview with Enhanced Design */}
      <div className="mb-16">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-800">
            <GitBranch className="mr-2 h-4 w-4" />
            Contract Architecture
          </div>
          <h2 className="mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">Our Live Three-Contract System</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            ⚡ <strong>Live on Polygon Amoy testnet.</strong> These contracts manage membership NFTs, role permissions, and secure fund transfers.
          </p>
        </div>

        {/* Enhanced Contract Architecture Diagram */}
        <div className="mb-8 rounded-2xl border border-border/40 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg">
          <div className="flex flex-col items-center justify-center space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
            {/* Roles Contract */}
            <div className="flex flex-col items-center group">
              <div className="mb-3 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 p-6 shadow-lg transition-all group-hover:scale-110">
                <Key className="h-10 w-10 text-white" />
              </div>
              <span className="text-sm font-semibold">🔑 Roles.sol</span>
              <span className="text-xs text-muted-foreground">Permission Hub</span>
            </div>

            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-orange-400" />
              <span className="text-xs text-muted-foreground bg-orange-50 px-2 py-1 rounded-full">manages</span>
              <ArrowRight className="h-4 w-4 text-orange-400" />
            </div>

            {/* Membership NFT */}
            <div className="flex flex-col items-center group">
              <div className="mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 shadow-lg transition-all group-hover:scale-110">
                <Award className="h-10 w-10 text-white" />
              </div>
              <span className="text-sm font-semibold">🎫 BlockchainClubMembership.sol</span>
              <span className="text-xs text-muted-foreground">Soulbound NFTs</span>
            </div>

            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-muted-foreground bg-blue-50 px-2 py-1 rounded-full">uses roles</span>
              <ArrowRight className="h-4 w-4 text-blue-400" />
            </div>

            {/* Treasury Router */}
            <div className="flex flex-col items-center group">
              <div className="mb-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 shadow-lg transition-all group-hover:scale-110">
                <Wallet className="h-10 w-10 text-white" />
              </div>
              <span className="text-sm font-semibold">💰 TreasuryRouter.sol</span>
              <span className="text-xs text-muted-foreground">24h Escrow Security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Organizational Roles Hierarchy */}
      <div className="mb-16">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-800">
            <Users className="mr-2 h-4 w-4" />
            Governance Structure
          </div>
          <h2 className="mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">Who Can Do What?</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground leading-relaxed">
            ⚖️ <strong>Power to the people.</strong> Our governance structure is designed to balance security with efficient operations. Here&apos;s how responsibilities are distributed.
          </p>
        </div>

        {/* Role Hierarchy Tree */}
        <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg">
          <div className="flex flex-col items-center space-y-8">
            {/* Owner */}
            <div className="flex flex-col items-center group">
              <div className="mb-3 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-6 shadow-lg transition-all group-hover:scale-110">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <span className="text-lg font-bold">Owner (Multisig)</span>
              <span className="text-sm text-muted-foreground text-center max-w-xs">Can upgrade contracts and pause membership in emergencies</span>
            </div>

            <div className="flex items-center">
              <ArrowDown className="h-8 w-8 text-red-400" />
            </div>

            {/* Admin */}
            <div className="flex flex-col items-center group">
              <div className="mb-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-6 shadow-lg transition-all group-hover:scale-110">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <span className="text-lg font-bold">Admin (Can be Multisig)</span>
              <span className="text-sm text-muted-foreground text-center max-w-xs">Manages roles, treasury addresses, and emergency functions</span>
            </div>

            <div className="flex items-center">
              <ArrowDown className="h-8 w-8 text-orange-400" />
            </div>

            {/* Officers - Multiple Roles */}
            <div className="flex flex-col items-center space-y-6 lg:space-y-0 lg:flex-row lg:space-x-12 lg:justify-center">
              {/* Contract Officer */}
              <div className="flex flex-col items-center group">
                <div className="mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 shadow-lg transition-all group-hover:scale-110">
                  <Key className="h-10 w-10 text-white" />
                </div>
                <span className="text-lg font-bold">Contract Officer</span>
                <span className="text-sm text-muted-foreground text-center max-w-xs">Can issue and revoke memberships, manage the whitelist</span>
              </div>

              {/* Chief Trading Officer */}
              <div className="flex flex-col items-center group">
                <div className="mb-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-6 shadow-lg transition-all group-hover:scale-110">
                  <Award className="h-10 w-10 text-white" />
                </div>
                <span className="text-lg font-bold">Chief Trading Officer</span>
                <span className="text-sm text-muted-foreground text-center max-w-xs">Oversees trading activities and investment strategies</span>
              </div>

              {/* Support Officer */}
              <div className="flex flex-col items-center group">
                <div className="mb-3 rounded-2xl bg-gradient-to-br from-teal-500 to-green-600 p-6 shadow-lg transition-all group-hover:scale-110">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <span className="text-lg font-bold">Support Officer</span>
                <span className="text-sm text-muted-foreground text-center max-w-xs">Provides various operational and community support</span>
              </div>
            </div>

            <div className="flex items-center">
              <ArrowDown className="h-8 w-8 text-blue-400" />
            </div>

            {/* Member */}
            <div className="flex flex-col items-center group">
              <div className="mb-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 shadow-lg transition-all group-hover:scale-110">
                <User className="h-10 w-10 text-white" />
              </div>
              <span className="text-lg font-bold">Member</span>
              <span className="text-sm text-muted-foreground text-center max-w-xs">Holds membership NFT and participates in club activities</span>
            </div>
          </div>
        </div>
      </div>



      {/* Treasury Flow */}
      <div className="mb-16">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800">
            <Wallet className="mr-2 h-4 w-4" />
            Treasury Security
          </div>
          <h2 className="mb-4 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">How We Protect Club Money</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground leading-relaxed">
            🏖️ <strong>Why the rush?</strong> If someone sends money to our club, we don&apos;t want it instantly accessible if there&apos;s a hack. 
            The 24-hour window lets admins react to suspicious activity before funds reach the main treasury.
          </p>
        </div>

        <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg">
          <div className="flex flex-col items-center space-y-8">
            {/* Someone sends money */}
            <div className="flex flex-col items-center group">
              <div className="mb-3 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 p-6 shadow-lg transition-all group-hover:scale-110">
                <User className="h-10 w-10 text-white" />
              </div>
              <span className="text-lg font-medium">Someone sends money to the club</span>
              <span className="text-sm text-muted-foreground">Could be dues, donations, etc.</span>
            </div>

            <div className="flex items-center">
              <ArrowDown className="h-8 w-8 text-purple-400" />
            </div>

            {/* Money goes to safety */}
            <div className="flex flex-col items-center group">
              <div className="mb-3 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 p-6 shadow-lg transition-all group-hover:scale-110">
                <Timer className="h-10 w-10 text-white" />
              </div>
              <span className="text-lg font-medium">Money holds in security buffer for 24 hours</span>
              <Badge variant="outline" className="mt-2 border-yellow-200 bg-yellow-50 text-yellow-800">🛡️ Hardcoded Protection</Badge>
            </div>

            <div className="flex items-center">
              <ArrowDown className="h-8 w-8 text-yellow-400" />
            </div>

            {/* After 24h, anyone can trigger */}
            <div className="flex flex-col items-center group">
              <div className="mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 shadow-lg transition-all group-hover:scale-110">
                <Users className="h-10 w-10 text-white" />
              </div>
              <span className="text-lg font-medium">After 24 hours, anyone can trigger release</span>
              <span className="text-sm text-muted-foreground">Trustless execution - no admin bottleneck</span>
            </div>

            <div className="flex items-center">
              <ArrowDown className="h-8 w-8 text-blue-400" />
            </div>

            {/* Funds go to real treasury */}
            <div className="flex flex-col items-center group">
              <div className="mb-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 shadow-lg transition-all group-hover:scale-110">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <span className="text-lg font-medium">Money moves to our main treasury</span>
              <span className="text-sm text-muted-foreground">Now officers can use it for club expenses</span>
            </div>
            {/* Powered by Safe - contextually relevant to treasury */}
            <div className="mt-6 flex justify-center">
              <a
                href="https://gnosis-safe.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-100 px-6 py-3 shadow-md hover:shadow-lg transition-all group"
              >
                <Shield className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-orange-800">Powered by Safe</span>
                <ExternalLink className="h-4 w-4 text-orange-500 group-hover:text-orange-700" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Contract Source Code */}
      <div className="mb-16">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800">
            <Code className="mr-2 h-4 w-4" />
            Source Code & Verification
          </div>
          <h2 className="mb-4 bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">Smart Contract Source & Addresses</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground leading-relaxed">
            📜 <strong>Don&apos;t trust, verify.</strong> View our contract code, verify deployments on the blockchain, and audit the system yourself.
          </p>
        </div>

        <div className="space-y-6">
          {/* Membership Contract */}
          <Card className="border-border/40 bg-gradient-to-br from-white to-gray-50 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 p-3 shadow-md">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">BlockchainClubMembership.sol</CardTitle>
                    <CardDescription className="text-base">ERC721 NFT with Soulbound mechanics</CardDescription>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Proxy</Badge>
                        <span className="font-mono text-muted-foreground text-xs">{contractAddresses.membership}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50" asChild>
                    <a href={`https://amoy.polygonscan.com/address/${contractAddresses.membership}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-4 w-4" />
                      PolygonScan
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50" asChild>
                    <a href="https://github.com/blockchain-club/contracts" target="_blank" rel="noopener noreferrer">
                      <Github className="mr-1 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <Collapsible open={expandedContract === "membership"} onOpenChange={() => 
              setExpandedContract(expandedContract === "membership" ? null : "membership")
            }>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between hover:bg-blue-50/50">
                  <span className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Key Features
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedContract === "membership" ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Multiple Token Types</p>
                        <p className="text-xs text-muted-foreground">Create different membership tiers, event badges, and rewards</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Soulbound Protection</p>
                        <p className="text-xs text-muted-foreground">Memberships can&apos;t be sold or transferred</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Auto Role Assignment</p>
                        <p className="text-xs text-muted-foreground">Getting an NFT automatically grants membership permissions</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Roles Contract */}
          <Card className="border-border/40 bg-gradient-to-br from-white to-gray-50 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 p-3 shadow-md">
                    <Key className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Roles.sol</CardTitle>
                    <CardDescription className="text-base">Access Control with Voting Power</CardDescription>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Proxy</Badge>
                        <span className="font-mono text-muted-foreground text-xs">{contractAddresses.roles}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="border-yellow-200 hover:bg-yellow-50" asChild>
                    <a href={`https://amoy.polygonscan.com/address/${contractAddresses.roles}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-4 w-4" />
                      PolygonScan
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50" asChild>
                    <a href="https://github.com/blockchain-club/contracts" target="_blank" rel="noopener noreferrer">
                      <Github className="mr-1 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <Collapsible open={expandedContract === "roles"} onOpenChange={() => 
              setExpandedContract(expandedContract === "roles" ? null : "roles")
            }>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between hover:bg-yellow-50/50">
                  <span className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Key Features
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedContract === "roles" ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Hierarchical Permissions</p>
                        <p className="text-xs text-muted-foreground">Owner {`>`} Admin {`>`} Officer {`>`} Member role structure</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Voting Power System</p>
                        <p className="text-xs text-muted-foreground">Different roles get different voting weights for governance</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Emergency Controls</p>
                        <p className="text-xs text-muted-foreground">Admins can pause operations and revoke roles if needed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Treasury Router Contract */}
          <Card className="border-border/40 bg-gradient-to-br from-white to-gray-50 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-3 shadow-md">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">TreasuryRouter.sol</CardTitle>
                    <CardDescription className="text-base">Time-locked Escrow Management</CardDescription>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Proxy</Badge>
                        <span className="font-mono text-muted-foreground text-xs">{contractAddresses.treasury}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50" asChild>
                    <a href={`https://amoy.polygonscan.com/address/${contractAddresses.treasury}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-4 w-4" />
                      PolygonScan
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50" asChild>
                    <a href="https://github.com/blockchain-club/contracts" target="_blank" rel="noopener noreferrer">
                      <Github className="mr-1 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <Collapsible open={expandedContract === "treasury"} onOpenChange={() => 
              setExpandedContract(expandedContract === "treasury" ? null : "treasury")
            }>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between hover:bg-green-50/50">
                  <span className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Key Features
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedContract === "treasury" ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">24-Hour Security Buffer</p>
                        <p className="text-xs text-muted-foreground">All incoming funds are held for 24 hours before release</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Trustless Execution</p>
                        <p className="text-xs text-muted-foreground">After 24 hours, anyone can trigger fund release automatically</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Emergency Withdrawal</p>
                        <p className="text-xs text-muted-foreground">Admins can emergency-withdraw funds during security incidents</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="text-center">
        <div className="mb-6 inline-flex items-center rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-800">
          <Settings className="mr-2 h-4 w-4" />
          Community Resources
        </div>
        <h2 className="mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent lg:text-3xl">Learn More & Get Involved</h2>
        <p className="mb-8 mx-auto max-w-2xl text-muted-foreground leading-relaxed">
          Ready to dive deeper? Here are some resources to help you understand our system better or get involved in the community.
        </p>
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          <div className="group">
            <Button variant="outline" className="h-auto p-6 flex-col border-border/40 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-all group-hover:scale-105" asChild>
              <a href="/whitepaper" className="space-y-3">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 p-3 shadow-md">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Technical Whitepaper</div>
                  <div className="text-sm text-muted-foreground">Deep dive into our architecture</div>
                </div>
              </a>
            </Button>
          </div>
          <div className="group">
            <Button variant="outline" className="h-auto p-6 flex-col border-border/40 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-all group-hover:scale-105" asChild>
              <a href="https://github.com/blockchain-club/contracts" target="_blank" rel="noopener noreferrer" className="space-y-3">
                <div className="rounded-xl bg-gradient-to-br from-gray-700 to-slate-800 p-3 shadow-md">
                  <Github className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Source Code</div>
                  <div className="text-sm text-muted-foreground">View our contracts on GitHub</div>
                </div>
              </a>
            </Button>
          </div>
          <div className="group">
            <Button variant="outline" className="h-auto p-6 flex-col border-border/40 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-all group-hover:scale-105" asChild>
              <a href="https://snapshot.org/#/blockchain-club.eth" target="_blank" rel="noopener noreferrer" className="space-y-3">
                <div className="rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 p-3 shadow-md">
                  <Vote className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Governance</div>
                  <div className="text-sm text-muted-foreground">Participate in club decisions</div>
                </div>
              </a>
            </Button>
          </div>
        </div>
      </div>

      </div>
    </div>
  )
}
