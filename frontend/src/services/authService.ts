import apiClient from './apiClient'
import {
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
  UserResponse,
} from '../types'

/**
 * Authentication API Service
 * 
 * Handles all auth-related HTTP requests
 * Works with backend /auth endpoints
 */

/**
 * Register a new user
 * 
 * @param credentials - Email, password, full_name
 * @returns New user object
 */
export const registerUser = async (
  credentials: RegisterCredentials
): Promise<UserResponse> => {
  const response = await apiClient.post('/auth/register', credentials)
  return response.data
}

/**
 * Login user
 * 
 * @param credentials - Email and password
 * @returns JWT token and token type
 * 
 * Note: The token is stored in context, which stores it in localStorage
 */
export const loginUser = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  // Backend expects form data for OAuth2PasswordRequestForm
  // Use URLSearchParams to send as application/x-www-form-urlencoded
  const formData = new URLSearchParams()
  formData.append('username', credentials.email)
  formData.append('password', credentials.password)

  const response = await apiClient.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  return response.data
}

/**
 * Decode JWT token to get user info
 * Frontend doesn't need to make API call - JWT contains user_id and email
 * But we verify token validity through interceptor 401 handling
 */
export const verifyToken = async (): Promise<void> => {
  // Make a simple request to verify token is still valid
  // Backend returns 401 if token expired
  await apiClient.get('/auth/verify')
}
