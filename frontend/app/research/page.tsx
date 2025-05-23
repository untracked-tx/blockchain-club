"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowUpRight, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ResearchHeader } from "@/components/research-header"

// Mock data for research articles
const researchArticles = [
  {
    id: 1,
    title: "Understanding Blockchain Consensus Mechanisms: A Comparative Study",
    excerpt: "An in-depth analysis of different consensus mechanisms including Proof of Work, Proof of Stake, and Delegated Proof of Stake, with performance benchmarks and security considerations.",
    date: "2023-11-15",
    author: "Dr. Sophia Chen",
    categories: ["Technical", "Blockchain Fundamentals"],
    readTime: 12,
    imageUrl: "/images/research/consensus-mechanisms.jpg",
    featured: true
  },
  {
    id: 2,
    title: "The Tokenomics of DeFi Protocols: Case Studies and Best Practices",
    excerpt: "Examining the economic models behind successful decentralized finance protocols and extracting principles for sustainable tokenomic design.",
    date: "2023-10-03",
    author: "Marcus Johnson",
    categories: ["DeFi", "Economics"],
    readTime: 15,
    imageUrl: "/images/research/defi-tokenomics.jpg",
    featured: true
  },
  {
    id: 3,
    title: "Smart Contract Vulnerabilities: Lessons from Major Exploits",
    excerpt: "A technical examination of notable smart contract exploits, analyzing vulnerabilities, attack vectors, and prevention strategies.",
    date: "2023-09-20",
    author: "Alex Rivera",
    categories: ["Security", "Smart Contracts"],
    readTime: 10,
    imageUrl: "/images/research/smart-contract-security.jpg",
    featured: false
  },
  {
    id: 4,
    title: "Layer 2 Scaling Solutions: Technical Tradeoffs and Use Cases",
    excerpt: "Comparing major Layer 2 scaling solutions for Ethereum including Optimistic Rollups, ZK-Rollups, and State Channels, with performance benchmarks.",
    date: "2023-08-12",
    author: "Dr. Sophia Chen",
    categories: ["Scaling", "Technical"],
    readTime: 14,
    imageUrl: "/images/research/layer2-scaling.jpg",
    featured: false
  },
  {
    id: 5,
    title: "NFT Market Analysis: Trends and Investment Opportunities",
    excerpt: "Data-driven analysis of NFT market trends, including historical price movements, trading volumes, and emerging application areas.",
    date: "2023-07-25",
    author: "Emma Thompson",
    categories: ["NFTs", "Market Research"],
    readTime: 8,
    imageUrl: "/images/research/nft-analysis.jpg",
    featured: false
  },
  {
    id: 6,
    title: "Regulatory Frameworks for Cryptocurrencies: Global Perspectives",
    excerpt: "A comprehensive review of cryptocurrency regulations across major jurisdictions, with insights on compliance requirements and future trends.",
    date: "2023-06-18",
    author: "Marcus Johnson",
    categories: ["Regulation", "Policy"],
    readTime: 16,
    imageUrl: "/images/research/crypto-regulation.jpg",
    featured: false
  }
];

// Categories for filtering
const allCategories = [
  "All",
  "Technical", 
  "Blockchain Fundamentals", 
  "DeFi", 
  "Economics", 
  "Security", 
  "Smart Contracts", 
  "Scaling", 
  "NFTs", 
  "Market Research", 
  "Regulation", 
  "Policy"
];

export default function ResearchPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter articles based on selected category and search query
  const filteredArticles = researchArticles.filter(article => {
    const matchesCategory = 
      selectedCategory === "All" || 
      article.categories.includes(selectedCategory);
    
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Get featured articles
  const featuredArticles = researchArticles.filter(article => article.featured);
  
  return (
    <div className="container mx-auto px-4 py-16">
      <ResearchHeader />
      
      {/* Featured Research */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Featured Research</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {featuredArticles.map((article) => (
            <motion.div
              key={article.id}
              className="group rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative h-56 w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop";
                  }}
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <Badge className="bg-blue-600 hover:bg-blue-700">Featured</Badge>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <User size={14} className="mr-1" />
                    <span className="mr-3">{article.author}</span>
                    <Calendar size={14} className="mr-1" />
                    <span>{new Date(article.date).toLocaleDateString()}</span>
                  </div>
                  
                  <Link href={`/research/${article.id}`} className="text-blue-600 hover:text-blue-800">
                    <Button variant="link" className="p-0 h-auto">
                      Read more <ArrowUpRight size={14} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Filters and Search */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex overflow-x-auto pb-2 md:pb-0 -mx-2 px-2 scrollbar-hide">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 mr-2 rounded-full whitespace-nowrap text-sm ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search research..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </section>
      
      {/* Research Article Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-6">All Research</h2>
        
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No research articles found. Try changing your filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <motion.div
                key={article.id}
                className="rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-md transition-all"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative h-48">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop";
                    }}
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex flex-wrap mb-2 gap-2">
                    {article.categories.map((category) => (
                      <Badge key={category} variant="outline" className="bg-gray-100">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.excerpt}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500">
                      <User size={12} className="mr-1" />
                      <span className="mr-2">{article.author}</span>
                      <Clock size={12} className="mr-1" />
                      <span>{article.readTime} min read</span>
                    </div>
                    
                    <Link href={`/research/${article.id}`} className="text-blue-600 hover:text-blue-800">
                      <Button variant="link" size="sm" className="p-0 h-auto">
                        Read
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}