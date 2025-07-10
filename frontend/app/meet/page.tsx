"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Linkedin, Users, Crown, Key, Award, Shield, MapPin, GraduationCap, User, DollarSign } from "lucide-react"

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
      {/* Enhanced Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-600 py-20 md:py-28">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-36 h-36 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Floating Badge */}
            <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-cyan-100 backdrop-blur-sm border border-white/30">
              <Users className="mr-2 h-4 w-4" />
              Meet Our Community
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              🤝 Meet Our Team
            </h1>
            
            <p className="mb-8 text-xl text-cyan-100 leading-relaxed">
              Meet the passionate individuals driving our blockchain community forward.
            </p>
          </div>
        </div>
      </section>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-sky-50">
        <div className="container mx-auto px-4 py-16">
          
          {/* Team Grid - Fresh Professional Design */}
          <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
            {clubMembers.map((member, index) => (
              <Card key={member.id} className="group relative overflow-hidden bg-white border border-gray-200 hover:border-cyan-300 transition-all duration-300 hover:shadow-xl">
                <div className="flex flex-col md:flex-row">
                  {/* Left: Profile Image Section */}
                  <div className="md:w-1/3 p-8 bg-gradient-to-br from-gray-50 to-cyan-50 flex flex-col items-center justify-center border-r border-gray-100">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={member.image || "/placeholder.svg"}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Professional Status Badge */}
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Role Badge */}
                    <div className="mt-6 px-4 py-2 bg-white rounded-full border border-cyan-200 shadow-sm">
                      <span className="text-sm font-semibold text-cyan-700">
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* Right: Content Section */}
                  <div className="md:w-2/3 p-8">
                    {/* Header */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-lg text-cyan-600 font-medium">
                        Blockchain Club {member.role}
                      </p>
                    </div>

                    {/* Bio */}
                    <p className="text-gray-600 leading-relaxed mb-8 text-base">
                      {member.bio}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2 px-6 py-3 border-gray-300 hover:border-cyan-400 hover:bg-cyan-50 transition-colors"
                        onClick={() => window.open(`mailto:${member.email}`)}
                      >
                        <Mail className="h-4 w-4" />
                        Send Email
                      </Button>
                      <Button
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-sm"
                        onClick={() => window.open(member.linkedin, '_blank')}
                      >
                        <Linkedin className="h-4 w-4" />
                        Connect on LinkedIn
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Bottom Accent Bar */}
                <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
