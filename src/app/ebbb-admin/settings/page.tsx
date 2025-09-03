'use client'

import { useState, useEffect } from 'react'
import { Settings, Database, Shield, Bell, Palette, Check, AlertTriangle } from 'lucide-react'
import { SessionManager } from '@/lib/auth'
import { SettingsService, AppSetting } from '@/lib/settings'

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [dbError, setDbError] = useState('')

  // Settings state
  const [settings, setSettings] = useState<any>({
    general: {
      restaurant_name: 'EBBB Restaurant',
      timezone: 'UTC+8',
      language: 'en'
    },
    security: {
      session_timeout_hours: 24,
      require_password_change_days: 90,
      enable_2fa: true
    },
    notifications: {
      notify_new_reservations: true,
      notify_order_updates: true,
      notify_system_alerts: false
    },
    appearance: {
      theme: 'light',
      primary_color: 'orange'
    }
  })

  useEffect(() => {
    const initializePage = async () => {
      try {
        const user = await SessionManager.getCurrentUser()
        setCurrentUser(user)
        
        // Load settings from database
        const { settings: dbSettings, error } = await SettingsService.getAllSettings()
        
        if (error) {
          console.error('Failed to load settings:', error)
          setDbError('Failed to load settings from database. Please check if the database schema has been set up.')
          // If there's an error, we'll keep the default settings
          // This could mean the database schema hasn't been run yet
        } else if (dbSettings && Object.keys(dbSettings).length > 0) {
          // Convert database settings to our format
          const newSettings: any = {
            general: {
              restaurant_name: 'EBBB Restaurant',
              timezone: 'UTC+8',
              language: 'en'
            },
            security: {
              session_timeout_hours: 24,
              require_password_change_days: 90,
              enable_2fa: true
            },
            notifications: {
              notify_new_reservations: true,
              notify_order_updates: true,
              notify_system_alerts: false
            },
            appearance: {
              theme: 'light',
              primary_color: 'orange'
            }
          }
          
          // Override with database values
          Object.keys(dbSettings).forEach(category => {
            if (newSettings[category]) {
              dbSettings[category].forEach((setting: AppSetting) => {
                const key = setting.setting_key.replace(`${category}_`, '')
                if (newSettings[category][key] !== undefined) {
                  newSettings[category][key] = setting.setting_value
                }
              })
            }
          })
          
          console.log('Loaded settings from database:', newSettings)
          setSettings(newSettings)
        } else {
          console.log('No settings found in database, using defaults')
          setDbError('No settings found in database. Please run the database schema setup.')
          // If no settings found, we'll keep the default settings
          // This could mean the database schema hasn't been run yet
        }
      } catch (error) {
        console.error('Failed to initialize settings page:', error)
        setDbError('Failed to initialize settings page. Please check the console for details.')
      } finally {
        setInitializing(false)
      }
    }

    initializePage()
  }, [])

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'database', name: 'Database', icon: Database }
  ]

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    
    try {
      // Convert settings to database format
      const settingsToUpdate: { key: string; value: any }[] = []
      
      Object.keys(settings).forEach(category => {
        Object.keys(settings[category as keyof typeof settings]).forEach(key => {
          const settingKey = `${category}_${key}`
          const value = settings[category as keyof typeof settings][key as keyof typeof settings[typeof category]]
          settingsToUpdate.push({ key: settingKey, value })
        })
      })
      
      // Save to database
      const { success, error } = await SettingsService.updateSettings(settingsToUpdate)
      
      if (success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        setDbError('') // Clear any previous errors
      } else {
        console.error('Failed to save settings:', error)
        alert(`Failed to save settings: ${error}`)
      }
    } catch (error) {
      console.error('Save settings error:', error)
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  if (initializing) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your admin panel preferences and system configuration</p>
      </div>

      {/* Database Error Alert */}
      {dbError && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Database Setup Required</h3>
              <p className="text-sm text-yellow-700 mb-3">{dbError}</p>
              <div className="text-sm text-yellow-700">
                <p className="mb-2">To fix this:</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Go to your Supabase SQL Editor</li>
                  <li>Copy the content from <code className="bg-yellow-100 px-1 rounded">database/settings-schema.sql</code></li>
                  <li>Paste and run the SQL script</li>
                  <li>Refresh this page</li>
                </ol>
                <div className="mt-3">
                  <a 
                    href="/ebbb-admin/settings/test-db" 
                    className="text-yellow-800 underline hover:text-yellow-900"
                  >
                    Test Database Connection
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {activeTab === 'general' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      value={settings?.general?.restaurant_name || 'EBBB Restaurant'}
                      onChange={(e) => updateSetting('general', 'restaurant_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Zone
                    </label>
                    <select 
                      value={settings?.general?.timezone || 'UTC+8'}
                      onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="UTC+8">UTC+8 (Perth)</option>
                      <option value="UTC+0">UTC+0 (London)</option>
                      <option value="UTC-5">UTC-5 (New York)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Language
                    </label>
                    <select 
                      value={settings?.general?.language || 'en'}
                      onChange={(e) => updateSetting('general', 'language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
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
                      Session Timeout (hours)
                    </label>
                    <input
                      type="number"
                      value={settings?.security?.session_timeout_hours || 24}
                      onChange={(e) => updateSetting('security', 'session_timeout_hours', parseInt(e.target.value))}
                      min="1"
                      max="168"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Require Password Change (days)
                    </label>
                    <input
                      type="number"
                      value={settings?.security?.require_password_change_days || 90}
                      onChange={(e) => updateSetting('security', 'require_password_change_days', parseInt(e.target.value))}
                      min="30"
                      max="365"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={settings?.security?.enable_2fa || false}
                        onChange={(e) => updateSetting('security', 'enable_2fa', e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" 
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable two-factor authentication</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={settings?.notifications?.notify_new_reservations || false}
                        onChange={(e) => updateSetting('notifications', 'notify_new_reservations', e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" 
                      />
                      <span className="ml-2 text-sm text-gray-700">New reservation notifications</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={settings?.notifications?.notify_order_updates || false}
                        onChange={(e) => updateSetting('notifications', 'notify_order_updates', e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" 
                      />
                      <span className="ml-2 text-sm text-gray-700">Order status updates</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={settings?.notifications?.notify_system_alerts || false}
                        onChange={(e) => updateSetting('notifications', 'notify_system_alerts', e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" 
                      />
                      <span className="ml-2 text-sm text-gray-700">System maintenance alerts</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select 
                      value={settings?.appearance?.theme || 'light'}
                      onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateSetting('appearance', 'primary_color', 'orange')}
                        className={`w-8 h-8 bg-orange-500 rounded-full border-2 ${(settings?.appearance?.primary_color || 'orange') === 'orange' ? 'border-gray-800' : 'border-gray-300'}`}
                      ></button>
                      <button
                        onClick={() => updateSetting('appearance', 'primary_color', 'blue')}
                        className={`w-8 h-8 bg-blue-500 rounded-full border-2 ${(settings?.appearance?.primary_color || 'orange') === 'blue' ? 'border-gray-800' : 'border-gray-300'}`}
                      ></button>
                      <button
                        onClick={() => updateSetting('appearance', 'primary_color', 'green')}
                        className={`w-8 h-8 bg-green-500 rounded-full border-2 ${(settings?.appearance?.primary_color || 'orange') === 'green' ? 'border-gray-800' : 'border-gray-300'}`}
                      ></button>
                      <button
                        onClick={() => updateSetting('appearance', 'primary_color', 'purple')}
                        className={`w-8 h-8 bg-purple-500 rounded-full border-2 ${(settings?.appearance?.primary_color || 'orange') === 'purple' ? 'border-gray-800' : 'border-gray-300'}`}
                      ></button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'database' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Information</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Connection Status</h3>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Connected to Database</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Database Stats</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Products: 5 items</p>
                      <p>Announcements: 3 items</p>
                      <p>Reservations: 0 items</p>
                      <p>Admin Users: 1 user</p>
                      <p>Settings: {Object.keys(settings).reduce((acc, cat) => acc + Object.keys(settings[cat as keyof typeof settings]).length, 0)} items</p>
                    </div>
                  </div>
                  {/* <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Database Test</h3>
                    <p className="text-sm text-blue-700 mb-2">
                      Test your database connection and settings:
                    </p>
                    <a 
                      href="/ebbb-admin/settings/test-db" 
                      className="text-blue-600 hover:text-blue-700 text-sm underline"
                    >
                      Run Database Test
                    </a>
                  </div> */}
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
              <button 
                onClick={handleSave}
                disabled={loading || !!dbError}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
              
              {saved && (
                <div className="flex items-center text-green-600">
                  <Check className="w-4 h-4 mr-1" />
                  <span className="text-sm">Settings saved successfully!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 