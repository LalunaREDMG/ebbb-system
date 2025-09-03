'use client'

import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  href?: string
  className?: string
}

export default function Logo({ size = 'md', href = '/', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: {
      container: 'w-6 h-6',
      text: 'text-lg',
      subtitle: 'text-[5px] max-w-[50px]'
    },
    md: {
      container: 'w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14',
      text: 'text-xl md:text-2xl lg:text-3xl',
      subtitle: 'text-[4px] md:text-[6px] lg:text-[5px] max-w-[60px] md:max-w-[65px] lg:max-w-[70px]'
    },
    lg: {
      container: 'w-12 h-12 md:w-16 md:h-16',
      text: 'text-2xl md:text-3xl',
      subtitle: 'text-[6px] md:text-[7px] max-w-[60px] md:max-w-[65px]'
    }
  }

  const sizes = sizeClasses[size]

  const LogoContent = () => (
    <div className={`flex flex-col items-center group ${className}`}>
      <div className={`bg-gradient-to-r from-orange-500 to-red-500 text-white font-black ${sizes.text} px-2 py-1 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 ${sizes.container} flex items-center justify-center`}>
        8
      </div>
      <div className={`${sizes.subtitle} font-bold text-orange-600 mt-1 text-center tracking-wider uppercase leading-none whitespace-nowrap`}>
        BITES, BEATS & BURGERS
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href}>
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}
