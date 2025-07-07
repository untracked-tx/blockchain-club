import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface EnhancedCardProps {
  children: ReactNode
  className?: string
  variant?: "default" | "gradient" | "glass" | "elevated"
  hover?: boolean
}

export function EnhancedCard({ 
  children, 
  className, 
  variant = "default", 
  hover = true 
}: EnhancedCardProps) {
  const baseClasses = "transition-all duration-300"
  
  const variantClasses = {
    default: "bg-white border border-gray-200/50 shadow-sm",
    gradient: "bg-gradient-to-br from-white to-gray-50 border border-gray-200/50 shadow-lg",
    glass: "bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg",
    elevated: "bg-white border border-gray-200/50 shadow-xl"
  }
  
  const hoverClasses = hover 
    ? "hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]" 
    : ""

  return (
    <Card 
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        "rounded-2xl overflow-hidden",
        className
      )}
    >
      {children}
    </Card>
  )
}

interface IconWrapperProps {
  children: ReactNode
  color?: "blue" | "green" | "purple" | "orange" | "red" | "gray"
  size?: "sm" | "md" | "lg"
}

export function IconWrapper({ children, color = "blue", size = "md" }: IconWrapperProps) {
  const sizeClasses = {
    sm: "h-12 w-12 p-3",
    md: "h-16 w-16 p-4", 
    lg: "h-20 w-20 p-5"
  }
  
  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-500 to-indigo-600",
    green: "bg-gradient-to-br from-green-500 to-emerald-600",
    purple: "bg-gradient-to-br from-purple-500 to-pink-600",
    orange: "bg-gradient-to-br from-orange-500 to-red-600",
    red: "bg-gradient-to-br from-red-500 to-pink-600",
    gray: "bg-gradient-to-br from-gray-400 to-slate-500"
  }

  return (
    <div className={cn(
      "rounded-2xl text-white shadow-lg mb-4 flex items-center justify-center",
      sizeClasses[size],
      colorClasses[color]
    )}>
      {children}
    </div>
  )
}

interface FloatingBadgeProps {
  children: ReactNode
  color?: "blue" | "green" | "purple" | "orange" | "gray"
}

export function FloatingBadge({ children, color = "blue" }: FloatingBadgeProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200", 
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    gray: "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className={cn(
      "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium border",
      colorClasses[color]
    )}>
      {children}
    </div>
  )
}
