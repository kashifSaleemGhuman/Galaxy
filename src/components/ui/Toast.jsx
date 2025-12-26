'use client'

import React, { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

// Internal Toast component for individual toast messages
function ToastInternal({ toast, onClose }) {
  const { title, message, type } = toast

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      default:
        return 'text-blue-800'
    }
  }

  return (
    <div
      className={`${getBgColor()} ${getTextColor()} border rounded-lg shadow-lg p-4 flex items-start space-x-3 min-w-[300px] max-w-md`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1">
        {title && <p className="text-sm font-semibold mb-1">{title}</p>}
        <p className="text-sm">{message || title}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Toast component wrapper for simpler usage (accepts type, message, onClose props)
// This matches the API expected by purchase pages
export function Toast({ type, message, title, onClose }) {
  const toast = { type, message, title: title || message }
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <ToastInternal toast={toast} onClose={onClose} />
      </div>
    </div>
  )
}

// ToastContainer component that listens to custom events
export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handleShowToast = (event) => {
      const { title, message, type = 'info', duration = 5000 } = event.detail
      const id = Date.now() + Math.random()
      const toast = { id, title, message, type, duration }
      
      setToasts(prev => [...prev, toast])
      
      if (duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
      }
    }

    window.addEventListener('show-toast', handleShowToast)
    return () => window.removeEventListener('show-toast', handleShowToast)
  }, [])

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastInternal toast={toast} onClose={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  )
}

// toast helper function for convenience (matches the API used in employees pages)
export function toast({ title, description, variant, duration = 5000 }) {
  // Map variant to type (variant: 'destructive' -> type: 'error', etc.)
  // If no variant is provided, default to 'success' for positive messages, 'info' otherwise
  const typeMap = {
    'destructive': 'error',
    'default': 'info',
    'success': 'success',
    'warning': 'warning'
  }
  
  // If variant is not provided, default to 'success' if title is 'Success', otherwise 'info'
  const defaultVariant = title === 'Success' ? 'success' : 'info'
  const variantToUse = variant || defaultVariant
  const type = typeMap[variantToUse] || variantToUse || 'info'
  const message = description || title
  
  const event = new CustomEvent('show-toast', {
    detail: { title, message, type, duration }
  })
  window.dispatchEvent(event)
}

// useToast hook for convenience
export function useToast() {
  const showToast = (messageOrTitle, typeOrMessage = 'info', type = null, duration = 5000) => {
    // Handle two different call patterns:
    // 1. showToast(message, type) - most common
    // 2. showToast(title, message, type, duration) - full signature
    let title, message, toastType
    
    if (type !== null) {
      // Full signature: (title, message, type, duration)
      title = messageOrTitle
      message = typeOrMessage
      toastType = type
    } else {
      // Short signature: (message, type)
      title = null
      message = messageOrTitle
      toastType = typeOrMessage || 'info'
    }
    
    const event = new CustomEvent('show-toast', {
      detail: { title, message, type: toastType, duration }
    })
    window.dispatchEvent(event)
  }

  return {
    showToast,
    ToastContainer
  }
}
