"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, Users, Crown, Star, Lock } from "lucide-react"
import { TerminalLoader } from "@/components/terminal-loader"
import { useMembershipVerification } from "@/hooks/use-membership-verification"

function MembersLoungeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showLoader, setShowLoader] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  
  // Check if user came through the secret entrance
  const hasSecretKey = searchParams.get('key') === 'authorized'
  
  // Verify membership status
  const { isMember, isLoading, membershipTier } = useMembershipVerification()

  useEffect(() => {
    // If user didn't come through secret entrance, redirect to 404
    if (!hasSecretKey) {
      router.push('/404')
      return
    }

    // Show terminal loader for dramatic effect
    const timer = setTimeout(() => {
      setShowLoader(false)
      
      // Check membership after loader
      if (!isLoading && !isMember) {
        setAccessDenied(true)
      }
    }, 3000) // 3 second loading screen

    return () => clearTimeout(timer)
  }, [hasSecretKey, router, isMember, isLoading])

  // Show terminal loader
  if (showLoader) {
    return <TerminalLoader />
  }

  // Show access denied if not a member
  if (accessDenied || (!isLoading && !isMember)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-500 mb-2">ACCESS DENIED</h1>
          <p className="text-gray-400 mb-6">Club membership required</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-indigo-900">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-black py-20">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-green-500/20 rounded-full filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-purple-500/20 rounded-full filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-36 h-36 bg-blue-500/20 rounded-full filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl"
          >
            <div className="mb-6 inline-flex items-center rounded-full bg-green-500/20 px-4 py-2 text-sm font-medium text-green-300 backdrop-blur-sm border border-green-500/30">
              <Shield className="mr-2 h-4 w-4" />
              Members Only Area
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              🏛️ <span className="text-green-400">Members</span> Lounge
            </h1>
            
            <p className="mb-8 text-xl text-gray-300 leading-relaxed">
              Welcome to the exclusive members area. Access to premium resources, private discussions, and insider insights.
            </p>

            {membershipTier && (
              <div className="inline-flex items-center bg-purple-600/20 px-6 py-3 rounded-lg border border-purple-500/30">
                <Crown className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-white font-medium">
                  {membershipTier} Member
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Exclusive Research */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-all"
          >
            <div className="flex items-center mb-4">
              <Star className="w-6 h-6 text-yellow-400 mr-3" />
              <h3 className="text-xl font-bold text-white">Exclusive Research</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Access to premium research reports, market analysis, and investment strategies not available to the public.
            </p>
            <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all">
              View Research
            </button>
          </motion.div>

          {/* Private Discord */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-purple-400 mr-3" />
              <h3 className="text-xl font-bold text-white">Private Discord</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Join our exclusive Discord server for real-time discussions, trading signals, and direct access to club leadership.
            </p>
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
              Join Discord
            </button>
          </motion.div>

          {/* Portfolio Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all"
          >
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-blue-400 mr-3" />
              <h3 className="text-xl font-bold text-white">Portfolio Tools</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Advanced portfolio tracking, risk management tools, and personalized investment recommendations.
            </p>
            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all">
              Access Tools
            </button>
          </motion.div>

          {/* Exclusive Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-yellow-500/50 transition-all md:col-span-2 lg:col-span-3"
          >
            <div className="flex items-center mb-4">
              <Crown className="w-6 h-6 text-yellow-400 mr-3" />
              <h3 className="text-xl font-bold text-white">Exclusive Events & Opportunities</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">VIP Trading Sessions</h4>
                <p className="text-gray-300 text-sm">Private trading sessions with professional traders</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Industry Networking</h4>
                <p className="text-gray-300 text-sm">Connect with blockchain industry professionals</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Early Access</h4>
                <p className="text-gray-300 text-sm">First access to new features and opportunities</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400">
            🤫 Remember, what happens in the members lounge, stays in the members lounge
          </p>
        </motion.div>
      </div>
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
