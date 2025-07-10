"use client"

import { Vote, Shield, GitBranch } from "lucide-react"
import { motion } from "framer-motion"

export function GovernanceHeader() {
  return (
    <section className="relative bg-slate-900 py-16 md:py-24 overflow-hidden">
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="grid grid-cols-12 gap-4 h-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <motion.div
                key={i}
                className="bg-white/20 rounded-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container relative mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Formal Content */}
          <motion.div 
            className="max-w-2xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-4 inline-flex items-center space-x-2 rounded-md bg-blue-600/20 px-3 py-1 text-sm font-medium text-blue-300 border border-blue-500/30">
              <Vote className="h-4 w-4" />
              <span>Governance & Operations</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              Club Governance
            </h1>
            
            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              Transparent governance structure, smart contract architecture, and decentralized operations. 
              Everything is on-chain, auditable, and designed for maximum transparency.
            </p>

            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <GitBranch className="h-4 w-4" />
                <span>Decentralized</span>
              </div>
              <div className="flex items-center space-x-2">
                <Vote className="h-4 w-4" />
                <span>Transparent</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Abstract Governance Visual */}
          <motion.div 
            className="hidden lg:flex items-center justify-center w-96 h-96"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative">
              {/* Central Node */}
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Vote className="h-8 w-8 text-white" />
              </div>
              
              {/* Orbiting Nodes */}
              {[0, 72, 144, 216, 288].map((rotation, i) => (
                <motion.div
                  key={i}
                  className="absolute w-8 h-8 bg-slate-600 rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-60px)`
                  }}
                  animate={{
                    rotate: [rotation, rotation + 360]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
