import React from 'react'
import { MapPin, Clock, Phone, Star } from 'lucide-react'

const categoryColors = {
  Restaurant: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  Lounge:     { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  Terminal:   { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200'   },
  Retail:     { bg: 'bg-pink-100',   text: 'text-pink-700',   border: 'border-pink-200'   },
  Medical:    { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200'    },
  Transport:  { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200'  },
  Hotel:      { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  Banking:    { bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-200'   },
}

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5`}>
    {[1,2,3,4,5].map((star) => (
      <Star
        key={star}
        className={`w-3 h-3 ${star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
      />
    ))}
    <span className="text-xs text-slate-500 ml-1">{rating.toFixed(1)}</span>
  </div>
)

export default function ServiceCard({ service }) {
  const cat = categoryColors[service.category] || categoryColors.Terminal

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Icon Header */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-6 flex items-center gap-4 border-b border-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-white shadow-card flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
          {service.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-navy-900 text-base leading-tight truncate">{service.serviceName}</h3>
          <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cat.bg} ${cat.text} ${cat.border}`}>
            {service.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-4 flex-1 flex flex-col gap-3">
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{service.description}</p>

        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="truncate">{service.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span>{service.openingHours}</span>
          </div>
          {service.contact && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span>{service.contact}</span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100">
          <StarRating rating={service.rating} />
        </div>
      </div>
    </div>
  )
}
