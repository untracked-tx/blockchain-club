import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EnhancedCard, IconWrapper, FloatingBadge } from "@/components/ui/enhanced-card"
import { Mail, Linkedin, Users, Crown, Key, Award, Shield } from "lucide-react"

export default function MeetPage() {
  // Combine all club members into a single array
  const clubMembers = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "President",
      bio: "Computer Science senior with a focus on blockchain development. Leading the club's strategic initiatives and governance structure.",
      image: "/blockchain-president-headshot.png",
      tokenType: "Officer",
      email: "alex@universityblockchainclub.edu",
      linkedin: "https://linkedin.com/in/alex-johnson-blockchain",
    },
    {
      id: 2,
      name: "Maya Patel",
      role: "Vice President",
      bio: "Finance and Computer Science double major. Manages the club treasury and oversees the implementation of our token system.",
      image: "/blockchain-vp-headshot.png",
      tokenType: "Officer",
      email: "maya@universityblockchainclub.edu",
      linkedin: "https://linkedin.com/in/maya-patel-finance",
    },
    {
      id: 3,
      name: "David Kim",
      role: "Technical Lead",
      bio: "Graduate student in Cryptography. Leads the development of our smart contracts and ensures security best practices.",
      image: "/blockchain-technical-lead-headshot.png",
      tokenType: "Officer",
      email: "david@universityblockchainclub.edu",
      linkedin: "https://linkedin.com/in/david-kim-crypto",
    },
    {
      id: 4,
      name: "Sarah Williams",
      role: "Education Coordinator",
      bio: "Junior in Information Systems. Organizes workshops and educational content for club members and the broader university community.",
      image: "/education-coordinator-headshot.png",
      tokenType: "Member",
      email: "sarah@universityblockchainclub.edu",
      linkedin: "https://linkedin.com/in/sarah-williams-edu",
    },
    {
      id: 5,
      name: "James Rodriguez",
      role: "Events Manager",
      bio: "Marketing major with a passion for blockchain. Coordinates club events, hackathons, and speaker series.",
      image: "/events-manager-headshot.png",
      tokenType: "Member",
      email: "james@universityblockchainclub.edu",
      linkedin: "https://linkedin.com/in/james-rodriguez-events",
    },
    {
      id: 6,
      name: "Emma Chen",
      role: "Research Coordinator",
      bio: "Economics PhD candidate. Leads research initiatives on blockchain applications in various industries.",
      image: "/research-coordinator-headshot.png",
      tokenType: "Member",
      email: "emma@universityblockchainclub.edu",
      linkedin: "https://linkedin.com/in/emma-chen-research",
    },
    {
      id: 7,
      name: "Michael Thompson",
      role: "New Member",
      bio: "Sophomore in Computer Engineering. Recently joined the club and actively participating in workshops and events.",
      image: "/student-observer-headshot.png",
      tokenType: "Observer",
      email: "michael@university.edu",
      linkedin: "https://linkedin.com/in/michael-thompson-eng",
    },
    {
      id: 8,
      name: "Sophia Garcia",
      role: "Industry Advisor",
      bio: "Blockchain Developer at a major tech company. Provides industry insights and mentorship to club members.",
      image: "/professional-headshot-advisor.png",
      tokenType: "Observer",
      email: "sophia@techcompany.com",
      linkedin: "https://linkedin.com/in/sophia-garcia-blockchain",
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
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 py-20 md:py-28">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-36 h-36 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Floating Badge */}
            <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-orange-100 backdrop-blur-sm border border-white/30">
              <Users className="mr-2 h-4 w-4" />
              Meet Our Community
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              🤝 Connect With Us
            </h1>
            
            <p className="mb-8 text-xl text-orange-100 leading-relaxed">
              Meet the passionate individuals driving our blockchain community forward. From seasoned officers to dedicated members, each person contributes to our mission of blockchain education and innovation.
            </p>
          </div>
        </div>
      </div>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-4 py-12">
        {/* Enhanced Member Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {clubMembers.map((member) => {
            const getRoleIcon = (role: string) => {
              if (role.includes("President")) return <Crown className="h-6 w-6" />
              if (role.includes("Officer") || role.includes("Lead") || role.includes("Vice")) return <Key className="h-6 w-6" />
              if (role.includes("Coordinator") || role.includes("Manager")) return <Award className="h-6 w-6" />
              return <Shield className="h-6 w-6" />
            }
            
            const getRoleColor = (role: string) => {
              if (role.includes("President")) return "orange"
              if (role.includes("Officer") || role.includes("Lead") || role.includes("Vice")) return "purple" 
              if (role.includes("Coordinator") || role.includes("Manager")) return "blue"
              return "gray"
            }
            
            return (
              <EnhancedCard key={member.id} variant="gradient" className="group">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-3">
                    <IconWrapper color={getRoleColor(member.role)} size="md">
                      {getRoleIcon(member.role)}
                    </IconWrapper>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {member.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 font-medium">
                    {member.role}
                  </CardDescription>
                  <div className="flex justify-center mt-2">
                    <Badge 
                      variant="outline" 
                      className={`${
                        member.tokenType === "Officer" 
                          ? "border-purple-200 text-purple-700 bg-purple-50" 
                          : "border-blue-200 text-blue-700 bg-blue-50"
                      }`}
                    >
                      {member.tokenType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden mb-4 ring-4 ring-white shadow-lg">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{member.bio}</p>
                </CardContent>
                <CardFooter className="flex flex-col space-y-3 pt-4 bg-gray-50/50">
                  <a
                    href={`mailto:${member.email}`}
                    className="w-full flex items-center justify-center text-gray-700 hover:text-orange-600 text-sm font-medium transition-colors py-2 px-3 rounded-lg hover:bg-orange-50"
                  >
                    <Mail className="h-4 w-4 mr-2" /> Contact
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center text-gray-700 hover:text-orange-600 text-sm font-medium transition-colors py-2 px-3 rounded-lg hover:bg-orange-50"
                  >
                    <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
                  </a>
                </CardFooter>
              </EnhancedCard>
            )
          })}
        </div>
        </div>
      </div>
    </div>
  )
}
