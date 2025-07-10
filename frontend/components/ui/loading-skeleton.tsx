"use client"

import { RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  className?: string
}

interface StatsCardSkeletonProps {
  title?: string
  icon?: React.ComponentType<any>
  className?: string
}

interface MemberCardSkeletonProps {
  count?: number
  className?: string
}

interface TokenCardSkeletonProps {
  count?: number
  className?: string
}

// Basic inline loading component for small elements
export function InlineLoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn("flex items-center text-muted-foreground", className)}>
      <RefreshCw className="h-4 w-4 animate-spin mr-1" />
      <span className="text-lg">Loading...</span>
    </div>
  )
}

// Stats card loading skeleton - matches the officers page pattern
export function StatsCardSkeleton({ title, icon: Icon, className }: StatsCardSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title || "Loading"}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <InlineLoadingSkeleton />
        </div>
        <Skeleton className="h-3 w-24 mt-2" />
      </CardContent>
    </Card>
  )
}

// Member/user list loading skeleton
export function MemberCardSkeleton({ count = 5, className }: MemberCardSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Token/NFT grid loading skeleton
export function TokenCardSkeleton({ count = 6, className }: TokenCardSkeletonProps) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-gray-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <Skeleton className="h-48 w-full rounded" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Portfolio summary loading skeleton
export function PortfolioSummarySkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
      {[
        { title: "Total Value", icon: true },
        { title: "24h Change", icon: true },
        { title: "Assets", icon: true }
      ].map((item, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            {item.icon && <Skeleton className="h-4 w-4" />}
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Page section loading skeleton with title
export function SectionLoadingSkeleton({ 
  title, 
  children, 
  className 
}: { 
  title?: string
  children?: React.ReactNode
  className?: string 
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
          {title || "Loading..."}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children || (
          <div className="flex items-center justify-center py-8">
            <InlineLoadingSkeleton />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Full page loading skeleton
export function PageLoadingSkeleton({ 
  title = "Loading...", 
  showStats = true,
  showContent = true,
  showBanner = true,
  bannerGradient = "from-blue-600 via-purple-600 to-indigo-600",
  bannerIcon,
  bannerBadgeText = "Loading Dashboard",
  className 
}: { 
  title?: string
  showStats?: boolean
  showContent?: boolean
  showBanner?: boolean
  bannerGradient?: string
  bannerIcon?: React.ComponentType<any>
  bannerBadgeText?: string
  className?: string 
}) {
  const Icon = bannerIcon || RefreshCw

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Banner Section */}
      {showBanner && (
        <section className={cn(
          "relative overflow-hidden bg-gradient-to-br py-20 md:py-28",
          bannerGradient
        )}>
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-40 h-40 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-40 w-36 h-36 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
          </div>
          
          <div className="container relative mx-auto px-4 text-center">
            <div className="mx-auto max-w-4xl">
              {/* Floating Badge */}
              <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm border border-white/30">
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {bannerBadgeText}
              </div>
              
              <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
                <Icon className="inline-block h-16 w-16 mr-4 animate-spin" />
                {title}
              </h1>
              
              <Skeleton className="h-6 w-96 mx-auto bg-white/20" />
            </div>
          </div>
        </section>
      )}

      <div className={cn("min-h-screen", showBanner ? "" : "pt-8")}>
        <div className="container mx-auto px-4 py-12">
          {/* Header skeleton - only if no banner */}
          {!showBanner && (
            <div className="text-center mb-8">
              <Skeleton className="h-10 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
          )}

          {/* Stats section skeleton */}
          {showStats && (
            <div className="mb-8">
              <PortfolioSummarySkeleton />
            </div>
          )}

          {/* Content section skeleton */}
          {showContent && (
            <div className="space-y-6">
              <SectionLoadingSkeleton title="Loading data...">
                <MemberCardSkeleton count={3} />
              </SectionLoadingSkeleton>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
