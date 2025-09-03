'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SettingsService } from '@/lib/settings'

export default function TestSettingsDB() {
  const [dbStatus, setDbStatus] = useState('Testing...')
  const [settings, setSettings] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const testDatabase = async () => {
      try {
        if (!supabase) {
          setError('Supabase client is not configured')
          setDbStatus('Supabase not configured')
          return
        }

        setDbStatus('Testing database connection...')

        // Test 1: Check if app_settings table exists
        const { data: tableCheck, error: tableError } = await supabase
          .from('app_settings')
          .select('count')
          .limit(1)

        if (tableError) {
          setError(`Table check failed: ${tableError.message}`)
          setDbStatus('Table does not exist')
          return
        }

        setDbStatus('Table exists, loading settings...')

        // Test 2: Load all settings
        const { settings: dbSettings, error: settingsError } = await SettingsService.getAllSettings()
        
        if (settingsError) {
          setError(`Settings load failed: ${settingsError}`)
          setDbStatus('Failed to load settings')
          return
        }

        setSettings(dbSettings)
        setDbStatus('Settings loaded successfully!')

        // Test 3: Try to update a setting
        const testResult = await SettingsService.updateSetting('restaurant_name', 'TEST RESTAURANT')
        console.log('Test update result:', testResult)

      } catch (error: any) {
        console.error('Database test error:', error)
        setError(`Test failed: ${error.message}`)
        setDbStatus('Test failed')
      }
    }

    testDatabase()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Settings Database Test</h1>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold mb-2">Database Status:</h2>
            <p className="text-sm">{dbStatus}</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-lg">
              <h2 className="font-semibold mb-2 text-red-800">Error:</h2>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {settings && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h2 className="font-semibold mb-2 text-green-800">Loaded Settings:</h2>
              <div className="text-sm text-green-700">
                {Object.keys(settings).map(category => (
                  <div key={category} className="mb-4">
                    <h3 className="font-medium text-green-800 mb-2">{category.toUpperCase()}:</h3>
                    {settings[category].map((setting: any) => (
                      <div key={setting.setting_key} className="ml-4 mb-1">
                        <strong>{setting.setting_key}:</strong> {JSON.stringify(setting.setting_value)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h2 className="font-semibold mb-2 text-yellow-800">Next Steps:</h2>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>If table doesn't exist, run the database schema</li>
              <li>If settings are empty, check the default data insertion</li>
              <li>If update fails, check RLS policies</li>
              <li>Check browser console for detailed error messages</li>
            </ol>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold mb-2 text-gray-800">Database Schema:</h2>
            <p className="text-sm text-gray-600 mb-2">
              Make sure you've run the settings schema in your Supabase SQL Editor:
            </p>
            <code className="text-xs bg-gray-200 p-2 rounded block">
              -- Copy the content from database/settings-schema.sql and run it in Supabase SQL Editor
            </code>
          </div>
        </div>
      </div>
    </div>
  )
} 