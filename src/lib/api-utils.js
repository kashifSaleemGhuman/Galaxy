import { NextResponse } from 'next/server'

/**
 * API Utility Functions
 * Helper functions for consistent API responses
 */

/**
 * Returns a successful response with data
 * Always returns 200 status, even for empty data
 */
export function successResponse(data, message = null) {
  return NextResponse.json({
    success: true,
    data: data ?? (Array.isArray(data) ? [] : null),
    ...(message && { message })
  }, { status: 200 })
}

/**
 * Returns an error response
 */
export function errorResponse(message, status = 500, details = null) {
  return NextResponse.json({
    success: false,
    error: message,
    ...(details && { details })
  }, { status })
}

/**
 * Handles API errors consistently
 * Returns appropriate error response based on error type
 */
export function handleApiError(error, defaultMessage = 'Internal server error') {
  console.error('API Error:', error)

  // Prisma errors
  if (error.code === 'P2002') {
    return errorResponse('Record already exists', 400)
  }
  if (error.code === 'P2025') {
    return errorResponse('Record not found', 404)
  }
  if (error.code === 'P1001') {
    return errorResponse('Database connection failed', 503)
  }

  // Authentication errors
  if (error.message?.includes('Unauthorized') || error.message?.includes('unauthorized')) {
    return errorResponse('Unauthorized', 401)
  }

  // Default error
  return errorResponse(
    error.message || defaultMessage,
    500,
    process.env.NODE_ENV === 'development' ? error.stack : null
  )
}

