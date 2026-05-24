import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * Axios instance with automatic JWT token injection
 * 
 * Key concepts:
 * 1. Request interceptor: Adds Authorization header to every request
 * 2. Response interceptor: Handles 401 errors gracefully
 * 3. Token stored in localStorage for persistence
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * REQUEST INTERCEPTOR
 * 
 * This runs BEFORE every API request
 * Purpose: Automatically attach JWT token to Authorization header
 * 
 * Flow:
 * 1. Get token from localStorage
 * 2. If token exists, add it to request headers
 * 3. Proceed with request
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * RESPONSE INTERCEPTOR
 * 
 * This runs AFTER every API response
 * Purpose: Handle authentication errors globally
 * 
 * Flow:
 * 1. If response is successful (2xx), return it
 * 2. If 401 Unauthorized occurs:
 *    - Token expired or invalid
 *    - Clear localStorage
 *    - Redirect to login (handled by PrivateRoute)
 * 3. Otherwise, reject with error
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      // Navigation handled by PrivateRoute component
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
