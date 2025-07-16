import {
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  ExternalLink,
  DollarSign,
  Bitcoin,
  Info,
  Shield,
  BarChart3,
  AlertTriangle,
  Zap,
  Coins,
  Gem,
  Hexagon,
  CircleDot,
  Sparkles,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface PortfolioLoadingScreenProps {
  message: string
  progress: number
}

export function PortfolioLoadingScreen({ message, progress }: PortfolioLoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 py-20 md:py-28">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-36 h-36 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Floating Badge */}
            <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-emerald-100 backdrop-blur-sm border border-white/30">
              <TrendingUp className="mr-2 h-4 w-4" />
              Investment Portfolio
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
              💰 Treasury Dashboard
            </h1>
            
            <p className="mb-8 text-xl text-emerald-100 leading-relaxed">
              Professional treasury management for the Blockchain Club. Real-time portfolio tracking, transparent reporting, and strategic investment oversight.
            </p>
            
            {/* Treasurer Credit */}
            <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-6 py-3 text-sm font-medium text-emerald-100 backdrop-blur-sm border border-white/30">
              <Shield className="mr-2 h-4 w-4" />
              Managed by Club Treasurer
            </div>
          </div>
        </div>
      </section>

      {/* Loading Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-white shadow-xl">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                {/* Loading Animation */}
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-4 relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-spin">
                      <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                        <Bitcoin className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loading Message */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Loading Portfolio Data</h2>
                  <p className="text-lg text-gray-600 font-medium">{message}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress 
                    value={progress} 
                    className="w-full h-3 bg-gray-100"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Loading components...</span>
                    <span>{progress}% complete</span>
                  </div>
                </div>

                {/* Loading Status Icons */}
                <div className="flex justify-center gap-4 pt-4">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all duration-300 ${
                    progress >= 25 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <BarChart3 className="w-4 h-4" />
                    Portfolio
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all duration-300 ${
                    progress >= 50 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Bitcoin className="w-4 h-4" />
                    Markets
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all duration-300 ${
                    progress >= 75 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Zap className="w-4 h-4" />
                    Transactions
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all duration-300 ${
                    progress >= 100 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Shield className="w-4 h-4" />
                    Analysis
                  </div>
                </div>

                {/* Fun Facts */}
                <div className="pt-6 border-t border-gray-100">
                  <Badge variant="outline" className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border-blue-200">
                    💡 Did you know? The first Bitcoin transaction was for 2 pizzas worth 10,000 BTC!
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
