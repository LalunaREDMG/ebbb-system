'use client'

import { useState, useEffect } from 'react'
import { ChefHat } from 'lucide-react'

interface ServiceNoticeProps {
  groupedProducts: Record<string, any[]>
  className?: string
}

export default function ServiceNotice({ groupedProducts, className = '' }: ServiceNoticeProps) {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    const isMorningService = hour < 16
    const keys = Object.keys(groupedProducts).map((c) => c.toLowerCase())
    
    const hasPanini = keys.some((c) => ['panini', 'sandwich', 'sandwiches'].includes(c))
    const hasBurgers = keys.some((c) => ['burgers', 'burger', 'mains', 'main'].includes(c))
    const hasCoffee = keys.some((c) => ['coffee', 'drinks'].includes(c))

    const parts: string[] = []
    if (isMorningService && hasPanini) parts.push('Panini (morning)')
    if (!isMorningService && hasBurgers) parts.push('Burgers (evening)')
    if (hasCoffee) parts.push('Coffee (all day)')

    if (parts.length > 0) {
      setMessage(`Currently serving: ${parts.join(' · ')}`)
    } else {
      setMessage(null)
    }
  }, [groupedProducts])

  if (!message) return null

  return (
    <div className={`inline-flex items-center bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm font-medium ${className}`}>
      <ChefHat className="w-4 h-4 mr-2" />
      {message}
    </div>
  )
}
