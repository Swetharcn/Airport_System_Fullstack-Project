import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Plane, Menu, X, LayoutDashboard, Settings, LogOut, LogIn, UserPlus, Briefcase, Navigation, Users, Search, Luggage, Brain, Ticket } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { isAuth, isAdmin, user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Add background when scrolled past hero
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  // Navigation links based on auth state
  const navLinks = [
    { to: '/',           label: 'Home',       icon: null,          always: true },
    { to: '/dashboard',  label: 'Flights',    icon: Plane,         auth: true  },
    { to: '/navigation', label: 'Map',        icon: Navigation,    auth: true  },
    { to: '/crowd',      label: 'Crowd',      icon: Users,         auth: true  },
    { to: '/baggage',      label: 'Baggage',    icon: Luggage,       auth: true  },
    { to: '/boarding-pass', label: 'My Pass',    icon: Ticket,        auth: true  },
    { to: '/lost-found',   label: 'Lost Item',  icon: Search,        auth: true  },
    { to: '/prediction',   label: 'AI Predict', icon: Brain,         auth: true  },
    { to: '/admin',      label: 'Admin',      icon: Settings,      admin: true  },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileOpen
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-100'
            : 'bg-transparent backdrop-blur-sm'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16">
            {/* ── Logo ───────────────────────────────────────────────────── */}
            <Link to="/" className="flex items-center gap-2.5 group" aria-label="Smart Airport Home">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-glow group-hover:shadow-glow-blue transition-all duration-300">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <span className={`font-bold text-lg tracking-tight transition-colors duration-300 ${
                scrolled ? 'text-navy-900' : 'text-white'
              }`}>
                AirAssist
              </span>
            </Link>

            {/* ── Desktop Nav Links ───────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon, always, auth, admin }) => {
                if (admin && !isAdmin) return null
                if (auth && !isAuth) return null
                if (!always && !auth && !admin) return null
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(to)
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : scrolled
                          ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {label}
                  </Link>
                )
              })}
            </div>

            {/* ── Desktop Auth Buttons ─────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-4">
              {isAuth ? (
                <>
                  <NotificationBell scrolled={scrolled} />
                  
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${
                    scrolled ? 'text-slate-700 bg-white border-slate-200 shadow-sm' : 'text-white bg-white/10 border-white/20'
                  }`}>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{user?.name}</span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      scrolled
                        ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    id="nav-login-btn"
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      scrolled
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    id="nav-register-btn"
                    className="btn-primary py-2 text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile Menu Toggle ───────────────────────────────────────── */}
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Drawer ──────────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-lg animate-slide-down">
            <div className="section-container py-4 flex flex-col gap-1">
              {navLinks.map(({ to, label, icon: Icon, always, auth, admin }) => {
                if (admin && !isAdmin) return null
                if (auth && !isAuth) return null
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(to)
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {label}
                  </Link>
                )
              })}
              <div className="border-t border-slate-100 mt-2 pt-2">
                {isAuth ? (
                  <>
                    <div className="px-4 py-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
                      Signed in as <span className="text-indigo-600">{user?.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 px-2 pt-1">
                    <Link to="/login"    className="flex-1 btn-secondary text-center py-2.5 text-sm">Login</Link>
                    <Link to="/register" className="flex-1 btn-primary  text-center py-2.5 text-sm">Sign Up</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* Spacer to prevent content hiding under fixed nav */}
      <div className="h-16" />
    </>
  )
}
