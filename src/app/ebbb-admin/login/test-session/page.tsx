'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSessionPage() {
  const [testStatus, setTestStatus] = useState('Testing...')
  const [error, setError] = useState('')
  const [tableInfo, setTableInfo] = useState<any>(null)

  useEffect(() => {
    const testSessionTable = async () => {
      try {
        if (!supabase) {
          setError('Supabase client is not configured')
          setTestStatus('Supabase not configured')
          return
        }

        setTestStatus('Testing admin_sessions table structure...')
        
        // Test 1: Check if table exists and get structure
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_name', 'admin_sessions')
          .eq('table_schema', 'public')

        if (columnsError) {
          setError(`Failed to get table structure: ${columnsError.message}`)
          setTestStatus('Failed to get table structure')
          return
        }

        setTableInfo(columns)
        setTestStatus('Table structure retrieved, testing session creation...')

        // Test 2: Try to create a test session
        const testSessionData = {
          user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
          session_token: 'test-session-token-' + Date.now(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }

        console.log('Testing session creation with:', testSessionData)

        const { data: testSession, error: sessionError } = await supabase
          .from('admin_sessions')
          .insert(testSessionData)
          .select()
          .single()

        if (sessionError) {
          setError(`Session creation test failed: ${sessionError.message}`)
          setTestStatus('Session creation test failed')
          console.error('Session creation test error:', sessionError)
          return
        }

        // Clean up test session
        await supabase
          .from('admin_sessions')
          .delete()
          .eq('session_token', testSessionData.session_token)

        setTestStatus('Session creation test passed!')
        
      } catch (error) {
        console.error('Test error:', error)
        setError(`Test failed: ${error}`)
        setTestStatus('Test failed')
      }
    }

    testSessionTable()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Session Table Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold mb-2">Test Status:</h2>
            <p className="text-sm">{testStatus}</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-lg">
              <h2 className="font-semibold mb-2 text-red-800">Error:</h2>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {tableInfo && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h2 className="font-semibold mb-2 text-green-800">Table Structure:</h2>
              <div className="text-sm text-green-700">
                {tableInfo.map((column: any, index: number) => (
                  <div key={index} className="mb-1">
                    <strong>{column.column_name}</strong>: {column.data_type} 
                    {column.is_nullable === 'YES' ? ' (nullable)' : ' (not null)'}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h2 className="font-semibold mb-2 text-yellow-800">Next Steps:</h2>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Check if the table structure is correct</li>
              <li>Verify that required fields are present</li>
              <li>Check if there are any constraint violations</li>
              <li>Look at the browser console for detailed error messages</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
} 