"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, Users, Crown, Star, Lock, MessageSquare, Calendar, FileText, Zap, Settings, Users2, Archive, BarChart3 } from "lucide-react"
import { useAccount } from "wagmi"
import { TerminalLoader } from "@/components/terminal-loader"
import { useMembershipVerification } from "@/hooks/use-membership-verification"
import { useMyTokens } from "@/hooks/use-mytokens"

function OfficersClubContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showLoader, setShowLoader] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  
  // Check if user came through the secret entrance
  const hasSecretKey = searchParams.get('key') === 'MesshallMischief'
  
  // Get wallet info
  const { address } = useAccount()
  
  // Verify membership status
  const { isMember, isLoading, membershipTier } = useMembershipVerification()
  
  // Get token data
  const { tokens } = useMyTokens(address)

  // Handle terminal completion
  const handleTerminalComplete = () => {
    setShowLoader(false)
    
    // Always check membership after loader completes
    // This creates the effect of the terminal "crashing" into access denied
    if (!isLoading && (!isMember || !membershipTier || !['officer', 'admin', 'president', 'founder'].includes(membershipTier.toLowerCase()))) {
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
    const shouldFail = !isLoading && (!isMember || !membershipTier || !['officer', 'admin', 'president', 'founder'].includes(membershipTier.toLowerCase()))
    
    return (
      <TerminalLoader 
        onComplete={handleTerminalComplete}
        membershipTier={membershipTier || undefined}
        nftBalance={tokens.length}
        walletAddress={address}
        isOfficersClub={true}
        shouldFailAuth={shouldFail}
      />
    )
  }

  // Show access denied if not an officer
  if (accessDenied || (!isLoading && (!isMember || !membershipTier || !['officer', 'admin', 'president', 'founder'].includes(membershipTier.toLowerCase())))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-orange-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-orange-500/10 rounded-full filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-40 right-40 w-40 h-40 bg-orange-500/10 rounded-full filter blur-xl animate-pulse delay-1000"></div>
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
            className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/30"
          >
            <Lock className="w-12 h-12 text-orange-400" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-orange-400 mb-4"
          >
            ACCESS DENIED
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <p className="text-gray-300 text-lg mb-2">⚡ Officer Rank Required</p>
            <p className="text-gray-500 text-sm leading-relaxed">
              This area is restricted to club officers and administrators only. 
              Please verify your officer-level membership NFT to access the command center.
            </p>
          </motion.div>
          
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={() => router.push('/')}
            className="mt-8 px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Return to Homepage
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-orange-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full filter blur-xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-40 h-40 bg-amber-500/10 rounded-full filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-40 w-36 h-36 bg-yellow-500/10 rounded-full filter blur-xl animate-pulse delay-2000"></div>
        <div className="absolute top-40 right-60 w-28 h-28 bg-red-500/10 rounded-full filter blur-xl animate-pulse delay-3000"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-900/80 via-amber-900/80 to-black/80 backdrop-blur-sm py-20 border-b border-gray-800/50">
        <div className="container relative mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6 inline-flex items-center rounded-full bg-orange-500/20 px-6 py-3 text-sm font-medium text-orange-300 backdrop-blur-sm border border-orange-500/30 shadow-lg shadow-orange-500/10"
            >
              <Shield className="mr-2 h-4 w-4" />
              Officers Command Center
              <div className="ml-2 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              ⚡ <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Officers</span> Club
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mb-8 text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
            >
              Command center for club leadership. Internal communications, strategic planning, and operational oversight for officer-level members.
            </motion.p>

            {membershipTier && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="inline-flex items-center bg-gradient-to-r from-orange-600/20 to-amber-600/20 px-8 py-4 rounded-xl border border-orange-500/30 backdrop-blur-sm shadow-xl shadow-orange-500/10"
              >
                <Crown className="w-6 h-6 text-yellow-400 mr-3" />
                <span className="text-white font-semibold text-lg">
                  {membershipTier} Officer
                </span>
                <div className="ml-3 px-3 py-1 bg-yellow-400/20 rounded-full text-yellow-300 text-sm font-medium">
                  Command Access
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container relative mx-auto px-4 py-16 z-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Officer-Only Chat */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-orange-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-orange-400/20 rounded-lg mr-4 group-hover:bg-orange-400/30 transition-colors">
                <MessageSquare className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Officer-Only Chat</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Secure, private discussion channel for candid strategic planning, leadership coordination, and confidential officer communications.
            </p>
            <button className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              Access Command Chat
            </button>
          </motion.div>

          {/* Officer Resources */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-amber-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-amber-400/20 rounded-lg mr-4 group-hover:bg-amber-400/30 transition-colors">
                <FileText className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Officer Resources</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Leadership documentation, club bylaws, meeting minutes, officer guides, budget information, and operational procedures.
            </p>
            <button className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-yellow-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              View Resources
            </button>
          </motion.div>

          {/* Event Planning Tools */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-red-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-400/20 rounded-lg mr-4 group-hover:bg-red-400/30 transition-colors">
                <Calendar className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Event Planning</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Shared calendars, task lists, signup sheets, and coordination tools for organizing club events and activities.
            </p>
            <button className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              Plan Events
            </button>
          </motion.div>

          {/* Officer Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-yellow-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10 hover:-translate-y-1"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-yellow-400/20 rounded-lg mr-4 group-hover:bg-yellow-400/30 transition-colors">
                <Users2 className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Officer Schedule</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Duty rosters, on-call assignments, and responsibility reminders for seamless club operations and leadership coverage.
            </p>
            <button className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-yellow-700 hover:to-amber-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              View Schedule
            </button>
          </motion.div>

          {/* Private Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-400/20 rounded-lg mr-4 group-hover:bg-purple-400/30 transition-colors">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Private Feedback</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Confidential feedback system for officers to share suggestions, concerns, and "hot wash" notes for continuous improvement.
            </p>
            <button className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-violet-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              Submit Feedback
            </button>
          </motion.div>

          {/* Templates & SOPs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-400/20 rounded-lg mr-4 group-hover:bg-blue-400/30 transition-colors">
                <Archive className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Templates & SOPs</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Email templates, event checklists, standard operating procedures, and workflow guides for consistent operations.
            </p>
            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              Access Templates
            </button>
          </motion.div>
        </div>

        {/* Secondary Features Row */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
          
          {/* Officer Training */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-emerald-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-emerald-400/20 rounded-lg mr-4 group-hover:bg-emerald-400/30 transition-colors">
                <Star className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Officer Training</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Leadership development guides, conflict resolution training, delegation strategies, and mentoring resources for new officers.
            </p>
            <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              Start Training
            </button>
          </motion.div>

          {/* Decision Logs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-cyan-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-cyan-400/20 rounded-lg mr-4 group-hover:bg-cyan-400/30 transition-colors">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Decision Logs</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Running record of officer decisions, rationales, and follow-up actions for transparency and smooth succession planning.
            </p>
            <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              View Decisions
            </button>
          </motion.div>

          {/* Officer Handbook */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-rose-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-rose-400/20 rounded-lg mr-4 group-hover:bg-rose-400/30 transition-colors">
                <Settings className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Officer Handbook</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Living digital handbook with lessons learned, FAQs, club traditions, and institutional knowledge updated by officers.
            </p>
            <button className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-rose-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              Edit Handbook
            </button>
          </motion.div>
        </div>

        {/* Advanced Officer Operations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Advanced Operations</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Crisis Response Playbook */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-red-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-red-400/20 rounded-lg mr-4 group-hover:bg-red-400/30 transition-colors">
                  <Shield className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Crisis Playbook</h3>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Emergency response protocols, escalation procedures, communication templates, and damage control strategies.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-red-400 mr-2">🚨</span>
                  <span className="text-gray-300">Security Breach Protocol</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-orange-400 mr-2">📞</span>
                  <span className="text-gray-300">Emergency Contact Chain</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-yellow-400 mr-2">📋</span>
                  <span className="text-gray-300">Response Templates</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                Access Playbook
              </button>
            </motion.div>

            {/* Succession Planning */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-400/20 rounded-lg mr-4 group-hover:bg-purple-400/30 transition-colors">
                  <Users2 className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Succession Planning</h3>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Leadership transition plans, knowledge transfer protocols, and candidate development tracking.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between bg-gray-700/30 p-2 rounded text-sm">
                  <span className="text-gray-300">🎯 Future President</span>
                  <span className="text-purple-400">3 candidates</span>
                </div>
                <div className="flex items-center justify-between bg-gray-700/30 p-2 rounded text-sm">
                  <span className="text-gray-300">⚡ VP Successors</span>
                  <span className="text-purple-400">5 identified</span>
                </div>
                <div className="flex items-center justify-between bg-gray-700/30 p-2 rounded text-sm">
                  <span className="text-gray-300">📚 Knowledge Docs</span>
                  <span className="text-purple-400">85% complete</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                View Pipeline
              </button>
            </motion.div>

            {/* Officer Polls & Quick Votes */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-400/20 rounded-lg mr-4 group-hover:bg-blue-400/30 transition-colors">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Officer Polls</h3>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Quick voting on decisions, policy changes, budget approvals, and strategic direction votes.
              </p>
              <div className="space-y-2 mb-4">
                <div className="bg-gray-700/30 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm">Budget Increase for Events</span>
                    <span className="text-blue-400 text-sm">5/7 voted</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full" style={{width: '71%'}}></div>
                  </div>
                </div>
                <div className="bg-gray-700/30 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm">New Partnership Approval</span>
                    <span className="text-green-400 text-sm">Approved</span>
                  </div>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                Create Poll
              </button>
            </motion.div>

            {/* Red Team/Blue Team Log */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-cyan-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-cyan-400/20 rounded-lg mr-4 group-hover:bg-cyan-400/30 transition-colors">
                  <Settings className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Red/Blue Team Log</h3>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Competitive analysis, strategy sessions, debate logs, and opposing viewpoint tracking for balanced decision-making.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-red-400 mr-2">🔴</span>
                  <span className="text-gray-300">Marketing Budget Concerns</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-blue-400 mr-2">🔵</span>
                  <span className="text-gray-300">Growth Strategy Benefits</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-purple-400 mr-2">⚡</span>
                  <span className="text-gray-300">Synthesis Meeting Thu</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                View Sessions
              </button>
            </motion.div>

            {/* Strategic Planning Hub */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-green-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-400/20 rounded-lg mr-4 group-hover:bg-green-400/30 transition-colors">
                  <Star className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Strategic Planning</h3>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Long-term vision, quarterly goals, resource allocation, competitive positioning, and growth roadmaps.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Q1 2024 Goals</span>
                  <span className="text-green-400">87% complete</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Vision 2025</span>
                  <span className="text-green-400">Draft ready</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Budget Planning</span>
                  <span className="text-green-400">In progress</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                Strategic Dashboard
              </button>
            </motion.div>

            {/* Confidential Intel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-amber-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-amber-400/20 rounded-lg mr-4 group-hover:bg-amber-400/30 transition-colors">
                  <Lock className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Intel Vault</h3>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Market intelligence, competitor analysis, partnership opportunities, and sensitive information management.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-amber-400 mr-2">🕵️</span>
                  <span className="text-gray-300">Competitor Activity Tracking</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-orange-400 mr-2">🤝</span>
                  <span className="text-gray-300">Partnership Prospects</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-red-400 mr-2">🔒</span>
                  <span className="text-gray-300">Classified Documents</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                Access Vault
              </button>
            </motion.div>

          </div>
        </motion.div>

        {/* Leadership Tools Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Leadership Command Tools</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
            {[
              { icon: "⚡", title: "Emergency Alert", desc: "Send urgent club notifications" },
              { icon: "🏆", title: "Officer of Month", desc: "Recognition and awards" },
              { icon: "�", title: "Generate Reports", desc: "Operational analytics" },
              { icon: "🎭", title: "Officer Memes", desc: "Leadership humor zone" }
            ].map((tool, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800/20 backdrop-blur-sm p-4 rounded-lg border border-gray-700/30 hover:border-orange-500/50 transition-all cursor-pointer"
              >
                <div className="text-2xl mb-2">{tool.icon}</div>
                <h4 className="text-white font-semibold mb-1">{tool.title}</h4>
                <p className="text-gray-400 text-sm">{tool.desc}</p>
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
            ⚡ Officer-level clearance verified - Handle with care
          </p>
          <p className="text-gray-500 text-sm">
            Confidential information - Leadership access only ⚔️
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function OfficersClub() {
  return (
    <Suspense fallback={<TerminalLoader isOfficersClub={true} />}>
      <OfficersClubContent />
    </Suspense>
  )
}
