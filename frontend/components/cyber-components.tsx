"use client"

import { ReactNode } from "react"

interface CyberHeroProps {
  title: string
  subtitle?: string
  command?: string
  statusText?: string
  children?: ReactNode
  gradient?: string
  feedType?: "blockchain" | "trading" | "governance" | "portfolio"
}

export function CyberHero({ 
  title, 
  subtitle, 
  command = "$ npm run blockchain-club --mode=production",
  statusText = "SYSTEM_ONLINE.EXE",
  children,
  gradient = "from-black via-gray-900 to-black",
  feedType = "blockchain"
}: CyberHeroProps) {
  
  const feedContent = {
    blockchain: `
Block #42069123
Tx: 0xAb3c...eF1
Gas Used: 21000
From: 0x742d...35c2
To: 0x8ba1...df89

Block #42069124
Tx: 0x9Dc4...Bd7
Gas Used: 87341
From: 0x1234...abcd
To: 0xbeef...dead

Block #42069125
Tx: 0xDdEf...A98
Gas Used: 65210
From: 0xcafe...babe
To: 0xfeed...face

Block #42069126
Tx: 0x99b4...C11
Gas Used: 12000
From: 0xdead...beef
To: 0x1337...c0de
    `,
    trading: `
BTC/USD: $67,842.31 ↗ +2.34%
ETH/USD: $3,987.15 ↘ -0.82%
BNB/USD: $614.27 ↗ +1.56%
SOL/USD: $143.89 ↗ +5.21%
XRP/USD: $0.57 ↘ -1.25%

Volume 24h: $23.4B
Market Cap: $2.1T
Fear & Greed: 72 (Greed)

BTC/USD: $67,901.45 ↗ +2.42%
ETH/USD: $3,992.33 ↗ +0.01%
BNB/USD: $615.89 ↗ +1.82%
    `,
    governance: `
Proposal #001: Treasury Allocation
Status: ACTIVE
Votes: 234 FOR / 45 AGAINST
Quorum: 89.2% reached
Ends: 2024-12-15 23:59 UTC

Proposal #002: New Member Requirements  
Status: PENDING
Votes: 156 FOR / 23 AGAINST
Quorum: 67.8% reached
Ends: 2024-12-20 23:59 UTC

Proposal #003: DeFi Investment Strategy
Status: DRAFT
Submitted by: 0x742d...35c2
Voting starts: 2024-12-10 00:00 UTC
    `,
    portfolio: `
Portfolio Value: $124,567.89
24h Change: +$2,341.23 (+1.92%)
Holdings: 15 assets

BTC: 1.2485 ($78,432.10)
ETH: 12.567 ($49,892.34)
SOL: 234.56 ($33,678.45)
USDC: $5,000.00 (Stable)

Staking Rewards: $234.56/month
DeFi Yields: 8.9% APY
Last Rebalance: 2024-12-08
Next Rebalance: 2024-12-22
    `
  }
  
  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${gradient} py-20 md:py-28`}>
      {/* Blockchain Feed Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-full animate-scroll-mono text-xs font-mono text-green-300 opacity-10 whitespace-pre-wrap p-4 blur-sm leading-5">
          {feedContent[feedType]}
        </div>
      </div>
      
      {/* Terminal Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
      
      {/* Animated Scan Line */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan opacity-30"></div>
      </div>
      
      {/* Floating Orbs */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-500/20 rounded-full mix-blend-screen filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-blue-500/20 rounded-full mix-blend-screen filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-40 w-36 h-36 bg-violet-500/20 rounded-full mix-blend-screen filter blur-xl animate-pulse delay-2000"></div>
      </div>
      
      {/* Corner Brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-green-400/50"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-green-400/50"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-green-400/50"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-green-400/50"></div>
      
      <div className="container relative mx-auto px-4 text-center z-10">
        <div className="mx-auto max-w-4xl">
          {/* Status Badge */}
          <div className="mb-6 inline-flex items-center rounded-full bg-black/40 px-4 py-2 text-sm font-mono text-green-400 backdrop-blur-sm border border-green-400/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            {statusText}
          </div>
          
          {/* Terminal Command */}
          <div className="mb-4 text-left max-w-2xl mx-auto bg-black/60 p-4 rounded-lg border border-green-400/30 backdrop-blur-sm">
            <div className="text-green-400 font-mono text-sm">
              <span className="text-green-500">root@blockchain-club:~$</span> {command}
            </div>
          </div>
          
          {/* Main Title */}
          <h1 className="mb-6 text-4xl font-mono text-green-400 sm:text-5xl md:text-6xl lg:text-7xl terminal-glow">
            {title}
          </h1>
          
          {subtitle && (
            <p className="mb-8 text-xl text-white/80 leading-relaxed">
              {subtitle}
            </p>
          )}
          
          {children}
        </div>
      </div>
    </section>
  )
}

interface CyberCardProps {
  children: ReactNode
  className?: string
  glowColor?: "green" | "blue" | "violet" | "cyan"
  size?: "sm" | "md" | "lg"
}

export function CyberCard({ 
  children, 
  className = "", 
  glowColor = "green",
  size = "md" 
}: CyberCardProps) {
  const colorMap = {
    green: "border-green-400/40 hover:border-green-400/60 hover:shadow-green-400/20",
    blue: "border-blue-400/40 hover:border-blue-400/60 hover:shadow-blue-400/20",
    violet: "border-violet-400/40 hover:border-violet-400/60 hover:shadow-violet-400/20",
    cyan: "border-cyan-400/40 hover:border-cyan-400/60 hover:shadow-cyan-400/20"
  }
  
  const sizeMap = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  }
  
  return (
    <div className={`
      bg-black/60 border backdrop-blur-sm rounded-2xl 
      hover:scale-105 transition-all duration-300 hover:shadow-2xl
      ${colorMap[glowColor]} ${sizeMap[size]} ${className}
    `}>
      {children}
    </div>
  )
}
