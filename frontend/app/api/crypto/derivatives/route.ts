import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/derivatives', {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Cache for 5 minutes
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error fetching derivatives data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch derivatives data' },
      { status: 500 }
    )
  }
}
