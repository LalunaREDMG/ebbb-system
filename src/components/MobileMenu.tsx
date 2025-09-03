'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function MobileMenu() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="text-gray-700 hover:text-orange-500 transition-colors duration-300 p-1"
      >
        {mobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Mobile Navigation Menu */}
      <div className={`transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md rounded-lg mt-2 shadow-lg">
          <a 
            href="#menu" 
            className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-md text-base font-medium transition-all duration-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            Menu
          </a>
          <a 
            href="#announcements" 
            className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-md text-base font-medium transition-all duration-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            News
          </a>
          <Link 
            href="/reservations" 
            className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-md text-base font-medium transition-all duration-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            Reservations
          </Link>
        </div>
      </div>
    </div>
  )
} 