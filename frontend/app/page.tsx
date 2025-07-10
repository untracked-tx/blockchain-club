"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lightbulb, Users, TrendingUp, Sparkles, Target } from "lucide-react"
import { useState } from "react"
import { NewUserOnboarding } from "@/components/new-user-onboarding"

export default function Home() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)

  return (
    <div className="flex flex-col">
      {/* Hero Section with Enhanced Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-[#CFB87C]/10 to-gray-100 py-20 md:py-28">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#CFB87C]/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-[#A2A4A3]/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-36 h-36 bg-[#CFB87C]/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Floating Badge */}
            <div className="mb-6 inline-flex items-center rounded-full bg-white/40 px-4 py-2 text-sm font-medium text-[#565A5C] backdrop-blur-sm border border-[#CFB87C]/30">
              <Sparkles className="mr-2 h-4 w-4 text-[#CFB87C]" />
              Next-Gen Blockchain Education
            </div>
            
            <h1 className="mb-6 bg-gradient-to-r from-black via-[#CFB87C] to-[#565A5C] bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
              Blockchain & Crypto 
              <span className="block">Investing Club</span>
            </h1>
            
            <p className="mb-8 text-xl text-[#565A5C] leading-relaxed">
              <span 
                className="cursor-pointer transition-all duration-300 hover:scale-125 hover:drop-shadow-lg inline-block"
                onClick={() => setIsOnboardingOpen(true)}
                title="New here? Click for onboarding!"
              >
                🚀
              </span>{" "}
              A student-driven academic society empowering members to <strong>learn</strong>, <strong>invest</strong>, and <strong>lead</strong> in blockchain and digital assets. 
              Join us for hands-on experience, real portfolio management, and a vibrant, collaborative community.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/gallery">
                <Button size="lg" className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#CFB87C] to-[#CFB87C]/90 px-8 py-6 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-2xl hover:scale-105">
                  <span className="relative z-10 flex items-center">
                    ✨ Mint Your Membership 
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#CFB87C]/90 to-[#565A5C] opacity-0 transition-opacity group-hover:opacity-100"></div>
                </Button>
              </Link>
              <Link href="/governance">
                <Button variant="outline" size="lg" className="rounded-xl border-2 border-[#CFB87C] bg-[#CFB87C]/10 px-8 py-6 text-lg font-semibold text-[#565A5C] backdrop-blur-sm transition-all hover:bg-[#CFB87C]/20 hover:border-[#CFB87C]">
                  🔍 How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section with Enhanced Cards */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center rounded-full bg-[#CFB87C]/20 px-4 py-2 text-sm font-medium text-[#565A5C]">
              <Target className="mr-2 h-4 w-4 text-[#CFB87C]" />
              Our Core Focus
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">What We Do</h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 leading-relaxed">
              Our club integrates hands-on crypto investing, original research, and a vibrant community to foster 
              financial literacy, critical thinking, and collaborative growth in blockchain and digital assets.
            </p>
          </div>          <div className="grid gap-8 md:grid-cols-3">
            {/* Investing Card */}
            <Link href="/portfolio">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-green-200/50 cursor-pointer">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-gray-900">💹 Active Investing</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Manage real capital in our collaborative investment fund. Members gain hands-on experience with portfolio 
                    construction, asset allocation, and market analysis while developing practical financial skills for their careers.
                  </p>
                </div>
              </div>
            </Link>

            {/* Research Card */}
            <Link href="/research">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-100 p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-teal-200/50 cursor-pointer">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg">
                    <Lightbulb className="h-8 w-8" />
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-gray-900">🔬 Research & Analysis</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Explore emerging technologies through structured research projects. Members investigate blockchain protocols, 
                    analyze market trends, and publish findings that contribute to academic discourse and investment decisions.
                  </p>
                </div>
              </div>
            </Link>

            {/* Community Card */}
            <Link href="/members">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-blue-200/50 cursor-pointer">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-gray-900">⛓️ Blockchain-Powered Membership</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Connect with like-minded students in an academic community built on transparency and collaboration. 
                    Our blockchain-based membership system ensures accountability while fostering peer learning and mentorship.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-black via-[#565A5C] to-black py-16 md:py-24">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Ready to Join the Future? 🚀
            </h2>
            <p className="mb-8 text-xl text-[#A2A4A3] leading-relaxed">
              Be part of the next generation of blockchain innovators. Connect your wallet and mint your membership NFT today.
            </p>
            <Link href="/gallery">
              <Button size="lg" className="rounded-xl bg-[#CFB87C] px-8 py-6 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:bg-[#CFB87C]/90">
                🎯 Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* New User Onboarding Modal */}
      <NewUserOnboarding 
        isOpen={isOnboardingOpen} 
        onClose={() => setIsOnboardingOpen(false)} 
      />
    </div>
  )
}
