export interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  date: string
  readTime: string
  category: string
  tags: string[]
  featured?: boolean
  imageUrl?: string
  isMarkdown?: boolean
  filePath?: string
}

// Function to read markdown files from the API
export async function readMarkdownFile(filename: string): Promise<string> {
  try {
    const response = await fetch(`/api/articles?filename=${filename}`)
    if (!response.ok) {
      throw new Error('Failed to fetch markdown file')
    }
    const data = await response.json()
    return data.content
  } catch (error) {
    console.error(`Error reading markdown file ${filename}:`, error)
    return ''
  }
}

export const researchArticles: Article[] = [
  {
    id: "humanitarian-blockchain-initiative",
    title: "Bridging the Gap: A Walletless Digital Cash System for Global Humanitarian Aid",
    excerpt: "A comprehensive proposal for implementing blockchain technology in humanitarian aid without requiring traditional crypto wallets. This initiative addresses the challenges of delivering financial assistance to unbanked populations through simplified mobile interfaces and transparent fund distribution.",
    content: "", // Will be loaded from markdown
    author: "Liam Murphy",
    date: "2025-01-10",
    readTime: "20 min read",
    category: "Research",
    tags: ["humanitarian aid", "blockchain", "digital cash", "unbanked", "mobile technology", "transparency", "financial inclusion", "walletless", "development"],
    featured: true,
    isMarkdown: true,
    filePath: "humanitarian-initiative.md"
  },
  {
    id: "central-banks-vs-crypto",
    title: "Central Banks vs. Cryptocurrency: The Global Battle for Monetary Control",
    excerpt: "As national currencies crumble and digital assets surge, a worldwide financial war is being fought in the shadows of regulation and rebellion. From Nigeria's naira crisis to Argentina's peso collapse, witness how economic disaster is driving the greatest monetary disruption in generations.",
    content: "", // Will be loaded from markdown
    author: "Julian Guiteau",
    date: "2024-12-18",
    readTime: "18 min read",
    category: "Market Analysis",
    tags: ["central banks", "cryptocurrency", "monetary policy", "nigeria", "argentina", "turkey", "financial crisis", "stablecoins"],
    featured: true,
    isMarkdown: true,
    filePath: "central-banks-vs-crypto.md"
  },
  {
    id: "bitcoin-temporal-cycles",
    title: "The Temporal Bitcoin Cycle: How Natural Market Rhythms Emerge in a Decentralized Currency System",
    excerpt: "An innovative research framework analyzing temporal patterns in Bitcoin blockchain data through the lens of behavioral finance, macroeconomics, and Hayekian economic theory. This groundbreaking analysis explores how natural market rhythms emerge without central banking intervention.",
    content: "", // Will be loaded from markdown
    author: "Liam Murphy",
    date: "2025-04-20",
    readTime: "12 min read",
    category: "Research",
    tags: ["bitcoin", "temporal analysis", "spontaneous order", "hayek", "blockchain", "market cycles", "chronobiology", "decentralized finance"],
    featured: true,
    isMarkdown: true,
    filePath: "bitcoin-temporal-cycles.md"
  },
  {
    id: "robinhood-tokenization",
    title: "Robinhood's Blockchain Gambit: Wall Street Meets Crypto Revolution",
    excerpt: "The commission-free trading pioneer that democratized stock investing is making its boldest bet yet—putting traditional securities on blockchain rails. But can Robinhood's tokenization play disrupt Wall Street's centuries-old settlement system, or is it just another Silicon Valley pipe dream?",
    content: "", // Will be loaded from markdown
    author: "Julian Guiteau",
    date: "2024-12-08",
    readTime: "8 min read",
    category: "FinTech",
    tags: ["tokenization", "robinhood", "blockchain", "securities", "wall street", "disruption", "defi", "regulation"],
    featured: true,
    isMarkdown: true,
    filePath: "robinhood-tokenization.md"
  },
  {
    id: "layer2-scaling-solutions",
    title: "The Great Ethereum Escape: How Layer 2 Networks Are Rescuing Crypto from $100 Gas Fees",
    excerpt: "While Ethereum users hemorhaged billions in transaction fees, a new generation of Layer 2 networks quietly built the infrastructure to save cryptocurrency from itself. From Arbitrum's optimistic gamble to Polygon's aggressive expansion, discover how scaling solutions turned from experimental sideshows into the main event.",
    content: "", // Will be loaded from markdown
    author: "Julian Guiteau",
    date: "2024-12-28",
    readTime: "12 min read",
    category: "Technology",
    tags: ["layer2", "scaling", "ethereum", "arbitrum", "polygon", "base", "rollups", "defi", "gas fees"],
    featured: true,
    isMarkdown: true,
    filePath: "layer2-scaling-solutions.md"
  }
]

export const categories = [
  "All",
  "DeFi",
  "Technology", 
  "Economic Theory",
  "Monetary Policy",
  "FinTech",
  "Research",
  "Market Analysis"
]
