import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PassengerDashboard from './pages/PassengerDashboard'
import ServicesPage from './pages/ServicesPage'
import AdminPanel from './pages/AdminPanel'
import ProtectedRoute from './components/ProtectedRoute'
import ChatbotWidget from './components/ChatbotWidget'
import LoadingSpinner from './components/LoadingSpinner'

import NavigationPage from './pages/NavigationPage'
import CrowdDensityPage from './pages/CrowdDensityPage'
import LostFoundPage from './pages/LostFoundPage'
import NotificationsPage from './pages/NotificationsPage'
import BaggagePage from './pages/BaggagePage'
import FlightPredictionPage from './pages/FlightPredictionPage'
import BoardingPassPage from './pages/BoardingPassPage'

export default function App() {
  const { isLoading, isAuth, isAdmin } = useAuth()

  // Wait for localStorage rehydration before rendering routes
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={isAuth ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={isAuth ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
          <Route path="/services" element={<ServicesPage />} />

          {/* Passenger - requires auth */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="passenger">
                <PassengerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/navigation"
            element={
              <ProtectedRoute requiredRole="passenger">
                <NavigationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crowd"
            element={
              <ProtectedRoute requiredRole="passenger">
                <CrowdDensityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lost-found"
            element={
              <ProtectedRoute requiredRole="passenger">
                <LostFoundPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute requiredRole="passenger">
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/baggage"
            element={
              <ProtectedRoute requiredRole="passenger">
                <BaggagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prediction"
            element={
              <ProtectedRoute requiredRole="passenger">
                <FlightPredictionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/boarding-pass"
            element={
              <ProtectedRoute requiredRole="passenger">
                <BoardingPassPage />
              </ProtectedRoute>
            }
          />

          {/* Admin - requires admin role */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating chatbot — visible only for authenticated users */}
      {isAuth && <ChatbotWidget />}
    </div>
  )
}
