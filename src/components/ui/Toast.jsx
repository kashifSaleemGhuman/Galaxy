'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, X, Info } from 'lucide-react'

const toastTypes = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-400'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-400'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-400'
  }
}

export function Toast({ message, type = 'info', duration = 5000, onClose, title, variant }) {
  const [isVisible, setIsVisible] = useState(true)
  
  // Handle destructured variant prop if provided (for compatibility with shadcn/ui style calls)
  const actualType = variant === 'destructive' ? 'error' : (type || 'info')
  
  const styles = toastTypes[actualType] || toastTypes.info
  const IconComponent = styles.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for fade out animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div className={`max-w-sm w-full ${styles.bgColor} border ${styles.borderColor} rounded-lg shadow-lg transform transition-all duration-300 ease-in-out pointer-events-auto`}>
      <div className="flex items-start p-4">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${styles.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && <p className={`text-sm font-medium ${styles.textColor}`}>{title}</p>}
          <p className={`text-sm ${title ? 'mt-1' : ''} ${styles.textColor}`}>
            {message || title} {/* Use title as message if message is missing */}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className={`inline-flex ${styles.textColor} hover:${styles.textColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-500`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Create a singleton for managing toasts outside of React tree if needed,
// but preferably use a Context provider. For now, let's export a helper
// that dispatches a custom event which the ToastContainer listens to.
export const toast = ({ title, description, variant = 'default' }) => {
  const event = new CustomEvent('show-toast', {
    detail: { title, message: description, type: variant === 'destructive' ? 'error' : 'success' }
  })
  window.dispatchEvent(event)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handleShowToast = (event) => {
      const { title, message, type, duration = 5000 } = event.detail
      const id = Date.now()
      setToasts(prev => [...prev, { id, title, message, type, duration }])
    }

    window.addEventListener('show-toast', handleShowToast)
    return () => window.removeEventListener('show-toast', handleShowToast)
  }, [])

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(t => (
        <Toast
          key={t.id}
          title={t.title}
          message={t.message}
          type={t.type}
          duration={t.duration}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </div>
  )
}

// Keep existing hook for compatibility if any components use it
export function useToast() {
  // This hook implementation is now just a wrapper around the event dispatcher
  // or could return the container. 
  // For now, components should just import { toast } and call it.
  return {
    showToast: (message, type) => toast({ title: message, variant: type === 'error' ? 'destructive' : 'default' }),
    ToastContainer
  }
}
