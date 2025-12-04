import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const url = process.env.DATABASE_URL || 'NOT_SET';
    const maskedUrl = url.replace(/:[^:@]*@/, ':****@');
    
    // Check tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    return NextResponse.json({
      databaseUrl: maskedUrl,
      tables: tables,
      nodeEnv: process.env.NODE_ENV
    })
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}





