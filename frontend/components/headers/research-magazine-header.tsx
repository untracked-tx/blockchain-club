"use client"

import { BookOpen, Search, Newspaper, TrendingUp, Users, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ResearchMagazineHeaderProps {
  onSearch?: (query: string) => void
  featuredCount?: number
  totalArticles?: number
}

export function ResearchMagazineHeader({ 
  onSearch, 
  featuredCount = 6, 
  totalArticles = 24 
}: ResearchMagazineHeaderProps) {
  
  return (
    <section className="relative bg-white py-12 md:py-16 border-b-2 border-gray-100">
      {/* Magazine-style Header */}
      <div className="container mx-auto px-4">
        {/* Top Bar - Magazine Style */}
        <motion.div 
          className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Updated Weekly</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>Expert Contributors</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
            <span>{totalArticles} Articles</span>
            <div className="h-4 w-px bg-gray-300"></div>
            <span>{featuredCount} Featured</span>
          </div>
        </motion.div>

        {/* Main Header Content */}
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Left - Title & Description */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-4 inline-flex items-center space-x-2 rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              <BookOpen className="h-4 w-4" />
              <span>Research & Analysis</span>
            </div>
            
            <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl leading-tight">
              Research Hub
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-6 max-w-2xl">
              In-depth research, technical analysis, and expert insights on blockchain technology, 
              cryptocurrency markets, and emerging DeFi protocols.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 max-w-md">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{featuredCount}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Featured</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalArticles}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">12</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Categories</div>
              </div>
            </div>
          </motion.div>

          {/* Right - Search & Navigation */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search research..."
                className="pl-10 h-12 bg-white border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>

            {/* Quick Categories */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Quick Access
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Technical', 'DeFi', 'Security', 'Market Research'].map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    className="text-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Research Stats */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Latest Activity</span>
              </div>
              <p className="text-xs text-gray-600">
                3 new articles published this week
              </p>
            </div>
          </motion.div>
        </div>

        {/* Featured Categories Strip */}
        <motion.div 
          className="mt-8 pt-6 border-t border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Featured Categories
            </h3>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              View All Categories →
            </Button>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-3">
            {[
              { name: 'Blockchain Fundamentals', count: 8, color: 'bg-blue-100 text-blue-700' },
              { name: 'DeFi Protocols', count: 6, color: 'bg-green-100 text-green-700' },
              { name: 'Smart Contract Security', count: 4, color: 'bg-red-100 text-red-700' },
              { name: 'Market Analysis', count: 6, color: 'bg-purple-100 text-purple-700' },
            ].map((category) => (
              <motion.div
                key={category.name}
                className={`px-3 py-1 rounded-full text-xs font-medium ${category.color} cursor-pointer hover:shadow-sm transition-shadow`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.name} ({category.count})
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
