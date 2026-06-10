import React, { useState, useEffect } from 'react'
import { Briefcase, Search } from 'lucide-react'
import api from '../api/axiosInstance'
import ServiceCard from '../components/ServiceCard'
import LoadingSpinner from '../components/LoadingSpinner'

const CATEGORIES = ['All', 'Restaurant', 'Lounge', 'Terminal', 'Retail', 'Medical', 'Transport', 'Hotel', 'Banking']

const CAT_ICONS = {
  All: '🌐', Restaurant: '🍽️', Lounge: '🛋️', Terminal: '🏢',
  Retail: '🛍️', Medical: '🏥', Transport: '🚌', Hotel: '🏨', Banking: '💳',
}

export default function ServicesPage() {
  const [services,  setServices]  = useState([])
  const [filtered,  setFiltered]  = useState([])
  const [category,  setCategory]  = useState('All')
  const [search,    setSearch]    = useState('')
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    api.get('/services')
      .then(({ data }) => {
        setServices(data.data || [])
        setFiltered(data.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Client-side filter by category + search text
  useEffect(() => {
    let result = services
    if (category !== 'All') result = result.filter((s) => s.category === category)
    if (search.trim())      result = result.filter((s) =>
      s.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [category, search, services])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="page-hero py-14">
        <div className="section-container text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Airport Services</h1>
          <p className="text-white/60 max-w-xl mx-auto">Discover restaurants, lounges, transport, medical facilities, and more.</p>

          {/* Search */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="services-search"
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-slate-800 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`cat-${cat.toLowerCase()}`}
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                category === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              <span>{CAT_ICONS[cat]}</span>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading services..." /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card py-16 text-center">
            <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No services found</p>
            <p className="text-slate-400 text-sm mt-1">Try a different category or search term</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-5">{filtered.length} service{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
