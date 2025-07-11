import fs from 'fs'
import path from 'path'

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

// Function to read markdown files from the articles directory
export async function readMarkdownFile(filename: string): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'articles', filename)
    const content = fs.readFileSync(filePath, 'utf8')
    return content
  } catch (error) {
    console.error(`Error reading markdown file ${filename}:`, error)
    return ''
  }
}

export const researchArticles: Article[] = [
  {
    id: "global-currency-analysis",
    title: "One World, One Currency: Promise and Peril",
    excerpt: "A comprehensive analysis of the economic implications of implementing a single global currency system, examining both the potential benefits and risks for developed and developing nations. This deep-dive explores historical precedents, theoretical frameworks, and real-world examples from the Eurozone to cryptocurrency adoption.",
    content: "", // Will be loaded from markdown
    author: "Economic Research Team",
    date: "2024-12-15",
    readTime: "15 min read",
    category: "Monetary Policy",
    tags: ["global currency", "monetary policy", "economic stability", "international trade", "eurozone", "cryptocurrency", "central banking"],
    featured: true,
    isMarkdown: true,
    filePath: "global-currency-analysis.md"
  },
  {
    id: "bitcoin-temporal-cycles",
    title: "The Temporal Bitcoin Cycle: How Natural Market Rhythms Emerge in a Decentralized Currency System",
    excerpt: "An innovative research framework analyzing temporal patterns in Bitcoin blockchain data through the lens of behavioral finance, macroeconomics, and Hayekian economic theory. This groundbreaking analysis explores how natural market rhythms emerge without central banking intervention.",
    content: "", // Will be loaded from markdown
    author: "Blockchain Research Team",
    date: "2024-12-10",
    readTime: "12 min read",
    category: "Research",
    tags: ["bitcoin", "temporal analysis", "spontaneous order", "hayek", "blockchain", "market cycles", "chronobiology", "decentralized finance"],
    featured: true,
    isMarkdown: true,
    filePath: "bitcoin-temporal-cycles.md"
  },
  {
    id: "robinhood-tokenization",
    title: "Robinhood's Revolutionary Move: Tokenizing Traditional Stocks on Blockchain",
    excerpt: "Examining Robinhood's groundbreaking initiative to enable trading of tokenized stocks on blockchain infrastructure, and its potential impact on traditional financial markets.",
    content: `<div class="prose prose-lg max-w-none">
      <h2>Introduction</h2>
      <p>Robinhood, the popular online brokerage platform, recently announced a groundbreaking initiative that could reshape the financial landscape. The company plans to let users trade tokenized stocks on blockchain rails, potentially increasing efficiency and accessibility in trading traditional assets.</p>

      <h2>The Technology Behind Tokenization</h2>
      <p>Stock tokenization involves creating digital representations of traditional securities on blockchain networks. This process enables 24/7 trading, fractional ownership, and programmable compliance features that could revolutionize how we interact with financial markets.</p>

      <h2>Market Implications</h2>
      <p>This move by Robinhood could democratize access to global markets, allowing retail investors to trade international stocks without traditional barriers. The blockchain infrastructure promises reduced settlement times from days to minutes, significantly improving capital efficiency.</p>

      <h2>Future Outlook</h2>
      <p>If successful, Robinhood's tokenization initiative could mark the beginning of a new era in financial markets, where blockchain technology becomes the standard infrastructure for securities trading and settlement.</p>
    </div>`,
    author: "FinTech Analysis Team",
    date: "2024-12-08",
    readTime: "6 min read",
    category: "FinTech",
    tags: ["tokenization", "robinhood", "blockchain", "securities", "defi", "traditional finance"],
    featured: true
  },
  {
    id: "defi-evolution-2024",
    title: "The Evolution of DeFi: From Experiment to Infrastructure",
    excerpt: "A comprehensive look at how decentralized finance has evolved from experimental protocols to essential financial infrastructure, examining the key developments, challenges, and future prospects.",
    content: `<div class="prose prose-lg max-w-none">
      <h2>The DeFi Revolution</h2>
      <p>Decentralized Finance (DeFi) has undergone a remarkable transformation since its inception. What began as experimental protocols on Ethereum has evolved into a sophisticated ecosystem of financial applications that collectively manage hundreds of billions of dollars in value.</p>

      <h2>Key Milestones in DeFi Development</h2>
      <p>The journey from MakerDAO's early collateralized debt positions to today's complex yield farming strategies represents one of the fastest innovation cycles in financial history. Major milestones include the launch of Uniswap's automated market maker, Compound's lending protocols, and the explosion of liquidity mining in 2020.</p>

      <h2>Current State of the Ecosystem</h2>
      <p>Today's DeFi landscape encompasses lending and borrowing protocols, decentralized exchanges, synthetic assets, insurance protocols, and yield optimization strategies. The total value locked (TVL) in DeFi protocols has grown exponentially, demonstrating real economic utility.</p>

      <h2>Future Prospects</h2>
      <p>The future of DeFi lies in improved user experience, cross-chain interoperability, and integration with traditional finance. As the technology matures, DeFi may become the backbone of a more open and accessible global financial system.</p>
    </div>`,
    author: "DeFi Research Team",
    date: "2024-11-20",
    readTime: "8 min read",
    category: "DeFi",
    tags: ["defi", "evolution", "security", "regulation", "institutional adoption", "blockchain", "ethereum"]
  },
  {
    id: "layer2-scaling-solutions",
    title: "Layer 2 Scaling Solutions: A Comparative Analysis",
    excerpt: "An examination of various Layer 2 scaling solutions for Ethereum, comparing their approaches, trade-offs, and suitability for different use cases.",
    content: `<div class="prose prose-lg max-w-none">
      <h2>Introduction</h2>
      <p>As Ethereum continues to face scalability challenges, Layer 2 solutions have emerged as the primary mechanism for increasing transaction throughput while maintaining security and decentralization.</p>

      <h2>Types of Layer 2 Solutions</h2>
      <p>The landscape includes optimistic rollups, zero-knowledge rollups, sidechains, and state channels, each offering unique trade-offs between security, scalability, and user experience.</p>

      <h2>Performance Metrics</h2>
      <p>Comparative analysis of transaction per second (TPS), finality times, and cost per transaction reveals significant differences between various Layer 2 implementations.</p>

      <h2>Future Developments</h2>
      <p>The roadmap for Layer 2 evolution includes improved interoperability, enhanced security mechanisms, and better user experience through account abstraction and cross-chain functionality.</p>
    </div>`,
    author: "Scaling Research Team",
    date: "2024-11-15",
    readTime: "9 min read",
    category: "Technology",
    tags: ["layer2", "scaling", "ethereum", "rollups", "blockchain", "zk-proofs", "optimistic rollups"]
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
