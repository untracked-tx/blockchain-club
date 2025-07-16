import { NextRequest, NextResponse } from "next/server"
import { Redis } from '@upstash/redis'

interface PolRequest {
  id: string
  address: string
  timestamp: number
  status: "pending" | "funded" | "rejected"
  userAgent?: string
  ip?: string
  createdAt: string
}

// Initialize Redis with explicit credentials
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
const REQUESTS_KEY = "pol-requests"

// Debug function to check Redis connection
async function testRedisConnection() {
  try {
    console.log("Testing Redis connection...")
    console.log("UPSTASH_REDIS_REST_URL:", process.env.UPSTASH_REDIS_REST_URL ? "✅ Set" : "❌ Missing")
    console.log("UPSTASH_REDIS_REST_TOKEN:", process.env.UPSTASH_REDIS_REST_TOKEN ? "✅ Set" : "❌ Missing")
    
    // Test with a simple ping
    await redis.ping()
    console.log("✅ Redis connection successful")
    return true
  } catch (err) {
    console.error("❌ Redis connection failed:", err)
    return false
  }
}

async function getRequests(): Promise<PolRequest[]> {
  try {
    const requests = await redis.get<PolRequest[]>(REQUESTS_KEY)
    return requests || []
  } catch (err) {
    console.error("Error fetching from Redis:", err)
    return []
  }
}

async function saveRequests(requests: PolRequest[]) {
  try {
    await redis.set(REQUESTS_KEY, requests)
  } catch (err) {
    console.error("Error saving to Redis:", err)
    throw err
  }
}

export async function POST(request: NextRequest) {
  try {
    // Test Redis connection first
    const isConnected = await testRedisConnection()
    if (!isConnected) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      )
    }

    const { address, timestamp } = await request.json()
    
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      )
    }

    const requests = await getRequests()
    
    // Check if user already has a pending request
    const existingRequest = requests.find(
      req => req.address.toLowerCase() === address.toLowerCase() && 
             req.status === "pending"
    )
    
    if (existingRequest) {
      return NextResponse.json(
        { 
          message: "Request already pending",
          requestId: existingRequest.id,
          status: "pending"
        },
        { status: 200 }
      )
    }

    // Check for recent requests (prevent spam)
    const recentRequest = requests.find(
      req => req.address.toLowerCase() === address.toLowerCase() && 
             Date.now() - req.timestamp < 24 * 60 * 60 * 1000 // 24 hours
    )
    
    if (recentRequest && recentRequest.status === "funded") {
      return NextResponse.json(
        { error: "You've already received POL in the last 24 hours" },
        { status: 429 }
      )
    }

    // Create new request
    const newRequest: PolRequest = {
      id: `pol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      address: address.toLowerCase(),
      timestamp: timestamp || Date.now(),
      status: "pending",
      userAgent: request.headers.get("user-agent") || undefined,
      ip: request.headers.get("x-forwarded-for") || undefined,
      createdAt: new Date().toISOString()
    }

    requests.push(newRequest)
    await saveRequests(requests)
    
    console.log("✅ Saved new request to Redis. Total requests now:", requests.length)
    console.log("New request ID:", newRequest.id)

    return NextResponse.json({
      message: "POL request submitted successfully!",
      requestId: newRequest.id,
      status: "pending",
      estimatedTime: "Usually processed within a few hours"
    })

  } catch (error) {
    console.error("POL request error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")
  
  if (!address) {
    return NextResponse.json(
      { error: "Address parameter required" },
      { status: 400 }
    )
  }

  try {
    const requests = await getRequests()
    const userRequests = requests.filter(
      req => req.address.toLowerCase() === address.toLowerCase()
    ).sort((a, b) => b.timestamp - a.timestamp)

    return NextResponse.json({
      requests: userRequests.slice(0, 5), // Last 5 requests
      hasActivePendingRequest: userRequests.some(req => req.status === "pending")
    })
  } catch (error) {
    console.error("Error fetching requests:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
