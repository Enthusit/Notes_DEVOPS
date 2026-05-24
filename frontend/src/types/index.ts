// Auth types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  full_name: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface UserResponse {
  id: number
  email: string
  full_name: string
  created_at: string
}

// Notes types
export interface NoteCreate {
  title: string
  content: string
}

export interface NoteUpdate {
  title: string
  content: string
}

export interface NoteResponse {
  id: number
  title: string
  content: string
  owner_id: number
  created_at: string
}

// Auth context types
export interface AuthContextType {
  user: UserResponse | null
  token: string | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}
