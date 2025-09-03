import { supabase, isSupabaseConfigured } from './supabase'

export interface AppSetting {
  id: string
  setting_key: string
  setting_value: any
  setting_type: string
  description: string
  category: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface UserPreference {
  id: string
  user_id: string
  preference_key: string
  preference_value: any
  created_at: string
  updated_at: string
}

export class SettingsService {
  // Get all settings by category
  static async getSettingsByCategory(category: string): Promise<{ settings?: AppSetting[]; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { error: 'Supabase configuration is missing' }
      }

      const { data: settings, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('category', category)
        .order('setting_key')

      if (error) {
        return { error: `Failed to fetch settings: ${error.message}` }
      }

      return { settings: settings as AppSetting[] }
    } catch (error) {
      console.error('Get settings error:', error)
      return { error: 'Failed to fetch settings' }
    }
  }

  // Get a single setting by key
  static async getSetting(key: string): Promise<{ setting?: AppSetting; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { error: 'Supabase configuration is missing' }
      }

      const { data: setting, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_key', key)
        .single()

      if (error) {
        return { error: `Failed to fetch setting: ${error.message}` }
      }

      return { setting: setting as AppSetting }
    } catch (error) {
      console.error('Get setting error:', error)
      return { error: 'Failed to fetch setting' }
    }
  }

  // Update a setting
  static async updateSetting(key: string, value: any): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { success: false, error: 'Supabase configuration is missing' }
      }

      const { error } = await supabase
        .from('app_settings')
        .update({ setting_value: value })
        .eq('setting_key', key)

      if (error) {
        return { success: false, error: `Failed to update setting: ${error.message}` }
      }

      return { success: true }
    } catch (error) {
      console.error('Update setting error:', error)
      return { success: false, error: 'Failed to update setting' }
    }
  }

  // Update multiple settings
  static async updateSettings(settings: { key: string; value: any }[]): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { success: false, error: 'Supabase configuration is missing' }
      }

      console.log('Attempting to update settings:', settings)

      // Update settings one by one
      for (const setting of settings) {
        console.log(`Updating setting: ${setting.key} = ${JSON.stringify(setting.value)}`)
        
        const { data, error } = await supabase
          .from('app_settings')
          .update({ setting_value: setting.value })
          .eq('setting_key', setting.key)
          .select()

        if (error) {
          console.error(`Failed to update setting ${setting.key}:`, error)
          return { success: false, error: `Failed to update setting ${setting.key}: ${error.message}` }
        }

        console.log(`Successfully updated setting ${setting.key}:`, data)
      }

      console.log('All settings updated successfully')
      return { success: true }
    } catch (error) {
      console.error('Update settings error:', error)
      return { success: false, error: 'Failed to update settings' }
    }
  }

  // Get user preferences
  static async getUserPreferences(userId: string): Promise<{ preferences?: UserPreference[]; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { error: 'Supabase configuration is missing' }
      }

      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .order('preference_key')

      if (error) {
        return { error: `Failed to fetch preferences: ${error.message}` }
      }

      return { preferences: preferences as UserPreference[] }
    } catch (error) {
      console.error('Get preferences error:', error)
      return { error: 'Failed to fetch preferences' }
    }
  }

  // Update user preference
  static async updateUserPreference(userId: string, key: string, value: any): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { success: false, error: 'Supabase configuration is missing' }
      }

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preference_key: key,
          preference_value: value
        })

      if (error) {
        return { success: false, error: `Failed to update preference: ${error.message}` }
      }

      return { success: true }
    } catch (error) {
      console.error('Update preference error:', error)
      return { success: false, error: 'Failed to update preference' }
    }
  }

  // Get all settings for the settings page
  static async getAllSettings(): Promise<{ settings?: { [category: string]: AppSetting[] }; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { error: 'Supabase configuration is missing' }
      }

      console.log('Fetching all settings from database...')

      const { data: settings, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('category, setting_key')

      if (error) {
        console.error('Failed to fetch settings:', error)
        return { error: `Failed to fetch settings: ${error.message}` }
      }

      console.log('Raw settings from database:', settings)

      // Group settings by category
      const groupedSettings: { [category: string]: AppSetting[] } = {}
      settings.forEach((setting: AppSetting) => {
        if (!groupedSettings[setting.category]) {
          groupedSettings[setting.category] = []
        }
        groupedSettings[setting.category].push(setting)
      })

      console.log('Grouped settings:', groupedSettings)
      return { settings: groupedSettings }
    } catch (error) {
      console.error('Get all settings error:', error)
      return { error: 'Failed to fetch settings' }
    }
  }
} 