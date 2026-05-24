# Notes App - Frontend

A **React + Vite** frontend for the Notes DevOps application, demonstrating modern frontend practices with **authentication**, **API integration**, and **request interception**.

## 🎯 Learning Focus

This frontend teaches you:

- **Token Lifecycle**: How JWT tokens flow through your application
- **Request Interception**: Automatically adding authorization headers
- **Auth Persistence**: Surviving page refreshes with localStorage
- **Protected Routes**: Conditional rendering based on authentication state
- **CORS**: Cross-origin requests between dockerized services
- **Error Handling**: API error responses and user feedback

## 🏗️ Architecture

```
frontend (React + Vite on :5173)
    ↓ Axios HTTP Client
    ↓ Request Interceptor (adds JWT token)
    ↓ Response Interceptor (handles 401 errors)
    ↓
backend (FastAPI on :8000)
    ↓ CORS enabled for frontend
    ↓ Token validation via JWT
    ↓
postgres (database)
```

## 📁 Project Structure

```
src/
├── pages/              # Full page components (routes)
│   ├── LoginPage.tsx           # Email + password login
│   ├── RegisterPage.tsx        # New user registration
│   ├── NotesListPage.tsx       # Dashboard: all notes + CRUD
│   └── NoteEditorPage.tsx      # Create/Edit notes
│
├── context/            # Global state management
│   └── AuthContext.tsx         # Authentication state + methods
│
├── services/           # API communication
│   ├── apiClient.ts            # Axios instance with interceptors
│   ├── authService.ts          # /auth endpoints
│   └── notesService.ts         # /notes endpoints
│
├── components/         # Reusable React components
│   └── PrivateRoute.tsx        # Protected route wrapper
│
├── types/              # TypeScript interfaces
│   └── index.ts                # All type definitions
│
├── App.tsx             # Router + Route configuration
├── main.tsx            # Entry point
└── index.css           # Tailwind CSS setup
```

## 🔑 Key Concepts

### 1. JWT Token Lifecycle

```
User Login
    ↓
/auth/login (POST email, password)
    ↓
Backend validates, returns {access_token: "jwt..."}
    ↓
AuthContext stores in localStorage
    ↓
apiClient interceptor adds: Authorization: Bearer jwt...
    ↓
Every subsequent request includes token
    ↓
Backend validates token, processes request
    ↓
Token expires → 401 response → Clear storage → Redirect to login
```

### 2. Request Interceptor

```typescript
// services/apiClient.ts
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }
)
```

**Why this matters:**
- Token is automatically added to EVERY request
- No need to manually pass token to each service function
- Centralized JWT handling

### 3. Auth Persistence

```typescript
// AuthProvider initialization
useEffect(() => {
  const storedToken = localStorage.getItem('access_token')
  if (storedToken) {
    // User session restored after page refresh
    setToken(storedToken)
    setUser(JSON.parse(localStorage.getItem('user')))
  }
}, [])
```

**Why this matters:**
- User doesn't need to login again after page refresh
- Token survives browser close (until expiration)
- Seamless UX

### 4. Protected Routes

```typescript
// App.tsx
<Route
  path="/notes"
  element={
    <PrivateRoute>
      <NotesListPage />
    </PrivateRoute>
  }
/>
```

**Protection logic:**
- Check if `isAuthenticated` (has token + user)
- If no, redirect to `/login`
- If yes, render protected component

### 5. CORS (Cross-Origin Resource Sharing)

**Problem:** Frontend on `localhost:5173` trying to access backend on `localhost:8000`

**Solution:** Backend must explicitly allow frontend origin

```python
# app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production: ["https://yourdomain.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**In Docker containers:**
- Frontend container: `http://frontend:5173`
- Backend container: `http://backend:8000`
- CORS still needed!

## 🚀 Quick Start

### With Docker Compose (Recommended)

```bash
cd notes-devops/backend
docker-compose up --build
```

