import { NextResponse } from 'next/server'

export async function GET(request) {
  return NextResponse.json({
    message: 'API is working',
    timestamp: new Date().toISOString(),
    env: {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV
    }
  })
} 