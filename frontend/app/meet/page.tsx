import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Linkedin } from "lucide-react"

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
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-4xl font-bold text-center text-gray-900">Connect With Us</h1>
      {/* TODO: Add club mission/vision statement and group photo here */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {clubMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <CardTitle>{member.name}</CardTitle>
              <CardDescription>{member.role}</CardDescription>
              {/* TODO: Add badge for tokenType and tooltip for role */}
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <img
                src={member.image || "/placeholder.svg"}
                alt={member.name}
                className="rounded-full w-24 h-24 object-cover mb-4"
              />
              <p className="text-sm text-gray-600 text-center">{member.bio}</p>
              {/* TODO: Add social links and club contributions */}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <a
                href={`mailto:${member.email}`}
                className="w-full flex items-center text-gray-700 hover:text-blue-600 text-sm"
              >
                <Mail className="h-4 w-4 mr-2" /> {member.email}
              </a>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center text-gray-700 hover:text-blue-600 text-sm"
              >
                <Linkedin className="h-4 w-4 mr-2" /> LinkedIn Profile
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
