'use client'

import { useRouter } from 'next/navigation'
import { Button } from './Button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

/**
 * BackButton Component
 * A reusable back button component for navigation
 * 
 * @param {string} href - Optional specific href to navigate to (defaults to browser back)
 * @param {string} label - Button label (defaults to "Back")
 * @param {string} variant - Button variant (defaults to "outline")
 */
export default function BackButton({ href, label = 'Back', variant = 'outline', className = '' }) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      className={`flex items-center gap-2 ${className}`}
    >
      <ArrowLeftIcon className="h-4 w-4" />
      {label}
    </Button>
  )
}

