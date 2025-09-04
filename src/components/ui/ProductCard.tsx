'use client'

import { Star } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  image_path: string | null
  category: string
  is_signature?: boolean
  available: boolean
}

interface ProductCardProps {
  product: Product
  index?: number
  showRating?: boolean
  className?: string
  hideSignatureIcon?: boolean
}

export default function ProductCard({ 
  product, 
  index = 0, 
  showRating = false, 
  className = '',
  hideSignatureIcon = false
}: ProductCardProps) {
  return (
    <div 
      className={`group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${className}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Product Image */}
      {product.image_url ? (
        <div className="relative overflow-hidden">
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-40 md:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      ) : (
        <div className="w-full h-40 md:h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center group-hover:from-orange-200 group-hover:to-red-200 transition-all duration-300">
          <div className="text-center text-gray-500 group-hover:text-orange-600 transition-colors duration-300">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center group-hover:bg-orange-300 transition-colors duration-300">
              <span className="text-xl md:text-2xl">🍽️</span>
            </div>
            <p className="text-xs md:text-sm">No image</p>
          </div>
        </div>
      )}

      {/* Product Info */}
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-start mb-2 md:mb-3">
          <h4 className="text-lg md:text-xl font-semibold text-gray-900 group-hover:text-orange-500 transition-colors duration-300 flex items-center gap-2">
            <span>{product.name}</span>
            {product.is_signature && !hideSignatureIcon && (
              <span title="Signature Dish" className="text-yellow-500" aria-label="Signature Dish">⭐</span>
            )}
          </h4>
          <span className="text-base md:text-lg font-bold text-orange-500 bg-orange-100 px-2 md:px-3 py-1 rounded-full group-hover:bg-orange-200 transition-colors duration-300 text-sm md:text-base">
            ${product.price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-sm md:text-base text-gray-600 mb-2 md:mb-4 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full capitalize">
            {product.category}
          </span>
          
          {showRating && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
              <span className="text-sm text-gray-500 ml-1">(4.9)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
