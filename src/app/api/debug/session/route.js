import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      hasSession: !!session,
      session: session,
      user: session?.user || null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 