import React, { createContext, useContext, useReducer, useEffect } from 'react'

// ─── Context & Initial State ───────────────────────────────────────────────────
const AuthContext = createContext(null)

const initialState = {
  user:  null,
  token: null,
  isLoading: true, // starts true to check localStorage on mount
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user:  action.payload.user,
        token: action.payload.token,
        isLoading: false,
      }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    case 'LOADED':
      return { ...state, isLoading: false }
    default:
      return state
  }
}

// ─── Provider Component ───────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Rehydrate auth state from localStorage on app load
  useEffect(() => {
    try {
      const token = localStorage.getItem('airport_token')
      const user  = JSON.parse(localStorage.getItem('airport_user') || 'null')
      if (token && user) {
        dispatch({ type: 'LOGIN', payload: { token, user } })
      } else {
        dispatch({ type: 'LOADED' })
      }
    } catch {
      dispatch({ type: 'LOADED' })
    }
  }, [])

  // ── Actions ────────────────────────────────────────────────────────────────
  const login = (user, token) => {
    localStorage.setItem('airport_token', token)
    localStorage.setItem('airport_user', JSON.stringify(user))
    dispatch({ type: 'LOGIN', payload: { user, token } })
  }

  const logout = () => {
    localStorage.removeItem('airport_token')
    localStorage.removeItem('airport_user')
    dispatch({ type: 'LOGOUT' })
  }

  const value = {
    user:      state.user,
    token:     state.token,
    isLoading: state.isLoading,
    isAuth:    !!state.token,
    isAdmin:   state.user?.role === 'admin',
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
