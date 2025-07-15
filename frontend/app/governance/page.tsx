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
  Zap
} from "lucide-react"

export default function GovernancePage() {
  const [showTechDetails, setShowTechDetails] = useState(false)

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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 p-8 shadow-lg border border-red-200/50">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-rose-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg">
                  <XCircle className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-gray-900">Traditional Student Orgs</h3>
                <div className="space-y-4">
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
                </div>
              </div>
            </div>

            {/* Solutions */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 p-8 shadow-lg border border-green-200/50">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-gray-900">Our Blockchain Solution</h3>
                <div className="space-y-4">
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
                </div>
              </div>
            </div>
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-8 shadow-lg border border-blue-200/50">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-gray-900">🎫 Your Digital Membership Card</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Like a student ID, but it lives on the blockchain and can't be lost, stolen, or faked.
                </p>
                <ul className="space-y-2 text-sm text-blue-600">
                  <li>• Proves you're a verified club member</li>
                  <li>• Automatically gives you voting rights</li>
                  <li>• Can't be transferred or sold to others</li>
                  <li>• Works forever, even after graduation</li>
                </ul>
              </div>
            </div>

            {/* Real Democracy */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 p-8 shadow-lg border border-purple-200/50">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-violet-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg">
                  <Vote className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-gray-900">🗳️ Real Democracy</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Every member gets 1 vote, officers get 5 votes. All votes are recorded forever.
                </p>
                <ul className="space-y-2 text-sm text-purple-600">
                  <li>• No backroom deals or fake vote counts</li>
                  <li>• Anyone can verify the results</li>
                  <li>• Officers have more influence, but members have power</li>
                  <li>• Voting history is permanent and public</li>
                </ul>
              </div>
            </div>

            {/* Safe Money */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 p-8 shadow-lg border border-green-200/50">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-gray-900">💰 Safe Money Management</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  All club funds have a 24-hour safety delay and every transaction is public.
                </p>
                <ul className="space-y-2 text-sm text-green-600">
                  <li>• If something suspicious happens, there's time to stop it</li>
                  <li>• Every transaction is visible to all members</li>
                  <li>• No mystery expenses or hidden spending</li>
                  <li>• Multiple people need to approve big purchases</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Real Examples */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How This Fixes Real Crypto Club Problems</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Managing money and making investment decisions as a group is hard. Here's how blockchain makes it bulletproof.
            </p>
          </div>

          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Example 1 */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 p-8 shadow-lg border border-orange-200/50">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-amber-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white text-sm font-bold mr-3">
                        �
                      </div>
                      Last Year: Investment Club Disaster
                    </h3>
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      "We voted to invest $2,000 in ETH when it was $1,800. The treasurer said he'd handle it, 
                      but never bought. When ETH hit $4,000, he claimed we 'never actually voted' on it."
                    </p>
                    <div className="text-sm text-red-600">
                      ❌ No record of investment decisions <br />
                      ❌ Treasurer had unilateral control <br />
                      ❌ Club missed 120% gains
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-bold mr-3">
                        ⛓️
                      </div>
                      With Our System:
                    </h3>
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      Every investment vote is recorded on-chain with timestamps. 
                      Smart contracts automatically execute approved trades—no single person can block decisions.
                    </p>
                    <div className="text-sm text-green-600">
                      ✅ Permanent record of all investment votes <br />
                      ✅ Automated execution of approved trades <br />
                      ✅ No single point of failure
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Example 2 */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-100 p-8 shadow-lg border border-blue-200/50">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-sm font-bold mr-3">
                        💰
                      </div>
                      This Semester: Fund Transparency Issues
                    </h3>
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      "The finance officer kept saying our portfolio was 'doing great' but wouldn't show us the actual 
                      numbers. Turns out he'd lost 40% on risky altcoins without telling anyone."
                    </p>
                    <div className="text-sm text-red-600">
                      ❌ Hidden portfolio performance <br />
                      ❌ Unauthorized risky investments <br />
                      ❌ No real-time transparency
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-bold mr-3">
                        ⛓️
                      </div>
                      With Our System:
                    </h3>
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      All wallet transactions are public and verifiable. 
                      Members can see every trade, every balance, every profit/loss in real-time.
                    </p>
                    <div className="text-sm text-green-600">
                      ✅ Real-time portfolio visibility <br />
                      ✅ Every transaction is public <br />
                      ✅ No hidden trades or losses
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Example 3 */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 p-8 shadow-lg border border-purple-200/50">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-violet-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 text-white text-sm font-bold mr-3">
                        🎓
                      </div>
                      Last Month: Membership Chaos
                    </h3>
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      "Random people kept showing up claiming they paid dues to join our premium crypto research group. 
                      Our Excel sheet was a mess—we couldn't tell who actually paid the $50 membership fee."
                    </p>
                    <div className="text-sm text-red-600">
                      ❌ No reliable membership verification <br />
                      ❌ People claiming unpaid access <br />
                      ❌ Excel sheet chaos
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-bold mr-3">
                        ⛓️
                      </div>
                      With Our System:
                    </h3>
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      NFT membership cards prove payment and access rights. 
                      Only verified members can vote on investments or access premium research.
                    </p>
                    <div className="text-sm text-green-600">
                      ✅ Cryptographic proof of membership <br />
                      ✅ Automatic access control <br />
                      ✅ No fake membership claims
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
