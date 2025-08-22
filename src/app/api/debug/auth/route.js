import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Get cookies from the request
    const cookies = request.headers.get('cookie')
    const cookieList = cookies ? cookies.split(';').map(c => c.trim()) : []
    
    // Find NextAuth related cookies
    const nextAuthCookies = cookieList.filter(c => c.startsWith('next-auth.'))
    
    return NextResponse.json({
      hasSession: !!session,
      session: session,
      user: session?.user || null,
      cookies: {
        total: cookieList.length,
        nextAuth: nextAuthCookies.length,
        nextAuthCookies: nextAuthCookies.map(c => c.split('=')[0])
      },
      env: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Auth debug error:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 