import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ids = searchParams.get('ids')
  const vs_currencies = searchParams.get('vs_currencies') || 'usd'
  const include_24hr_change = searchParams.get('include_24hr_change') || 'true'

  if (!ids) {
    return NextResponse.json(
      { error: 'Missing required parameter: ids' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}&include_24hr_change=${include_24hr_change}`,
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
    console.error('Error fetching price data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch price data' },
      { status: 500 }
    )
  }
}
