# 🚀 Redis Setup & Configuration Guide

## Overview

Redis has been integrated into your ERP system to provide:
- **Lightning-fast caching** (10-100x performance improvement)
- **Session management** for better authentication
- **Rate limiting** to prevent API abuse
- **Real-time data** for live dashboards
- **Data persistence** for critical information

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Frontend      │    │    Redis     │    │   PostgreSQL    │
│   (React)       │◄──►│   (Cache)    │◄──►│   (Database)    │
└─────────────────┘    └──────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
   User Interface         Fast Data Access        Persistent Storage
```

## 🚀 Quick Start

### 1. Start Redis Container
```bash
# Start only Redis
npm run redis:start

# Start all infrastructure (PostgreSQL + Redis + pgAdmin)
npm run infra:start
```

### 2. Check Redis Health
```bash
# Health check
npm run redis:health

# View logs
npm run redis:logs
```

### 3. Test Redis Operations
```bash
# Test basic operations
curl -X POST http://localhost:3000/api/health/redis \
  -H "Content-Type: application/json" \
  -d '{"operation": "set", "key": "test", "data": "hello", "ttl": 60}'
```

## ⚙️ Configuration

### Environment Variables
```bash
# .env
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
REDIS_DB="0"
REDIS_URL="redis://localhost:6379"
```

### Docker Configuration
```yaml
# docker-compose.yml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
```

## 🔧 Usage Examples

### Basic Caching
```javascript
import { cache } from '@/lib/redis'

// Cache data for 1 hour
await cache.set('user:123', userData, 3600)

// Retrieve cached data
const userData = await cache.get('user:123')

// Delete cache
await cache.del('user:123')
```

### CRM Data Caching
```javascript
import { crmCache } from '@/lib/redis'

// Cache customer list
await crmCache.setCustomerList(tenantId, filters, data, 1800)

// Get cached customer list
const customers = await crmCache.getCustomerList(tenantId, filters)

// Invalidate cache when data changes
await crmCache.invalidateCustomer(tenantId)
```

### Dashboard Metrics
```javascript
import { dashboardCache } from '@/lib/redis'

// Cache metrics for 5 minutes
await dashboardCache.setMetrics(tenantId, 'overview', metrics, 300)

// Get cached metrics
const metrics = await dashboardCache.getMetrics(tenantId, 'overview')
```

### Rate Limiting
```javascript
import { rateLimit } from '@/lib/redis'

// Check rate limit (100 requests per minute)
const result = await rateLimit.check(`user:${userId}:api`, 100, 60)

if (!result.allowed) {
  throw new Error('Rate limit exceeded')
}
```

### Session Management
```javascript
import { sessionCache } from '@/lib/redis'

// Store session for 24 hours
await sessionCache.set(sessionId, sessionData, 86400)

// Get session
const session = await sessionCache.get(sessionId)

// Refresh session
await sessionCache.refresh(sessionId, 86400)
```

## 📊 Cache Strategies

### 1. CRM Data
- **Customer Lists**: 30 minutes (1800s)
- **Individual Customers**: 1 hour (3600s)
- **Lead Lists**: 30 minutes (1800s)
- **Individual Leads**: 1 hour (3600s)

### 2. Dashboard Metrics
- **Overview Stats**: 5 minutes (300s)
- **Detailed Analytics**: 15 minutes (900s)
- **Real-time Updates**: 1 minute (60s)

### 3. User Sessions
- **Active Sessions**: 24 hours (86400s)
- **User Preferences**: 1 week (604800s)
- **Permissions**: 1 hour (3600s)

### 4. API Responses
- **Search Results**: 10 minutes (600s)
- **Filtered Lists**: 15 minutes (900s)
- **Static Data**: 1 hour (3600s)

## 🚨 Cache Invalidation

### Automatic Invalidation
```javascript
// When creating/updating customers
await crmCache.invalidateCustomer(tenantId)

// When creating/updating leads
await crmCache.invalidateCustomer(tenantId)

// When updating dashboard
await dashboardCache.invalidateMetrics(tenantId)
```

### Manual Invalidation
```javascript
import { cache } from '@/lib/redis'

// Clear specific cache
await cache.del('customers:tenant123:list')

// Clear pattern-based cache
await cache.delPattern('customers:tenant123:*')

