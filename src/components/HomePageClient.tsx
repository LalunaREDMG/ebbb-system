'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ChefHat, Star, ArrowRight, Heart, Award, Zap, Sparkles, Clock, MapPin, Phone, Facebook, Instagram, Twitter, ChevronDown } from 'lucide-react'

// Import new reusable components
import LoadingSpinner from './ui/LoadingSpinner'
import Navigation from './layout/Navigation'
import HeroSection from './sections/HeroSection'
import ProductCard from './ui/ProductCard'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  image_path: string | null
  category: string
  is_signature?: boolean
  available: boolean
}

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

interface HomePageClientProps {
  products: Product[]
  announcements: Announcement[]
  groupedProducts: Record<string, Product[]>
  error: string | null
}

export default function HomePageClient({ products, announcements, groupedProducts, error }: HomePageClientProps) {
  const [loading, setLoading] = useState(true)
  const [liveProducts, setLiveProducts] = useState(products)
  const [isVisible, setIsVisible] = useState(false)
  const [isWeekend, setIsWeekend] = useState(false)
  const [showArrow, setShowArrow] = useState(true)

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setLoading(false)
      // Trigger entrance animation
      setTimeout(() => setIsVisible(true), 100)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const now = new Date()
    const day = now.getDay() // 0 Sun .. 6 Sat
    setIsWeekend(day === 0 || day === 6)
  }, [])

  // Realtime subscription for products (live updates)
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return
    const supabase = createClient(url, key)

    const channel = supabase
      .channel('realtime-products-home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        setLiveProducts((prev) => {
          if (payload.eventType === 'INSERT') return [...prev, payload.new as any]
          if (payload.eventType === 'UPDATE') return prev.map(p => p.id === (payload.new as any).id ? (payload.new as any) : p)
          if (payload.eventType === 'DELETE') return prev.filter(p => p.id !== (payload.old as any).id)
          return prev
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Filter out hero announcements to check if we should show the announcements section
  const nonHeroAnnouncements = announcements.filter(announcement => 
    !(announcement.title || '').toLowerCase().includes("what's new")
  )

  if (loading) {
    return <LoadingSpinner message="Opening EBBB..." submessage="Preparing something extraordinary for you" />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Error display */}
      {error && <ErrorDisplay error={error} />}

      {/* Navigation */}
      <Navigation variant="home" />

      {/* Hero Section */}
      <HeroSection 
        announcements={announcements} 
        groupedProducts={groupedProducts} 
        isVisible={isVisible} 
      />

      {/* Announcements Section - Show when there are non-hero announcements */}
      {nonHeroAnnouncements.length > 0 && (
        <AnnouncementsSection 
          announcements={announcements} 
          isWeekend={isWeekend} 
        />
      )}

      {/* Menu Section */}
      <MenuSection 
        groupedProducts={groupedProducts} 
        products={liveProducts} 
      />

      {/* Contact & Info Section */}
      <ContactSection />

      {/* Footer */}
      <Footer />

      {/* Mobile Sticky Reserve Button */}
      <MobileReserveButton />
    </div>
  )
}

// Error Display Component
function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded-md animate-fade-in">
      <strong>Error:</strong> {error}
      <div className="mt-2 text-sm">
        <p>To fix this issue:</p>
        <ol className="list-decimal list-inside mt-1">
          <li>Create a <code>.env.local</code> file in the project root</li>
          <li>Add your Supabase credentials:</li>
          <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
          </pre>
          <li>Set up your Supabase database using the schema in <code>database/schema.sql</code></li>
          <li>Restart the development server</li>
        </ol>
      </div>
    </div>
  )
}



