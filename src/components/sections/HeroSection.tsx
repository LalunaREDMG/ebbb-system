
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChefHat, Calendar, ArrowRight, Clock, MapPin, Phone, Sparkles, Users, Zap } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  image_url: string | null
  published: boolean
  created_at: string
  announcement_type?: 'general' | 'dj_event'
  dj_name?: string | null
  event_date?: string | null
  event_start_time?: string | null
  event_end_time?: string | null
  venue_details?: string | null
  ticket_price?: number | null
  is_featured?: boolean
}

interface HeroSectionProps {
  announcements: Announcement[]
  groupedProducts: Record<string, any[]>
  isVisible: boolean
}

export default function HeroSection({ announcements, groupedProducts, isVisible }: HeroSectionProps) {
  const [heroIndex, setHeroIndex] = useState(0)

  // Get hero announcements (What's New) and prioritize DJ events
  const heroAnnouncements = announcements
    .filter((a) => (a.title || '').toLowerCase().includes("what's new"))
    .sort((a, b) => {
      // Prioritize DJ events first
      if (a.announcement_type === 'dj_event' && b.announcement_type !== 'dj_event') return -1
      if (b.announcement_type === 'dj_event' && a.announcement_type !== 'dj_event') return 1
      return 0
    })

  const currentAnnouncement = heroAnnouncements[heroIndex % heroAnnouncements.length]
  const isDJEvent = currentAnnouncement?.announcement_type === 'dj_event'

  // Rotate hero announcements
  useEffect(() => {
    if (heroAnnouncements.length <= 1) return

    const id = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroAnnouncements.length)
    }, 6000) // Slower rotation for better readability
    return () => clearInterval(id)
  }, [heroAnnouncements.length])

  return (
    <section className="relative bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 text-white overflow-hidden min-h-screen flex flex-col">
      {/* Important Announcements Marquee */}
      <ImportantAnnouncementsMarquee announcements={announcements} />
      
      <div className="flex-1 flex items-center">
        {/* Hero background slideshow from announcements */}
        <div className="absolute inset-0">
          {announcements
            .filter((a) => (a.title || '').toLowerCase().includes("what's new") && a.image_url)
            .map((a, i, arr) => (
              <img
                key={a.id}
                src={a.image_url as string}
                alt={a.title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === (heroIndex % arr.length) ? 'opacity-50' : 'opacity-0'}`}
              />
            ))}
          {/* Gradient overlay for readability - reduced opacity to show more of the background image */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/60 via-red-500/50 to-pink-500/60"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left copy */}
              <div className="text-center md:text-left">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight tracking-tight">
                  Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-amber-400">EBBB</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl mb-6 max-w-xl md:max-w-2xl md:mx-0 mx-auto text-white/90">
                  Perth&apos;s newest culinary destination where passion meets perfection. Fresh flavors, warm hospitality, unforgettable moments.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start mb-8">
                  <Link href="/reservations" className="group bg-white text-orange-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-xl inline-flex items-center justify-center space-x-2 ring-2 ring-white/20">
                    <Calendar className="h-5 w-5" />
                    <span>Book Your Table</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <a href="#menu" className="group border-2 border-white/80 text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-all duration-300 hover:scale-105 inline-flex items-center justify-center space-x-2">
                    <span>Explore Our Menu</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </a>
                </div>
                
                {/* Restaurant Info Pills */}
                <div className="flex flex-wrap items-center gap-2 text-sm justify-center md:justify-start">
                  <div className="inline-flex items-center bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4 mr-2 text-yellow-200" />
                    <span>Hours today: 11am–10pm</span>
                  </div>
                  <div className="inline-flex items-center bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                    <MapPin className="w-4 h-4 mr-2 text-yellow-200" />
                    <span>Perth CBD</span>
                  </div>
                  <Link href="/reservations" className="inline-flex items-center bg-white/20 hover:bg-white/25 transition-colors px-3 py-1.5 rounded-full">
                    <Phone className="w-4 h-4 mr-2 text-yellow-200" />
                    <span>Reserve now</span>
                  </Link>
                </div>
              </div>

              {/* Right card - DJ Event or Branded */}
              <div className="hidden md:block">
                {isDJEvent && currentAnnouncement ? (
                  /* Enhanced DJ Event Promotion Card */
                  <div className="relative bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-400/50 shadow-2xl transform hover:scale-105 transition-all duration-500">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl animate-pulse"></div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-30 animate-pulse"></div>
                    
                    {/* Floating Badge */}
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-black animate-bounce shadow-lg">
                      🎵 LIVE DJ EVENT 🎵
                    </div>
                    
                    {/* Header Section */}
                    <div className="relative z-10 flex items-center gap-4 mb-6">
                      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white font-black text-3xl w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                        🎧
                      </div>
                      <div>
                        <div className="text-xs font-black text-purple-200 tracking-widest uppercase mb-1 animate-pulse">🔥 FEATURED EVENT 🔥</div>
                        <div className="text-2xl font-black text-white mb-1">{currentAnnouncement.dj_name}</div>
                        <div className="text-sm text-pink-200 font-semibold">Live Performance</div>
                      </div>
                    </div>
                    
                    {/* Event Details */}
                    <div className="relative z-10 space-y-4 text-white mb-6">
                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center mb-2">
                          <Calendar className="w-5 h-5 mr-3 text-yellow-300" />
                          <span className="font-bold text-lg">
                            {currentAnnouncement.event_date && new Date(currentAnnouncement.event_date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center mb-2">
                          <Clock className="w-5 h-5 mr-3 text-yellow-300" />
                          <span className="font-bold text-lg">
                            {currentAnnouncement.event_start_time} - {currentAnnouncement.event_end_time}
                          </span>
                        </div>
                        {currentAnnouncement.ticket_price && (
                          <div className="flex items-center">
                            <span className="w-5 h-5 mr-3 text-yellow-300 flex items-center justify-center font-black text-lg">💰</span>
                            <span className="font-black text-xl text-green-300">
                              ${currentAnnouncement.ticket_price.toFixed(2)} Entry Fee
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Event Description */}
                    <div className="relative z-10 bg-gradient-to-r from-white/15 to-white/10 rounded-xl p-4 mb-6 backdrop-blur-sm border border-white/20">
                      <p className="text-white font-medium leading-relaxed">
                        {currentAnnouncement.content}
                      </p>
                    </div>
                    
                    {/* Call to Action Buttons */}
                    <div className="relative z-10 space-y-3">
                      <Link 
                        href="/reservations" 
                        className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-4 px-6 rounded-2xl font-black text-lg hover:from-purple-700 hover:via-pink-700 hover:to-red-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-3 shadow-xl animate-pulse"
                      >
                        <span>🎫 RESERVE YOUR SPOT</span>
                        <ArrowRight className="w-6 h-6" />
                      </Link>
                      <div className="text-center">
                        <span className="text-xs text-purple-200 font-semibold animate-pulse">⚡ Limited Spots Available ⚡</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Default Branded Card */
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-white/90 text-orange-600 font-black text-2xl w-12 h-12 rounded-xl flex items-center justify-center shadow">8</div>
                      <div className="text-xs font-bold text-yellow-200 tracking-widest">BITES, BEATS & BURGERS</div>
                    </div>
                    <ul className="space-y-3 text-white/90">
                      <li className="flex items-center">
                        <Sparkles className="w-4 h-4 mr-2 text-yellow-200" /> 
                        Chef-crafted signatures
                      </li>
                      <li className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-yellow-200" /> 
                        Warm, welcoming service
                      </li>
                      <li className="flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-yellow-200" /> 
                        Weekend Live DJs
                      </li>
                    </ul>
                    <div className="mt-6 flex items-center text-sm text-white/80">
                      <span className="mr-2">Scroll</span>
                      <ArrowRight className="w-5 h-5 rotate-90" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={() => {
              const nextSection = document.querySelector('#announcements, #menu, section:nth-of-type(2)');
              if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="flex flex-col items-center animate-bounce hover:scale-110 transition-transform duration-300 cursor-pointer group"
            aria-label="Scroll to next section"
          >
            <span className="text-white/70 text-sm font-medium mb-2 group-hover:text-white transition-colors duration-300">Discover More</span>
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center group-hover:border-white transition-colors duration-300">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse group-hover:bg-white transition-colors duration-300"></div>
            </div>
          </button>
        </div>

        {/* Enhanced Mobile DJ Event Banner */}
        {isDJEvent && currentAnnouncement && (
          <div className="md:hidden absolute bottom-4 left-4 right-4 z-20">
            <div className="relative bg-gradient-to-r from-purple-700 via-pink-600 to-red-600 text-white p-5 rounded-2xl shadow-2xl border-2 border-purple-300/50 backdrop-blur-sm animate-pulse">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl animate-pulse"></div>
              
              {/* Header */}
              <div className="relative z-10 flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl animate-bounce">🎧</span>
                  <span className="font-black text-sm tracking-wider">🎵 LIVE DJ EVENT 🎵</span>
                </div>
                <div className="text-xs bg-white/30 px-3 py-1 rounded-full font-bold animate-pulse">
                  {currentAnnouncement.event_date && new Date(currentAnnouncement.event_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              
              {/* DJ Name */}
              <div className="relative z-10 font-black text-xl mb-2 text-center animate-pulse">
                🔥 {currentAnnouncement.dj_name} 🔥
              </div>
              
              {/* Event Details */}
              <div className="relative z-10 text-center text-sm text-purple-100 mb-4 font-semibold">
                <div className="flex items-center justify-center space-x-4">
                  <span>⏰ {currentAnnouncement.event_start_time} - {currentAnnouncement.event_end_time}</span>
                  {currentAnnouncement.ticket_price && (
                    <span className="text-green-300 font-bold">💰 ${currentAnnouncement.ticket_price.toFixed(2)}</span>
                  )}
                </div>
              </div>
              
              {/* CTA Button */}
              <Link 
                href="/reservations" 
                className="relative z-10 w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-black text-center transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 shadow-lg border border-white/30"
              >
                <span>🎫 RESERVE YOUR SPOT</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              {/* Urgency Text */}
              <div className="relative z-10 text-center mt-2">
                <span className="text-xs text-yellow-200 font-bold animate-pulse">⚡ Limited Spots Available ⚡</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// Important Announcements Marquee Component
function ImportantAnnouncementsMarquee({ announcements }: { announcements: Announcement[] }) {
  const [isVisible, setIsVisible] = useState(true)
  
  // Filter for important announcements (DJ events, featured, or urgent)
  const importantAnnouncements = announcements.filter(announcement => 
    announcement.announcement_type === 'dj_event' || 
    announcement.is_featured || 
    announcement.title.toLowerCase().includes('urgent') ||
    announcement.title.toLowerCase().includes('important') ||
    announcement.title.toLowerCase().includes('breaking') ||
    announcement.content.toLowerCase().includes('limited time') ||
    announcement.content.toLowerCase().includes('today only') ||
    announcement.content.toLowerCase().includes('this weekend')
  )

  // Don't show marquee if no important announcements
  if (importantAnnouncements.length === 0 || !isVisible) {
    return null
  }

  // Create marquee content
  const marqueeItems = importantAnnouncements.map(announcement => {
    if (announcement.announcement_type === 'dj_event') {
      return `🎵 LIVE DJ EVENT: ${announcement.dj_name} - ${announcement.event_date ? new Date(announcement.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''} ${announcement.event_start_time || ''} 🎵`
    }
    return `📢 ${announcement.title}: ${announcement.content.substring(0, 100)}${announcement.content.length > 100 ? '...' : ''}`
  })

  return (
    <div className="relative top-[85px] left-0 right-0 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white py-2 overflow-hidden z-[1]">
      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-1 right-2 z-10 text-white/80 hover:text-white text-lg font-bold transition-colors duration-200"
        aria-label="Close marquee"
      >
        ×
      </button>
      
      {/* Marquee content */}
      <div className="flex animate-marquee whitespace-nowrap">
        <div className="flex items-center space-x-8 px-4">
          {marqueeItems.map((item, index) => (
            <span key={index} className="font-semibold text-sm md:text-base flex items-center">
              {item}
            </span>
          ))}
        </div>
        {/* Duplicate for seamless loop */}
        <div className="flex items-center space-x-8 px-4">
          {marqueeItems.map((item, index) => (
            <span key={`duplicate-${index}`} className="font-semibold text-sm md:text-base flex items-center">
              {item}
            </span>
          ))}
        </div>
      </div>
      
      {/* CSS Animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
