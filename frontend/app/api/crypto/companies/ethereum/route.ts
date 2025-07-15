import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/companies/public_treasury/ethereum', {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Cache for 10 minutes - corporate data doesn't change often
    return NextResponse.json(data.companies || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    })
  } catch (error) {
    console.error('Error fetching Ethereum corporate treasury data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Ethereum corporate treasury data' },
      { status: 500 }
    )
  }
}
