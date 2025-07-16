import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.COINGECKO_API_KEY
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }
    
    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey
      console.log('🔑 Using CoinGecko API key for Bitcoin corporate holdings')
    } else {
      console.warn('⚠️ No CoinGecko API key found for Bitcoin corporate data - using free tier')
    }
    
    const response = await fetch('https://api.coingecko.com/api/v3/companies/public_treasury/bitcoin', {
      headers,
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.error('❌ Bitcoin corporate treasury API error:', response.status)
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limited - please try again later', companies: [] },
          { status: 200 }
        )
      }
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Bitcoin corporate treasury data fetched successfully')
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error fetching Bitcoin corporate treasury data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Bitcoin corporate treasury data', companies: [] },
      { status: 200 }
    )
  }
}
