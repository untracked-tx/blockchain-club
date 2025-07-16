import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.COINGECKO_API_KEY
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }
    
    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey
      console.log('🔑 Using CoinGecko API key for derivatives data')
    } else {
      console.warn('⚠️ No CoinGecko API key found for derivatives - using free tier')
    }

    const response = await fetch('https://api.coingecko.com/api/v3/derivatives', {
      headers,
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.error('❌ Derivatives API error:', response.status)
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limited - please try again later', derivatives: [] },
          { status: 200 } // Return 200 with empty data instead of error
        )
      }
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Derivatives data fetched successfully')
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error fetching derivatives data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch derivatives data', derivatives: [] },
      { status: 200 } // Return 200 with empty data instead of 500 error
    )
  }
}
