"use client"

import { Users, Crown, Award, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

interface TeamMember {
  id: number
  name: string
  role: string
  image: string
}

interface MeetHeaderProps {
  featuredMembers?: TeamMember[]
}

export function MeetHeader({ featuredMembers = [] }: MeetHeaderProps) {
  // Fallback featured members if none provided
  const defaultMembers = [
    { id: 1, name: "Dr. Yosef Bonaparte", role: "Faculty Advisor", image: "/yosef.jpg" },
    { id: 2, name: "Julie Jurkowski", role: "President", image: "/julie.jpg" },
    { id: 3, name: "Liam Murphy", role: "Treasurer", image: "/liam.jpg" },
  ]

  const displayMembers = featuredMembers.length > 0 ? featuredMembers : defaultMembers

  return (
    <section className="relative bg-white py-16 md:py-24 overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50"></div>
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-100/30 to-transparent"></div>

      <div className="container relative mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              <Users className="h-4 w-4" />
              <span>Meet Our Community</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Meet Our Team
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Meet the passionate individuals driving our blockchain community forward. 
              From seasoned faculty advisors to dedicated student leaders.
            </p>

            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4" />
                <span>Leadership</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>Expertise</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>CU Denver</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Team Member Headshots */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-6">
              {/* Main Featured Member */}
              <motion.div 
                className="col-span-2 relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 shadow-lg">
                  {displayMembers[0] && (
                    <>
                      <Image
                        src={displayMembers[0].image}
                        alt={displayMembers[0].name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Fallback to gradient background if image fails
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="font-semibold text-lg">{displayMembers[0].name}</h3>
                        <p className="text-sm opacity-90">{displayMembers[0].role}</p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Secondary Members */}
              {displayMembers.slice(1, 3).map((member, index) => (
                <motion.div
                  key={member.id}
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  custom={index}
                >
                  <div className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 shadow-md">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 text-white">
                      <h4 className="font-medium text-sm">{member.name}</h4>
                      <p className="text-xs opacity-90">{member.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-16 h-16 bg-blue-500/10 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-8 -left-8 w-12 h-12 bg-cyan-500/10 rounded-full"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
