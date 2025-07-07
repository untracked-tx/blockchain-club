"use client"

import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EnhancedCard, IconWrapper, FloatingBadge } from "@/components/ui/enhanced-card"
import { ArrowLeft, Calendar, User, Clock, Share2, Bookmark, Download, BookOpen, Star } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

// Same mock data from main research page
const researchArticles = [
  {
    id: 1,
    title: "Layer 2 Scaling Solutions: A Comparative Analysis",
    excerpt: "An in-depth look at Optimistic Rollups, ZK Rollups, and other Layer 2 solutions.",
    author: "Dr. Jane Smith",
    authorTitle: "Blockchain Researcher, University of Technology",
    date: "2025-04-15",
    readTime: "12 min",
    image: "/placeholder.svg",
    categories: ["Technical", "Infrastructure", "Scaling"],
    content: `
      <h2>Introduction to Layer 2 Scaling</h2>
      <p>Blockchain scalability remains one of the most significant challenges facing widespread adoption. As networks like Ethereum continue to grow in popularity, the limitations of their base layer become increasingly apparent. Layer 2 (L2) solutions have emerged as the primary approach to scaling these networks without sacrificing security or decentralization.</p>
      
      <h2>Optimistic Rollups</h2>
      <p>Optimistic rollups operate by executing transactions off-chain and then posting the transaction data to the main chain. They are called "optimistic" because they assume transactions are valid by default and only run fraud proofs when a transaction is challenged.</p>
      <p>Key projects implementing optimistic rollups include Optimism and Arbitrum, which have seen significant adoption among DeFi applications seeking to offer users lower fees and faster transactions while maintaining Ethereum's security guarantees.</p>
      
      <h2>Zero-Knowledge Rollups</h2>
      <p>Zero-knowledge rollups (ZK-rollups) bundle or "roll up" hundreds of transactions into a single transaction. They generate cryptographic proofs (known as ZK-SNARKs or ZK-STARKs) that verify the validity of all transactions within the rollup.</p>
      <p>Unlike optimistic rollups, ZK-rollups don't rely on challenge periods, allowing for faster finality. However, they typically require more complex cryptography and computational resources.</p>
      
      <h2>Comparative Analysis</h2>
      <p>When comparing different L2 solutions, several factors come into play:</p>
      <ul>
        <li><strong>Security model:</strong> How closely the solution inherits the security guarantees of the underlying blockchain.</li>
        <li><strong>Transaction finality:</strong> The time required for a transaction to be considered irreversible.</li>
        <li><strong>Throughput:</strong> The number of transactions that can be processed per second.</li>
        <li><strong>Cost efficiency:</strong> The reduction in transaction costs compared to the base layer.</li>
      </ul>
      
      <h2>Conclusion and Future Directions</h2>
      <p>Layer 2 solutions represent the most promising path toward blockchain scalability in the near term. As these technologies mature, we expect to see increasing specialization, with different solutions optimized for specific use cases.</p>
      <p>The future of blockchain scaling likely involves a combination of approaches, including continued L2 development, improvements to base layer protocols, and the emergence of application-specific chains designed for particular workloads.</p>
    `
  },
  {
    id: 2,
    title: "The Future of Decentralized Finance: Trends and Predictions",
    excerpt: "Exploring emerging DeFi protocols and their potential impact on traditional finance.",
    author: "Alex Johnson",
    authorTitle: "Financial Analyst, Crypto Research Institute",
    date: "2025-04-02",
    readTime: "8 min",
    image: "/placeholder.svg",
    categories: ["DeFi", "Finance", "Trends"],
    content: `
      <h2>The Evolution of DeFi</h2>
      <p>Decentralized Finance (DeFi) has evolved rapidly from simple token swaps to complex financial instruments that mirror and expand upon traditional finance. This article explores the current state of DeFi and makes predictions about its future trajectory.</p>
      
      <h2>Current DeFi Landscape</h2>
      <p>The DeFi ecosystem now includes lending protocols, decentralized exchanges, derivatives platforms, insurance products, and yield optimization tools. Total Value Locked (TVL) in DeFi protocols has grown significantly, indicating increasing trust in these systems.</p>
      
      <h2>Emerging Trends</h2>
      <p>Several key trends are shaping the future of DeFi:</p>
      <ul>
        <li><strong>Cross-chain interoperability:</strong> Solutions that enable seamless asset and data transfer between different blockchain networks.</li>
        <li><strong>Real-world asset tokenization:</strong> Bringing traditional assets like real estate and stocks on-chain.</li>
        <li><strong>Institutional adoption:</strong> Growing interest from traditional financial institutions in DeFi protocols.</li>
        <li><strong>Improved user experience:</strong> Simplifying complex DeFi interactions to attract mainstream users.</li>
      </ul>
      
      <h2>Regulatory Considerations</h2>
      <p>As DeFi grows in size and importance, regulatory frameworks are evolving to address potential risks while not stifling innovation. Finding this balance will be crucial for the continued growth of the ecosystem.</p>
      
      <h2>Future Predictions</h2>
      <p>Looking ahead, we anticipate several developments in the DeFi space:</p>
      <ol>
        <li>Integration with traditional finance through hybrid systems that combine the best of both worlds.</li>
        <li>Specialization of protocols for specific market segments or use cases.</li>
        <li>Increased focus on privacy-preserving transactions while maintaining regulatory compliance.</li>
        <li>Evolution of governance systems to improve decision-making in protocol development.</li>
      </ol>
      
      <h2>Conclusion</h2>
      <p>The future of DeFi appears bright, with continued innovation likely to reshape the financial landscape. As these systems mature, they will increasingly challenge traditional financial services and potentially create entirely new economic models.</p>
    `
  },
  // Abbreviated for brevity, but would include all articles from the main page
];

