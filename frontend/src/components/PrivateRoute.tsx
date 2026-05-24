import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface PrivateRouteProps {
  children: React.ReactNode
}

/**
 * Protected Route Component
 * 
 * Wraps routes that require authentication
 * 
 * Logic:
 * 1. Check if user is authenticated (has token + user)
 * 2. If yes, render the protected component
 * 3. If no, redirect to login page
 * 
 * This prevents unauthorized access to /notes, /profile, etc
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
