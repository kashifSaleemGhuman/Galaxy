/**
 * Toast notification utility
 * Dispatches custom events that ToastContainer listens to
 */

export const showToast = (title, message, type = 'info', duration = 5000) => {
  const event = new CustomEvent('show-toast', {
    detail: { title, message, type, duration }
  })
  window.dispatchEvent(event)
}

export const toast = {
  success: (title, message, duration) => showToast(title, message, 'success', duration),
  error: (title, message, duration) => showToast(title, message, 'error', duration),
  info: (title, message, duration) => showToast(title, message, 'info', duration),
  warning: (title, message, duration) => showToast(title, message, 'warning', duration),
}

