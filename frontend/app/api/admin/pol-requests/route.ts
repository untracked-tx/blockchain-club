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

async function getRequests(): Promise<PolRequest[]> {
  try {
    console.log("Admin API: Testing Redis connection...")
    console.log("UPSTASH_REDIS_REST_URL:", process.env.UPSTASH_REDIS_REST_URL ? "✅ Set" : "❌ Missing")
    console.log("UPSTASH_REDIS_REST_TOKEN:", process.env.UPSTASH_REDIS_REST_TOKEN ? "✅ Set" : "❌ Missing")
    
    // Test the connection first
    await redis.ping()
    console.log("✅ Redis connection successful")
    
    const requests = await redis.get<PolRequest[]>(REQUESTS_KEY)
    console.log("Raw Redis data:", requests)
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

// GET - Fetch all requests (admin only)
export async function GET(request: NextRequest) {
  // Add CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    console.log("=== DEBUGGING ENVIRONMENT VARIABLES ===")
    console.log("UPSTASH_REDIS_REST_URL:", process.env.UPSTASH_REDIS_REST_URL)
    console.log("UPSTASH_REDIS_REST_TOKEN:", process.env.UPSTASH_REDIS_REST_TOKEN ? "[HIDDEN]" : "MISSING")
    console.log("URL length:", process.env.UPSTASH_REDIS_REST_URL?.length)
    console.log("Token length:", process.env.UPSTASH_REDIS_REST_TOKEN?.length)
    
    // Check if env vars have quotes
    const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/^["']|["']$/g, '') || ""
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.replace(/^["']|["']$/g, '') || ""
    
    console.log("Cleaned URL:", url)
    console.log("Cleaned token length:", token.length)
    
    if (!url || !token) {
      return NextResponse.json({
        error: "Missing Redis credentials",
        debug: {
          hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
          hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
          urlLength: process.env.UPSTASH_REDIS_REST_URL?.length || 0,
          tokenLength: process.env.UPSTASH_REDIS_REST_TOKEN?.length || 0
        }
      }, { status: 500, headers: corsHeaders })
    }
    
    // Try to create Redis client with cleaned credentials
    const testRedis = new Redis({ url, token })
    await testRedis.ping()
    
    console.log("Admin API: Fetching POL requests...")
    const requests = await getRequests()
    console.log("Admin API: Found", requests.length, "requests")
    
    // Sort by timestamp (newest first)
    const sortedRequests = requests.sort((a, b) => b.timestamp - a.timestamp)
    
    return NextResponse.json({
      requests: sortedRequests,
      summary: {
        total: requests.length,
        pending: requests.filter(r => r.status === "pending").length,
        funded: requests.filter(r => r.status === "funded").length,
        rejected: requests.filter(r => r.status === "rejected").length
      }
    }, { headers: corsHeaders })
  } catch (error) {
    console.error("Error fetching admin requests:", error)
    
    // Return a more detailed error for debugging
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
        envCheck: {
          hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
          hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN
        }
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

// PUT - Update request status
export async function PUT(request: NextRequest) {
  try {
    const { requestId, status } = await request.json()
    
    if (!requestId || !["funded", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }

    const requests = await getRequests()
    const requestIndex = requests.findIndex(req => req.id === requestId)
    
    if (requestIndex === -1) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      )
    }

    requests[requestIndex].status = status
    requests[requestIndex].timestamp = Date.now() // Update timestamp
    
    await saveRequests(requests)

    return NextResponse.json({
      message: `Request ${status} successfully`,
      request: requests[requestIndex]
    })

  } catch (error) {
    console.error("Error updating request:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a request (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get("id")
    
    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID required" },
        { status: 400 }
      )
    }

    const requests = await getRequests()
    const filteredRequests = requests.filter(req => req.id !== requestId)
    
    if (filteredRequests.length === requests.length) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      )
    }

    await saveRequests(filteredRequests)

    return NextResponse.json({
      message: "Request deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting request:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// OPTIONS - Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
