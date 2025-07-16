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

// Initialize Redis
const redis = Redis.fromEnv()
const REQUESTS_KEY = "pol-requests"

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

// GET - Fetch all requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const requests = await getRequests()
    
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
    })
  } catch (error) {
    console.error("Error fetching admin requests:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
