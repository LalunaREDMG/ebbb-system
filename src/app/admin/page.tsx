'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AdminRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new secure admin route
    router.push('/ebbb-admin/login')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <p className="text-gray-600">Redirecting to secure admin panel...</p>
      </div>
    </div>
  )
} 