// Announcements Section
function AnnouncementsSection({ announcements, isWeekend }: { announcements: Announcement[], isWeekend: boolean }) {
  // Filter out announcements that are featured in hero (What's New slideshow)
  const nonHeroAnnouncements = announcements.filter(announcement => 
    !(announcement.title || '').toLowerCase().includes("what's new")
  )
  
  const hasDJEvents = nonHeroAnnouncements.some(announcement => announcement.announcement_type === 'dj_event')
  const djEvents = nonHeroAnnouncements.filter(announcement => announcement.announcement_type === 'dj_event')
  const regularAnnouncements = nonHeroAnnouncements.filter(announcement => announcement.announcement_type !== 'dj_event')
  
  return (
    <section id="announcements" className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            {hasDJEvents ? 'Live DJ & Events' : (isWeekend ? 'Weekend Live DJ & Events' : "What's New at EBBB")}
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            {hasDJEvents ? 'Upcoming DJ Events & News' : (isWeekend ? 'Catch Our Live DJ This Weekend' : 'Latest Updates & Special Offers')}
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            {hasDJEvents ? 'Join us for beats, great vibes, and the latest updates from EBBB' : (isWeekend ? 'Join us for beats and great vibes. Check the news for who\'s playing and upcoming events.' : 'Stay in the loop with our newest dishes, events, and exclusive promotions')}
          </p>
        </div>
        
        {nonHeroAnnouncements.length > 0 && (
          <div className="space-y-8 md:space-y-12">
            {/* DJ Events - Large Featured Cards */}
            {djEvents.length > 0 && (
              <div className="space-y-6">
                {djEvents.map((djEvent, index) => (
                  <FeaturedDJCard key={djEvent.id} announcement={djEvent} index={index} />
                ))}
              </div>
            )}
            
            {/* Regular Announcements - Smaller Grid */}
            {regularAnnouncements.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {regularAnnouncements.map((announcement, index) => (
                  <AnnouncementCard key={announcement.id} announcement={announcement} index={index + djEvents.length} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

// Menu Section
function MenuSection({ groupedProducts, products }: { groupedProducts: Record<string, Product[]>, products: Product[] }) {
  return (
    <section id="menu" className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <ChefHat className="w-4 h-4 mr-2" />
            Chef's Special Selection
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Our Signature Dishes</h2>
          <p className="text-base md:text-lg text-gray-600">Discover our most popular dishes crafted with love using fresh, local ingredients</p>
        </div>

        {Object.keys(groupedProducts).length > 0 ? (
          <div className="mb-8 md:mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {(products.filter(p => p.is_signature)
                  .concat(products.filter(p => !p.is_signature)) // fallback fill from rest
                )
                .slice(0, 6)
                .map((product, productIndex) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={productIndex}
                    className="animate-fade-in-up"
                    hideSignatureIcon
                  />
                ))}
            </div>
            
            {/* View Full Menu Button */}
            <div className="text-center mt-8 md:mt-12">
              <Link 
                href="/menu" 
                className="group inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <span>View Complete Menu</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 md:py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 md:w-24 md:h-24 flex items-center justify-center mx-auto mb-4 md:mb-6">
              <ChefHat className="h-8 w-8 md:h-12 md:w-12 text-gray-400" />
            </div>
            <p className="text-base md:text-lg text-gray-500">Our menu is being prepared with love.</p>
            <p className="text-sm md:text-base text-gray-400 mt-2">Check back soon for our delicious offerings!</p>
          </div>
        )}
      </div>
    </section>
  )
}

// Contact Section
function ContactSection() {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Location",
      content: "123 Local Street\nPerth, WA 6000"
    },
    {
      icon: Phone,
      title: "Contact", 
      content: "Phone: (08) 1234 5678\nEmail: hello@ebbb.com.au"
    },
    {
      icon: Clock,
      title: "Hours",
      content: "Mon-Thu: 11am-9pm\nFri-Sat: 11am-10pm\nSun: 11am-8pm"
    }
  ]

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">Visit Our New Restaurant</h2>
          <p className="text-base md:text-lg text-gray-300">Experience the magic of EBBB - where every meal is a celebration</p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-8">
          {contactInfo.map((info, index) => (
            <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="bg-orange-500/20 w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 lg:mb-4 group-hover:bg-orange-500/30 transition-colors duration-300">
                <info.icon className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-orange-500" />
              </div>
              <h3 className="text-sm md:text-lg lg:text-xl font-semibold mb-1 md:mb-2">{info.title}</h3>
              <p className="text-xs md:text-sm lg:text-base text-gray-300 whitespace-pre-line">{info.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  const [showArrow, setShowArrow] = useState(true)

  const handleArrowClick = () => {
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Hide arrow after click
    setShowArrow(false)
    // Show arrow again after 3 seconds
    setTimeout(() => setShowArrow(true), 3000)
  }

  return (
    <footer className="bg-black text-white py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0 group">
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-lg md:text-xl px-2 py-1 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                8
              </div>
              <div className="text-[6px] md:text-[7px] font-bold text-orange-600 mt-1 text-center tracking-wider uppercase max-w-[60px] md:max-w-[65px] leading-none whitespace-nowrap">
                BITES, BEATS & BURGERS
              </div>
            </div>
            {/* Arrow next to logo */}
            {showArrow && (
              <button
                onClick={handleArrowClick}
                className="flex items-center justify-center w-8 h-8 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/30 rounded-full text-orange-400 hover:text-orange-300 transition-all duration-300 hover:scale-110 animate-bounce"
                title="Back to Top"
                style={{
                  animation: 'gentleBounce 2s infinite'
                }}
              >
                <ChevronDown className="h-4 w-4 rotate-180 transition-transform duration-300 hover:scale-110" />
              </button>
            )}
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-center md:text-left">
            <span className="text-gray-400 text-sm">© 2024 EBBB. Perth&apos;s newest culinary gem.</span>
            <div className="flex items-center space-x-3">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
      `}</style>
    </footer>
  )
}

// Mobile Reserve Button
function MobileReserveButton() {
  return (
    <div className="fixed bottom-4 inset-x-0 px-4 md:hidden z-40">
      <Link href="/reservations" className="w-full inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-full font-semibold shadow-xl">
        Book a Table
        <ArrowRight className="w-5 h-5 ml-2" />
      </Link>
    </div>
  )
}

// Announcement Card Component
function AnnouncementCard({ announcement, index }: { announcement: Announcement, index: number }) {
  const isDJEvent = announcement.announcement_type === 'dj_event'
  
  return (
    <div 
      className={`group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
        isDJEvent ? 'ring-2 ring-purple-200 bg-gradient-to-br from-purple-50 to-pink-50' : ''
      }`}
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      {announcement.image_url ? (
        <div className="relative overflow-hidden">
          <img 
            src={announcement.image_url} 
            alt={announcement.title}
            className="w-full h-40 md:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {isDJEvent && (
            <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
              🎵 DJ EVENT
            </div>
          )}
        </div>
      ) : (
        <div className={`w-full h-40 md:h-48 bg-gradient-to-br ${
          isDJEvent 
            ? 'from-purple-200 to-pink-200 group-hover:from-purple-300 group-hover:to-pink-300' 
            : 'from-gray-200 to-gray-300 group-hover:from-orange-200 group-hover:to-red-200'
        } flex items-center justify-center transition-all duration-300`}>
          <div className={`text-center ${
            isDJEvent ? 'text-purple-600 group-hover:text-purple-700' : 'text-gray-500 group-hover:text-orange-600'
          } transition-colors duration-300`}>
            <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 ${
              isDJEvent ? 'bg-purple-300 group-hover:bg-purple-400' : 'bg-gray-300 group-hover:bg-orange-300'
            } rounded-full flex items-center justify-center transition-colors duration-300`}>
              <span className="text-xl md:text-2xl">{isDJEvent ? '🎵' : '📰'}</span>
            </div>
            <p className="text-xs md:text-sm">No image</p>
          </div>
        </div>
      )}
      
      <div className="p-4 md:p-6">
        {isDJEvent && (
          <div className="flex items-center mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
              🎧 DJ Event
            </span>
          </div>
        )}
        
        <h3 className={`text-lg md:text-xl font-semibold mb-2 transition-colors duration-300 ${
          isDJEvent 
            ? 'text-purple-900 group-hover:text-purple-600' 
            : 'text-gray-900 group-hover:text-orange-500'
        }`}>
          {announcement.title}
        </h3>
        
        {isDJEvent && announcement.dj_name && (
          <p className="text-sm font-medium text-purple-700 mb-1">
            DJ: {announcement.dj_name}
          </p>
        )}
        
        {isDJEvent && announcement.event_date && (
          <div className="flex items-center text-xs text-purple-600 mb-2">
            <Clock className="w-3 h-3 mr-1" />
            <span>
              {new Date(announcement.event_date).toLocaleDateString()}
              {announcement.event_start_time && ` • ${announcement.event_start_time}`}
              {announcement.event_end_time && ` - ${announcement.event_end_time}`}
            </span>
          </div>
        )}
        
        {isDJEvent && announcement.ticket_price && (
          <p className="text-sm font-semibold text-green-600 mb-2">
            ${announcement.ticket_price.toFixed(2)} entry
          </p>
        )}
        
        <p className="text-sm md:text-base text-gray-600 mb-3 line-clamp-2">
          {announcement.content}
        </p>
        
        {isDJEvent && announcement.venue_details && (
          <p className="text-xs text-gray-500 mb-3 italic">
            {announcement.venue_details}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
          <span className={`font-semibold ${
            isDJEvent ? 'text-purple-500' : 'text-orange-500'
          }`}>
            {isDJEvent ? 'Event Details →' : 'Read More →'}
          </span>
        </div>
      </div>
    </div>
  )
}

// Featured DJ Card Component - Large, prominent display
function FeaturedDJCard({ announcement, index }: { announcement: Announcement, index: number }) {
  return (
    <div 
      className="relative bg-gradient-to-br from-purple-900/10 via-pink-900/10 to-red-900/10 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-200/30 hover:border-purple-300/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl"
      style={{ animationDelay: `${index * 0.3}s` }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 animate-pulse"></div>
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur opacity-30 animate-pulse"></div>
      
      {/* Floating Badge */}
      <div className="absolute top-6 right-6 z-20 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-4 py-2 rounded-full text-sm font-black animate-bounce shadow-lg">
        🎵 LIVE DJ EVENT 🎵
      </div>
      
      <div className="relative z-10 grid md:grid-cols-2 gap-8 p-8 md:p-12">
        {/* Left Side - Event Image */}
        <div className="relative">
          {announcement.image_url ? (
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <img 
                src={announcement.image_url} 
                alt={announcement.title}
                className="w-full h-64 md:h-80 object-cover hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30">
                  <div className="text-white font-black text-2xl mb-1">🎧 {announcement.dj_name}</div>
                  <div className="text-purple-100 text-sm">Live Performance</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-64 md:h-80 bg-gradient-to-br from-purple-200 via-pink-200 to-red-200 rounded-2xl flex items-center justify-center shadow-xl">
              <div className="text-center text-purple-700">
                <div className="w-20 h-20 mx-auto mb-4 bg-purple-300 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🎧</span>
                </div>
                <div className="font-black text-2xl mb-2">🎵 {announcement.dj_name} 🎵</div>
                <div className="text-purple-600 font-semibold">Live DJ Performance</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Side - Event Details */}
        <div className="flex flex-col justify-center space-y-6">
          {/* Header */}
          <div>
            <div className="text-sm font-black text-purple-600 tracking-widest uppercase mb-2 animate-pulse">
              🔥 FEATURED EVENT 🔥
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">
              {announcement.title}
            </h3>
            <div className="text-xl font-bold text-purple-700 mb-4">
              DJ {announcement.dj_name}
            </div>
          </div>
          
          {/* Event Info */}
          <div className="space-y-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50">
              {announcement.event_date && (
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-lg">📅</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      {new Date(announcement.event_date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-purple-600 font-semibold">
                      {announcement.event_start_time} - {announcement.event_end_time}
                    </div>
                  </div>
                </div>
              )}
              
              {announcement.ticket_price && (
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-lg">💰</span>
                  </div>
                  <div>
                    <div className="font-black text-2xl text-green-600">
                      ${announcement.ticket_price.toFixed(2)}
                    </div>
                    <div className="text-gray-600 font-semibold">Entry Fee</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Event Description */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200/50">
            <p className="text-gray-700 font-medium leading-relaxed text-lg">
              {announcement.content}
            </p>
            {announcement.venue_details && (
              <p className="text-purple-600 font-semibold mt-3 italic">
                {announcement.venue_details}
              </p>
            )}
          </div>
          
          {/* Call to Action */}
          <div className="space-y-3">
            <Link 
              href="/reservations" 
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-4 px-8 rounded-2xl font-black text-xl hover:from-purple-700 hover:via-pink-700 hover:to-red-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-3 shadow-xl animate-pulse"
            >
              <span>🎫 RESERVE YOUR SPOT NOW</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
            <div className="text-center">
              <span className="text-sm text-purple-600 font-bold animate-pulse">
                ⚡ Limited Spots Available - Book Today! ⚡
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    <div className="relative bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white py-2 overflow-hidden z-[100]">
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