// Clear all cache for tenant
await cache.delPattern(`*:${tenantId}:*`)
```

## 📈 Performance Monitoring

### Health Check Endpoint
```bash
GET /api/health/redis
```

Response:
```json
{
  "status": "healthy",
  "responseTime": "5ms",
  "operations": {
    "write": "success",
    "read": "success",
    "delete": "success"
  },
  "performance": {
    "excellent": true,
    "good": false,
    "acceptable": false,
    "slow": false
  }
}
```

### Redis Statistics
```javascript
import { cache } from '@/lib/redis'

const stats = await cache.getStats()
console.log('Total keys:', stats.keys)
console.log('Redis info:', stats.info)
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
# Check if Redis is running
docker ps | grep redis

# Check Redis logs
npm run redis:logs

# Restart Redis
npm run redis:restart
```

#### 2. Permission Denied
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
# Log out and back in
```

#### 3. Cache Not Working
```bash
# Test Redis connection
npm run redis:health

# Check environment variables
echo $REDIS_HOST
echo $REDIS_PORT
```

### Debug Mode
```javascript
// Enable debug logging
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  lazyConnect: true,
  showFriendlyErrorStack: true,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
})

redis.on('connect', () => console.log('✅ Redis connected'))
redis.on('error', (error) => console.error('❌ Redis error:', error))
redis.on('close', () => console.log('🔌 Redis closed'))
redis.on('reconnecting', () => console.log('🔄 Redis reconnecting'))
```

## 🚀 Production Considerations

### 1. Security
```bash
# Set Redis password
REDIS_PASSWORD="strong-password-here"

# Use SSL in production
REDIS_URL="rediss://username:password@host:port/db"
```

### 2. Persistence
```yaml
# docker-compose.yml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes --save 900 1 --save 300 10
  volumes:
    - redis_data:/data
```

### 3. Clustering
```javascript
// For high availability
import Redis from 'ioredis'

const redis = new Redis.Cluster([
  { host: 'redis-1', port: 6379 },
  { host: 'redis-2', port: 6379 },
  { host: 'redis-3', port: 6379 }
])
```

### 4. Monitoring
```bash
# Redis CLI
docker exec -it galaxy-redis redis-cli

# Monitor commands
MONITOR

# Check memory usage
INFO memory

# Check connected clients
CLIENT LIST
```

## 📚 API Reference

### Cache Functions
- `cache.set(key, data, ttl)` - Set cache with expiration
- `cache.get(key)` - Get cached data
- `cache.del(key)` - Delete cache key
- `cache.delPattern(pattern)` - Delete keys by pattern
- `cache.exists(key)` - Check if key exists
- `cache.setnx(key, data, ttl)` - Set if not exists
- `cache.incr(key, increment)` - Increment counter

### CRM Cache Functions
- `crmCache.setCustomer(tenantId, customerId, data, ttl)`
- `crmCache.getCustomer(tenantId, customerId)`
- `crmCache.setCustomerList(tenantId, filters, data, ttl)`
- `crmCache.getCustomerList(tenantId, filters)`
- `crmCache.invalidateCustomer(tenantId, customerId)`

### Dashboard Cache Functions
- `dashboardCache.setMetrics(tenantId, type, data, ttl)`
- `dashboardCache.getMetrics(tenantId, type)`
- `dashboardCache.invalidateMetrics(tenantId, type)`

### Rate Limiting Functions
- `rateLimit.check(key, maxRequests, window)`
- `rateLimit.getInfo(key)`

### Session Cache Functions
- `sessionCache.set(sessionId, data, ttl)`
- `sessionCache.get(sessionId)`
- `sessionCache.del(sessionId)`
- `sessionCache.refresh(sessionId, ttl)`

## 🎯 Best Practices

1. **Cache Key Naming**: Use consistent patterns (e.g., `module:tenant:type:id`)
2. **TTL Strategy**: Set appropriate expiration times based on data volatility
3. **Cache Invalidation**: Always invalidate cache when data changes
4. **Error Handling**: Gracefully handle Redis failures with fallbacks
5. **Monitoring**: Regularly check Redis health and performance
6. **Security**: Use strong passwords and network isolation in production

## 🚀 Next Steps

1. **Start Redis**: `npm run redis:start`
2. **Test Connection**: `npm run redis:health`
3. **Monitor Performance**: Check response times in browser dev tools
4. **Scale Up**: Add more Redis instances for production load

Your ERP system now has enterprise-grade caching and performance! 🎉✨ 