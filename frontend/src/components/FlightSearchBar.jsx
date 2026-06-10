import React, { useState } from 'react'
import { Search, MapPin, Calendar, Filter, Lock } from 'lucide-react'

const STATUS_OPTIONS = ['', 'On Time', 'Delayed', 'Cancelled', 'Boarding', 'Departed', 'Arrived']

// All destinations served from Bengaluru International Airport (BLR)
const BLR_DESTINATIONS = [
  { label: 'All Destinations', value: '' },
  { label: 'Delhi (DEL)', value: 'Delhi' },
  { label: 'Dubai (DXB)', value: 'Dubai' },
  { label: 'Hyderabad (HYD)', value: 'Hyderabad' },
  { label: 'Frankfurt (FRA)', value: 'Frankfurt' },
  { label: 'Doha (DOH)', value: 'Doha' },
  { label: 'London (LHR)', value: 'London' },
  { label: 'Mumbai (BOM)', value: 'Mumbai' },
  { label: 'Singapore (SIN)', value: 'Singapore' },
  { label: 'Pune (PNQ)', value: 'Pune' },
  { label: 'Goa (GOI)', value: 'Goa' },
  { label: 'Istanbul (IST)', value: 'Istanbul' },
  { label: 'Kochi (COK)', value: 'Kochi' },
  { label: 'New York (JFK)', value: 'New York' },
  { label: 'Kolkata (CCU)', value: 'Kolkata' },
  { label: 'Abu Dhabi (AUH)', value: 'Abu Dhabi' },
  { label: 'Kuala Lumpur (KUL)', value: 'Kuala Lumpur' },
  { label: 'Jaipur (JAI)', value: 'Jaipur' },
  { label: 'Ahmedabad (AMD)', value: 'Ahmedabad' },
  { label: 'Bangkok (BKK)', value: 'Bangkok' },
  { label: 'Bhubaneswar (BBI)', value: 'Bhubaneswar' },
  { label: 'Chennai (MAA)', value: 'Chennai' },
  { label: 'Trivandrum (TRV)', value: 'Trivandrum' },
  { label: 'Chandigarh (IXC)', value: 'Chandigarh' },
  { label: 'Nagpur (NAG)', value: 'Nagpur' },
]

const SOURCE_AIRPORT = 'Bengaluru'

/**
 * FlightSearchBar
 * @param {function} onSearch - Callback with { source, destination, date, status }
 * @param {boolean}  loading  - Disables submit while fetching
 */
export default function FlightSearchBar({ onSearch, loading }) {
  const [filters, setFilters] = useState({
    source: SOURCE_AIRPORT,
    destination: '',
    date: '',
    status: '',
  })

  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(filters)
  }

  const handleReset = () => {
    const reset = { source: SOURCE_AIRPORT, destination: '', date: '', status: '' }
    setFilters(reset)
    onSearch(reset)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-100 shadow-card p-5"
      aria-label="Flight search form"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Source — Locked */}
        <div>
          <label htmlFor="search-source" className="form-label flex items-center gap-1">
            From
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full ml-1">
              <Lock className="w-2.5 h-2.5" /> Fixed
            </span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <input
              id="search-source"
              name="source"
              type="text"
              className="form-input pl-9 bg-indigo-50 text-indigo-700 font-semibold cursor-not-allowed select-none border-indigo-200"
              value="Bengaluru International Airport (BLR)"
              readOnly
              tabIndex={-1}
              aria-readonly="true"
            />
          </div>
        </div>

        {/* Destination — Dropdown */}
        <div>
          <label htmlFor="search-destination" className="form-label">To</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              id="search-destination"
              name="destination"
              className="form-input pl-9 cursor-pointer appearance-none"
              value={filters.destination}
              onChange={handleChange}
            >
              {BLR_DESTINATIONS.map(({ label, value }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label htmlFor="search-date" className="form-label">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="search-date"
              name="date"
              type="date"
              className="form-input pl-9"
              value={filters.date}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="search-status" className="form-label">Status</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              id="search-status"
              name="status"
              className="form-input pl-9 cursor-pointer appearance-none"
              value={filters.status}
              onChange={handleChange}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.slice(1).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          id="flight-search-btn"
          disabled={loading}
          className="btn-primary flex-1 sm:flex-none"
        >
          <Search className="w-4 h-4" />
          {loading ? 'Searching...' : 'Search Flights'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="btn-secondary"
        >
          Reset
        </button>
      </div>
    </form>
  )
}
