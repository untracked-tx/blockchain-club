import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lightbulb, Users, School, Award, TrendingUp, Sparkles, Zap, Target } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section with Enhanced Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-20 md:py-28">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23667eea" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="7"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Floating Badge */}
            <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-purple-800 backdrop-blur-sm">
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
                Members participate in managing the club’s real cryptocurrency portfolio, gaining practical experience in research, analysis, and investment decision-making. We emphasize transparency, risk management, and responsible investing.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Research</h3>
              <p className="text-gray-600">
                We conduct research on blockchain protocols, DeFi, and digital asset markets. Members collaborate on projects, present findings, and contribute to the club’s collective knowledge base.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Community</h3>
              <p className="text-gray-600">
                Join a diverse, supportive community of students passionate about blockchain and crypto investing. We value peer learning, mentorship, and collaborative growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">Membership Tokens</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Our blockchain-based membership system recognizes three core roles: Observer, Member, and Officer. Each role confers specific access, governance rights, and responsibilities, supporting a transparent and inclusive club structure.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Observer</h3>
              <p className="mb-4 text-gray-600">
                Observers are welcome to attend public events and access select resources. This free, transferable token is ideal for those beginning their journey in blockchain and crypto investing.
              </p>
              <div className="text-sm text-gray-500">
                <p>• Access to public events</p>
                <p>• Read-only access to resources</p>
                <p>• Free to mint</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Member</h3>
              <p className="mb-4 text-gray-600">
                Members are the backbone of the club, with full participation rights, voting power, and access to all events and workshops. The Member token is soulbound and requires university affiliation.
              </p>
              <div className="text-sm text-gray-500">
                <p>• Access to all events and workshops</p>
                <p>• 1x voting power in governance</p>
                <p>• Requires university email</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Officer</h3>
              <p className="mb-4 text-gray-600">
                Officers are elected leaders with enhanced governance rights and responsibilities, including the ability to promote members and initiate proposals. The Officer token is soulbound and granted by election.
              </p>
              <div className="text-sm text-gray-500">
                <p>• Leadership and admin privileges</p>
                <p>• 3–5x voting power in governance</p>
                <p>• Granted by officer election</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl rounded-xl bg-blue-50 p-8 shadow-sm">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Ready to Join?</h2>
            <p className="mb-8 text-lg text-gray-600">
              Mint your membership token and become an active participant in our academic community dedicated to blockchain research, education, and innovation.
            </p>
            <Link href="/gallery">
              <Button size="lg" className="rounded-md px-8 py-6 text-lg font-medium">
                Explore Token Gallery <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
