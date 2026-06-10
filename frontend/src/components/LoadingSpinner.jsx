import React from 'react'

/**
 * LoadingSpinner
 * @param {'sm'|'md'|'lg'} size
 * @param {string} color  - Tailwind color class without prefix, default 'indigo-600'
 */
export default function LoadingSpinner({ size = 'md', color = 'indigo-600', text = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} border-4 border-slate-200 border-t-${color} rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-sm text-slate-500 font-medium">{text}</p>}
    </div>
  )
}
