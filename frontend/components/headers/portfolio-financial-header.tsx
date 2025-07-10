"use client"

import { TrendingUp, DollarSign, BarChart3, Shield, Zap } from "lucide-react"
import { motion } from "framer-motion"

interface PortfolioFinancialHeaderProps {
  totalValue?: number
  dayChange?: number
  assetsCount?: number
}

export function PortfolioFinancialHeader({ 
  totalValue = 0, 
  dayChange = 0, 
  assetsCount = 0 
}: PortfolioFinancialHeaderProps) {
  
  const isPositiveChange = dayChange >= 0

  return (
    <section className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 py-12 md:py-16 overflow-hidden">
      {/* Financial Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Floating Financial Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-2 h-2 bg-green-400 rounded-full opacity-60"
          animate={{ y: [0, -20, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-40 right-32 w-3 h-3 bg-blue-400 rounded-full opacity-40"
          animate={{ y: [0, -30, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute bottom-32 left-40 w-2 h-2 bg-yellow-400 rounded-full opacity-50"
          animate={{ y: [0, -25, 0], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left - Financial Dashboard Style */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-4 inline-flex items-center space-x-2 rounded-md bg-green-600/20 px-3 py-1 text-sm font-medium text-green-300 border border-green-500/30">
              <TrendingUp className="h-4 w-4" />
              <span>Treasury Dashboard</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl font-mono">
              Portfolio
            </h1>
            
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              Real-time treasury analytics, asset allocation, and performance metrics. 
              Transparent financial management powered by blockchain technology.
            </p>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Total Value</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  ${totalValue.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wide">24h Change</span>
                </div>
                <div className={`text-2xl font-bold font-mono ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositiveChange ? '+' : ''}${dayChange.toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Data Visualization */}
          <motion.div
            className="relative h-64 lg:h-80"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* Simulated Chart Background */}
            <div className="absolute inset-0 bg-slate-800/30 rounded-2xl border border-slate-600/50 p-6">
              {/* Chart Lines */}
              <div className="relative h-full">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Chart Path */}
                  <motion.path
                    d="M 0 150 Q 50 100 100 120 T 200 110 T 300 90 T 400 80"
                    fill="none"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.5 }}
                  />
                  
                  {/* Area Fill */}
                  <motion.path
                    d="M 0 150 Q 50 100 100 120 T 200 110 T 300 90 T 400 80 L 400 200 L 0 200 Z"
                    fill="url(#chartGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                  />
                  
                  {/* Data Points */}
                  {[
                    { x: 100, y: 120 },
                    { x: 200, y: 110 },
                    { x: 300, y: 90 },
                    { x: 400, y: 80 }
                  ].map((point, i) => (
                    <motion.circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="rgb(34, 197, 94)"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 1.2 + i * 0.1 }}
                    />
                  ))}
                </svg>
                
                {/* Chart Labels */}
                <div className="absolute bottom-2 left-2 text-xs text-gray-400">
                  Last 30 Days
                </div>
                <div className="absolute top-2 right-2 flex items-center space-x-1 text-xs text-green-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12.4%</span>
                </div>
              </div>
            </div>

            {/* Floating Metrics */}
            <motion.div
              className="absolute -top-4 -right-4 bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
            >
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <div>
                  <div className="text-xs text-gray-400">Assets</div>
                  <div className="text-sm font-bold text-white">{assetsCount}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.7 }}
            >
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <div>
                  <div className="text-xs text-gray-400">Live</div>
                  <div className="text-sm font-bold text-white">On-Chain</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
