import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.COINGECKO_API_KEY
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }
    
    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey
      console.log('🔑 Using CoinGecko API key for Ethereum corporate holdings')
    } else {
      console.warn('⚠️ No CoinGecko API key found for Ethereum corporate data - using free tier')
    }
    
    // Use free tier endpoint only
    const baseUrl = 'https://api.coingecko.com/api/v3/companies/public_treasury/ethereum'
    
    const response = await fetch(baseUrl, {
      headers,
    })

    if (!response.ok) {
      // Handle rate limiting with fallback data
      if (response.status === 429) {
        console.warn('⚠️ CoinGecko rate limit exceeded for Ethereum corporate data')
        return NextResponse.json(
          { companies: [], error: 'Rate limit exceeded' },
          { 
            status: 200,
            headers: {
              'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
          }
        )
      }
      
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
      { error: 'Failed to fetch Ethereum corporate treasury data', companies: [] },
      { status: 200 }
    )
  }
}
