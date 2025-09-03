'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChefHat, 
  Grid3X3, 
  Package, 
  Megaphone, 
  Calendar, 
  Menu, 
  X, 
  LogOut,
  Settings,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import AdminAuthGuard from '@/components/AdminAuthGuard'
import { SessionManager, AdminAuth } from '@/lib/auth'
import { AdminUser } from '@/lib/supabase'

const navigation = [
  {
    name: 'Dashboard',
    href: '/ebbb-admin',
    icon: Grid3X3,
    description: 'Overview & Analytics'
  },
  {
    name: 'Products',
    href: '/ebbb-admin/products',
    icon: Package,
    description: 'Manage Menu Items'
  },
  {
    name: 'Announcements',
    href: '/ebbb-admin/announcements',
    icon: Megaphone,
    description: 'News & Updates'
  },
  {
    name: 'Reservations',
    href: '/ebbb-admin/reservations',
    icon: Calendar,
    description: 'Booking Management'
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  // Check if we're on the login page
  const isLoginPage = pathname === '/ebbb-admin/login' || pathname === '/ebbb-admin/login/debug' || pathname === '/ebbb-admin/login/test'

  useEffect(() => {
    // Only run auth checks if not on login page
    if (!isLoginPage) {
      const getUser = async () => {
        const user = await SessionManager.getCurrentUser()
        setCurrentUser(user)
      }
      getUser()
    }
    setIsVisible(true)
  }, [isLoginPage])

  const handleLogout = async () => {
    const sessionToken = SessionManager.getSession()
    if (sessionToken) {
      await AdminAuth.logout(sessionToken)
    }
    SessionManager.clearSession()
    window.location.href = '/ebbb-admin/login'
  }

  // If we're on the login page, render children directly without layout
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AdminAuthGuard>
      <style jsx>{`
        @keyframes sidebarSlideIn {
          0% {
            transform: translateX(-100%) scale(0.95);
            opacity: 0;
          }
          50% {
            transform: translateX(-10px) scale(1.02);
            opacity: 0.7;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes sidebarSlideOut {
          0% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateX(-10px) scale(0.98);
            opacity: 0.7;
          }
          100% {
            transform: translateX(-100%) scale(0.95);
            opacity: 0;
          }
        }
        
        @keyframes navItemFadeIn {
          0% {
            opacity: 0;
            transform: translateX(-20px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        @keyframes collapseExpand {
          0% {
            width: 288px;
          }
          100% {
            width: 80px;
          }
        }
        
        @keyframes expandCollapse {
          0% {
            width: 80px;
          }
          100% {
            width: 288px;
          }
        }
        
        .sidebar-enter {
          animation: sidebarSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .sidebar-exit {
          animation: sidebarSlideOut 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        .nav-item-enter {
          animation: navItemFadeIn 0.5s ease-out forwards;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
        {/* Mobile sidebar overlay */}
        <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-500 ease-in-out ${sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div 
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setSidebarOpen(false)}
          />
          <div className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transform transition-all duration-500 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex h-full flex-col bg-white shadow-xl">
                {/* Mobile sidebar header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                                         <div className="flex flex-col items-center">
                       <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-sm px-2 py-1 rounded-lg shadow-md w-8 h-8 flex items-center justify-center">
                         8
                       </div>
                       <div className="text-[6px] font-bold text-orange-600 mt-1 text-center tracking-wider uppercase max-w-[55px] leading-none whitespace-nowrap">
                         BITES, BEATS & BURGERS
                       </div>
                     </div>
                    <div>
                      <h1 className="text-lg font-bold text-gray-900">EBBB</h1>
                      <p className="text-xs text-gray-500">Admin Panel</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                  {navigation.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 group hover:scale-105 hover:-translate-y-1 ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-orange-600'
                        }`}
                        style={{
                          animation: sidebarOpen ? `navItemFadeIn 0.6s ease-out ${index * 0.1}s both` : 'none'
                        }}
                      >
                        <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.name}</div>
                          <div className={`text-xs truncate transition-colors duration-300 ${isActive ? 'text-orange-100' : 'text-gray-500'}`}>
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </nav>

                {/* Mobile footer */}
                <div className="border-t border-gray-200 p-3">
                  <Link
                    href="/"
                    className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-orange-600 rounded-lg transition-all duration-300 group"
                  >
                    <LogOut className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                    <span className="font-medium">Back to Website</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

        {/* Desktop sidebar */}
        <div className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-500 ease-in-out ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white shadow-xl sidebar-enter">
            {/* Desktop sidebar header */}
            <div className={`flex items-center p-6 border-b border-gray-200 transition-all duration-500 ${sidebarCollapsed ? 'justify-center space-x-0' : 'space-x-3'}`}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-xl px-2 py-1 rounded-lg shadow-md w-10 h-10 flex items-center justify-center transition-all duration-300 hover:scale-110">
                  8
                </div>
                {!sidebarCollapsed && (
                  <div className="text-[6px] font-bold text-orange-600 mt-1 text-center tracking-wider uppercase max-w-[60px] leading-none whitespace-nowrap transition-opacity duration-300">
                    BITES, BEATS & BURGERS
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="transition-all duration-300 opacity-100">
                  <h1 className="text-2xl font-bold text-gray-900">EBBB</h1>
                  <p className="text-sm text-gray-500">Admin Panel</p>
                </div>
              )}
              
              {/* Collapse/Expand Button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`absolute top-6 right-4 p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all duration-300 hover:scale-110 group ${sidebarCollapsed ? 'right-2' : 'right-4'}`}
                title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <ChevronLeft className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                )}
              </button>
            </div>

            {/* Desktop navigation */}
            <nav className={`flex-1 py-6 space-y-2 transition-all duration-300 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
              {navigation.map((item, index) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center rounded-xl transition-all duration-300 group hover:scale-105 hover:-translate-y-1 ${
                      sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 space-x-3'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-orange-600'
                    }`}
                    title={sidebarCollapsed ? item.name : ''}
                    style={{
                      animation: isVisible ? `navItemFadeIn 0.6s ease-out ${index * 0.1}s both` : 'none'
                    }}
                  >
                    <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'} ${sidebarCollapsed ? '' : 'flex-shrink-0'}`} />
                    {!sidebarCollapsed && (
                      <div className="flex-1 transition-all duration-300">
                        <div className="font-medium">{item.name}</div>
                        <div className={`text-xs transition-colors duration-300 ${isActive ? 'text-orange-100' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Desktop footer */}
            <div className={`border-t border-gray-200 transition-all duration-300 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
              <Link
                href="/"
                className={`flex items-center text-gray-700 hover:bg-gray-50 hover:text-orange-600 rounded-xl transition-all duration-300 group hover:scale-105 ${
                  sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 space-x-3'
                }`}
                title={sidebarCollapsed ? 'Back to Website' : ''}
              >
                <LogOut className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
                {!sidebarCollapsed && (
                  <span className="font-medium transition-all duration-300">Back to Website</span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className={`transition-all duration-500 ease-in-out ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
          {/* Top bar */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm px-4 sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1 items-center justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">EBBB Admin</h1>
                  {currentUser && (
                    <span className="text-xs sm:text-sm text-gray-500 truncate">
                      Welcome, {currentUser.full_name}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="hidden sm:block text-sm text-gray-500">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <Link href="/ebbb-admin/settings">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-300">
                      <Settings className="w-5 h-5" />
                    </button>
                  </Link>
                  <Link href="/ebbb-admin/profile">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-300">
                      <User className="w-5 h-5" />
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  )
} 