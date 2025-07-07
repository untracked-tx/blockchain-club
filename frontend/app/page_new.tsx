import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lightbulb, Users, School, Award, TrendingUp, Sparkles, Zap, Target, ChevronRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section with Enhanced Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-20 md:py-28">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-36 h-36 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-2000"></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Floating Badge */}
            <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-purple-800 backdrop-blur-sm border border-white/30">
              <Sparkles className="mr-2 h-4 w-4" />
              Next-Gen Blockchain Education
            </div>
            
            <h1 className="mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
              Blockchain & Crypto 
              <span className="block">Investing Club</span>
            </h1>
            
            <p className="mb-8 text-xl text-gray-700 leading-relaxed">
              🚀 A student-driven academic society empowering members to <strong>learn</strong>, <strong>invest</strong>, and <strong>lead</strong> in blockchain and digital assets. 
              Join us for hands-on experience, real portfolio management, and a vibrant, collaborative community.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/gallery">
                <Button size="lg" className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-2xl hover:scale-105">
                  <span className="relative z-10 flex items-center">
                    ✨ Mint Your Membership 
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
                </Button>
              </Link>
              <Link href="/governance">
                <Button variant="outline" size="lg" className="rounded-xl border-2 border-purple-200 px-8 py-6 text-lg font-semibold text-purple-700 backdrop-blur-sm transition-all hover:bg-purple-50 hover:border-purple-300">
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
            <div className="mb-4 inline-flex items-center rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-800">
              <Target className="mr-2 h-4 w-4" />
              Our Core Focus
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">What We Do</h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 leading-relaxed">
              Our club integrates hands-on crypto investing, original research, and a vibrant community to foster 
              financial literacy, critical thinking, and collaborative growth in blockchain and digital assets.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Investing Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-green-200/50">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-gray-900">💹 Active Investing</h3>
                <p className="text-gray-700 leading-relaxed">
                  Experience real-world portfolio management with our club fund. Learn trading strategies, risk management, 
                  and market analysis while building your financial literacy.
                </p>
              </div>
            </div>

            {/* Research Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-blue-200/50">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                  <Lightbulb className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-gray-900">🔬 Research & Analysis</h3>
                <p className="text-gray-700 leading-relaxed">
                  Conduct deep-dive research on blockchain protocols, DeFi, and digital asset markets. Collaborate on projects 
                  and contribute to our collective knowledge base.
                </p>
              </div>
            </div>

            {/* Community Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-purple-200/50">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-gray-900">🤝 Vibrant Community</h3>
                <p className="text-gray-700 leading-relaxed">
                  Join a diverse, supportive community of students passionate about blockchain. We value peer learning, 
                  mentorship, and collaborative growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Section with Enhanced Design */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
              <Zap className="mr-2 h-4 w-4" />
              Blockchain-Powered Membership
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">Membership Tokens</h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 leading-relaxed">
              Our innovative membership system uses NFTs to recognize three core roles: Observer, Member, and Officer. 
              Each role provides specific access, governance rights, and responsibilities in our transparent ecosystem.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Observer Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-200/50">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-200/30 to-slate-300/30 rounded-full -mr-8 -mt-8"></div>
              <div className="relative">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-400 to-slate-500 text-white shadow-lg">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-gray-900">👁️ Observer</h3>
                <p className="mb-6 text-gray-700 leading-relaxed">
                  Welcome to attend public events and access select resources. Perfect for those beginning their blockchain journey.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-green-500" />
                    Access to public events
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-green-500" />
                    Read-only access to resources
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-green-500" />
                    Free to mint & transferable
                  </div>
                </div>
              </div>
            </div>

            {/* Member Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 border-blue-200">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full -mr-8 -mt-8"></div>
              <div className="absolute top-4 right-4 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                Popular ⭐
              </div>
              <div className="relative">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-gray-900">🎓 Member</h3>
                <p className="mb-6 text-gray-700 leading-relaxed">
                  Full participation rights with voting power and access to all events. The backbone of our community.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-green-500" />
                    All events and workshops
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-green-500" />
                    1x voting power in governance
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-green-500" />
                    Soulbound & university verified
                  </div>
                </div>
              </div>
            </div>

            {/* Officer Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-yellow-200/50">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-200/30 to-orange-300/30 rounded-full -mr-8 -mt-8"></div>
              <div className="relative">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-lg">
                  <School className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-gray-900">👑 Officer</h3>
                <p className="mb-6 text-gray-700 leading-relaxed">
                  Elected leaders with enhanced governance rights and administrative responsibilities.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-green-500" />
                    Leadership & admin privileges
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-green-500" />
                    3–5x voting power
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="mr-2 h-4 w-4 text-green-500" />
                    Granted by election only
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 py-16 md:py-24">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Ready to Join the Future? 🚀
            </h2>
            <p className="mb-8 text-xl text-blue-100 leading-relaxed">
              Be part of the next generation of blockchain innovators. Connect your wallet and mint your membership NFT today.
            </p>
            <Link href="/gallery">
              <Button size="lg" className="rounded-xl bg-white px-8 py-6 text-lg font-semibold text-purple-700 shadow-lg transition-all hover:scale-105 hover:shadow-2xl">
                🎯 Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