export default function ArticleDetail() {
  const router = useRouter();
  const params = useParams();
  const [saved, setSaved] = useState(false);
  
  // Find the article that matches the ID parameter
  const articleId = Number(params.id);
  const article = researchArticles.find(a => a.id === articleId);
  
  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <EnhancedCard variant="gradient" className="max-w-md mx-auto p-8">
            <div className="flex justify-center mb-4">
              <IconWrapper color="red" size="md">
                <BookOpen className="h-5 w-5" />
              </IconWrapper>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Article Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              The article you're looking for doesn't exist or has been moved.
            </p>
            <Button 
              onClick={() => router.push('/research')} 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              <ArrowLeft className="mr-2" size={16} />
              Back to Research
            </Button>
          </EnhancedCard>
        </div>
      </div>
    );
  }
  
  // Format date
  const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-700 py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-blue-500/30"></div>
        <div className="relative container mx-auto px-4">
          {/* Navigation */}
          <Button 
            variant="ghost" 
            className="mb-6 text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => router.push('/research')}
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Research
          </Button>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {article.categories.map((category) => (
              <FloatingBadge key={category} color="blue">
                {category}
              </FloatingBadge>
            ))}
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {article.title}
          </h1>
          
          {/* Meta Information */}
          <div className="flex flex-col md:flex-row md:items-center text-white/90 gap-y-3 md:gap-x-6 text-lg">
            <div className="flex items-center">
              <User size={20} className="mr-2" />
              <span className="font-medium">{article.author}</span>
              {article.authorTitle && (
                <span className="text-white/70 ml-2">| {article.authorTitle}</span>
              )}
            </div>
            <div className="flex items-center">
              <Calendar size={20} className="mr-2" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <Clock size={20} className="mr-2" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
      
      {/* Article Content */}
      <EnhancedCard variant="elevated" className="mb-10">
        {/* Featured image */}
        <div className="rounded-xl overflow-hidden mb-8 bg-gradient-to-br from-gray-100 to-gray-200">
          <Image
            src={article.image}
            alt={article.title}
            width={1200}
            height={600}
            className="w-full h-auto object-cover"
          />
        </div>
        
        {/* Article actions */}
        <div className="flex justify-between items-center mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200/50">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50">
              <Share2 size={16} className="mr-2" />
              Share
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`backdrop-blur-sm border-blue-200 ${saved ? 'bg-blue-100 text-blue-700' : 'bg-white/80 hover:bg-blue-50'}`}
              onClick={() => setSaved(!saved)}
            >
              <Bookmark size={16} className="mr-2" fill={saved ? "currentColor" : "none"} />
              {saved ? 'Saved' : 'Save'}
            </Button>
          </div>
          <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50">
            <Download size={16} className="mr-2" />
            Download PDF
          </Button>
        </div>
        
        {/* Article content */}
        <div className="px-6 pb-8">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </EnhancedCard>
      
      {/* Author bio */}
      <EnhancedCard variant="gradient" className="mb-10">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <IconWrapper color="green" size="sm">
              <User className="h-5 w-5" />
            </IconWrapper>
            <div>
              <h3 className="text-xl font-bold text-gray-900">About the Author</h3>
              <p className="text-gray-600">{article.author}</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">
            {article.author} {article.authorTitle && `is ${article.authorTitle}`}. 
            They specialize in blockchain research and distributed systems, contributing to the advancement 
            of decentralized technologies and their real-world applications.
          </p>
          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
            <Star className="h-4 w-4 mr-2" />
            View Profile
          </Button>
        </div>
      </EnhancedCard>
      
      {/* Related research */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Research</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {researchArticles
            .filter(a => a.id !== article.id && a.categories.some(c => article.categories.includes(c)))
            .slice(0, 2)
            .map(relatedArticle => (
              <div 
                key={relatedArticle.id} 
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col"
              >
                <div className="h-40 overflow-hidden relative bg-gray-200">
                  <Image
                    src={relatedArticle.image}
                    alt={relatedArticle.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 mb-2">{relatedArticle.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{relatedArticle.excerpt}</p>
                  <Button 
                    variant="link" 
                    className="text-blue-600 hover:text-blue-800 p-0 justify-start h-auto"
                    onClick={() => {
                      router.push(`/research/${relatedArticle.id}`);
                      window.scrollTo(0, 0);
                    }}
                  >
                    Read article
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
      </div>
    </div>
  );
}
