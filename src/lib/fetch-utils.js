/**
 * Frontend Fetch Utility Functions
 * Helper functions for consistent API calls and error handling
 */

/**
 * Fetches data from API and handles errors gracefully
 * Returns empty array/object instead of throwing for empty data
 */
export async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, options)
    
    // For server errors (5xx), throw error
    if (response.status >= 500) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Server error: ${response.status}`)
    }
    
    // For client errors (4xx), return null or empty array based on context
    if (response.status >= 400 && response.status < 500) {
      const errorData = await response.json().catch(() => ({}))
      // For "not found" or "no data" scenarios, return empty
      if (response.status === 404 || errorData.error?.includes('not found')) {
        return null
      }
      // For other 4xx errors, throw
      throw new Error(errorData.error || `Client error: ${response.status}`)
    }
    
    // Parse response
    const data = await response.json()
    
    // Return data, ensuring arrays are always arrays
    if (Array.isArray(data)) {
      return data
    }
    if (data?.data !== undefined) {
      return Array.isArray(data.data) ? data.data : data.data
    }
    
    return data
  } catch (error) {
    // Network errors or parsing errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server')
    }
    throw error
  }
}

/**
 * Fetches data and returns empty array on error (for list endpoints)
 */
export async function safeFetchList(url, options = {}) {
  try {
    const data = await safeFetch(url, options)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching list:', error)
    return []
  }
}

/**
 * Fetches data and returns null on error (for single item endpoints)
 */
export async function safeFetchItem(url, options = {}) {
  try {
    return await safeFetch(url, options)
  } catch (error) {
    console.error('Error fetching item:', error)
    return null
  }
}

