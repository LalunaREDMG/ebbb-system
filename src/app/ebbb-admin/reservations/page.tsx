'use client'

import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Calendar, Clock, Users, Phone, Mail, MessageSquare, Filter, X } from 'lucide-react'

interface Reservation {
  id: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  party_size: number
  special_requests: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  updated_at: string
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')
  const [dateFilter, setDateFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.')
      }
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) throw error
      setReservations(data || [])
    } catch (error) {
      console.error('Error fetching reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateReservationStatus = async (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.')
      }
      
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      fetchReservations()
    } catch (error) {
      console.error('Error updating reservation:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'confirmed':
        return 'bg-green-100 text-green-800 border border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const filteredReservations = reservations.filter(reservation => {
    const statusMatch = filter === 'all' || reservation.status === filter
    const dateMatch = !dateFilter || reservation.date === dateFilter
    return statusMatch && dateMatch
  })

  const groupedReservations = filteredReservations.reduce((acc, reservation) => {
    const date = reservation.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(reservation)
    return acc
  }, {} as Record<string, Reservation[]>)

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage customer reservations</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as Reservation['status'] | 'all')}
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilter('all')
                  setDateFilter('')
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reservations */}
      {Object.keys(groupedReservations).length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No reservations found</h3>
          <p className="text-gray-600 text-sm sm:text-base mb-6">
            {filter !== 'all' || dateFilter ? 'Try adjusting your filters' : 'No reservations have been made yet'}
          </p>
          {(filter !== 'all' || dateFilter) && (
            <button
              onClick={() => {
                setFilter('all')
                setDateFilter('')
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 flex items-center mx-auto transition-all duration-300 hover:scale-105"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {Object.entries(groupedReservations)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dateReservations]) => (
              <div key={date} className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {dateReservations
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((reservation) => (
                      <div key={reservation.id} className="bg-white shadow-sm hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-105">
                        {/* Header */}
                        <div className="p-4 sm:p-6 border-b border-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{reservation.name}</h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                              {reservation.status}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-orange-500" />
                              {reservation.time}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2 text-orange-500" />
                              {reservation.party_size} {reservation.party_size === 1 ? 'person' : 'people'}
                            </div>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="p-4 sm:p-6 border-b border-gray-100">
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-orange-500" />
                              <a href={`tel:${reservation.phone}`} className="hover:text-orange-500 transition-colors duration-300">
                                {reservation.phone}
                              </a>
                            </div>
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-orange-500" />
                              <a href={`mailto:${reservation.email}`} className="hover:text-orange-500 transition-colors duration-300">
                                {reservation.email}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Special Requests */}
                        {reservation.special_requests && (
                          <div className="p-4 sm:p-6 border-b border-gray-100">
                            <div className="flex items-start">
                              <MessageSquare className="w-4 h-4 mr-2 mt-0.5 text-orange-500 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Special Requests:</p>
                                <p className="text-sm text-gray-600">{reservation.special_requests}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="p-4 sm:p-6">
                          <p className="text-xs text-gray-500 mb-4">
                            Booked: {new Date(reservation.created_at).toLocaleDateString()} at{' '}
                            {new Date(reservation.created_at).toLocaleTimeString()}
                          </p>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            {reservation.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                                  className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 text-sm font-medium transition-all duration-300 hover:scale-105"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                                  className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 text-sm font-medium transition-all duration-300 hover:scale-105"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {reservation.status === 'confirmed' && (
                              <button
                                onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                                className="w-full bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 text-sm font-medium transition-all duration-300 hover:scale-105"
                              >
                                Cancel
                              </button>
                            )}
                            {reservation.status === 'cancelled' && (
                              <button
                                onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                                className="w-full bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 text-sm font-medium transition-all duration-300 hover:scale-105"
                              >
                                Reconfirm
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}