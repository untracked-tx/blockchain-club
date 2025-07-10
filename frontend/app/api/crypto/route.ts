import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const vs_currency = searchParams.get('vs_currency') || 'usd'
  const per_page = searchParams.get('per_page') || '50'
  const order = searchParams.get('order') || 'market_cap_desc'
  const sparkline = searchParams.get('sparkline') || 'false'
  const price_change_percentage = searchParams.get('price_change_percentage') || '1h,24h,7d'

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currency}&order=${order}&per_page=${per_page}&page=1&sparkline=${sparkline}&price_change_percentage=${price_change_percentage}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Blockchain Club Portfolio App',
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Error fetching crypto data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crypto data' },
      { status: 500 }
    )
  }
}
