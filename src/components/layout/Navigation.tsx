'use client'

import { useState, useEffect } from 'react'
import { Menu, X, ChevronUp, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Logo from '../ui/Logo'

interface NavigationProps {
  variant?: 'home' | 'page'
  showBackButton?: boolean
  backHref?: string
  backLabel?: string
}

export default function Navigation({ 
  variant = 'home', 
  showBackButton = false, 
  backHref = '/', 
  backLabel = 'Back to Home' 
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const navLinks = [
    { href: '#menu', label: 'Menu', external: true },
    { href: '#announcements', label: 'News', external: true },
    { href: '/reservations', label: 'Reservations', external: false }
  ]

  return (
    <>
      <style jsx>{`
        @keyframes slideInFromTop {
          0% {
            transform: translateY(-100px) scale(0.8);
            opacity: 0;
          }
          60% {
            transform: translateY(10px) scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes navSlideIn {
          0% {
            transform: translateY(-100%) scale(0.95);
            opacity: 0;
          }
          50% {
            transform: translateY(-10px) scale(1.02);
            opacity: 0.7;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes navSlideOut {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-10px) scale(0.98);
            opacity: 0.7;
          }
          100% {
            transform: translateY(-100%) scale(0.95);
            opacity: 0;
          }
        }
        
        @keyframes gentleBounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-3px);
          }
          60% {
            transform: translateY(-1px);
          }
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-bounce-gentle {
          animation: gentleBounce 2s infinite;
        }
        
        .nav-enter {
          animation: navSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .nav-exit {
          animation: navSlideOut 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
      
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0 opacity-100 nav-enter' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
          {/* Left side - Back button or Logo */}
          {showBackButton ? (
            <Link 
              href={backHref}
              className="flex items-center text-gray-700 hover:text-orange-500 transition-colors duration-300 group"
            >
              <span className="text-sm font-medium">{backLabel}</span>
            </Link>
          ) : (
            <div className="flex-shrink-0">
              <Logo size="md" />
            </div>
          )}

          {/* Center - Logo for page variant with back button */}
          {showBackButton && (
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Logo size="sm" />
            </div>
          )}

          {/* Right side - Desktop Navigation or Spacer */}
          {variant === 'home' ? (
            <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
              <div className="flex items-baseline space-x-4">
                {navLinks.map((link, index) => (
                  link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                      style={{
                        animation: isVisible ? `fadeInUp 0.6s ease-out ${index * 0.1}s both` : 'none'
                      }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                      style={{
                        animation: isVisible ? `fadeInUp 0.6s ease-out ${index * 0.1}s both` : 'none'
                      }}
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-orange-500 transition-all duration-300 hover:scale-105"
              >
                Home
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          {variant === 'home' && (
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
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {variant === 'home' && (
          <div className={`md:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md rounded-lg mt-2 shadow-lg">
              {navLinks.map((link) => (
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-md text-base font-medium transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-md text-base font-medium transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>

      </>
  )
}
