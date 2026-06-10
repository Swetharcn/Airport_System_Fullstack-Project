import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

/**
 * ProtectedRoute
 * Redirects unauthenticated users to /login.
 * For admin-only routes, redirects passengers to /dashboard.
 *
 * @param {ReactNode} children - The component to render if authorized
 * @param {'passenger'|'admin'} requiredRole - Minimum role required
 */
export default function ProtectedRoute({ children, requiredRole = 'passenger' }) {
  const { isAuth, isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
