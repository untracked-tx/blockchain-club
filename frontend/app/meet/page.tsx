"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Linkedin, Users, Crown, Key, Award, Shield, MapPin, GraduationCap, User, DollarSign, Github, ExternalLink } from "lucide-react"

export default function MeetPage() {

  // Combine all club members into a single array
  const clubMembers = [
    {
      id: 1,
      name: "Dr. Yosef Bonaparte",
      role: "Faculty Advisor",
      bio: "Professor of Finance at CU Denver, Director of External Affairs, and leader of the MS in FinTech program. Founding faculty advisor and national expert in AI, crypto, and blockchain.",
      image: "/yosef.jpg",
      tokenType: "Advisor",
      email: "yosef.bonaparte@ucdenver.edu",
      linkedin: "https://www.linkedin.com/in/yosef-bonaparte-22234aa6/",
      website: "https://yosef-bonaparte.vercel.app",
    },
    {
      id: 2,
      name: "Julie Jurkowski",
      role: "President",
      bio: "Julie combines hands-on experience at Comcast and Lockheed Martin with a drive to foster growth and accountability within the club. She’s committed to building a culture where students turn data-driven ideas into real results, together.",
      image: "/julie.jpg",
      tokenType: "Officer",
      email: "Julie.Jurkowski@ucdenver.edu",
      linkedin: "https://www.linkedin.com/in/julie-jurkowski/",
    },
    {
      id: 3,
      name: "Liam Murphy",
      role: "Treasurer",
      bio: "Treasurer of the Blockchain Club and is currently pursuing an MS in Finance at CU Denver. He’s dedicated to making finance and blockchain accessible to all students, and is passionate about building a transparent, supportive community where everyone can learn and grow together.",
      image: "/liam.jpg",
      tokenType: "Officer",
      email: "liam.murphy@ucdenver.edu",
      linkedin: "https://www.linkedin.com/in/liam-m-582255340/",
    },
    {
      id: 4,
      name: "Samuel Sherrow",
      role: "Member",
      bio: "Sam is a senior product manager and MBA candidate who’s led teams at S&P Global and top SaaS firms. With 15+ years connecting technology and finance, he helps the club link classroom concepts to industry trends—offering real-world insights on digital platforms, product strategy, and what it takes to succeed in finance.",
      image: "/sam.jpg",
      tokenType: "Member",
      email: "Samuel.Sherrow@Ucdenver.edu",
      linkedin: "https://www.linkedin.com/in/ssherrow/",
    },
    
   
  ]

  // TODO: Replace hardcoded clubMembers with real data from backend or club directory
  // TODO: Add filtering by role (Officer, Member, Observer, Advisor)
  // TODO: Add tooltips for roles and responsibilities
  // TODO: Add badges for tokenType (Officer, Member, Observer)
  // TODO: Replace placeholder images and emails with real club info as provided

  return (
    <div className="flex flex-col">
      {/* Enhanced Header Section - Cyber Web3 Style */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black py-20 md:py-28">
        {/* Subtle Blockchain Feed Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute w-full h-full animate-scroll-mono text-xs font-mono text-green-300 opacity-5 whitespace-pre-wrap p-8 blur-sm leading-6">
{`
Block #0x1337...
Members: 234 Active
Governance: LIVE
Treasury: $124K

Block #0xdefi...
Proposals: 3 Pending
Votes: 89.2% Quorum
Status: BUILDING

Block #0xcafe...
Research: 47 Papers
DeFi: $67K Deployed
Community: THRIVING
`}
          </div>
        </div>
        
        {/* Matrix-style Background Elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-10 left-10 w-32 h-32 bg-green-400/20 rounded-full mix-blend-screen filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-blue-400/20 rounded-full mix-blend-screen filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-36 h-36 bg-violet-400/20 rounded-full mix-blend-screen filter blur-xl animate-pulse delay-2000"></div>
          
          {/* Terminal Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>
        
        {/* Scan Line Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/5 to-transparent animate-pulse"></div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Floating Badge - Cyber Style */}
            <div className="mb-6 inline-flex items-center rounded-full bg-black/60 border border-green-400/50 px-6 py-3 text-sm font-mono text-green-300 backdrop-blur-sm shadow-lg shadow-green-400/20">
              <div className="mr-3 h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              PROTOCOL_MEMBERS.EXE
            </div>
            
            <h1 className="mb-6 text-4xl font-mono font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-green-400">{'<'}</span>
              MEET_OUR_CREW
              <span className="text-green-400">{'/>'}</span>
            </h1>
            
            <p className="mb-8 text-xl text-white/80 leading-relaxed font-mono">
              <span className="text-green-400">$</span> cat team_members.json | grep "passionate_builders"
            </p>
            
            <div className="text-green-300 font-mono text-sm mb-4">
              {"{"} <span className="text-blue-300">"status"</span>: <span className="text-yellow-300">"ONLINE"</span>, <span className="text-blue-300">"members"</span>: <span className="text-yellow-300">"4"</span>, <span className="text-blue-300">"mission"</span>: <span className="text-yellow-300">"BUILDING_THE_FUTURE"</span> {"}"}
            </div>
          </div>
        </div>
        
        {/* Corner Brackets */}
        <div className="absolute top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-green-400/60"></div>
        <div className="absolute top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-green-400/60"></div>
        <div className="absolute bottom-8 left-8 w-8 h-8 border-l-2 border-b-2 border-green-400/60"></div>
        <div className="absolute bottom-8 right-8 w-8 h-8 border-r-2 border-b-2 border-green-400/60"></div>
      </section>
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-60 left-1/4 w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-green-300 rounded-full animate-ping delay-2000"></div>
        <div className="absolute bottom-40 right-10 w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-500"></div>
      </div>
      
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative">
        <div className="container mx-auto px-4 py-16">
          
          {/* Team Grid - Cyber Web3 Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {clubMembers.map((member, index) => (
              <Card 
                key={member.id} 
                className="bg-black/60 border border-green-400/40 backdrop-blur-sm p-6 rounded-2xl hover:scale-105 hover:border-green-400/80 hover:shadow-2xl hover:shadow-green-400/20 transition-all duration-300 group relative overflow-hidden min-h-[400px] flex flex-col"
              >
                {/* Neon Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 via-blue-400/5 to-violet-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  {/* Profile Image */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <img
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        className="w-24 h-24 rounded-full mx-auto border-2 border-green-400/60 group-hover:border-green-400 transition-all duration-300 object-cover"
                      />
                    </div>
                  </div>

                  {/* Name - Monospace for Web3 feel */}
                  <h3 className="text-2xl text-green-300 font-mono text-center mb-1 group-hover:text-green-200 transition-colors">
                    {member.name}
                  </h3>
                  
                  {/* Role */}
                  <p className="text-base text-white/80 text-center mb-3 font-medium">
                    {member.role}
                  </p>

                  {/* Bio - Flexible height */}
                  <div className="flex-1 mb-4">
                    <p className="text-sm text-white/60 text-center leading-relaxed">
                      {member.bio}
                    </p>
                  </div>

                  {/* Action Buttons - Always at bottom */}
                  <div className="flex justify-center gap-3 mt-auto">
                    <button
                      onClick={() => window.open(`mailto:${member.email}`)}
                      className="p-2 bg-green-400/20 border border-green-400/40 rounded-lg hover:bg-green-400/30 hover:border-green-400/80 transition-all duration-200 group/btn"
                    >
                      <Mail className="h-4 w-4 text-green-300 group-hover/btn:text-green-200" />
                    </button>
                    <button
                      onClick={() => window.open(member.linkedin, '_blank')}
                      className="p-2 bg-blue-400/20 border border-blue-400/40 rounded-lg hover:bg-blue-400/30 hover:border-blue-400/80 transition-all duration-200 group/btn"
                    >
                      <Linkedin className="h-4 w-4 text-blue-300 group-hover/btn:text-blue-200" />
                    </button>
                    {/* Website button only for Dr. Yosef Bonaparte (card 1) */}
                    {member.id === 1 && (
                      <button
                        onClick={() => window.open(member.website, '_blank')}
                        className="p-2 bg-purple-400/20 border border-purple-400/40 rounded-lg hover:bg-purple-400/30 hover:border-purple-400/80 transition-all duration-200 group/btn"
                      >
                        <ExternalLink className="h-4 w-4 text-purple-300 group-hover/btn:text-purple-200" />
                      </button>
                    )}
                    {/* GitHub button only for Liam Murphy (card 3) */}
                    {member.id === 3 && (
                      <button
                        onClick={() => window.open('https://github.com/untracked-tx', '_blank')}
                        className="p-2 bg-gray-400/20 border border-gray-400/40 rounded-lg hover:bg-gray-400/30 hover:border-gray-400/80 transition-all duration-200 group/btn"
                      >
                        <Github className="h-4 w-4 text-gray-300 group-hover/btn:text-gray-200" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-green-400/30 to-transparent rounded-bl-2xl"></div>
              </Card>
            ))}
          </div>

          {/* Join Us Section - Cyber Style */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto bg-black/80 border border-green-400/50 backdrop-blur-sm rounded-2xl relative overflow-hidden">
              {/* Animated Border */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-400/20 to-violet-400/20 animate-pulse rounded-2xl"></div>
              
              <CardContent className="p-8 relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-mono text-green-300 mb-4">JOIN THE PROTOCOL</h3>
                <p className="text-white/70 mb-6 leading-relaxed">
                  Ready to dive into the decentralized future? We're building the next generation of blockchain innovators. 
                  Connect with us and become part of the revolution. 🚀
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => window.open('mailto:Julie.Jurkowski@ucdenver.edu')}
                    className="px-6 py-3 bg-green-400/20 border border-green-400/60 text-green-300 rounded-lg hover:bg-green-400/30 hover:border-green-400 transition-all duration-200 font-mono"
                  >
                    <Mail className="h-4 w-4 mr-2 inline" />
                    CONTACT_ADMIN
                  </button>
                  <Link href="/governance">
                    <button className="px-6 py-3 bg-blue-400/20 border border-blue-400/60 text-blue-300 rounded-lg hover:bg-blue-400/30 hover:border-blue-400 transition-all duration-200 font-mono w-full sm:w-auto">
                      <Users className="h-4 w-4 mr-2 inline" />
                      LEARN_MORE
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
