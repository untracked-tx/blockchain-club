"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, BookOpen } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function ResearchHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [scrolled])

  // Handle search functionality with secret keyword
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check for secret keyword
    if (searchQuery.toLowerCase().trim() === "inplainview42") {
      // Redirect to members lounge with authorization key
      router.push("/memberslounge?key=authorized")
      return
    }
    
    // Normal search functionality - you can implement this based on your needs
    console.log("Searching for:", searchQuery)
    // For now, just clear the search - you can implement actual search later
    setSearchQuery("")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden ${
        scrolled ? "py-6" : "py-12"
      } transition-all duration-300`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 grid grid-cols-6 w-full h-full opacity-10">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="border-r border-t border-white/20" />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-blue-200 mr-2" strokeWidth={1.5} />
            <h2 className="text-xl font-medium text-white">Blockchain Club Research</h2>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Latest <span className="text-blue-200">Blockchain</span> Insights
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            Explore research papers, technical analyses, and market insights from our community of blockchain experts.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <form onSubmit={handleSearch} className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, topics, or authors..."
                className="w-full pl-10 pr-4 py-3 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
              />
            </form>
            <Link href="/research/submit">
              <Button className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg whitespace-nowrap px-6">
                Submit Research
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
