import { NextResponse } from 'next/server'
import { cache, rateLimit } from '@/lib/redis'

// GET /api/health/redis - Redis health check
export async function GET() {
  try {
    const startTime = Date.now()
    
    // Test basic Redis operations
    const testKey = 'health:test'
    const testData = { timestamp: new Date().toISOString(), status: 'healthy' }
    
    // Test write operation
    const writeSuccess = await cache.set(testKey, testData, 60)
    if (!writeSuccess) {
      throw new Error('Redis write operation failed')
    }
    
    // Test read operation
    const readData = await cache.get(testKey)
    if (!readData || readData.status !== 'healthy') {
      throw new Error('Redis read operation failed')
    }
    
    // Test delete operation
    const deleteSuccess = await cache.del(testKey)
    if (!deleteSuccess) {
      throw new Error('Redis delete operation failed')
    }
    
    // Test rate limiting
    const rateLimitKey = 'health:ratelimit:test'
    const rateLimitResult = await rateLimit.check(rateLimitKey, 10, 60)
    
    // Get Redis statistics
    const stats = await cache.getStats()
    
    const responseTime = Date.now() - startTime
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      operations: {
        write: 'success',
        read: 'success',
        delete: 'success',
        rateLimit: 'success'
      },
      rateLimit: rateLimitResult,
      stats: stats ? {
        keys: stats.keys,
        info: stats.info ? 'available' : 'unavailable'
      } : null,
      performance: {
        excellent: responseTime < 10,
        good: responseTime < 50,
        acceptable: responseTime < 100,
        slow: responseTime >= 100
      }
    }
    
    return NextResponse.json(healthStatus, { status: 200 })
    
  } catch (error) {
    console.error('Redis health check failed:', error)
    
    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      operations: {
        write: 'failed',
        read: 'failed',
        delete: 'failed',
        rateLimit: 'failed'
      },
      recommendation: 'Check Redis connection and configuration'
    }
    
    return NextResponse.json(errorStatus, { status: 503 })
  }
}

// POST /api/health/redis - Test Redis operations
export async function POST(request) {
  try {
    const body = await request.json()
    const { operation, key, data, ttl } = body
    
    switch (operation) {
      case 'set':
        const setResult = await cache.set(key || 'test:key', data || 'test data', ttl || 60)
        return NextResponse.json({ 
          operation: 'set', 
          success: setResult, 
          key: key || 'test:key' 
        })
        
      case 'get':
        const getResult = await cache.get(key || 'test:key')
        return NextResponse.json({ 
          operation: 'get', 
          success: !!getResult, 
          data: getResult,
          key: key || 'test:key'
        })
        
      case 'del':
        const delResult = await cache.del(key || 'test:key')
        return NextResponse.json({ 
          operation: 'delete', 
          success: delResult, 
          key: key || 'test:key'
        })
        
      case 'exists':
        const existsResult = await cache.exists(key || 'test:key')
        return NextResponse.json({ 
          operation: 'exists', 
          exists: existsResult, 
          key: key || 'test:key'
        })
        
      case 'incr':
        const incrResult = await cache.incr(key || 'test:counter', data || 1)
        return NextResponse.json({ 
          operation: 'increment', 
          success: incrResult !== null, 
          value: incrResult,
          key: key || 'test:counter'
        })
        
      default:
        return NextResponse.json({ 
          error: 'Invalid operation. Supported: set, get, del, exists, incr' 
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Redis test operation failed:', error)
    return NextResponse.json({ 
      error: 'Redis test operation failed', 
      message: error.message 
    }, { status: 500 })
  }
} 