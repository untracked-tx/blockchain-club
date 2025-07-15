import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/global',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Blockchain Club Portfolio App',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error fetching global data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch global data' },
      { status: 500 }
    )
  }
}