Services start on:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Postgres: localhost:5432

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# In .env.local, point to local backend
VITE_API_BASE_URL=http://localhost:8000
```

## 📋 API Integration Examples

### Login Flow

```typescript
// pages/LoginPage.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // 1. Call service
  await login(formData)
  
  // 2. AuthContext handles:
  //    - POST /auth/login
  //    - Stores token in localStorage
  //    - Updates auth state
  
  // 3. Interceptor will automatically add token to all requests
  navigate('/notes')
}
```

### Fetching Protected Data

```typescript
// pages/NotesListPage.tsx
useEffect(() => {
  const loadNotes = async () => {
    // Interceptor automatically adds: Authorization: Bearer {token}
    const notes = await fetchNotes()
    setNotes(notes)
  }
  loadNotes()
}, [])
```

### Handling Expired Token

```typescript
// services/apiClient.ts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      // PrivateRoute detects !isAuthenticated
      // Redirects to /login
    }
    return Promise.reject(error)
  }
)
```

## 🔐 Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERACTION                      │
└─────────────────────────────────────────────────────────┘
                          ↓
                  Enter credentials
                          ↓
                  Click "Login" button
                          ↓
┌─────────────────────────────────────────────────────────┐
│              loginUser() [authService.ts]               │
│  - POST to /auth/login with email, password             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Backend Validation (FastAPI)               │
│  - Verify email exists                                  │
│  - Verify password matches bcrypt hash                  │
│  - Create JWT token with user_id, email                │
└─────────────────────────────────────────────────────────┘
                          ↓
            Return {access_token: "jwt...", ...}
                          ↓
┌─────────────────────────────────────────────────────────┐
│             AuthContext.login() handler                 │
│  - Store token in localStorage                          │
│  - Update auth state                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
        All subsequent requests now include:
        Authorization: Bearer {token}
                          ↓
┌─────────────────────────────────────────────────────────┐
│           Request Interceptor Automatic                 │
│  - Extract token from localStorage                      │
│  - Add Authorization header to all requests             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         Backend Receives Request with Token             │
│  - get_current_user dependency verifies JWT             │
│  - Extracts user_id from token                          │
│  - Queries database for user                            │
│  - Proceeds with request (returns user's data)          │
└─────────────────────────────────────────────────────────┘
```

## 🧪 Testing the Full Flow

1. **Start everything:**
   ```bash
   cd notes-devops/backend
   docker-compose up --build
   ```

2. **Test Registration:**
   - Go to http://localhost:5173/register
   - Create an account with email, password, name
   - Should redirect to login

3. **Test Login:**
   - Go to http://localhost:5173/login
   - Enter credentials
   - Should redirect to `/notes` (dashboard)
   - Check browser DevTools → Storage → LocalStorage
   - Should see `access_token` key

4. **Test Protected Route:**
   - Try accessing http://localhost:5173/notes directly (before login)
   - Should redirect to `/login`

5. **Test Token Persistence:**
   - Refresh the page while logged in
   - Should stay logged in (token restored from localStorage)

6. **Test CORS:**
   - Open browser DevTools → Network
   - Create a note
   - POST /notes request should succeed (CORS header present)
   - If blocked, backend CORS config needs fixing

7. **Test Token Expiration:**
   - Backend has `ACCESS_TOKEN_EXPIRE_MINUTES=30`
   - After 30 minutes of inactivity, making a request returns 401
   - Interceptor clears storage
   - User redirected to login

## 🛠️ Common Issues & Solutions

### Issue: "Cannot reach backend" / Network Error

**Causes:**
1. Backend not running
2. CORS not configured
3. Wrong API_BASE_URL in .env

**Solution:**
```bash
# Check backend is running
docker logs notes-backend

# Check frontend env
cat frontend/.env  # Should have VITE_API_BASE_URL=http://backend:8000

# Check CORS in backend
cat backend/app/main.py  # Should have CORSMiddleware
```

### Issue: 401 Unauthorized on every request

**Causes:**
1. Token not being sent (interceptor not working)
2. Backend not validating token correctly

**Solution:**
```typescript
// Debug: Check if token is being sent
apiClient.interceptors.request.use((config) => {
  console.log('Token:', localStorage.getItem('access_token'))
  console.log('Headers:', config.headers)
  return config
})
```

### Issue: "Token invalid" but just logged in

**Causes:**
1. SECRET_KEY changed between requests
2. ALGORITHM mismatch
3. Clock skew (server time differs)

**Solution:**
```bash
# Check backend config
cat backend/.env
# SECRET_KEY and ALGORITHM should be consistent
```

## 📚 What You'll Learn

By building this, you understand:

✅ How JWT authentication works end-to-end  
✅ Why token persistence matters (UX)  
✅ How to intercept requests (clean code)  
✅ CORS errors and solutions  
✅ Protected routes (security)  
✅ Multi-service Docker Compose  
✅ Environment-based configuration  
✅ Request/response error handling  
✅ Async/await in React  
✅ TypeScript for type safety  

## 🎓 Next Steps

Once comfortable with this:

1. **Add token refresh** - Implement refresh_token endpoint
2. **Global error handling** - Toast notifications for all errors
3. **Loading states** - Show spinners during requests
4. **Form validation** - Real-time field validation
5. **React Query** - Server state management (not yet!)
6. **E2E tests** - Cypress/Playwright testing

## 📖 Resources

- [JWT.io](https://jwt.io) - Understand JWT structure
- [CORS MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [React Router Docs](https://reactrouter.com)
- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)

---

**Remember:** The goal is understanding **request flow**, not beautiful UI. Learn the mechanics first! 🚀
