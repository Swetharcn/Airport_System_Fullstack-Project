import React from 'react'
import { Plane, Clock, MapPin, Hash, DoorOpen } from 'lucide-react'

// ── Status badge config ─────────────────────────────────────────────────────
const statusConfig = {
  'On Time':  { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  'Delayed':  { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500',   bar: 'bg-amber-500'   },
  'Cancelled':{ bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500',     bar: 'bg-red-500'     },
  'Boarding': { bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500',    bar: 'bg-blue-500'    },
  'Departed': { bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400',   bar: 'bg-slate-400'   },
  'Arrived':  { bg: 'bg-purple-100',  text: 'text-purple-700',  dot: 'bg-purple-500',  bar: 'bg-purple-500'  },
}

// ── Airline logo mapping (using logo.clearbit.com CDN) ───────────────────────
const AIRLINE_LOGOS = {
  'Air India':          'https://logo.clearbit.com/airindia.in',
  'IndiGo':             'https://logo.clearbit.com/goindigo.in',
  'SpiceJet':           'https://logo.clearbit.com/spicejet.com',
  'Vistara':            'https://logo.clearbit.com/airvistara.com',
  'Emirates':           'https://logo.clearbit.com/emirates.com',
  'Qatar Airways':      'https://logo.clearbit.com/qatarairways.com',
  'Lufthansa':          'https://logo.clearbit.com/lufthansa.com',
  'British Airways':    'https://logo.clearbit.com/britishairways.com',
  'Singapore Airlines': 'https://logo.clearbit.com/singaporeair.com',
  'Turkish Airlines':   'https://logo.clearbit.com/turkishairlines.com',
  'Go First':           'https://logo.clearbit.com/gofirst.in',
  'Etihad Airways':     'https://logo.clearbit.com/etihad.com',
  'Malaysia Airlines':  'https://logo.clearbit.com/malaysiaairlines.com',
}

// ── Airline brand gradient mapping ───────────────────────────────────────────
const AIRLINE_GRADIENT = {
  'Air India':          'from-[#e31837] to-[#a00025]',
  'IndiGo':             'from-[#1a1f6e] to-[#282faa]',
  'SpiceJet':           'from-[#e2231a] to-[#ff6f2b]',
  'Vistara':            'from-[#5c2e7e] to-[#8b4fb5]',
  'Emirates':           'from-[#c8102e] to-[#8b0000]',
  'Qatar Airways':      'from-[#5c0632] to-[#8e0042]',
  'Lufthansa':          'from-[#002b5c] to-[#1a5276]',
  'British Airways':    'from-[#0c0c82] to-[#2e4bb8]',
  'Singapore Airlines': 'from-[#1a3a6b] to-[#032060]',
  'Turkish Airlines':   'from-[#c8102e] to-[#1a2e6e]',
  'Go First':           'from-[#004c97] to-[#0070ce]',
  'Etihad Airways':     'from-[#bd975a] to-[#7a6030]',
  'Malaysia Airlines':  'from-[#003087] to-[#cc0001]',
}

const formatTime = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}
const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
const getDuration = (dep, arr) => {
  const diff = (new Date(arr) - new Date(dep)) / 60000
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return `${h}h ${m}m`
}
const getIATACode = (airportStr) => {
  const match = airportStr.match(/\(([A-Z]{3})\)/)
  return match ? match[1] : airportStr.slice(0, 3).toUpperCase()
}

export default function FlightCard({ flight }) {
  const status = statusConfig[flight.flightStatus] || statusConfig['On Time']
  const logoUrl = AIRLINE_LOGOS[flight.airlineName]
  const gradient = AIRLINE_GRADIENT[flight.airlineName] || 'from-navy-900 to-indigo-900'
  const srcCode = getIATACode(flight.sourceAirport)
  const dstCode = getIATACode(flight.destinationAirport)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">

      {/* ── Airline Header Bar ── */}
      <div className={`bg-gradient-to-r ${gradient} px-5 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2.5">
          {/* Airline Logo */}
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow overflow-hidden flex-shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={flight.airlineName}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
                }}
              />
            ) : (
              <Plane className="w-4 h-4 text-indigo-600" />
            )}
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">{flight.airlineName}</p>
            <p className="text-white/60 text-[10px]">{flight.aircraft}</p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`status-badge ${status.bg} ${status.text}`}
          aria-label={`Flight status: ${flight.flightStatus}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot} mr-1 inline-block animate-pulse`} />
          {flight.flightStatus}
        </span>
      </div>

      {/* ── Route Section ── */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between gap-2">

          {/* Origin */}
          <div className="text-center flex-1">
            <p className="text-3xl font-extrabold text-navy-900 tracking-tight">{srcCode}</p>
            <p className="text-lg font-bold text-navy-900 mt-0.5">{formatTime(flight.departureTime)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(flight.departureTime)}</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-tight px-1 truncate">{flight.sourceAirport}</p>
          </div>

          {/* Duration + Plane animation */}
          <div className="flex-1 flex flex-col items-center gap-1 px-2">
            <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />{getDuration(flight.departureTime, flight.arrivalTime)}
            </p>
            <div className="w-full flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-indigo-300 flex-shrink-0" />
              <div className="flex-1 h-px bg-gradient-to-r from-indigo-300 via-indigo-500 to-blue-400 relative">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <Plane className="w-5 h-5 text-indigo-500 drop-shadow" />
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Direct</p>
          </div>

          {/* Destination */}
          <div className="text-center flex-1">
            <p className="text-3xl font-extrabold text-navy-900 tracking-tight">{dstCode}</p>
            <p className="text-lg font-bold text-navy-900 mt-0.5">{formatTime(flight.arrivalTime)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(flight.arrivalTime)}</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-tight px-1 truncate">{flight.destinationAirport}</p>
          </div>
        </div>

        {/* ── Details Row ── */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3 text-indigo-400" />
            <span className="font-semibold text-slate-700">{flight.flightNumber}</span>
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-400" />
            {flight.terminal}
          </span>
          <span className="flex items-center gap-1">
            <DoorOpen className="w-3 h-3 text-indigo-400" />
            Gate <span className="font-semibold text-slate-700 ml-0.5">{flight.gate}</span>
          </span>
          {flight.price > 0 && (
            <span className="ml-auto font-bold text-indigo-600 text-sm">
              ₹{flight.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {/* ── Coloured status bottom bar ── */}
      <div className={`h-1 w-full ${status.bar} opacity-70`} />
    </div>
  )
}
