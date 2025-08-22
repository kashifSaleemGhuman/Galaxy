import Redis from 'ioredis'

// Redis client configuration
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  showFriendlyErrorStack: process.env.NODE_ENV === 'development'
})

// Redis connection events
redis.on('connect', () => {
  console.log('✅ Redis connected successfully')
})

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error)
})

redis.on('close', () => {
  console.log('🔌 Redis connection closed')
})

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...')
})

// Cache utility functions
export const cache = {
  /**
   * Set cache with expiration
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in seconds
   */
  async set(key, data, ttl = 3600) {
    try {
      const serializedData = typeof data === 'string' ? data : JSON.stringify(data)
      await redis.setex(key, ttl, serializedData)
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  },

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {any} Cached data or null
   */
  async get(key) {
    try {
      const data = await redis.get(key)
      if (!data) return null
      
      try {
        return JSON.parse(data)
      } catch {
        return data // Return as string if not JSON
      }
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  },

  /**
   * Delete cache key
   * @param {string} key - Cache key
   */
  async del(key) {
    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  },

  /**
   * Delete multiple cache keys by pattern
   * @param {string} pattern - Redis pattern (e.g., 'customers:*')
   */
  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      return keys.length
    } catch (error) {
      console.error('Cache pattern delete error:', error)
      return 0
    }
  },

  /**
   * Check if key exists
   * @param {string} key - Cache key
   */
  async exists(key) {
    try {
      return await redis.exists(key)
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  },

  /**
   * Set cache if not exists (atomic operation)
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in seconds
   */
  async setnx(key, data, ttl = 3600) {
    try {
      const serializedData = typeof data === 'string' ? data : JSON.stringify(data)
      const result = await redis.set(key, serializedData, 'EX', ttl, 'NX')
      return result === 'OK'
    } catch (error) {
      console.error('Cache setnx error:', error)
      return false
    }
  },

  /**
   * Increment counter
   * @param {string} key - Cache key
   * @param {number} increment - Increment value
   */
  async incr(key, increment = 1) {
    try {
      return await redis.incrby(key, increment)
    } catch (error) {
      console.error('Cache increment error:', error)
      return null
    }
  },

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      const info = await redis.info()
      const keys = await redis.dbsize()
      return { info, keys }
    } catch (error) {
      console.error('Cache stats error:', error)
      return null
    }
  }
}

// Session management functions
export const sessionCache = {
  /**
   * Store user session
   * @param {string} sessionId - Session ID
   * @param {object} sessionData - Session data
   * @param {number} ttl - Time to live in seconds (default: 24 hours)
   */
  async set(sessionId, sessionData, ttl = 86400) {
    const key = `session:${sessionId}`
    return await cache.set(key, sessionData, ttl)
  },

  /**
   * Get user session
   * @param {string} sessionId - Session ID
   */
  async get(sessionId) {
    const key = `session:${sessionId}`
    return await cache.get(key)
  },

  /**
   * Delete user session
   * @param {string} sessionId - Session ID
   */
  async del(sessionId) {
    const key = `session:${sessionId}`
    return await cache.del(key)
  },

  /**
   * Refresh session TTL
   * @param {string} sessionId - Session ID
   * @param {number} ttl - New time to live in seconds
   */
  async refresh(sessionId, ttl = 86400) {
    const key = `session:${sessionId}`
    const sessionData = await cache.get(key)
    if (sessionData) {
      return await cache.set(key, sessionData, ttl)
    }
    return false
  }
}

