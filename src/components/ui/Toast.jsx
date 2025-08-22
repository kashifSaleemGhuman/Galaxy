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

export function Toast({ message, type = 'info', duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(true)
  const styles = toastTypes[type]
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
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${styles.bgColor} border ${styles.borderColor} rounded-lg shadow-lg transform transition-all duration-300 ease-in-out`}>
      <div className="flex items-start p-4">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${styles.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${styles.textColor}`}>
            {message}
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

export function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, duration }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )

  return {
    showToast,
    ToastContainer
  }
} 