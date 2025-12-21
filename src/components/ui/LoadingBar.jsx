'use client'

/**
 * LoadingBar Component - Shows a loading indicator with progress bar
 * @param {Object} props
 * @param {boolean} props.loading - Whether to show loading state
 * @param {string} props.message - Optional loading message
 * @param {string} props.size - Size: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} props.fullScreen - Whether to show full screen overlay
 */
export default function LoadingBar({ 
  loading = true, 
  message = 'Loading...', 
  size = 'md',
  fullScreen = false 
}) {
  if (!loading) return null

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2'
  }

  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const content = (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 rounded-full`}
          style={{
            backgroundSize: '200% 100%',
            animation: 'loading-progress 1.5s ease-in-out infinite'
          }}
        />
      </div>
      
      {/* Loading Message */}
      {message && (
        <div className="mt-3 flex items-center justify-center space-x-2">
          <div className={`${spinnerSizes[size]} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
          <span className="text-sm text-gray-600">{message}</span>
        </div>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-4">
      {content}
    </div>
  )
}

