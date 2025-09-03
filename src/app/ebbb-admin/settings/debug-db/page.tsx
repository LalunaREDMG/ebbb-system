'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

interface Setting {
  id: string
  setting_key: string
  setting_value: string | number | boolean
  category: string
  updated_at: string
}

export default function DebugSettingsDB() {
  const [dbStatus, setDbStatus] = useState('Initializing...')
  const [error, setError] = useState<string | null>(null)
  const [currentSettings, setCurrentSettings] = useState<Setting[]>([])
  const [testResult, setTestResult] = useState<string | null>(null)

  // Check if Supabase environment variables are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    setError('Supabase environment variables are not configured')
    setDbStatus('Supabase not configured')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const loadCurrentSettings = async () => {
    try {
      if (!supabase) {
        setError('Supabase client is not configured')
        setDbStatus('Supabase not configured')
        return
      }

      setDbStatus('Loading current settings...')

      const { data: settings, error: loadError } = await supabase
        .from('app_settings')
        .select('*')
        .order('category, setting_key')

      if (loadError) {
        setError(`Failed to load settings: ${loadError.message}`)
        setDbStatus('Failed to load settings')
        return
      }

      setCurrentSettings(settings || [])
      setDbStatus(`Loaded ${settings?.length || 0} settings`)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(`Load error: ${errorMessage}`)
      setDbStatus('Load failed')
    }
  }

  const testSaveAndLoad = async () => {
    try {
      setTestResult('Testing save and load...')

      if (!supabase) {
        setTestResult('Supabase client not available')
        return
      }

      // Test 1: Save a setting
      const testValue = `Test Value ${new Date().toLocaleTimeString()}`
      console.log('Testing save with value:', testValue)

      const { data: saveData, error: saveError } = await supabase
        .from('app_settings')
        .update({ setting_value: testValue })
        .eq('setting_key', 'general_restaurant_name')
        .select()

      if (saveError) {
        setTestResult(`Save failed: ${saveError.message}`)
        return
      }

      console.log('Save result:', saveData)
      setTestResult(`Save successful: ${JSON.stringify(saveData)}`)

      // Test 2: Load the setting back
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait a bit

      const { data: loadData, error: loadError } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_key', 'general_restaurant_name')
        .single()

      if (loadError) {
        setTestResult(`Load failed: ${loadError.message}`)
        return
      }

      console.log('Load result:', loadData)
      setTestResult(`Load successful: ${JSON.stringify(loadData)}`)

      // Reload current settings
      loadCurrentSettings()

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setTestResult(`Test failed: ${errorMessage}`)
    }
  }

  const resetToDefaults = async () => {
    try {
      setTestResult('Resetting to defaults...')

      if (!supabase) {
        setTestResult('Supabase client not available')
        return
      }

      const defaultSettings = [
        { key: 'general_restaurant_name', value: 'EBBB Restaurant' },
        { key: 'general_timezone', value: 'UTC+8' },
        { key: 'general_language', value: 'en' },
        { key: 'security_session_timeout_hours', value: 24 },
        { key: 'security_require_password_change_days', value: 90 },
        { key: 'security_enable_2fa', value: true },
        { key: 'notifications_notify_new_reservations', value: true },
        { key: 'notifications_notify_order_updates', value: true },
        { key: 'notifications_notify_system_alerts', value: false },
        { key: 'appearance_theme', value: 'light' },
        { key: 'appearance_primary_color', value: 'orange' }
      ]

      for (const setting of defaultSettings) {
        const { error } = await supabase
          .from('app_settings')
          .update({ setting_value: setting.value })
          .eq('setting_key', setting.key)

        if (error) {
          setTestResult(`Reset failed at ${setting.key}: ${error.message}`)
          return
        }
      }

      setTestResult('Reset to defaults successful')
      loadCurrentSettings()

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setTestResult(`Reset failed: ${errorMessage}`)
    }
  }

  useEffect(() => {
    loadCurrentSettings()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Settings Database Debug</h1>

        <div className="space-y-6">
          {/* Status */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold mb-2">Database Status:</h2>
            <p className="text-sm">{dbStatus}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg">
              <h2 className="font-semibold mb-2 text-red-800">Error:</h2>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Test Results */}
          {testResult && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h2 className="font-semibold mb-2 text-yellow-800">Test Result:</h2>
              <p className="text-sm text-yellow-700">{testResult}</p>
            </div>
          )}

          {/* Current Settings */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h2 className="font-semibold mb-2 text-green-800">Current Settings ({currentSettings.length}):</h2>
            <div className="text-sm text-green-700 space-y-2 max-h-96 overflow-y-auto">
              {currentSettings.map((setting, index) => (
                <div key={index} className="border-b border-green-200 pb-2">
                  <div><strong>{setting.setting_key}:</strong></div>
                  <div>Value: {JSON.stringify(setting.setting_value)}</div>
                  <div>Category: {setting.category}</div>
                  <div>Updated: {new Date(setting.updated_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold mb-4 text-gray-800">Actions:</h2>
            <div className="space-x-4">
              <button
                onClick={loadCurrentSettings}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Reload Settings
              </button>
              <button
                onClick={testSaveAndLoad}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Test Save & Load
              </button>
              <button
                onClick={resetToDefaults}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Reset to Defaults
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <h2 className="font-semibold mb-2 text-purple-800">Instructions:</h2>
            <div className="text-sm text-purple-700 space-y-2">
              <p>1. Check the Database Status to see if the connection is working</p>
              <p>2. If there are errors, check your Supabase configuration</p>
              <p>3. Use &quot;Test Save & Load&quot; to verify database operations</p>
              <p>4. Use &quot;Reset to Defaults&quot; to restore default settings</p>
              <p>5. Check the Current Settings to see what&apos;s in the database</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 