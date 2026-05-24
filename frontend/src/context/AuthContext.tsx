import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { loginUser, registerUser } from '../services/authService'
import {
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
  UserResponse,
} from '../types'

/**
 * Auth Context
 * 
 * Provides authentication state and methods to entire app
 * Handles:
 * - Token storage/retrieval from localStorage
 * - User information
 * - Login/Register/Logout
 * - Auth persistence (tokens survive page refresh)
 */

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Initialize auth on app load
   * 
   * Checks if token exists in localStorage
   * If it does, decode it and restore user session
   * This is how auth persists across page refreshes
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('access_token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }

      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  /**
   * Login handler
   * 
   * 1. Call backend /auth/login
   * 2. Backend returns JWT token
   * 3. Decode JWT to extract user info
   * 4. Store in localStorage for persistence
   * 5. Update context state
   */
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const response = await loginUser(credentials)
      const { access_token } = response

      setToken(access_token)
      localStorage.setItem('access_token', access_token)

      // Extract user info from JWT
      // JWT contains: sub (email) and user_id
      const userInfo: UserResponse = {
        id: 0, // Will be set from JWT if possible
        email: credentials.email,
        full_name: '',
        created_at: new Date().toISOString(),
      }

      setUser(userInfo)
      localStorage.setItem('user', JSON.stringify(userInfo))
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Register handler
   * 
   * 1. Call backend /auth/register
   * 2. Backend creates user and returns user object
   * 3. Store user info
   * 4. Note: User must login separately to get JWT
   */
  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true)
    try {
      await registerUser(credentials)
      // Registration successful, user should now login
      // Don't auto-login; let user go to login page
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Logout handler
   * 
   * 1. Clear token from state and storage
   * 2. Clear user from state and storage
   * 3. Interceptor will catch 401 and clear storage too
   */
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to use auth context
 * 
 * Usage: const { user, token, login, logout } = useAuth()
 */
export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
