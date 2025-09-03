'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Package, 
  Megaphone, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Users,
  ArrowUpRight,
  Clock,
  DollarSign,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { SessionManager } from '@/lib/auth'

interface Stats {
  totalProducts: number
  totalAnnouncements: number
  pendingReservations: number
  todayReservations: number
  totalReservations: number
  confirmedReservations: number
}

interface RecentReservation {
  id: string
  name: string
  party_size: number
  date: string
  time: string
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalAnnouncements: 0,
    pendingReservations: 0,
    todayReservations: 0,
    totalReservations: 0,
    confirmedReservations: 0
  })
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    fetchDashboardData()
    setIsVisible(true)
  }, [])

  const fetchDashboardData = async () => {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.')
      }
      
      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Fetch announcements count
      const { count: announcementsCount } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })

      // Fetch reservations data
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select('*')

      const reservations = reservationsData || []
      const pendingCount = reservations.filter(r => r.status === 'pending').length
      const confirmedCount = reservations.filter(r => r.status === 'confirmed').length
      const totalCount = reservations.length

      // Fetch today's reservations count
      const today = new Date().toISOString().split('T')[0]
      const todayCount = reservations.filter(r => r.date === today).length

      // Fetch recent reservations
      const { data: recentData } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalProducts: productsCount || 0,
        totalAnnouncements: announcementsCount || 0,
        pendingReservations: pendingCount,
        todayReservations: todayCount,
        totalReservations: totalCount,
        confirmedReservations: confirmedCount
      })

      setRecentReservations(recentData || [])
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Total Products',
      value: stats.totalProducts,
      description: 'Menu items',
      color: 'from-blue-500 to-cyan-500',
      icon: Package,
      trend: '+2 this week'
    },
    {
      name: 'Total Reservations',
      value: stats.totalReservations,
      description: 'All bookings',
      color: 'from-purple-500 to-pink-500',
      icon: Calendar,
      trend: `${stats.confirmedReservations} confirmed`
    },
    {
      name: 'Pending Reservations',
      value: stats.pendingReservations,
      description: 'Awaiting confirmation',
      color: 'from-yellow-500 to-orange-500',
      icon: Clock,
      trend: 'Needs attention'
    },
    {
      name: "Today's Reservations",
      value: stats.todayReservations,
      description: "Today's bookings",
      color: 'from-green-500 to-emerald-500',
      icon: CheckCircle,
      trend: 'Active today'
    }
  ]

  const quickActions = [
    {
      name: 'Add Product',
      description: 'Create new menu item',
      href: '/ebbb-admin/products',
      color: 'from-orange-500 to-red-500',
      icon: Plus
    },
    {
      name: 'New Announcement',
      description: 'Share news with customers',
      href: '/ebbb-admin/announcements',
      color: 'from-green-500 to-emerald-500',
      icon: Megaphone
    },
    {
      name: 'View Reservations',
      description: 'Manage bookings',
      href: '/ebbb-admin/reservations',
      color: 'from-blue-500 to-cyan-500',
      icon: Calendar
    },
    {
      name: 'Analytics',
      description: 'View insights',
      href: '#',
      color: 'from-purple-500 to-pink-500',
      icon: TrendingUp
    }
  ]

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600 text-sm sm:text-base">Welcome to your restaurant management dashboard</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="mt-4 sm:mt-0 inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
        <div className="text-xs text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white shadow-sm hover:shadow-lg rounded-xl transition-all duration-300 hover:scale-105 group border border-gray-100">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 mb-2">{stat.description}</p>
                <p className="text-xs text-orange-600 font-medium">{stat.trend}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="bg-white shadow-sm hover:shadow-lg rounded-xl p-4 sm:p-6 transition-all duration-300 hover:scale-105 group border border-gray-100"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{action.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Reservations */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 sm:mb-0">Recent Reservations</h2>
          <div className="flex items-center space-x-4">
            <span className="text-xs sm:text-sm text-gray-500">{recentReservations.length} reservations</span>
            <Link
              href="/ebbb-admin/reservations"
              className="inline-flex items-center px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200 transition-colors duration-200"
            >
              <Eye className="w-3 h-3 mr-1" />
              View All
            </Link>
          </div>
        </div>
        
        {recentReservations.length === 0 ? (
          <div className="bg-white shadow-sm hover:shadow-lg rounded-xl p-6 sm:p-8 text-center border border-gray-100">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No reservations yet</h3>
            <p className="text-sm text-gray-600 mb-4">Reservations will appear here once customers start booking</p>
            <Link
              href="/ebbb-admin/reservations"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-sm"
            >
              <Calendar className="w-4 h-4 mr-2" />
              View All Reservations
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-sm hover:shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <div className="divide-y divide-gray-200">
              {recentReservations.map((reservation) => (
                <div key={reservation.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 truncate">{reservation.name}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 mt-1">
                          <span>{reservation.party_size} Guests</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{reservation.time}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{reservation.date}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{formatTimeAgo(reservation.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                        reservation.status === 'confirmed'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : reservation.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {reservation.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 