'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, X, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  image_path: string | null
  category: string
  menu_type: string | null
  size_variants: Record<string, number> | null
  is_signature: boolean
  available: boolean
  created_at: string
  updated_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    image_path: '',
    category: '',
    menu_type: '',
    size_variants: {} as Record<string, number> | undefined,
    is_signature: false,
    available: true
  })
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [categoryInput, setCategoryInput] = useState('')

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showModal])

  // Theme-based categories for EBBB venue concept
  const categories = [
    // Morning Menu (Until 4 PM)
    'Panini',
    'Sandwiches', 
    'Breakfast',
    
    // Night Menu (From 4 PM)
    'Burgers',
    'Mains',
    'Entrees',
    
    // All Day Menu
    'Coffee',
    'Drinks',
    'Beverages',
    'Smoothies',
    
    // Additional Categories
    'Desserts',
    'Sides',
    'Appetizers'
  ]

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.')
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
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

    const { error: uploadError, data } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
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

      // Upload new image if selected
      if (selectedFile) {
        const { url, path } = await uploadImage(selectedFile)
        imageUrl = url
        imagePath = path
      }

      // Determine base price: if price field empty and All Day Coffee with variants, use the smallest variant price; else default to 0
      const parsedPrice = formData.price !== '' ? parseFloat(formData.price) : NaN
      const variantPrices = formData.size_variants 
        ? Object.values(formData.size_variants).filter((v): v is number => typeof v === 'number')
        : []
      const smallestVariant = variantPrices.length > 0 ? Math.min(...variantPrices) : 0
      const basePrice = !isNaN(parsedPrice)
        ? parsedPrice
        : (formData.menu_type === 'All Day Coffee' && variantPrices.length > 0 ? smallestVariant : 0)

      const productData = {
        ...formData,
        menu_type: formData.menu_type,
        price: basePrice,
        image_url: imageUrl,
        image_path: imagePath,
        // Persist size_variants as null if empty object
        size_variants: formData.size_variants && Object.keys(formData.size_variants).length > 0
          ? formData.size_variants
          : null
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData])

        if (error) throw error
      }

      await fetchProducts()
      setShowModal(false)
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        image_url: '',
        image_path: '',
        category: '',
        menu_type: '',
        size_variants: {},
        is_signature: false,
        available: true
      })
      setSelectedFile(null)
      setImagePreview(null)
      setShowCategoryDropdown(false)
      setCategoryInput('')
    } catch (error: unknown) {
      console.error('Error saving product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert('Error saving product: ' + errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image_url: product.image_url || '',
      image_path: product.image_path || '',
      category: product.category,
      menu_type: product.menu_type || '',
      size_variants: product.size_variants || {},
      is_signature: product.is_signature,
      available: product.available
    })
    setCategoryInput(product.category) // Sync category input
    setImagePreview(product.image_url)
    setSelectedFile(null)
    setShowCategoryDropdown(false) // Reset dropdown state
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.')
      }
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchProducts()
    } catch (error: unknown) {
      console.error('Error deleting product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert('Error deleting product: ' + errorMessage)
    }
  }

  const toggleAvailability = async (product: Product) => {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.')
      }
      
      const { error } = await supabase
        .from('products')
        .update({ available: !product.available })
        .eq('id', product.id)

      if (error) throw error
      await fetchProducts()
    } catch (error: unknown) {
      console.error('Error updating product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert('Error updating product: ' + errorMessage)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  // Get unique categories from existing products
  const getExistingCategories = () => {
    const existingCategories = [...new Set(products.map(product => product.category))]
    return existingCategories.sort()
  }

  // Handle category input with dropdown functionality
  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCategoryInput(value)
    setFormData(prev => ({ ...prev, category: value }))
    // Show dropdown when there's input and there are matching categories
    const existingCategories = getExistingCategories()
    const hasMatches = existingCategories.some(cat => 
      cat.toLowerCase().includes(value.toLowerCase())
    )
    setShowCategoryDropdown(value.length > 0 && hasMatches)
  }

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({ ...prev, category }))
    setCategoryInput(category)
    setShowCategoryDropdown(false)
  }

  const handleCategoryFocus = () => {
    const existingCategories = getExistingCategories()
    if (existingCategories.length > 0) {
      setShowCategoryDropdown(true)
    }
  }

  const handleCategoryBlur = () => {
    // Longer delay for mobile touch interactions
    setTimeout(() => setShowCategoryDropdown(false), 300)
  }

  // Handle touch events for mobile
  const handleCategoryTouchStart = (category: string) => {
    // Immediately select on touch start for mobile
    setFormData(prev => ({ ...prev, category }))
    setCategoryInput(category)
    setShowCategoryDropdown(false)
  }

  const filteredCategories = getExistingCategories().filter(category =>
    category.toLowerCase().includes(formData.category.toLowerCase())
  )

  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your menu items</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Products List (admin-friendly) */}
      {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
        <div key={category} className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">{category}</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
              <div className="col-span-5">Product</div>
              <div className="col-span-2">Menu</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <ul className="divide-y divide-gray-200">
              {categoryProducts.map((product) => (
                <li key={product.id} className="px-3 sm:px-4 py-3 md:grid md:grid-cols-12 md:items-center gap-3">
                  {/* Product cell */}
                  <div className="flex items-center gap-3 col-span-5">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">🍽️</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 line-clamp-1 flex items-center gap-1">
                        <span>{product.name}</span>
                        {product.is_signature && (
                          <span title="Signature Dish" className="text-yellow-500" aria-label="Signature">★</span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className="inline-block bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{product.category}</span>
                        <span className="inline-block bg-orange-50 text-orange-700 text-[10px] px-2 py-0.5 rounded-full">{product.menu_type === 'Evening Menu' ? 'Night Menu' : product.menu_type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Menu (for small screens, merged above) */}
                  <div className="hidden md:block col-span-2 text-sm text-gray-700">{product.menu_type === 'Evening Menu' ? 'Night Menu' : product.menu_type}</div>

                  {/* Price */}
                  <div className="col-span-2 mt-2 md:mt-0">
                    {(() => {
                      const variants = (product as any).size_variants as Record<string, number> | undefined
                      if (product.menu_type === 'All Day Coffee' && variants && Object.keys(variants).length > 0) {
                        const entries = Object.entries(variants).filter(([, v]) => typeof v === 'number') as [string, number][]
                        if (entries.length > 0) {
                          return (
                            <div className="flex flex-wrap gap-2">
                              {entries.map(([label, value]) => (
                                <span key={label} className="inline-flex items-center text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-1 rounded-full">
                                  {label} ${value.toFixed(2)}
                                </span>
                              ))}
                            </div>
                          )
                        }
                      }
                      return (
                        <span className="text-sm font-bold text-orange-600">${product.price.toFixed(2)}</span>
                      )
                    })()}
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex md:justify-center mt-2 md:mt-0">
                    <span className={`inline-flex px-2 py-1 text-[10px] font-semibold rounded-full ${
                      product.available ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {product.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex justify-end gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => toggleAvailability(product)}
                      className={`p-2 rounded-lg transition-colors duration-300 ${
                        product.available ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={product.available ? 'Make unavailable' : 'Make available'}
                    >
                      {product.available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                      title="Edit product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {Object.keys(groupedProducts).length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Package className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-600 text-sm sm:text-base mb-6">Get started by adding your first menu item</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 flex items-center mx-auto transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Product
          </button>
        </div>
      )}

      {/* Enhanced Modal Portal - Improved UI/UX */}
      {showModal && typeof window !== 'undefined' && createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: 0,
            left: 0, 
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-out'
          }}
          // Removed onClick to prevent closing on background click
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '1.5rem',
              width: '100%',
              maxWidth: '32rem',
              maxHeight: '95vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              transform: 'scale(1)',
              animation: 'modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enhanced Header */}
            <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {editingProduct ? '✏️ Edit Product' : '✨ Add New Product'}
                  </h2>
                  <p className="text-orange-100 text-sm">
                    {editingProduct ? 'Update your menu item details' : 'Create a delicious new menu item for EBBB'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingProduct(null)
                    setFormData({
                      name: '',
                      description: '',
                      price: '',
                      image_url: '',
                      image_path: '',
                      category: '',
                      menu_type: '',
                      size_variants: {},
                      is_signature: false,
                      available: true
                    })
                    setSelectedFile(null)
                    setImagePreview(null)
                    setShowCategoryDropdown(false)
                    setCategoryInput('')
                  }}
                  className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110"
                  title="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Progress indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-full">
                <div className="h-full bg-white/40 rounded-full w-0 transition-all duration-300" id="progress-bar"></div>
              </div>
            </div>

            {/* Enhanced Form Content */}
            <div className="p-8">
              <style jsx>{`
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                
                @keyframes modalSlideIn {
                  from { 
                    opacity: 0;
                    transform: scale(0.9) translateY(-20px);
                  }
                  to { 
                    opacity: 1;
                    transform: scale(1) translateY(0);
                  }
                }
                
                .form-field {
                  animation: slideInUp 0.5s ease-out forwards;
                  opacity: 0;
                }
                
                .form-field:nth-child(1) { animation-delay: 0.1s; }
                .form-field:nth-child(2) { animation-delay: 0.2s; }
                .form-field:nth-child(3) { animation-delay: 0.3s; }
                .form-field:nth-child(4) { animation-delay: 0.4s; }
                .form-field:nth-child(5) { animation-delay: 0.5s; }
                .form-field:nth-child(6) { animation-delay: 0.6s; }
                
                @keyframes slideInUp {
                  from {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name Field */}
                <div className="form-field">
                  <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                    <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                    Product Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-3 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:border-gray-300"
                      placeholder="e.g., Classic Beef Burger, Cappuccino, Caesar Salad"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-gray-400">🍽️</span>
                    </div>
                  </div>
                </div>

                {/* Description Field */}
                <div className="form-field">
                  <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                    <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-3 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 resize-none text-gray-800 placeholder-gray-400 hover:border-gray-300"
                    placeholder="Describe what makes this dish special. Include ingredients, cooking style, or unique features..."
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <span className="mr-1">💡</span>
                    Tip: Mention key ingredients and what makes it delicious!
                  </p>
                </div>

                {/* Menu Type Selector */}
                <div className="form-field">
                  <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                    <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                    Menu Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className={`relative flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                      formData.menu_type === 'Morning Menu' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="menu_type"
                        value="Morning Menu"
                        checked={formData.menu_type === 'Morning Menu'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center text-center w-full">
                        <span className="text-2xl mb-2">🥪</span>
                        <span className="font-semibold text-gray-800">Morning Menu</span>
                        <span className="text-xs text-gray-500 mt-1">6:00 AM - 2:00 PM</span>
                      </div>
                      {formData.menu_type === 'Morning Menu' && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </label>

                    <label className={`relative flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                      formData.menu_type === 'Night Menu' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="menu_type"
                        value="Night Menu"
                        checked={formData.menu_type === 'Night Menu'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center text-center w-full">
                        <span className="text-2xl mb-2">🍔</span>
                        <span className="font-semibold text-gray-800">Night Menu</span>
                        <span className="text-xs text-gray-500 mt-1">4:00 PM - 9:00 PM</span>
                      </div>
                      {formData.menu_type === 'Night Menu' && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </label>

                    <label className={`relative flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                      formData.menu_type === 'All Day Coffee' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="menu_type"
                        value="All Day Coffee"
                        checked={formData.menu_type === 'All Day Coffee'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center text-center w-full">
                        <span className="text-2xl mb-2">☕</span>
                        <span className="font-semibold text-gray-800">All Day Coffee</span>
                        <span className="text-xs text-gray-500 mt-1">Available Anytime</span>
                      </div>
                      {formData.menu_type === 'All Day Coffee' && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Choose which menu this item belongs to
                  </p>
                </div>

                {/* Price and Category Grid */}
                <div className="form-field grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                      <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">4</span>
                      Price ($)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required={!(formData.menu_type === 'All Day Coffee' && formData.size_variants && Object.keys(formData.size_variants).length > 0)}
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-4 pl-8 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-3 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:border-gray-300"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                        <span className="text-gray-500 font-semibold">$</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                      <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">5</span>
                      Category
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleCategoryInputChange}
                        onFocus={handleCategoryFocus}
                        onBlur={handleCategoryBlur}
                        required
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-3 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:border-gray-300"
                        placeholder="Type or select category (e.g., Burgers, Coffee, Desserts)"
                      />
                      
                      {/* Smart Dropup */}
                      {showCategoryDropdown && filteredCategories.length > 0 && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-[999999] max-h-48 overflow-y-auto" style={{ zIndex: 999999 }}>
                          <div className="p-2">
                            <div className="text-xs text-gray-500 px-3 py-2 font-semibold">Existing Categories:</div>
                            {filteredCategories.map((category, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleCategorySelect(category)}
                                onMouseDown={(e) => e.preventDefault()} // Prevent blur on mobile
                                onTouchStart={() => handleCategoryTouchStart(category)} // Handle mobile touch
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 active:bg-orange-100 rounded-xl transition-colors duration-200 flex items-center justify-between touch-manipulation min-h-[44px]"
                              >
                                <span className="truncate">{category}</span>
                                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                  {products.filter(p => p.category === category).length} items
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                      <span className="mr-1">💡</span>
                      Select from existing categories or type a new one
                    </p>
                  </div>
                </div>

                {/* Size Variants (Only for All Day Coffee) */}
                {formData.menu_type === 'All Day Coffee' && (
                  <div className="form-field">
                    <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                      <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">6</span>
                      Size Variants (optional)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">Small</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          inputMode="decimal"
                          value={
                            formData.size_variants && formData.size_variants['Small'] !== undefined
                              ? String(formData.size_variants['Small'])
                              : ''
                          }
                          onChange={(e) => {
                            const value = e.target.value
                            setFormData(prev => ({
                              ...prev,
                              size_variants: {
                                ...(prev.size_variants || {}),
                                Small: value === '' ? undefined as unknown as number : parseFloat(value)
                              }
                            }))
                          }}
                          className="w-full pl-14 pr-3 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-3 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:border-gray-300"
                          placeholder="e.g., 2.50"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">$</div>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">Large</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          inputMode="decimal"
                          value={
                            formData.size_variants && formData.size_variants['Large'] !== undefined
                              ? String(formData.size_variants['Large'])
                              : ''
                          }
                          onChange={(e) => {
                            const value = e.target.value
                            setFormData(prev => ({
                              ...prev,
                              size_variants: {
                                ...(prev.size_variants || {}),
                                Large: value === '' ? undefined as unknown as number : parseFloat(value)
                              }
                            }))
                          }}
                          className="w-full pl-14 pr-3 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-3 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:border-gray-300"
                          placeholder="e.g., 3.00"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">$</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Leave blank to use the base price only.</p>
                  </div>
                )}

                {/* Image Upload Field */}
                <div className="form-field">
                  <label className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                    <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">6</span>
                    Product Image
                  </label>
                  
                  {/* Image Preview */}
                  {(imagePreview || formData.image_url) && (
                    <div className="mb-4">
                      <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden border-2 border-gray-200">
                        <img
                          src={imagePreview || formData.image_url || ''}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20"></div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 hover:scale-110 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                          ✨ Looking great!
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced File Upload */}
                  <label className="group relative block w-full bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:from-orange-50 hover:to-red-50 hover:border-orange-300 transition-all duration-300">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                          {selectedFile ? selectedFile.name : 'Upload Product Image'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedFile ? 'Click to change image' : 'PNG, JPG up to 10MB'}
                        </p>
                      </div>
                      {!selectedFile && (
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span>📸</span>
                          <span>Make it look delicious!</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Availability Toggle */}
                <div className="form-field">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-gray-200">
                    <div className="flex items-center space-x-3">
                      <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">7</span>
                      <div>
                        <label className="text-sm font-semibold text-gray-800">Product Availability</label>
                        <p className="text-xs text-gray-500">Customers can order this item</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="available"
                        checked={formData.available}
                        onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                </div>

                {/* Signature Dish Toggle */}
                <div className="form-field">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <span className="bg-yellow-100 text-yellow-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">★</span>
                      <div>
                        <label className="text-sm font-semibold text-gray-800">Signature Dish</label>
                        <p className="text-xs text-gray-500">Feature this item on Signature Dishes</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_signature"
                        checked={!!formData.is_signature}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_signature: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transform"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        <span>Saving Magic...</span>
                      </>
                    ) : (
                      <>
                        <span className="mr-2">
                          {editingProduct ? '✏️' : '✨'}
                        </span>
                        {editingProduct ? 'Update Product' : 'Create Product'}
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingProduct(null)
                      setFormData({
                        name: '',
                        description: '',
                        price: '',
                        image_url: '',
                        image_path: '',
                        category: '',
                        menu_type: '',
                        size_variants: {},
                        is_signature: false,
                        available: true
                      })
                      setSelectedFile(null)
                      setImagePreview(null)
                    }}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center"
                  >
                    <span className="mr-2">❌</span>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}