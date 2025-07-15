"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Vote, 
  Award, 
  Shield, 
  Users, 
  Wallet, 
  ChevronDown,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Lock,
  Zap,
  ArrowRight,
  Play
} from "lucide-react"

export default function GovernancePage() {
  const [showTechDetails, setShowTechDetails] = useState(false)
  const [activeDemo, setActiveDemo] = useState<'traditional' | 'blockchain' | null>(null)

  const runDemo = (type: 'traditional' | 'blockchain') => {
    setActiveDemo(type)
    setTimeout(() => setActiveDemo(null), 3000)
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section - Lead with Benefits */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 py-20 md:py-28">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-36 h-36 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-purple-100 backdrop-blur-sm border border-white/30">
              <Zap className="mr-2 h-4 w-4" />
              Student Government 2.0
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Student Government <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                That Actually Works
              </span>
            </h1>
            
            <p className="mb-8 text-xl text-purple-100 leading-relaxed max-w-3xl mx-auto">
              No more lost paperwork. No more "he said, she said." No more backdoor deals. 
              Every vote counts, every transaction is public, and your membership gives you real power.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                <CheckCircle className="h-5 w-5 mr-2 text-green-300" />
                <span>Every vote is recorded forever</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                <CheckCircle className="h-5 w-5 mr-2 text-green-300" />
                <span>All money moves are transparent</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                <CheckCircle className="h-5 w-5 mr-2 text-green-300" />
                <span>Your membership can't be faked</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        
        {/* Problem/Solution Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Traditional Student Government Sucks</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We've all been there. Every year, same problems. Time to fix this once and for all.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Problems */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center text-red-700">
                  <XCircle className="h-6 w-6 mr-2" />
                  Traditional Student Orgs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 mr-3 mt-1 text-red-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-red-800">Leadership changes, records disappear</div>
                    <div className="text-sm text-red-600">Google Drive gets lost, emails deleted, "Wait, what did we vote on last semester?"</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 mr-3 mt-1 text-red-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-red-800">Financial decisions happen behind closed doors</div>
                    <div className="text-sm text-red-600">"Trust us, we spent the $500 on something important"</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <XCircle className="h-5 w-5 mr-3 mt-1 text-red-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-red-800">Hard to verify who's actually a member</div>
                    <div className="text-sm text-red-600">Spreadsheets, paper lists, "Are you on the roster? I think so..."</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <XCircle className="h-5 w-5 mr-3 mt-1 text-red-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-red-800">Voting is often just for show</div>
                    <div className="text-sm text-red-600">Hand counts, "lost" ballots, decisions already made in group chats</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Solutions */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  Our Blockchain Solution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-1 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-green-800">Permanent, tamper-proof records</div>
                    <div className="text-sm text-green-600">Everything lives on the blockchain forever. No more "oops, we lost the minutes"</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-1 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-green-800">All financial moves are public & delayed 24h</div>
                    <div className="text-sm text-green-600">See every transaction. If something looks fishy, there's time to stop it</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-1 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-green-800">Digital membership cards that can't be faked</div>
                    <div className="text-sm text-green-600">Like a student ID, but it lives on the blockchain and proves your voting rights</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-1 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-green-800">Every member's vote is cryptographically verified</div>
                    <div className="text-sm text-green-600">No fake counts. No lost ballots. Math doesn't lie.</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works - Three Simple Benefits */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Our System Actually Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple pieces that make everything transparent and fair.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Digital Membership */}
            <Card className="relative overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="absolute top-4 right-4">
                <Award className="h-8 w-8 text-blue-400 opacity-50" />
              </div>
              <CardHeader>
                <CardTitle className="text-blue-800">🎫 Your Digital Membership Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 mb-4">
                  Like a student ID, but it lives on the blockchain and can't be lost, stolen, or faked.
                </p>
                <ul className="space-y-2 text-sm text-blue-600">
                  <li>• Proves you're a verified club member</li>
                  <li>• Automatically gives you voting rights</li>
                  <li>• Can't be transferred or sold to others</li>
                  <li>• Works forever, even after graduation</li>
                </ul>
              </CardContent>
            </Card>

            {/* Real Democracy */}
            <Card className="relative overflow-hidden border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="absolute top-4 right-4">
                <Vote className="h-8 w-8 text-purple-400 opacity-50" />
              </div>
              <CardHeader>
                <CardTitle className="text-purple-800">🗳️ Real Democracy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 mb-4">
                  Every member gets 1 vote, officers get 5 votes. All votes are recorded forever.
                </p>
                <ul className="space-y-2 text-sm text-purple-600">
                  <li>• No backroom deals or fake vote counts</li>
                  <li>• Anyone can verify the results</li>
                  <li>• Officers have more influence, but members have power</li>
                  <li>• Voting history is permanent and public</li>
                </ul>
              </CardContent>
            </Card>

            {/* Safe Money */}
            <Card className="relative overflow-hidden border-green-200 bg-gradient-to-br from-green-50 to-green-100">
              <div className="absolute top-4 right-4">
                <Shield className="h-8 w-8 text-green-400 opacity-50" />
              </div>
              <CardHeader>
                <CardTitle className="text-green-800">💰 Safe Money Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 mb-4">
                  All club funds have a 24-hour safety delay and every transaction is public.
                </p>
                <ul className="space-y-2 text-sm text-green-600">
                  <li>• If something suspicious happens, there's time to stop it</li>
                  <li>• Every transaction is visible to all members</li>
                  <li>• No mystery expenses or hidden spending</li>
                  <li>• Multiple people need to approve big purchases</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">See The Difference</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Click the buttons below to see how voting works in traditional orgs vs our blockchain system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Traditional Demo */}
            <Card className="border-red-200">
              <CardHeader className="text-center">
                <CardTitle className="text-red-700">Traditional Organization</CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => runDemo('traditional')}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Play className="h-4 w-4 mr-2" />
                  See How It "Works"
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border transition-all ${
                    activeDemo === 'traditional' ? 'bg-red-100 border-red-300' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="font-medium mb-2">Vote on pizza budget ($200)</div>
                    <div className="text-sm space-y-1">
                      <div>📝 Someone counts by hand...</div>
                      <div className={activeDemo === 'traditional' ? 'animate-pulse' : ''}>
                        ⏳ "Hold on, let me recount..."
                      </div>
                      <div>🤷 "Trust me, pizza won 15-12"</div>
                      <div className="text-red-600 font-medium">❌ No way to verify. No permanent record.</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blockchain Demo */}
            <Card className="border-green-200">
              <CardHeader className="text-center">
                <CardTitle className="text-green-700">Our Blockchain System</CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => runDemo('blockchain')}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Play className="h-4 w-4 mr-2" />
                  See How It Actually Works
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border transition-all ${
                    activeDemo === 'blockchain' ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="font-medium mb-2">Vote on pizza budget ($200)</div>
                    <div className="text-sm space-y-1">
                      <div>🤖 Blockchain counts automatically...</div>
                      <div className={activeDemo === 'blockchain' ? 'animate-pulse' : ''}>
                        ⚡ Instant, verifiable results
                      </div>
                      <div>📊 Anyone can verify: 0x4f2...voted YES, 0x8a1...voted NO</div>
                      <div className="text-green-600 font-medium">✅ Permanent record. Math doesn't lie.</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-16">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-12 border border-purple-200">
            <h2 className="text-3xl font-bold mb-4">Ready to Join the Future?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're building student government that actually serves students. 
              Transparent, fair, and impossible to corrupt.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                <Users className="h-5 w-5 mr-2" />
                Become a Member
              </Button>
              <Button variant="outline" size="lg">
                <Eye className="h-5 w-5 mr-2" />
                View Live Contracts
              </Button>
            </div>
          </div>
        </div>

        {/* Technical Details - Collapsible */}
        <div className="border-t pt-16">
          <Collapsible open={showTechDetails} onOpenChange={setShowTechDetails}>
            <div className="text-center mb-8">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="lg">
                  <Lock className="h-5 w-5 mr-2" />
                  For the Tech-Curious: View Contract Details
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showTechDetails ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent>
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Smart Contract Architecture</h3>
                  <p className="text-muted-foreground">
                    For developers, auditors, and anyone who wants to verify our claims.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="h-5 w-5 mr-2 text-blue-500" />
                        Membership NFTs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        ERC721 tokens that represent club membership. Non-transferable (soulbound).
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Contract
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-purple-500" />
                        Role Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Access control system managing member roles and voting weights.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Contract
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Wallet className="h-5 w-5 mr-2 text-green-500" />
                        Treasury Router
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Secure fund management with time delays and multi-signature requirements.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Contract
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-2">Contract Addresses (Polygon Amoy Testnet)</h4>
                  <div className="space-y-2 text-sm font-mono">
                    <div>Membership: 0x1234...5678</div>
                    <div>Roles: 0xabcd...efgh</div>
                    <div>Treasury: 0x9876...5432</div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}
