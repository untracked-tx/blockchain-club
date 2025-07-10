import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization')
    const adminKey = process.env.ADMIN_SECRET_KEY
    
    // Check for admin key in header or query param (for easier access)
    const queryKey = request.nextUrl.searchParams.get('key')
    
    if (!adminKey) {
      console.warn('ADMIN_SECRET_KEY not set in environment variables')
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    const isAuthorized = 
      authHeader === `Bearer ${adminKey}` || 
      queryKey === adminKey
    
    if (!isAuthorized) {
      // Return simple auth challenge
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      })
    }
  }
  
  // Protect admin API routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const authHeader = request.headers.get('authorization')
    const adminKey = process.env.ADMIN_SECRET_KEY
    
    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}
