'use client'

import { ChefHat } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
  submessage?: string
}

export default function LoadingSpinner({ 
  message = "Loading...", 
  submessage = "Please wait a moment" 
}: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-24 w-24 md:h-32 md:w-32 border-b-4 border-orange-500 border-t-transparent mx-auto mb-6 md:mb-8"></div>
        <div className="animate-pulse">
          <ChefHat className="h-12 w-12 md:h-16 md:w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">{message}</h2>
          <p className="text-gray-600 mt-2 text-sm md:text-base">{submessage}</p>
        </div>
      </div>
    </div>
  )
}
