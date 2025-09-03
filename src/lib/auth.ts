import { supabase, AdminUser, AdminSession, isSupabaseConfigured } from './supabase'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

// Authentication utilities for admin panel
export class AdminAuth {
  private static SESSION_DURATION_HOURS = 24 // 24 hours

  // Get client IP address (for server-side)
  private static getClientIP(): string | null {
    if (typeof window === 'undefined') {
      // Server-side - would need to be passed from request
      return null
    }
    
    // Client-side - try to get from various sources
    try {
      // This is a simplified approach - in production you'd get this from the server
      return null // Set to null for now to avoid issues
    } catch (error) {
      return null
    }
  }

  // Get user agent
  private static getUserAgent(): string | null {
    if (typeof window === 'undefined') {
      return null
    }
    
    return navigator.userAgent || null
  }

  // Login admin user
  static async login(username: string, password: string): Promise<{ success: boolean; user?: AdminUser; session?: AdminSession; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { success: false, error: 'Supabase configuration is missing' }
      }
      
      // Get user by username
      const { data: user, error: userError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single()

      if (userError || !user) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Create session
      const sessionToken = uuidv4()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + this.SESSION_DURATION_HOURS)

      // Get client information (can be null)
      const ipAddress = this.getClientIP()
      const userAgent = this.getUserAgent()

      // Prepare session data
      const sessionData: any = {
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      }

      // Only add IP and user agent if they exist
      if (ipAddress) sessionData.ip_address = ipAddress
      if (userAgent) sessionData.user_agent = userAgent

      console.log('Attempting to create session with data:', sessionData)

      const { data: session, error: sessionError } = await supabase
        .from('admin_sessions')
        .insert(sessionData)
        .select()
        .single()

      if (sessionError) {
        console.error('Session creation error details:', {
          message: sessionError.message,
          details: sessionError.details,
          hint: sessionError.hint,
          code: sessionError.code
        })
        return { success: false, error: `Failed to create session: ${sessionError.message}` }
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)

      return { success: true, user, session }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    }
  }

  // Verify session token
  static async verifySession(sessionToken: string): Promise<{ valid: boolean; user?: AdminUser; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { valid: false, error: 'Supabase configuration is missing' }
      }
      
      const { data: session, error: sessionError } = await supabase
        .from('admin_sessions')
        .select('*, admin_users(*)')
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (sessionError || !session) {
        return { valid: false, error: 'Invalid or expired session' }
      }

      return { valid: true, user: session.admin_users as AdminUser }
    } catch (error) {
      console.error('Session verification error:', error)
      return { valid: false, error: 'Session verification failed' }
    }
  }

  // Logout user
  static async logout(sessionToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { success: false, error: 'Supabase configuration is missing' }
      }
      
      const { error } = await supabase
        .from('admin_sessions')
        .delete()
        .eq('session_token', sessionToken)

      if (error) {
        return { success: false, error: 'Logout failed' }
      }

      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: 'Logout failed' }
    }
  }

  // Create new admin user (for super admin only)
  static async createAdminUser(userData: {
    username: string
    email: string
    password: string
    full_name: string
    role?: 'admin' | 'super_admin'
  }): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { success: false, error: 'Supabase configuration is missing' }
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12)

      const { data: user, error } = await supabase
        .from('admin_users')
        .insert({
          username: userData.username,
          email: userData.email,
          password_hash: passwordHash,
          full_name: userData.full_name,
          role: userData.role || 'admin'
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: 'Failed to create user' }
      }

      return { success: true, user }
    } catch (error) {
      console.error('Create user error:', error)
      return { success: false, error: 'Failed to create user' }
    }
  }

  // Change password
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { success: false, error: 'Supabase configuration is missing' }
      }
      
      // Get current user
      const { data: user, error: userError } = await supabase
        .from('admin_users')
        .select('password_hash')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        return { success: false, error: 'User not found' }
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash)
      if (!isValidPassword) {
        return { success: false, error: 'Current password is incorrect' }
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12)

      // Update password
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ password_hash: newPasswordHash })
        .eq('id', userId)

      if (updateError) {
        return { success: false, error: 'Failed to update password' }
      }

      return { success: true }
    } catch (error) {
      console.error('Change password error:', error)
      return { success: false, error: 'Failed to change password' }
    }
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return
      }
      
      await supabase
        .from('admin_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString())
    } catch (error) {
      console.error('Cleanup sessions error:', error)
    }
  }

  // Get active sessions for a user
  static async getActiveSessions(userId: string): Promise<{ sessions?: AdminSession[]; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { error: 'Supabase configuration is missing' }
      }
      
      const { data: sessions, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        return { error: 'Failed to fetch sessions' }
      }

      return { sessions: sessions as AdminSession[] }
    } catch (error) {
      console.error('Get sessions error:', error)
      return { error: 'Failed to fetch sessions' }
    }
  }
}

// Client-side session management
export class SessionManager {
  private static SESSION_KEY = 'ebbb_admin_session'

  // Store session token in localStorage
  static setSession(sessionToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, sessionToken)
    }
  }

  // Get session token from localStorage
  static getSession(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.SESSION_KEY)
    }
    return null
  }

  // Remove session token from localStorage
  static clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY)
    }
  }

  // Check if user is logged in
  static async isAuthenticated(): Promise<boolean> {
    const sessionToken = this.getSession()
    if (!sessionToken) return false

    const { valid } = await AdminAuth.verifySession(sessionToken)
    return valid
  }

  // Get current user
  static async getCurrentUser(): Promise<AdminUser | null> {
    const sessionToken = this.getSession()
    if (!sessionToken) return null

    const { user } = await AdminAuth.verifySession(sessionToken)
    return user || null
  }
} 