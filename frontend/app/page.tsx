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
            
            <h1 className="mb-6 bg-gradient-to-r from-black via-[#CFB87C] to-[#565A5C] bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl pb-4">
              Blockchain & Crypto 
              <span className="block">Investing Club</span>
            </h1>
            
            <p className="mb-8 text-xl text-[#565A5C] leading-relaxed">
              <span 
                className="cursor-pointer transition-all duration-300 hover:scale-125 hover:drop-shadow-lg inline-block rocket-fly"
                onClick={() => setIsOnboardingOpen(true)}
                title="New here? Click for onboarding!"
              >
                🚀
              </span>{" "}
              A student-driven academic society empowering members to <strong>learn</strong>, <strong>invest</strong>, and <strong>lead</strong> in blockchain and digital assets. 
              Join us for hands-on experience, real portfolio management, and a vibrant, collaborative community.
            </p>

            <style jsx>{`
              .rocket-fly {
                animation: rocketFly 2s ease-in-out 12s infinite;
                animation-fill-mode: both;
              }
              
              @keyframes rocketFly {
                0% {
                  transform: translateY(0) translateX(0) rotate(0deg);
                }
                25% {
                  transform: translateY(-10px) translateX(5px) rotate(5deg);
                }
                50% {
                  transform: translateY(-15px) translateX(10px) rotate(10deg);
                }
                75% {
                  transform: translateY(-10px) translateX(5px) rotate(5deg);
                }
                100% {
                  transform: translateY(0) translateX(0) rotate(0deg);
                }
              }
            `}</style>
            
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

      {/* Attribution & Partners Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 py-12">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10"></div>
        
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-8 left-1/4 w-24 h-24 bg-[#CFB87C]/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-8 right-1/4 w-32 h-32 bg-[#8247E5]/10 rounded-full blur-xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6">
              <h3 className="mb-2 text-base font-semibold text-[#CFB87C] tracking-wide">Acknowledgements</h3>
              <div className="mx-auto w-16 h-0.5 bg-gradient-to-r from-transparent via-[#CFB87C] to-transparent"></div>
            </div>
            
            <p className="mb-10 text-sm text-gray-300 leading-relaxed max-w-2xl mx-auto font-light">
              We gratefully acknowledge the open-source developers, data providers, and networks that help make this club possible.
            </p>
            
            {/* Creative Partners Layout */}
            <div className="relative">
              {/* Floating connection lines */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 400">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#CFB87C" stopOpacity="0.3"/>
                      <stop offset="50%" stopColor="#8247E5" stopOpacity="0.5"/>
                      <stop offset="100%" stopColor="#12FF80" stopOpacity="0.3"/>
                    </linearGradient>
                  </defs>
                  <path d="M 100 200 Q 400 100 700 200" stroke="url(#lineGradient)" strokeWidth="2" fill="none" className="animate-pulse"/>
                  <path d="M 150 250 Q 400 150 650 250" stroke="url(#lineGradient)" strokeWidth="1.5" fill="none" className="animate-pulse" style={{animationDelay: '1s'}}/>
                </svg>
              </div>

              {/* Uniform Partners Grid */}
              <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
                
                {/* Polygon */}
                <div className="w-56">
                  <a 
                    href="https://polygon.technology/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative block"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#8247E5]/10 to-transparent p-6 h-20 border border-[#8247E5]/20 transition-all duration-300 hover:border-[#8247E5]/50 hover:scale-105 hover:rotate-1">
                      <div className="flex items-center justify-center h-full">
                        <img 
                          src="/logos/Polygon_Primary_Light.svg" 
                          alt="Polygon" 
                          className="w-36 h-14 object-contain transition-all duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-36 h-14 bg-gradient-to-br from-[#8247E5] to-[#6B46C1] rounded-xl flex items-center justify-center text-white font-bold text-xl">POL</div>';
                            }
                          }}
                        />
                      </div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-[#8247E5] rounded-full animate-pulse"></div>
                      <div className="absolute bottom-2 left-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="text-xs text-[#8247E5] font-medium">Network</div>
                      </div>
                    </div>
                  </a>
                </div>

                {/* CoinGecko */}
                <div className="w-56">
                  <a 
                    href="https://www.coingecko.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative block"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#8DC647]/10 to-transparent p-6 h-20 border border-[#8DC647]/20 transition-all duration-300 hover:border-[#8DC647]/50 hover:scale-105 hover:-rotate-1">
                      <div className="flex items-center justify-center h-full">
                        <img 
                          src="/logos/coingecko-white.svg" 
                          alt="CoinGecko" 
                          className="w-36 h-14 object-contain transition-all duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-36 h-14 bg-gradient-to-br from-[#8DC647] to-[#7CB342] rounded-xl flex items-center justify-center text-white text-xl">🦎</div>';
                            }
                          }}
                        />
                      </div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-[#8DC647] rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute bottom-2 left-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="text-xs text-[#8DC647] font-medium">Data</div>
                      </div>
                    </div>
                  </a>
                </div>

                {/* Safe */}
                <div className="w-56">
                  <a 
                    href="https://safe.global/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative block"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#12FF80]/10 to-transparent p-6 h-20 border border-[#12FF80]/20 transition-all duration-300 hover:border-[#12FF80]/50 hover:scale-105 hover:rotate-1">
                      <div className="flex items-center justify-center h-full">
                        <img 
                          src="/logos/Safe_Logos_H-Lockup_White.svg" 
                          alt="Safe" 
                          className="w-36 h-14 object-contain transition-all duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-36 h-14 bg-gradient-to-br from-[#12FF80] to-[#00E673] rounded-xl flex items-center justify-center text-gray-900 font-bold text-xl">🔒</div>';
                            }
                          }}
                        />
                      </div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-[#12FF80] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                      <div className="absolute bottom-2 left-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="text-xs text-[#12FF80] font-medium">Security</div>
                      </div>
                    </div>
                  </a>
                </div>

                {/* Rainbow Wallet */}
                <div className="w-56">
                  <a 
                    href="https://rainbow.me/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative block"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF8CDA]/10 to-[#FFF500]/10 p-6 h-20 border border-[#FF8CDA]/20 transition-all duration-300 hover:border-[#FF8CDA]/50 hover:scale-105 hover:-rotate-1">
                      <div className="flex items-center justify-center h-full">
                        <img 
                          src="/logos/idXcLraLs3_logos.svg" 
                          alt="Rainbow Wallet" 
                          className="w-36 h-14 object-contain transition-all duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-36 h-14 bg-gradient-to-br from-[#FF8CDA] to-[#FFF500] rounded-xl flex items-center justify-center text-gray-900 font-bold text-xl">🌈</div>';
                            }
                          }}
                        />
                      </div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-[#FF8CDA] rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                      <div className="absolute bottom-2 left-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="text-xs text-[#FF8CDA] font-medium">Wallet</div>
                      </div>
                    </div>
                  </a>
                </div>

                {/* OpenZeppelin */}
                <div className="w-56">
                  <a 
                    href="https://openzeppelin.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative block"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/10 to-transparent p-6 h-20 border border-blue-600/20 transition-all duration-300 hover:border-blue-600/50 hover:scale-105 hover:rotate-1">
                      <div className="flex items-center justify-center h-full">
                        <img 
                          src="/logos/OZ-Logo-WhiteBG.svg" 
                          alt="OpenZeppelin" 
                          className="w-36 h-14 object-contain transition-all duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-36 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-xl">🛡️</div>';
                            }
                          }}
                        />
                      </div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
                      <div className="absolute bottom-2 left-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="text-xs text-blue-600 font-medium">Security</div>
                      </div>
                    </div>
                  </a>
                </div>

                {/* Storacha */}
                <div className="w-56">
                  <a 
                    href="https://storacha.network/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative block"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500/10 to-transparent p-6 h-20 border border-red-500/20 transition-all duration-300 hover:border-red-500/50 hover:scale-105 hover:-rotate-1">
                      <div className="flex items-center justify-center h-full">
                        <img 
                          src="/logos/Storacha_Graphic_DarkMode.png" 
                          alt="Storacha" 
                          className="w-36 h-14 object-contain transition-all duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-36 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">📦</div>';
                            }
                          }}
                        />
                      </div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '2.5s'}}></div>
                      <div className="absolute bottom-2 left-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="text-xs text-red-500 font-medium">IPFS</div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Bottom accent line */}
              <div className="mt-8 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-[#CFB87C] to-transparent opacity-40"></div>
            </div>
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
