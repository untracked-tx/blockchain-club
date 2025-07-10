import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

interface PolRequest {
  id: string
  address: string
  timestamp: number
  status: "pending" | "funded" | "rejected"
  userAgent?: string
  ip?: string
  createdAt: string
}

const REQUEST_FILE = path.join(process.cwd(), "data", "pol-requests.json")

async function ensureDataDir() {
  const dataDir = path.dirname(REQUEST_FILE)
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (err) {
    // Directory might already exist
  }
}

async function getRequests(): Promise<PolRequest[]> {
  try {
    const data = await fs.readFile(REQUEST_FILE, "utf-8")
    return JSON.parse(data)
  } catch (err) {
    return []
  }
}

async function saveRequests(requests: PolRequest[]) {
  await ensureDataDir()
  await fs.writeFile(REQUEST_FILE, JSON.stringify(requests, null, 2))
}

export async function POST(request: NextRequest) {
  try {
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
