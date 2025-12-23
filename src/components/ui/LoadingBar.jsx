'use client'

/**
 * LoadingBar Component - Shows a loading spinner indicator
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

  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const borderSizes = {
    sm: 'border-2',
    md: 'border-[3px]',
    lg: 'border-4'
  }

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      {/* Spinner */}
      <div className={`${spinnerSizes[size]} ${borderSizes[size]} border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
      
      {/* Loading Message */}
      {message && (
        <span className="text-sm text-gray-600">{message}</span>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-4 flex items-center justify-center">
      {content}
    </div>
  )
}

