'use client'

import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, X, Megaphone } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  image_url: string | null
  image_path: string | null
  published: boolean
  created_at: string
  updated_at: string
  announcement_type: 'general' | 'dj_event'
  dj_name?: string | null
  event_date?: string | null
  event_start_time?: string | null
  event_end_time?: string | null
  venue_details?: string | null
  ticket_price?: number | null
  is_featured: boolean
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    image_path: '',
    published: false,
    hero: false,
    announcement_type: 'general' as 'general' | 'dj_event',
    dj_name: '',
    event_date: '',
    event_start_time: '',
    event_end_time: '',
    venue_details: '',
    ticket_price: '',
    is_featured: false
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.')
      }
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadImage = async (file: File): Promise<{ url: string; path: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase configuration is missing. Please check your environment variables.')
    }
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('announcement-images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('announcement-images')
      .getPublicUrl(filePath)

    return { url: publicUrl, path: filePath }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedFile(null)
    setImagePreview(null)
    setFormData(prev => ({ ...prev, image_url: '', image_path: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.')
      }
      
      setUploading(true)
      
      let imageUrl = formData.image_url
      let imagePath = formData.image_path

      if (selectedFile) {
        const { url, path } = await uploadImage(selectedFile)
        imageUrl = url
        imagePath = path
      }

      // Handle title based on hero checkbox
      let finalTitle = formData.title
      if (formData.hero && !formData.title.toLowerCase().includes("what's new")) {
        // Add "What's New - " prefix when hero is checked
        finalTitle = `What's New - ${formData.title}`
      } else if (!formData.hero && formData.title.toLowerCase().includes("what's new")) {
        // Remove "What's New - " prefix when hero is unchecked
        finalTitle = formData.title.replace(/^what's new - /i, '')
      }

      const announcementData = {
        title: finalTitle,
        content: formData.content,
        image_url: imageUrl,
        image_path: imagePath,
        published: formData.published,
        announcement_type: formData.announcement_type,
        is_featured: formData.is_featured,
        ...(formData.announcement_type === 'dj_event' && {
          dj_name: formData.dj_name,
          event_date: formData.event_date,
          event_start_time: formData.event_start_time,
          event_end_time: formData.event_end_time,
          venue_details: formData.venue_details || null,
          ticket_price: formData.ticket_price ? parseFloat(formData.ticket_price) : null
        })
      }

      if (editingAnnouncement) {
        const { error } = await supabase
          .from('announcements')
          .update({
            ...announcementData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAnnouncement.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert([announcementData])

        if (error) throw error
      }

      setShowModal(false)
      setEditingAnnouncement(null)
      setFormData({
        title: '',
        content: '',
        image_url: '',
        image_path: '',
        published: false,
        hero: false,
        announcement_type: 'general',
        dj_name: '',
        event_date: '',
        event_start_time: '',
        event_end_time: '',
        venue_details: '',
        ticket_price: '',
        is_featured: false
      })
      setSelectedFile(null)
      setImagePreview(null)
      fetchAnnouncements()
    } catch (error) {
      console.error('Error saving announcement:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      image_url: announcement.image_url || '',
      image_path: announcement.image_path || '',
      published: announcement.published,
      hero: (announcement.title || '').toLowerCase().includes("what's new"),
      announcement_type: announcement.announcement_type || 'general',
      dj_name: announcement.dj_name || '',
      event_date: announcement.event_date || '',
      event_start_time: announcement.event_start_time || '',
      event_end_time: announcement.event_end_time || '',
      venue_details: announcement.venue_details || '',
      ticket_price: announcement.ticket_price ? announcement.ticket_price.toString() : '',
      is_featured: announcement.is_featured || false
    })
    setImagePreview(announcement.image_url)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        if (!isSupabaseConfigured() || !supabase) {
          throw new Error('Supabase configuration is missing. Please check your environment variables.')
        }
        
        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', id)

        if (error) throw error
        fetchAnnouncements()
      } catch (error) {
        console.error('Error deleting announcement:', error)
      }
    }
  }

  const togglePublished = async (announcement: Announcement) => {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.')
      }
      
      const { error } = await supabase
        .from('announcements')
        .update({ published: !announcement.published })
        .eq('id', announcement.id)

      if (error) throw error
      fetchAnnouncements()
    } catch (error) {
      console.error('Error toggling published status:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your news and announcements</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Add Announcement
        </button>
      </div>

      {/* Announcements Grid */}
      {announcements.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Megaphone className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No announcements yet</h3>
          <p className="text-gray-600 text-sm sm:text-base mb-6">Share news and updates with your customers</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 flex items-center mx-auto transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Announcement
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white shadow-sm hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 group">
              {/* Announcement Image */}
              <div className="relative h-40 sm:h-48 bg-gray-100">
                {announcement.image_url ? (
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    src={announcement.image_url}
                    alt={announcement.title}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📰</span>
                      </div>
                      <p className="text-xs text-gray-500">No image</p>
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    announcement.published
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {announcement.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              {/* Announcement Info */}
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-1">{announcement.title}</h3>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{announcement.content}</p>
                
                <div className="text-xs text-gray-500 mb-4">
                  <p>Created: {new Date(announcement.created_at).toLocaleDateString()}</p>
                  {announcement.updated_at !== announcement.created_at && (
                    <p>Updated: {new Date(announcement.updated_at).toLocaleDateString()}</p>
                  )}
                </div>
                {(announcement.title || '').toLowerCase().includes("what's new") && (
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200 mb-3">
                    Featured in Hero
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => togglePublished(announcement)}
                      className={`p-2 rounded-lg transition-colors duration-300 ${
                        announcement.published
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={announcement.published ? 'Unpublish' : 'Publish'}
                    >
                      {announcement.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                      title="Edit announcement"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingAnnouncement(null)
                    setFormData({
                      title: '',
                      content: '',
                      image_url: '',
                      image_path: '',
                      published: false,
                      hero: false,
                      announcement_type: 'general',
                      dj_name: '',
                      event_date: '',
                      event_start_time: '',
                      event_end_time: '',
                      venue_details: '',
                      ticket_price: '',
                      is_featured: false
                    })
                    setSelectedFile(null)
                    setImagePreview(null)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Announcement Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Announcement Type
                  </label>
                  <select
                    name="announcement_type"
                    value={formData.announcement_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, announcement_type: e.target.value as 'general' | 'dj_event' }))}
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                  >
                    <option value="general">General Announcement</option>
                    <option value="dj_event">DJ Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.announcement_type === 'dj_event' ? 'Event Title' : 'Announcement Title'}
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                    placeholder={formData.announcement_type === 'dj_event' ? 'Enter event title' : 'Enter announcement title'}
                  />
                </div>

                {/* DJ Event Fields */}
                {formData.announcement_type === 'dj_event' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        DJ Name
                      </label>
                      <input
                        type="text"
                        name="dj_name"
                        value={formData.dj_name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                        placeholder="Enter DJ name"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Date
                        </label>
                        <input
                          type="date"
                          name="event_date"
                          value={formData.event_date}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time
                        </label>
                        <input
                          type="time"
                          name="event_start_time"
                          value={formData.event_start_time}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Time
                        </label>
                        <input
                          type="time"
                          name="event_end_time"
                          value={formData.event_end_time}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ticket Price (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="ticket_price"
                        value={formData.ticket_price}
                        onChange={handleChange}
                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                        placeholder="Enter ticket price (leave empty for free)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Venue Details (Optional)
                      </label>
                      <textarea
                        name="venue_details"
                        value={formData.venue_details}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 resize-none"
                        placeholder="Enter venue details, special instructions, etc."
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.announcement_type === 'dj_event' ? 'Event Description' : 'Content'}
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 resize-none"
                    placeholder={formData.announcement_type === 'dj_event' ? 'Describe the event, music style, special features...' : 'Enter announcement content'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image (Optional)
                  </label>
                  
                  {/* Image Preview */}
                  {(imagePreview || formData.image_url) && (
                    <div className="mb-4">
                      <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                        <img
                          src={imagePreview || formData.image_url || ''}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="flex items-center space-x-3">
                    <label className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors duration-300">
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {selectedFile ? selectedFile.name : 'Click to upload image'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label className="text-sm text-gray-700">
                    Publish immediately
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="hero"
                    checked={formData.hero}
                    onChange={(e) => setFormData(prev => ({ ...prev, hero: e.target.checked }))}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label className="text-sm text-gray-700">
                    Feature in Home Hero (What's New slideshow)
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        {editingAnnouncement ? 'Update Announcement' : 'Add Announcement'}
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingAnnouncement(null)
                      setFormData({
                        title: '',
                        content: '',
                        image_url: '',
                        image_path: '',
                        published: false,
                        hero: false,
                        announcement_type: 'general',
                        dj_name: '',
                        event_date: '',
                        event_start_time: '',
                        event_end_time: '',
                        venue_details: '',
                        ticket_price: '',
                        is_featured: false
                      })
                      setSelectedFile(null)
                      setImagePreview(null)
                    }}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}