'use client'

import { useState, useEffect } from 'react'
import { ChefHat, Calendar, Clock, Users, Phone, Mail, User, CheckCircle, ArrowLeft, Star } from 'lucide-react'
import Link from 'next/link'
import { createReservation } from '@/app/actions/reservations'

interface ReservationsPageClientProps {
  error: string | null
}

export default function ReservationsPageClient({ error }: ReservationsPageClientProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    party_size: 2,
    special_requests: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError('')

    try {
      const result = await createReservation(formData)
      
      if (result.success) {
        setSuccess(true)
        setFormData({
          name: '',
          email: '',
          phone: '',
          date: '',
          time: '',
          party_size: 2,
          special_requests: ''
        })
      } else {
        setSubmitError(result.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'party_size' ? parseInt(value) : value
    }))
  }

  // Generate time slots
  const timeSlots = []
  for (let hour = 11; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeSlots.push(time)
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Reservation Confirmed!</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Thank you for your reservation. We&apos;ll contact you shortly to confirm the details.
          </p>
          <div className="space-y-4">
            <Link 
              href="/"
              className="group block w-full bg-orange-500 text-white py-3 px-6 rounded-full hover:bg-orange-600 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span>Back to Home</span>
            </Link>
            <button
              onClick={() => setSuccess(false)}
              className="block w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-full hover:bg-gray-50 hover:border-orange-500 transition-all duration-300 hover:scale-105"
            >
              Make Another Reservation
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
                         <Link href="/" className="flex flex-col items-center group">
               <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-xl px-2 py-1 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 w-8 h-8 flex items-center justify-center">
                 8
               </div>
               <div className="text-[6px] font-bold text-orange-600 mt-1 text-center tracking-wider uppercase max-w-[55px] leading-none whitespace-nowrap">
                 BITES, BEATS & BURGERS
               </div>
             </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-orange-500 transition-all duration-300 hover:scale-105">Home</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-8 md:mb-12">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 animate-pulse">
                <Calendar className="w-8 h-8 md:w-12 md:h-12 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">Make a Reservation</h1>
              <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8">Book your table and join us for an amazing dining experience</p>
              
              {/* Trust indicators */}
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs md:text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" />
                  <span>4.8/5 Rating</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                  <span>500+ Happy Customers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                  <span>Quick Confirmation</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 animate-fade-in-up">
                {(error || submitError) && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-fade-in">
                    {error || submitError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="group">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-orange-500 transition-colors duration-300">
                        <User className="w-4 h-4 inline mr-1" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300 text-sm md:text-base"
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="group">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-orange-500 transition-colors duration-300">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300 text-sm md:text-base"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="group">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-orange-500 transition-colors duration-300">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300 text-sm md:text-base"
                        placeholder="(08) 1234 5678"
                      />
                    </div>

                    <div className="group">
                      <label htmlFor="party_size" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-orange-500 transition-colors duration-300">
                        <Users className="w-4 h-4 inline mr-1" />
                        Party Size
                      </label>
                      <select
                        id="party_size"
                        name="party_size"
                        value={formData.party_size}
                        onChange={handleChange}
                        required
                        className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300 text-sm md:text-base"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(size => (
                          <option key={size} value={size}>
                            {size} {size === 1 ? 'person' : 'people'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="group">
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-orange-500 transition-colors duration-300">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        min={today}
                        className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300 text-sm md:text-base"
                      />
                    </div>

                    <div className="group">
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-orange-500 transition-colors duration-300">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Time
                      </label>
                      <select
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300 text-sm md:text-base"
                      >
                        <option value="">Select a time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="special_requests" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-orange-500 transition-colors duration-300">
                      Special Requests
                    </label>
                    <textarea
                      id="special_requests"
                      name="special_requests"
                      value={formData.special_requests}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300 resize-none text-sm md:text-base"
                      placeholder="Any special requests or dietary requirements..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 md:py-4 px-4 md:px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 text-sm md:text-base"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                        <span>Book My Table</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-4 md:space-y-6">
              {/* Restaurant Info */}
              <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center">
                  <ChefHat className="w-4 h-4 md:w-5 md:h-5 text-orange-500 mr-2" />
                  Restaurant Info
                </h3>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start space-x-2 md:space-x-3">
                    <Clock className="w-4 h-4 md:w-5 md:h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm md:text-base">Opening Hours</p>
                      <p className="text-xs md:text-sm text-gray-600">Mon-Thu: 11am-9pm<br />Fri-Sat: 11am-10pm<br />Sun: 11am-8pm</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 md:space-x-3">
                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm md:text-base">Contact</p>
                      <p className="text-xs md:text-sm text-gray-600">(08) 1234 5678</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Choose Us */}
              <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl shadow-xl p-4 md:p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Why Choose EBBB?</h3>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span className="text-xs md:text-sm">Fresh, local ingredients</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span className="text-xs md:text-sm">Cozy, welcoming atmosphere</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span className="text-xs md:text-sm">Expert culinary team</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span className="text-xs md:text-sm">Quick reservation confirmation</span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-2xl p-4 md:p-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <h3 className="text-base md:text-lg font-bold text-blue-900 mb-2 md:mb-3">💡 Pro Tips</h3>
                <ul className="text-xs md:text-sm text-blue-800 space-y-1 md:space-y-2">
                  <li>• Book at least 24 hours in advance for weekend dining</li>
                  <li>• We accommodate dietary restrictions - just let us know!</li>
                  <li>• Perfect for special occasions and celebrations</li>
                  <li>• Free parking available on-site</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 