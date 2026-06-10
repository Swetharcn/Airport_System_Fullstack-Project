import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plane, Shield, Zap, Clock, MapPin, ArrowRight, Star } from 'lucide-react'
import api from '../api/axiosInstance'
import ServiceCard from '../components/ServiceCard'
import LoadingSpinner from '../components/LoadingSpinner'

const STATS = [
  { value: '150+', label: 'Daily Flights',    icon: Plane  },
  { value: '50+',  label: 'Airport Services', icon: Star   },
  { value: '24/7', label: 'Live Support',     icon: Clock  },
  { value: '99.8%', label: 'On-Time Rate',   icon: Shield },
]

const FEATURES = [
  { icon: Plane,  title: 'Real-Time Flights',    desc: 'Track arrivals, departures, and delays with up-to-the-minute updates.',     color: 'from-blue-500 to-indigo-600'   },
  { icon: Zap,    title: 'AI Smart Assistant',   desc: 'Get instant answers about navigation, services, and flight queries 24/7.',  color: 'from-purple-500 to-pink-600'   },
  { icon: MapPin, title: 'Airport Navigation',   desc: 'Find terminals, gates, lounges, dining, and services with ease.',           color: 'from-emerald-500 to-teal-600'  },
  { icon: Shield, title: 'Secure & Reliable',    desc: 'Your data is protected with enterprise-grade security and encryption.',     color: 'from-orange-500 to-red-500'    },
]

export default function LandingPage() {
  const [services, setServices] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.get('/services?category=Lounge')
      .then(({ data }) => setServices(data.data?.slice(0, 3) || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-indigo-900 -mt-16 pt-16">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-indigo-600 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-500 blur-3xl" />
        </div>

        <div className="section-container relative z-10 py-28 md:py-36">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live · Real-Time Airport Updates
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6 animate-slide-up">
              Your Smart{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                Airport
              </span>{' '}
              Companion
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 animate-fade-in">
              Real-time flight tracking, AI-powered navigation, and seamless airport services — all in one intelligent platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <Link to="/register" id="hero-register-btn" className="btn-primary text-base px-8 py-3 shadow-glow-blue">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/services" id="hero-services-btn" className="btn-secondary text-base px-8 py-3 bg-white/10 border-white/20 text-white hover:bg-white/20">
                Explore Services
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center group">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-white/20 transition-colors">
                  <Icon className="w-5 h-5 text-indigo-300" />
                </div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/50 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1200 0 960 60 720 30C480 0 240 60 0 30L0 60Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50" id="features">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">Why AirAssist?</p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900">Everything You Need at the Airport</h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">Designed to make your airport experience effortless, from gate to destination.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="group bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 p-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Services (Lounges) ───────────────────────────────────── */}
      <section className="py-20 bg-white" id="services-preview">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">Airport Services</p>
              <h2 className="text-3xl font-bold text-navy-900">Premium Lounges</h2>
            </div>
            <Link to="/services" className="btn-secondary whitespace-nowrap">
              View All Services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" text="Loading services..." /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.length > 0
                ? services.map((s) => <ServiceCard key={s._id} service={s} />)
                : <p className="text-slate-400 col-span-3 text-center py-12">No services loaded yet — run the seed script!</p>
              }
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-navy-900 via-indigo-900 to-navy-900">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Fly Smarter?</h2>
          <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">Create a free account to access real-time flights, AI chat support, and full airport services.</p>
          <Link to="/register" id="cta-register-btn" className="btn-primary text-base px-8 py-3 shadow-glow-blue">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-navy-950 text-white/40 py-8 text-center text-sm">
        <p>© 2026 AirAssist · Smart Airport Assistant System · Built with ❤️ using MERN Stack</p>
      </footer>
    </div>
  )
}
