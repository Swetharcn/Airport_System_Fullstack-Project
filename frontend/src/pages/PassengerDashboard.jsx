import React, { useState, useEffect, useCallback } from 'react'
import { Plane, TrendingUp, Clock, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosInstance'
import FlightSearchBar from '../components/FlightSearchBar'
import FlightCard from '../components/FlightCard'
import LoadingSpinner from '../components/LoadingSpinner'

const STAT_CARDS = [
  { label: 'Total Flights', icon: Plane,         key: 'total',     color: 'text-indigo-600', bg: 'bg-indigo-50'  },
  { label: 'On Time',       icon: TrendingUp,    key: 'ontime',    color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Delayed',       icon: Clock,         key: 'delayed',   color: 'text-amber-600',  bg: 'bg-amber-50'   },
  { label: 'Cancelled',     icon: AlertTriangle, key: 'cancelled', color: 'text-red-600',    bg: 'bg-red-50'     },
]

export default function PassengerDashboard() {
  const { user } = useAuth()
  const [flights,  setFlights]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [stats,    setStats]    = useState({ total: 0, ontime: 0, delayed: 0, cancelled: 0 })
  const [pagination, setPagination] = useState({ total: 0, pages: 1, current: 1 })

  const fetchFlights = useCallback(async (filters = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.source)      params.append('source',      filters.source)
      if (filters.destination) params.append('destination', filters.destination)
      if (filters.date)        params.append('date',        filters.date)
      if (filters.status)      params.append('status',      filters.status)

      const { data } = await api.get(`/flights?${params}`)
      setFlights(data.data || [])
      setPagination({ total: data.total, pages: data.pages, current: data.currentPage })

      // Compute stats from returned results
      const all = data.data || []
      setStats({
        total:     data.total,
        ontime:    all.filter((f) => f.flightStatus === 'On Time').length,
        delayed:   all.filter((f) => f.flightStatus === 'Delayed').length,
        cancelled: all.filter((f) => f.flightStatus === 'Cancelled').length,
      })
    } catch {
      setFlights([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFlights() }, [fetchFlights])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Hero */}
      <div className="page-hero py-10">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Welcome back, {user?.name?.split(' ')[0]}! ✈️
              </h1>
              <p className="text-white/60 mt-1">Track flights and explore airport services</p>
            </div>
            <div className="text-right text-white/50 text-sm">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      <div className="section-container py-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(({ label, icon: Icon, key, color, bg }) => (
            <div key={key} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{stats[key]}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div>
          <h2 className="text-lg font-bold text-navy-900 mb-3">Search Flights</h2>
          <FlightSearchBar onSearch={fetchFlights} loading={loading} />
        </div>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy-900">
              Flight Results
              {!loading && <span className="ml-2 text-sm font-normal text-slate-500">({pagination.total} found)</span>}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" text="Searching flights..." />
            </div>
          ) : flights.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card py-16 text-center">
              <Plane className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No flights found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {flights.map((flight) => (
                <FlightCard key={flight._id} flight={flight} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
