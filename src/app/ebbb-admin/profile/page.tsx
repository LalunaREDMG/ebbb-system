'use client'

import { useState, useEffect } from 'react'
import { User, Key, Clock, Shield, LogOut, Monitor, Wifi, Globe } from 'lucide-react'
import { SessionManager, AdminAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const user = await SessionManager.getCurrentUser()
      setCurrentUser(user)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (activeTab === 'sessions' && currentUser) {
      loadActiveSessions()
    }
  }, [activeTab, currentUser])

  const loadActiveSessions = async () => {
    if (!currentUser || !supabase) return
    
    setLoadingSessions(true)
    try {
      const { data: sessionsData, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('user_id', currentUser.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load sessions:', error)
      } else {
        setSessions(sessionsData || [])
      }
    } catch (error) {
      console.error('Load sessions error:', error)
    } finally {
      setLoadingSessions(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'sessions', name: 'Active Sessions', icon: Clock }
  ]

  const handleLogout = async () => {
    const sessionToken = SessionManager.getSession()
    if (sessionToken) {
      await AdminAuth.logout(sessionToken)
    }
    SessionManager.clearSession()
    window.location.href = '/ebbb-admin/login'
  }

  const handleLogoutSession = async (sessionId: string) => {
    if (!supabase) return
    
    try {
      const { error } = await supabase
        .from('admin_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) {
        console.error('Failed to logout session:', error)
      } else {
        // Reload sessions
        loadActiveSessions()
      }
    } catch (error) {
      console.error('Logout session error:', error)
    }
  }

  const getDeviceInfo = (userAgent: string) => {
    if (!userAgent) return { type: 'Unknown', browser: 'Unknown' }
    
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/.test(userAgent)
    
    let browser = 'Unknown'
    if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    else if (userAgent.includes('Edge')) browser = 'Edge'
    
    let type = 'Desktop'
    if (isTablet) type = 'Tablet'
    else if (isMobile) type = 'Mobile'
    
    return { type, browser }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} days ago`
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {activeTab === 'profile' && currentUser && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={currentUser.full_name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      defaultValue={currentUser.username}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={currentUser.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      defaultValue={currentUser.role}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Login
                    </label>
                    <input
                      type="text"
                      defaultValue={currentUser.last_login ? new Date(currentUser.last_login).toLocaleString() : 'Never'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                      <span className="ml-2 text-sm text-gray-700">Logout from all other devices</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Active Sessions</h2>
                  <button
                    onClick={loadActiveSessions}
                    disabled={loadingSessions}
                    className="text-sm text-orange-600 hover:text-orange-700 disabled:opacity-50"
                  >
                    {loadingSessions ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
                
                {loadingSessions ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active sessions found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => {
                      const deviceInfo = getDeviceInfo(session.user_agent)
                      const isCurrentSession = session.session_token === SessionManager.getSession()
                      
                      return (
                        <div
                          key={session.id}
                          className={`border rounded-lg p-4 ${
                            isCurrentSession 
                              ? 'border-orange-200 bg-orange-50' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${
                                isCurrentSession ? 'bg-orange-100' : 'bg-gray-100'
                              }`}>
                                {deviceInfo.type === 'Mobile' ? (
                                  <Monitor className="w-4 h-4 text-gray-600" />
                                ) : deviceInfo.type === 'Tablet' ? (
                                  <Wifi className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <Globe className="w-4 h-4 text-gray-600" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium text-gray-900">
                                    {deviceInfo.type} - {deviceInfo.browser}
                                  </p>
                                  {isCurrentSession && (
                                    <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                                      Current
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">
                                  Started {formatTimeAgo(session.created_at)}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Expires {new Date(session.expires_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            {!isCurrentSession && (
                              <button
                                onClick={() => handleLogoutSession(session.id)}
                                className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                              >
                                Logout
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Session Information</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• Sessions automatically expire after 24 hours</p>
                    <p>• You can logout from other devices to end their sessions</p>
                    <p>• The current session is highlighted in orange</p>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 