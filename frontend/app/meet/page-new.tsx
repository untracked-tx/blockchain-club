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
      bio: "Julie combines hands-on experience at Comcast and Lockheed Martin with a drive to foster growth and accountability within the club. She's committed to building a culture where students turn data-driven ideas into real results, together.",
      image: "/julie.jpg",
      tokenType: "Officer",
      email: "Julie.Jurkowski@ucdenver.edu",
      linkedin: "https://www.linkedin.com/in/julie-jurkowski/",
    },
    {
      id: 3,
      name: "Liam Murphy",
      role: "Treasurer",
      bio: "Treasurer of the Blockchain Club and is currently pursuing an MS in Finance at CU Denver. He's dedicated to making finance and blockchain accessible to all students, and is passionate about building a transparent, supportive community where everyone can learn and grow together.",
      image: "/liam.jpg",
      tokenType: "Officer",
      email: "liam.murphy@ucdenver.edu",
      linkedin: "https://www.linkedin.com/in/liam-m-582255340/",
    },
    {
      id: 4,
      name: "Samuel Sherrow",
      role: "Member",
      bio: "Sam is a senior product manager and MBA candidate who's led teams at S&P Global and top SaaS firms. With 15+ years connecting technology and finance, he helps the club link classroom concepts to industry trends—offering real-world insights on digital platforms, product strategy, and what it takes to succeed in finance.",
      image: "/sam.jpg",
      tokenType: "Member",
      email: "samuel.sherrow@ucdenver.edu",
      linkedin: "https://www.linkedin.com/in/samuel-sherrow-a8476a32/",
    },
  ]

  return (
    <div className="flex flex-col">
      
      {/* Hero Section - Professional Hedge Fund Style */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 py-20 md:py-28">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-purple-400/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-36 h-36 bg-blue-400/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-blue-200 backdrop-blur-sm border border-white/20">
              <Users className="mr-2 h-4 w-4" />
              Leadership Team
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Meet Our <br />
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Investment Team
              </span>
            </h1>
            
            <p className="mb-8 text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Our diverse team combines academic excellence with real-world experience in finance, 
              technology, and blockchain innovation. Together, we're building the future of student investing.
            </p>
          </div>
        </div>
      </section>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100">
        <div className="container mx-auto px-4 py-16">
          
          {/* Team Grid - Professional Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {clubMembers.map((member, index) => (
              <Card 
                key={member.id} 
                className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg border border-gray-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group min-h-[400px] flex flex-col"
              >
                {/* Subtle decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -mr-10 -mt-10"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  {/* Profile Image */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <img
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        className="w-24 h-24 rounded-full mx-auto border-3 border-gray-200 group-hover:border-blue-300 transition-all duration-300 object-cover shadow-lg"
                      />
                      {/* Role badge */}
                      <div className="absolute -bottom-2 -right-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs font-medium ${
                            member.tokenType === 'Advisor' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            member.tokenType === 'Officer' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {member.tokenType}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-2xl font-bold text-gray-900 text-center mb-2 group-hover:text-blue-600 transition-colors">
                    {member.name}
                  </h3>
                  
                  {/* Role */}
                  <p className="text-lg text-blue-600 text-center mb-4 font-semibold">
                    {member.role}
                  </p>

                  {/* Bio */}
                  <div className="flex-1 mb-6">
                    <p className="text-sm text-gray-600 text-center leading-relaxed">
                      {member.bio}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-3 mt-auto">
                    <Button
                      onClick={() => window.open(`mailto:${member.email}`)}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      onClick={() => window.open(member.linkedin, '_blank')}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Button>
                    {/* Website button only for Dr. Yosef Bonaparte */}
                    {member.id === 1 && (
                      <Button
                        onClick={() => window.open(member.website, '_blank')}
                        variant="outline"
                        size="sm"
                        className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Portfolio
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Professional CTA Section */}
          <div className="text-center mt-20">
            <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-lg max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Join Our Investment Community</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Ready to learn from industry professionals and gain hands-on experience 
                in blockchain investing? We're always looking for driven students.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Award className="h-5 w-5 mr-2" />
                  Apply for Membership
                </Button>
                <Button variant="outline" size="lg" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Users className="h-5 w-5 mr-2" />
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
