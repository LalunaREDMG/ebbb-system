'use client'

import { useState, useEffect } from 'react'
import { ChefHat, ArrowLeft, Star, Filter } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  image_path: string | null
  category: string
  available: boolean
}

interface MenuPageClientProps {
  products: Product[]
  groupedProducts: Record<string, Product[]>
  error: string | null
}

export default function MenuPageClient({ products, groupedProducts, error }: MenuPageClientProps) {
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedMenuPart, setSelectedMenuPart] = useState<'morning' | 'evening' | 'all'>('all')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setLoading(false)
      // Trigger entrance animation
      setTimeout(() => setIsVisible(true), 100)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Determine current service window and set default menu part
  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    const isMorningService = hour < 16 // Morning until 4pm
    
    // Set default menu part based on time
    setSelectedMenuPart(isMorningService ? 'morning' : 'evening')
  }, [])

  // Categorize products into menu parts
  const morningCategories = Object.keys(groupedProducts).filter(category => 
    ['panini', 'sandwich', 'sandwiches', 'breakfast'].includes(category.toLowerCase())
  )
  
  const eveningCategories = Object.keys(groupedProducts).filter(category => 
    ['burgers', 'burger', 'mains', 'main', 'dinner', 'entrees'].includes(category.toLowerCase())
  )

  const coffeeCategories = Object.keys(groupedProducts).filter(category => 
    ['coffee', 'drinks', 'beverages', 'smoothies', 'juices'].includes(category.toLowerCase())
  )

  // Get categories based on selected menu part
  const getFilteredCategories = () => {
    switch (selectedMenuPart) {
      case 'morning':
        return morningCategories
      case 'evening':
        return eveningCategories
      case 'all':
        return coffeeCategories // Only show coffee/drinks categories
      default:
        return Object.keys(groupedProducts)
    }
  }

  const availableCategories = getFilteredCategories()
  const categories = ['all', ...availableCategories]
  
  const filteredProducts = selectedCategory === 'all' 
    ? products.filter(product => availableCategories.includes(product.category))
    : groupedProducts[selectedCategory] || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 md:h-32 md:w-32 border-b-4 border-orange-500 border-t-transparent mx-auto mb-6 md:mb-8"></div>
          <div className="animate-pulse">
            <ChefHat className="h-12 w-12 md:h-16 md:w-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Loading Menu...</h2>
            <p className="text-gray-600 mt-2 text-sm md:text-base">Preparing our delicious menu for you</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded-md animate-fade-in">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <Link 
              href="/" 
              className="flex items-center text-gray-700 hover:text-orange-500 transition-colors duration-300 group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            
                                                   <div className="flex flex-col items-center group">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-lg px-2 py-1 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 w-6 h-6 flex items-center justify-center">
                  8
                </div>
                <div className="text-[6px] font-bold text-orange-600 mt-1 text-center tracking-wider uppercase max-w-[55px] leading-none whitespace-nowrap">
                  BITES, BEATS & BURGERS
                </div>
              </div>

            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <ChefHat className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Full Menu
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Explore our complete selection of delicious dishes
            </p>
                        
            {/* Stats */}
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                <span>Fresh Ingredients</span>
              </div>
              <div className="flex items-center">
                <ChefHat className="h-4 w-4 text-orange-500 mr-1" />
                <span>{products.length} Menu Items</span>
              </div>
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-orange-500 mr-1" />
                <span>{Object.keys(groupedProducts).length} Categories</span>
              </div>
            </div>
          </div>

          {/* Menu Part Selector */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🍽️</span>
              Choose Your Menu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => {
                  setSelectedMenuPart('morning')
                  setSelectedCategory('all')
                }}
                className={`p-4 rounded-xl text-left transition-all duration-300 hover:scale-105 ${
                  selectedMenuPart === 'morning'
                    ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-orange-300 shadow-lg'
                    : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                }`}
              >
              <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">🥪</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Morning Menu</h3>
                    <p className="text-sm text-gray-600">Until 4:00 PM</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">Fresh paninis & sandwiches</p>
                <div className="mt-2 text-xs text-orange-600 font-medium">
                  {morningCategories.length} categories available
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedMenuPart('evening')
                  setSelectedCategory('all')
                }}
                className={`p-4 rounded-xl text-left transition-all duration-300 hover:scale-105 ${
                  selectedMenuPart === 'evening'
                    ? 'bg-gradient-to-br from-red-100 to-orange-100 border-2 border-red-300 shadow-lg'
                    : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                }`}
              >
              <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">🍔</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Evening Menu</h3>
                    <p className="text-sm text-gray-600">From 4:00 PM</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">Gourmet burgers & hearty mains</p>
                <div className="mt-2 text-xs text-red-600 font-medium">
                  {eveningCategories.length} categories available
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedMenuPart('all')
                  setSelectedCategory('all')
                }}
                className={`p-4 rounded-xl text-left transition-all duration-300 hover:scale-105 ${
                  selectedMenuPart === 'all'
                    ? 'bg-gradient-to-br from-green-100 to-blue-100 border-2 border-green-300 shadow-lg'
                    : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">☕</span>
                  <div>
                    <h3 className="font-bold text-gray-900">All Day Coffee</h3>
                    <p className="text-sm text-gray-600">Available Anytime</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">Coffee, drinks & beverages only</p>
                <div className="mt-2 text-xs text-green-600 font-medium">
                  {coffeeCategories.length} categories available
                </div>
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <Filter className="h-4 w-4 mr-2 text-orange-500" />
              Filter by Category
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({selectedMenuPart === 'morning' ? 'Morning' : selectedMenuPart === 'evening' ? 'Evening' : 'All Day'} Menu)
              </span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Items' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          {Object.keys(groupedProducts).length > 0 ? (
            <div className="space-y-12">
              {Object.entries(groupedProducts).map(([category, categoryProducts]) => {
                const categoryFilteredProducts = selectedCategory === 'all' || selectedCategory === category 
                  ? categoryProducts 
                  : []
                
                if (categoryFilteredProducts.length === 0) return null

                return (
                  <div key={category} className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center capitalize">
                      {category}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {categoryFilteredProducts.map((product, index) => (
                        <div 
                          key={product.id} 
                          className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden"
                          style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                        >
                          {product.image_url ? (
                            <div className="relative h-48 overflow-hidden">
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center group-hover:from-orange-200 group-hover:to-red-200 transition-all duration-300">
                              <div className="text-center text-gray-500 group-hover:text-orange-600 transition-colors duration-300">
                                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center group-hover:bg-orange-300 transition-colors duration-300">
                                  <span className="text-xl md:text-2xl">🍽️</span>
                                </div>
                                <p className="text-xs md:text-sm">No image</p>
                              </div>
                            </div>
                          )}
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors duration-300">
                                {product.name}
                              </h3>
                              <span className="text-xl font-bold text-orange-500 bg-orange-100 px-3 py-1 rounded-full group-hover:bg-orange-200 transition-colors duration-300">
                                ${product.price.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full capitalize">
                                {product.category}
                              </span>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-500 ml-1">(4.9)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in-up">
              <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No menu items available at the moment.</p>
              <p className="text-gray-400 text-sm mt-2">Please check back later or contact us for more information.</p>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center mt-16 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <Link 
              href="/reservations" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <ChefHat className="h-5 w-5" />
              Book a Table to Try Our Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}