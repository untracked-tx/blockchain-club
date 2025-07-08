"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Animation */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-8xl font-bold text-indigo-600 mb-4"
          >
            404
          </motion.div>
          
          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          
          {/* Action Buttons */}
          <div className="space-y-4">
            <Link href="/">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Homepage
              </Button>
            </Link>
            
            <Link href="/research">
              <Button variant="outline" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Browse Research
              </Button>
            </Link>
          </div>
          
          {/* Fun Easter Egg Hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-8 text-xs text-gray-400"
          >
            💡 Tip: Some doors require special keys...
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
