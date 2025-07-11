"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, Users, Crown, Star, Lock, Calendar, FileText, Zap, X, Play, Smile, ZoomIn, Clock, MapPin, Pizza, Mic, BookOpen } from "lucide-react"
import { useAccount } from "wagmi"
import { TerminalLoader } from "@/components/terminal-loader"
import { useMembershipVerification } from "@/hooks/use-membership-verification"
import { useMyTokens } from "@/hooks/use-mytokens"
import { MockRealtimeChat } from "@/components/mock-realtime-chat"
import { YouTubeEmbed } from "@/components/youtube-embed"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function MembersLoungeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showLoader, setShowLoader] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [selectedMeme, setSelectedMeme] = useState<{src: string, title: string, description?: string} | null>(null)
  
  // Check if user came through the secret entrance
  const hasSecretKey = searchParams.get('key') === 'authorized'
  
  // Get wallet info
  const { address } = useAccount()
  
  // Verify membership status
  const { isMember, isLoading, membershipTier } = useMembershipVerification()
  
  // Get token data
  const { tokens } = useMyTokens(address)

  // Memes data
  const memes = [
    {
      src: "/meme/explaining-bitcoin.jpg",
      title: "Explaining Bitcoin",
      description: "When you try to explain Bitcoin to your family at dinner"
    },
    {
      src: "/meme/6-(1).jpg",
      title: "Classic Crypto Meme",
      description: "The eternal struggle of crypto investors"
    },
    {
      src: "/meme/3.gif",
      title: "HODL Strong",
      description: "Me watching my portfolio during a bull run"
    },
    {
      src: "/meme/havent-seen-this-meme-in-a-very-long-time-a-week-or-so-too-v0-wbdxtjodtame1.webp",
      title: "Timeless Classic",
      description: "Some memes never get old... unlike crypto prices"
    }
  ]

  // Handle terminal completion
  const handleTerminalComplete = () => {
    setShowLoader(false)
    
    // Always check membership after loader completes
    // This creates the effect of the terminal "crashing" into access denied
    if (!isLoading && !isMember) {
      setAccessDenied(true)
    }
  }

  useEffect(() => {
    // If user didn't come through secret entrance, redirect to 404
    if (!hasSecretKey) {
      router.push('/404')
      return
    }
  }, [hasSecretKey, router])

  // Show terminal loader
  if (showLoader) {
    // Check if user should fail authentication
    const shouldFail = !isLoading && !isMember
    
    return (
      <TerminalLoader 
        onComplete={handleTerminalComplete}
        membershipTier={membershipTier || undefined}
        nftBalance={tokens.length}
        walletAddress={address}
        shouldFailAuth={shouldFail}
      />
    )
  }

  // Show access denied if not a member
  if (accessDenied || (!isLoading && !isMember)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-red-500/10 rounded-full filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-40 right-40 w-40 h-40 bg-red-500/10 rounded-full filter blur-xl animate-pulse delay-1000"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center relative z-10 max-w-md mx-auto p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30"
          >
            <Lock className="w-12 h-12 text-red-400" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-red-400 mb-4"
          >
            ACCESS DENIED
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <p className="text-gray-300 text-lg mb-2">🔒 Club Membership Required</p>
            <p className="text-gray-500 text-sm leading-relaxed">
              This exclusive area is reserved for verified blockchain club members. 
              Please ensure you hold a valid membership NFT to access the lounge.
            </p>
          </motion.div>
          
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={() => router.push('/')}
            className="mt-8 px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Return to Homepage
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/10 rounded-full filter blur-xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-40 h-40 bg-purple-500/10 rounded-full filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-40 w-36 h-36 bg-blue-500/10 rounded-full filter blur-xl animate-pulse delay-2000"></div>
        <div className="absolute top-40 right-60 w-28 h-28 bg-yellow-500/10 rounded-full filter blur-xl animate-pulse delay-3000"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Enhanced Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 py-20 md:py-28">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-36 h-36 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Floating Badge */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-purple-100 backdrop-blur-sm border border-white/30"
            >
              <Shield className="mr-2 h-4 w-4" />
              Members Only Area
              <div className="ml-2 w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              ✨ Members Lounge
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mb-8 text-xl text-purple-100 leading-relaxed"
            >
              Welcome to the exclusive members area. Access to premium resources, private discussions, and insider insights reserved for verified club members.
            </motion.p>

            {membershipTier && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mb-6 inline-flex items-center rounded-full bg-white/20 px-6 py-3 text-sm font-medium text-purple-100 backdrop-blur-sm border border-white/30"
              >
                <Crown className="mr-2 h-4 w-4 text-yellow-300" />
                {membershipTier} Member • VIP Access
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container relative mx-auto px-4 py-16 z-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Live Member Chat */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-2 lg:col-span-3 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-green-400/20 rounded-lg mr-4">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Live Member Chat</h3>
                <p className="text-gray-400 text-sm">Connect with fellow members in real-time</p>
              </div>
              <div className="ml-auto flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-green-400 text-sm font-medium">Live</span>
              </div>
            </div>
            
            <div className="h-96 bg-gray-900/70 rounded-lg border border-gray-700/50 backdrop-blur-sm">
              <MockRealtimeChat />
            </div>
          </motion.div>

          {/* Meme Center */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6 hover:border-orange-400/50 transition-all duration-300"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-orange-400/20 rounded-lg mr-4">
                <Smile className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">🚀 Meme Center</h3>
                <p className="text-gray-400 text-sm">The best crypto memes and entertainment for our members</p>
              </div>
              <div className="ml-auto flex items-center">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-orange-400 text-sm font-medium">Fresh Memes</span>
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Featured Video */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <Play className="w-5 h-5 mr-2 text-orange-400" />
                  Featured Meme Video
                </h4>
                <YouTubeEmbed 
                  videoId="0V5SfMcTY5E"
                  title="Epic Crypto Meme Video"
                  className="rounded-lg overflow-hidden"
                />
              </div>

              {/* Meme Gallery */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <Star className="w-5 h-5 mr-2 text-orange-400" />
                  Fresh Memes Gallery
                </h4>
                
                {/* Meme Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {memes.map((meme, index) => (
                    <div 
                      key={index}
                      className="bg-gray-900/70 rounded-lg p-3 border border-gray-700/50 hover:border-orange-500/50 transition-all cursor-pointer group"
                      onClick={() => setSelectedMeme(meme)}
                    >
                      <div className="relative overflow-hidden rounded">
                        <img 
                          src={meme.src} 
                          alt={meme.title} 
                          className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 rounded-full p-2">
                            <ZoomIn className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                      <p className="text-white text-xs font-semibold mt-2 group-hover:text-orange-400 transition-colors">{meme.title}</p>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 text-sm">
                    Upload Meme
                  </button>
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 text-sm">
                    Vote & Rate
                  </button>
                </div>
              </div>
            </div>

            {/* Meme Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-gray-900/30 rounded-lg p-3 text-center">
                <div className="text-orange-400 font-bold text-lg">42</div>
                <div className="text-gray-400 text-xs">Memes This Week</div>
              </div>
              <div className="bg-gray-900/30 rounded-lg p-3 text-center">
                <div className="text-orange-400 font-bold text-lg">1,337</div>
                <div className="text-gray-400 text-xs">Total Laughs</div>
              </div>
              <div className="bg-gray-900/30 rounded-lg p-3 text-center">
                <div className="text-orange-400 font-bold text-lg">🚀</div>
                <div className="text-gray-400 text-xs">To The Moon!</div>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-400/20 rounded-lg mr-4">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">🗓️ Upcoming Events</h3>
                <p className="text-gray-400 text-sm">Don't miss out on exclusive member experiences</p>
              </div>
              <div className="ml-auto flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-blue-400 text-sm font-medium">5 Events</span>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Featured Events */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <Star className="w-5 h-5 mr-2 text-blue-400" />
                  This Week's Highlights
                </h4>
                
                {/* Event 1 */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer group">
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-500/20 p-2 rounded-lg">
                      <Pizza className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-white font-semibold group-hover:text-blue-400 transition-colors">Virtual Pizza Party & Trading Stories</h5>
                      <p className="text-gray-400 text-sm mt-1">Share your best (and worst) trading stories while we eat pizza together on Zoom!</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Tomorrow 7PM EST
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          Zoom Room A
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer group">
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                      <Mic className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-white font-semibold group-hover:text-blue-400 transition-colors">Dr. Bonaparte's Bitcoin Keynote</h5>
                      <p className="text-gray-400 text-sm mt-1">"The Future of Decentralized Finance" - An exclusive talk by our guest speaker</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Friday 2PM EST
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          Main Auditorium
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Calendar & Quick Actions */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                  Coming Soon
                </h4>
                
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm font-medium">🎮 Game Night</span>
                      <span className="text-gray-400 text-xs">Next Monday</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm font-medium">📈 Market Analysis Workshop</span>
                      <span className="text-gray-400 text-xs">Next Wed</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm font-medium">🍻 Happy Hour Meetup</span>
                      <span className="text-gray-400 text-xs">Next Fri</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm font-medium">🎯 DAO Governance Vote</span>
                      <span className="text-gray-400 text-xs">Next Sun</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 text-sm">
                    RSVP Event
                  </button>
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 text-sm">
                    Full Calendar
                  </button>
                </div>
              </div>
            </div>

            {/* Event Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-gray-900/30 rounded-lg p-3 text-center">
                <div className="text-blue-400 font-bold text-lg">12</div>
                <div className="text-gray-400 text-xs">Events This Month</div>
              </div>
              <div className="bg-gray-900/30 rounded-lg p-3 text-center">
                <div className="text-blue-400 font-bold text-lg">89%</div>
                <div className="text-gray-400 text-xs">Attendance Rate</div>
              </div>
              <div className="bg-gray-900/30 rounded-lg p-3 text-center">
                <div className="text-blue-400 font-bold text-lg">🎉</div>
                <div className="text-gray-400 text-xs">Good Vibes Only</div>
              </div>
            </div>
          </motion.div>

          {/* Member Directory */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-400/20 rounded-lg mr-4 group-hover:bg-purple-400/30 transition-colors">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Member Directory</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Browse member profiles with bios, roles, and contact info. Connect with other members and discover shared interests.
            </p>
            <button className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-violet-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              View Directory
            </button>
          </motion.div>

          {/* Announcements */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-yellow-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10 hover:-translate-y-1"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-yellow-400/20 rounded-lg mr-4 group-hover:bg-yellow-400/30 transition-colors">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Announcements</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Important updates from club leadership including new projects, deadlines, policy changes, and official notices.
            </p>
            <button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              View Announcements
            </button>
          </motion.div>

          {/* Member Resources */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-indigo-400/20 rounded-lg mr-4 group-hover:bg-indigo-400/30 transition-colors">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Member Resources</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Access shared files, guides, meeting recordings, project docs, and reference materials exclusive to club members.
            </p>
            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              Browse Resources
            </button>
          </motion.div>

          {/* Photo Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-pink-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-pink-400/20 rounded-lg mr-4 group-hover:bg-pink-400/30 transition-colors">
                <Crown className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Photo Gallery</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Event highlights, member spotlights, throwback photos, and club culture moments. Share memories and celebrate together!
            </p>
            <button className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 rounded-lg font-semibold hover:from-pink-700 hover:to-rose-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              View Gallery
            </button>
          </motion.div>

          {/* Suggest Events & Polls */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-amber-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-amber-400/20 rounded-lg mr-4 group-hover:bg-amber-400/30 transition-colors">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Suggest & Vote</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Propose new events, activities, or club improvements. Vote on member suggestions and help shape our community's future.
            </p>
            <button className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-yellow-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              Share Ideas
            </button>
          </motion.div>

          {/* Recognition Corner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gold-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10 hover:-translate-y-1"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-yellow-400/20 rounded-lg mr-4 group-hover:bg-yellow-400/30 transition-colors">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Recognition Corner</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Celebrate achievements! Shoutouts for outstanding contributions, member spotlights, and appreciation for a job well done.
            </p>
            <button className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-yellow-700 hover:to-amber-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              View Recognition
            </button>
          </motion.div>
        </div>

        {/* New Member Welcome (Full Width) */}
        <div className="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="group bg-gradient-to-br from-emerald-900/20 to-teal-900/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-8 hover:border-emerald-400/50 hover:bg-emerald-900/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-emerald-400/20 rounded-lg mr-6 group-hover:bg-emerald-400/30 transition-colors">
                <Users className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">New Member Welcome</h3>
                <p className="text-emerald-200 text-lg">Join the community and start your blockchain journey!</p>
              </div>
            </div>
            <div className="text-center max-w-4xl mx-auto">
              <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                Welcome to our exclusive members' area! This is your introduction space to say hello, get oriented, and connect with existing members. Whether you're new to blockchain or a seasoned veteran, this community is here to support your journey. Start by introducing yourself, exploring our resources, and joining the conversation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                  Get Started
                </button>
                <button className="bg-transparent border-2 border-emerald-500 text-emerald-400 py-4 px-8 rounded-lg font-semibold hover:bg-emerald-500 hover:text-white transition-all transform hover:scale-105">
                  Member Guide
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* New Expanded Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Expanded Community Hub</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Resource Library Expansion */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-400/20 rounded-lg mr-4 group-hover:bg-blue-400/30 transition-colors">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Resource Library+</h3>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Curated books, podcasts, videos, and courses. Member recommendations, reading lists, and study groups.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">📚 Books</span>
                  <span className="text-blue-400">47 titles</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">🎧 Podcasts</span>
                  <span className="text-blue-400">23 episodes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">🎥 Videos</span>
                  <span className="text-blue-400">15 courses</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                Browse Library
              </button>
            </motion.div>

            {/* Club Achievements Board */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-400/20 rounded-lg mr-4 group-hover:bg-purple-400/30 transition-colors">
                  <Star className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Achievement Board</h3>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Track hackathon wins, competition placements, press mentions, certifications, and club milestones.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-yellow-400 mr-2">🏆</span>
                  <span className="text-gray-300">ETH Denver 2024 - 2nd Place</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-green-400 mr-2">📰</span>
                  <span className="text-gray-300">Featured in TechCrunch</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-blue-400 mr-2">🎓</span>
                  <span className="text-gray-300">25 Members Certified</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                View Achievements
              </button>
            </motion.div>

            {/* Help Needed Thread */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-orange-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-orange-400/20 rounded-lg mr-4 group-hover:bg-orange-400/30 transition-colors">
                  <Users className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Help Needed</h3>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Volunteer requests, project collaboration, skill exchanges, and peer feedback opportunities.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between bg-gray-700/30 p-2 rounded text-sm">
                  <span className="text-gray-300">🔧 Smart Contract Review</span>
                  <span className="text-orange-400">2 volunteers</span>
                </div>
                <div className="flex items-center justify-between bg-gray-700/30 p-2 rounded text-sm">
                  <span className="text-gray-300">🎨 UI/UX Design Help</span>
                  <span className="text-orange-400">1 volunteer</span>
                </div>
                <div className="flex items-center justify-between bg-gray-700/30 p-2 rounded text-sm">
                  <span className="text-gray-300">📝 Documentation Writer</span>
                  <span className="text-orange-400">Open</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                Offer Help
              </button>
            </motion.div>

            {/* Wellness & Support Corner */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-teal-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-teal-400/20 rounded-lg mr-4 group-hover:bg-teal-400/30 transition-colors">
                  <Shield className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Wellness Corner</h3>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Mental health resources, stress management tips, work-life balance discussions, and peer support.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-green-400 mr-2">🧘</span>
                  <span className="text-gray-300">Weekly Meditation Sessions</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-blue-400 mr-2">💡</span>
                  <span className="text-gray-300">Burnout Prevention Tips</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-purple-400 mr-2">🤝</span>
                  <span className="text-gray-300">Anonymous Support Chat</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                Get Support
              </button>
            </motion.div>

            {/* Birthday & Milestones */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-pink-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-pink-400/20 rounded-lg mr-4 group-hover:bg-pink-400/30 transition-colors">
                  <Calendar className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Celebrations</h3>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Birthday shoutouts, life milestones, graduations, job announcements, and personal achievements.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-yellow-400 mr-2">🎂</span>
                  <span className="text-gray-300">Alex's Birthday Tomorrow!</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-green-400 mr-2">🎓</span>
                  <span className="text-gray-300">Sarah graduated MIT!</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-blue-400 mr-2">💼</span>
                  <span className="text-gray-300">Mike joined Google!</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 rounded-lg font-semibold hover:from-pink-700 hover:to-rose-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                Share News
              </button>
            </motion.div>

            {/* Learning & Skill Exchange */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-400/20 rounded-lg mr-4 group-hover:bg-purple-400/30 transition-colors">
                  <BookOpen className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Learning Hub</h3>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Share knowledge, teach skills, and learn from fellow members. From coding to trading strategies.
              </p>
              <div className="space-y-2 mb-4">
                <div className="bg-gray-700/30 p-2 rounded text-sm">
                  <span className="text-purple-400">� Current:</span>
                  <span className="text-gray-300 ml-2">Smart Contract Security</span>
                </div>
                <div className="bg-gray-700/30 p-2 rounded text-sm">
                  <span className="text-blue-400">🎯 Next Session:</span>
                  <span className="text-gray-300 ml-2">DeFi Yield Strategies</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                Join Session
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Access Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.7 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Quick Access</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
            {[
              { icon: "🔒", title: "Anonymous Suggestions", desc: "Submit ideas confidentially" },
              { icon: "🔔", title: "Push Notifications", desc: "Stay updated on everything" },
              { icon: "📱", title: "Mobile App", desc: "Access on the go" },
              { icon: "🎯", title: "Quick Polls", desc: "Voice your opinion fast" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800/20 backdrop-blur-sm p-4 rounded-lg border border-gray-700/30 hover:border-gray-500/50 transition-all cursor-pointer"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16 p-8 bg-gray-800/20 backdrop-blur-sm rounded-xl border border-gray-700/30"
        >
          <p className="text-gray-300 text-lg mb-2">
            🤫 What happens in the members lounge, stays in the members lounge
          </p>
          <p className="text-gray-500 text-sm">
            Enjoy your exclusive access and remember to keep our secrets safe ✨
          </p>
        </motion.div>
      </div>

      {/* Meme Modal */}
      <Dialog open={!!selectedMeme} onOpenChange={() => setSelectedMeme(null)}>
        <DialogContent className="max-w-4xl w-full bg-gray-900/95 border-gray-700/50 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold flex items-center">
              <Smile className="w-6 h-6 mr-2 text-orange-400" />
              {selectedMeme?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMeme && (
              <>
                <div className="relative w-full max-h-[70vh] overflow-hidden rounded-lg">
                  <img 
                    src={selectedMeme.src} 
                    alt={selectedMeme.title}
                    className="w-full h-auto object-contain max-h-[70vh]"
                  />
                </div>
                {selectedMeme.description && (
                  <p className="text-gray-300 text-center italic text-lg">
                    "{selectedMeme.description}"
                  </p>
                )}
                <div className="flex justify-center space-x-4 pt-4">
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                    <Star className="w-4 h-4" />
                    <span>Rate Meme</span>
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function MembersLounge() {
  return (
    <Suspense fallback={<TerminalLoader />}>
      <MembersLoungeContent />
    </Suspense>
  )
}