// CRM data caching functions
export const crmCache = {
  /**
   * Cache customer data
   * @param {string} tenantId - Tenant ID
   * @param {string} customerId - Customer ID
   * @param {object} customerData - Customer data
   * @param {number} ttl - Time to live in seconds (default: 1 hour)
   */
  async setCustomer(tenantId, customerId, customerData, ttl = 3600) {
    const key = `customer:${tenantId}:${customerId}`
    return await cache.set(key, customerData, ttl)
  },

  /**
   * Get cached customer data
   * @param {string} tenantId - Tenant ID
   * @param {string} customerId - Customer ID
   */
  async getCustomer(tenantId, customerId) {
    const key = `customer:${tenantId}:${customerId}`
    return await cache.get(key)
  },

  /**
   * Cache customer list with filters
   * @param {string} tenantId - Tenant ID
   * @param {object} filters - Search filters
   * @param {object} data - Customer list data
   * @param {number} ttl - Time to live in seconds (default: 30 minutes)
   */
  async setCustomerList(tenantId, filters, data, ttl = 1800) {
    const filterString = JSON.stringify(filters)
    const key = `customers:${tenantId}:${Buffer.from(filterString).toString('base64')}`
    return await cache.set(key, data, ttl)
  },

  /**
   * Get cached customer list
   * @param {string} tenantId - Tenant ID
   * @param {object} filters - Search filters
   */
  async getCustomerList(tenantId, filters) {
    const filterString = JSON.stringify(filters)
    const key = `customers:${tenantId}:${Buffer.from(filterString).toString('base64')}`
    return await cache.get(key)
  },

  /**
   * Invalidate customer cache
   * @param {string} tenantId - Tenant ID
   * @param {string} customerId - Customer ID (optional, if not provided clears all customer cache)
   */
  async invalidateCustomer(tenantId, customerId = null) {
    if (customerId) {
      const key = `customer:${tenantId}:${customerId}`
      await cache.del(key)
    } else {
      // Clear all customer cache for this tenant
      await cache.delPattern(`customer:${tenantId}:*`)
      await cache.delPattern(`customers:${tenantId}:*`)
    }
  }
}

// Dashboard metrics caching
export const dashboardCache = {
  /**
   * Cache dashboard metrics
   * @param {string} tenantId - Tenant ID
   * @param {string} metricType - Type of metric (e.g., 'overview', 'sales', 'crm')
   * @param {object} data - Metric data
   * @param {number} ttl - Time to live in seconds (default: 5 minutes)
   */
  async setMetrics(tenantId, metricType, data, ttl = 300) {
    const key = `dashboard:${tenantId}:${metricType}`
    return await cache.set(key, data, ttl)
  },

  /**
   * Get cached dashboard metrics
   * @param {string} tenantId - Tenant ID
   * @param {string} metricType - Type of metric
   */
  async getMetrics(tenantId, metricType) {
    const key = `dashboard:${tenantId}:${metricType}`
    return await cache.get(key)
  },

  /**
   * Invalidate dashboard cache
   * @param {string} tenantId - Tenant ID
   * @param {string} metricType - Type of metric (optional, if not provided clears all dashboard cache)
   */
  async invalidateMetrics(tenantId, metricType = null) {
    if (metricType) {
      const key = `dashboard:${tenantId}:${metricType}`
      await cache.del(key)
    } else {
      await cache.delPattern(`dashboard:${tenantId}:*`)
    }
  }
}

// Rate limiting functions
export const rateLimit = {
  /**
   * Check rate limit for user/endpoint
   * @param {string} key - Rate limit key (e.g., 'user:123:api')
   * @param {number} maxRequests - Maximum requests allowed
   * @param {number} window - Time window in seconds
   */
  async check(key, maxRequests = 100, window = 60) {
    try {
      const current = await redis.incr(key)
      if (current === 1) {
        await redis.expire(key, window)
      }
      return {
        allowed: current <= maxRequests,
        remaining: Math.max(0, maxRequests - current),
        reset: await redis.ttl(key)
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      return { allowed: true, remaining: maxRequests, reset: window }
    }
  },

  /**
   * Get rate limit info
   * @param {string} key - Rate limit key
   */
  async getInfo(key) {
    try {
      const current = await redis.get(key)
      const ttl = await redis.ttl(key)
      return {
        current: parseInt(current) || 0,
        ttl: ttl > 0 ? ttl : 0
      }
    } catch (error) {
      console.error('Rate limit info error:', error)
      return { current: 0, ttl: 0 }
    }
  }
}

// Export default Redis client for direct access
export default redis 