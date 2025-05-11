import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, Users, School, Code, DollarSign, Shield, Award, TrendingUp } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          About Us
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          We are a student-led academic society advancing knowledge and practical skills in blockchain, DeFi, and crypto investing. Our mission is to empower members with the tools and experience needed to thrive in the world of digital assets and decentralized systems.
        </p>
      </section>

      <section className="mb-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-600">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">Crypto Investing & Portfolio Management</h2>
            <p className="text-gray-600">
              Members gain hands-on experience by participating in the club’s actively managed cryptocurrency portfolio. Through research, analysis, and governance, we make real investment decisions and track our performance, fostering financial literacy and responsible investing practices.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-600">
              <School className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">Education & Research</h2>
            <p className="text-gray-600">
              We host lectures, workshops, and seminars on blockchain fundamentals, smart contracts, DeFi protocols, and emerging trends. Our club encourages scholarly research and critical discussion, bridging theory with real-world application.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-600">
              <Users className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">Community & Collaboration</h2>
            <p className="text-gray-600">
              We foster a collaborative environment where students from diverse backgrounds can connect, share ideas, and work on projects. Our club values inclusivity, mentorship, and peer learning.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-600">
              <Award className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">Governance & Leadership</h2>
            <p className="text-gray-600">
              All major club decisions, including portfolio allocations and event planning, are made through transparent governance processes. Members are encouraged to take on leadership roles and actively participate in shaping the club’s direction.
            </p>
          </div>
        </div>
      </section>

      <div className="mb-12 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Mission & Vision</CardTitle>
            <CardDescription>Why we exist</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Our mission is to demystify blockchain and cryptocurrency investing for students of all backgrounds. We foster a collaborative environment for:
            </p>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>Learning about blockchain, DeFi, digital assets, and crypto investing</li>
              <li>Building real-world skills through investment simulations, portfolio management, and technical projects</li>
              <li>Connecting with industry leaders and alumni</li>
              <li>Promoting responsible, ethical participation in the crypto economy</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>What Makes Us Unique</CardTitle>
            <CardDescription>Our on-chain approach</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              We are the first student club on campus to use a blockchain-based NFT system for:
            </p>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>Verifiable, on-chain membership credentials</li>
              <li>Transparent dues collection and treasury management</li>
              <li>Decentralized, token-weighted governance</li>
              <li>Hands-on experience with smart contracts and DeFi tools</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mb-12 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Club Structure</CardTitle>
            <CardDescription>How we operate</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li><strong>Membership Tiers:</strong> Observer, Member, Supporter, Officer</li>
              <li><strong>Governance:</strong> Token-based voting for all major decisions</li>
              <li><strong>Treasury:</strong> Managed via Gnosis Safe multisig wallet and invested in a diversified crypto portfolio</li>
              <li><strong>Working Groups:</strong> Investment, Research, Tech, Events</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Technical Stack</CardTitle>
            <CardDescription>How our system works</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>ERC-721 NFT smart contract (Polygon Amoy)</li>
              <li>Role-based access and voting power</li>
              <li>Snapshot integration for off-chain governance</li>
              <li>Recovery system for lost wallets</li>
              <li>Open source, student-built, and extensible</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <h2 className="mb-6 text-2xl font-bold">Resources</h2>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/about#whitepaper">
            <Button variant="outline" className="w-full sm:w-auto">
              <FileText className="mr-2 h-4 w-4" /> Whitepaper
            </Button>
          </Link>
          <a href="https://github.com/universityblockchainclub" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full sm:w-auto">
              <ExternalLink className="mr-2 h-4 w-4" /> GitHub Repository
            </Button>
          </a>
          <Link href="/meet">
            <Button variant="outline" className="w-full sm:w-auto">
              <Users className="mr-2 h-4 w-4" /> Meet The Club
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
