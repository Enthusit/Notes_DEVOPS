# Frontend Architecture & Request Flow Guide

## 🏗️ Complete Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                     │
│                   Running on localhost:5173                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    React Components                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │  LoginPage   │  │ NotesListPage│  │NoteEditorPage│  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  │         ↓ (useAuth)       ↓ (fetch notes)    ↓         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         ↓                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 AuthContext (State)                      │   │
│  │  - user: UserResponse | null                            │   │
│  │  - token: string | null                                 │   │
│  │  - isAuthenticated: boolean                             │   │
│  │  - login(), register(), logout()                        │   │
│  │                                                          │   │
│  │  KEY: Persists token to localStorage                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         ↓                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         API Services (authService, notesService)        │   │
│  │  - loginUser()                                          │   │
│  │  - registerUser()                                       │   │
│  │  - fetchNotes()                                         │   │
│  │  - createNote(), updateNote(), deleteNote()            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         ↓                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            Axios HTTP Client (apiClient)               │   │
│  │                                                          │   │
│  │  ┌─ REQUEST INTERCEPTOR ─────────────────────────────┐ │   │
│  │  │ 1. Get token from localStorage                  │ │   │
│  │  │ 2. Add Authorization: Bearer {token} header     │ │   │
│  │  │ 3. Send request                                 │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  │                      ↓↓↓                              │   │
│  │  ┌─ RESPONSE INTERCEPTOR ────────────────────────────┐ │   │
│  │  │ 1. Check status code                           │ │   │
│  │  │ 2. If 401: clear storage, redirect to login    │ │   │
│  │  │ 3. Otherwise: return response                  │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓↓↓ (HTTP)
                   ┌──────────────────────────┐
                   │  NETWORK / DOCKER BRIDGE │
                   │ (http://backend:8000)    │
                   └──────────────────────────┘
                              ↓↓↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI + Python)                   │
│                     Running on port 8000                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │             CORSMiddleware                              │   │
│  │  - Allows frontend to make cross-origin requests       │   │
│  │  - Sets Access-Control-Allow-Origin header            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         ↓                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   FastAPI Routes                        │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ /auth/login (POST)                                │ │   │
│  │  │ - Validate email/password                         │ │   │
│  │  │ - Create JWT token                                │ │   │
│  │  │ - Return {access_token, token_type}               │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ /auth/register (POST)                             │ │   │
│  │  │ - Validate email uniqueness                       │ │   │
│  │  │ - Hash password with bcrypt                       │ │   │
│  │  │ - Create user record                              │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ /notes (GET, POST, PUT, DELETE)                   │ │   │
│  │  │ - Dependency: get_current_user (JWT verification) │ │   │
│  │  │ - Filters by owner_id (from JWT)                  │ │   │
│  │  │ - Returns user's notes only                        │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         ↓                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          Database Layer (SQLAlchemy ORM)              │   │
│  │  - Query User table                                    │   │
│  │  - Query/Insert/Update/Delete Note records            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         ↓                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         PostgreSQL Database (Port 5432)               │   │
│  │  - users table: id, email, hashed_password, full_name│   │
│  │  - notes table: id, title, content, owner_id         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Request Flow Examples

### Flow 1: User Registration

```
FRONTEND                          BACKEND
  │                                 │
  ├─ User fills register form       │
  │                                 │
  ├─ Click "Register"               │
  │                                 │
  ├─ registerUser({                 │
  │    email: "bob@example.com",   │
  │    password: "pass123",         │
  │    full_name: "Bob Smith"       │
  │  })                             │
  │                                 │
  ├─────── POST /auth/register ────→│
  │       (JSON body, no auth)      │
  │                                 │
  │                              ┌─ Check email not taken
  │                              │  Hash password with bcrypt
  │                              │  Insert user into DB
  │                              │  Return UserResponse
  │                              │
  ├────────────────────────────────│
  │  {                             │
  │   "id": 42,                    │
  │   "email": "bob@example.com",  │
  │   "full_name": "Bob Smith",    │
  │   "created_at": "2024-05-20"   │
  │  }                             │
  │                                 │
  ├─ Show success message           │
  │  "Account created! Login now"  │
  │                                 │
  ├─ Redirect to /login             │
  │                                 │
```

### Flow 2: User Login (Token Creation)

```
FRONTEND                          BACKEND
  │                                 │
  ├─ User enters credentials        │
  │                                 │
  ├─ loginUser({                    │
  │    email: "bob@example.com",   │
  │    password: "pass123"          │
  │  })                             │
  │                                 │
  ├─────── POST /auth/login ───────→│
  │       (form data: username,     │
  │        password)                │
  │                                 │
  │                              ┌─ Query User by email
  │                              │  verify_password(input, hashed)
  │                              │  create_access_token({
  │                              │    sub: email,
  │                              │    user_id: 42,
  │                              │    exp: now+30min
  │                              │  })
  │                              │
  ├─────────────────────────────────│
  │  {                              │
  │   "access_token": "eyJhbGc..." │
  │   "token_type": "bearer"        │
  │  }                              │
  │                                 │
  ├─ AuthContext receives token     │
  │                                 │
  ├─ Store in localStorage:         │
  │  {                              │
  │   "access_token": "eyJhbGc..." │
  │   "user": {"id":42, "email"...} │
  │  }                              │
  │                                 │
  ├─ Set isAuthenticated = true     │
  │                                 │
  ├─ Redirect to /notes             │
  │                                 │
```

### Flow 3: Fetch Notes (Protected Request)

```
FRONTEND                                      BACKEND
  │                                             │
  ├─ NotesListPage mounts                      │
  │                                             │
  ├─ useEffect calls fetchNotes()              │
  │                                             │
  ├─ authService.fetchNotes()                  │
  │    → calls: apiClient.get('/notes')        │
  │                                             │
  ├─ REQUEST INTERCEPTOR runs:                 │
  │  ┌─ Get token: localStorage.getItem(...)  │
  │  │  token = "eyJhbGc..."                  │
  │  │                                         │
  │  │  Add header:                            │
  │  │  Authorization: Bearer eyJhbGc...      │
  │                                             │
  ├────── GET /notes ─────────────────────────→│
  │    (Headers: Authorization: Bearer...)     │
  │                                             │
  │                                          ┌─ get_current_user dependency
  │                                          │  ├─ Get token from header
  │                                          │  ├─ decode_access_token(token)
  │                                          │  │  ├─ jwt.decode(token, SECRET_KEY)
  │                                          │  │  └─ Extract: user_id=42
  │                                          │  │
  │                                          │  ├─ db.query(User).get(42)
  │                                          │  └─ Return User object
  │                                          │
  │                                          ├─ db.query(Note).filter(
  │                                          │    owner_id == 42
  │                                          │  )
  │                                          │  [List of Bob's notes]
  │                                          │
  ├──────────────────────────────────────────→│
  │  [                                         │
  │    {                                       │
  │     "id": 1,                              │
  │     "title": "Meeting notes",             │
  │     "content": "Discussed Q2...",         │
  │     "owner_id": 42,                       │
  │     "created_at": "2024-05-20"            │
  │    },                                      │
  │    {                                       │
  │     "id": 2,                              │
  │     "title": "TODO list",                 │
  │     ...                                    │
  │    }                                       │
  │  ]                                         │
  │                                             │
  ├─ RESPONSE INTERCEPTOR runs:                │
  │  Status: 200 ✓                             │
  │  Return response data                      │
  │                                             │
  ├─ setNotes(data)                            │
  │  Render note cards                         │
  │                                             │
```

### Flow 4: Create Note (Protected POST)

```
FRONTEND                                      BACKEND
  │                                             │
  ├─ NoteEditorPage form submit                │
  │                                             │
  ├─ createNote({                              │
  │    title: "Grocery list",                 │
  │    content: "Milk, eggs, bread"           │
  │  })                                         │
  │                                             │
  ├─ REQUEST INTERCEPTOR:                      │
  │  Add Authorization header                  │
  │                                             │
  ├────── POST /notes ──────────────────────→  │
  │    {                                       │
  │     "title": "Grocery list",              │
  │     "content": "Milk, eggs, bread"        │
  │    }                                       │
  │    Authorization: Bearer eyJ...            │
  │                                             │
  │                                          ┌─ Verify token → user_id=42
  │                                          │  Create Note(
  │                                          │    title="Grocery list",
  │                                          │    content="...",
  │                                          │    owner_id=42  ← FROM JWT
  │                                          │  )
  │                                          │  db.commit()
  │                                          │
  ├──────────────────────────────────────────→│
  │  {                                         │
  │   "id": 3,                                │
  │   "title": "Grocery list",                │
  │   "content": "Milk, eggs, bread",         │
  │   "owner_id": 42,                         │
  │   "created_at": "2024-05-20T14:30:00"     │
  │  }                                         │
  │                                             │
  ├─ navigate('/notes')                        │
  │  Redirect to list page                     │
  │                                             │
```

### Flow 5: Token Expiration (401 Error)

```
FRONTEND                                      BACKEND
  │                                             │
  ├─ 30 minutes pass (token expired)           │
  │                                             │
  ├─ User tries to fetch notes                 │
  │                                             │
  ├─ REQUEST INTERCEPTOR:                      │
  │  token = "eyJ..." (still valid locally)    │
  │  Add Authorization header                  │
  │                                             │
  ├─────── GET /notes ──────────────────────→  │
  │    Authorization: Bearer eyJ...             │
  │                                             │
  │                                          ┌─ decode_access_token(token)
  │                                          │  jwt.decode(...)
  │                                          │  JWTError: "Token expired"
  │                                          │  raise HTTPException(401)
  │                                          │
  ├──────────────────────────────────────────→│
  │  401 Unauthorized                          │
  │  {detail: "Invalid or expired token"}      │
  │                                             │
  ├─ RESPONSE INTERCEPTOR runs:                │
  │  if (status === 401) {                     │
  │    localStorage.clear()                    │
  │    isAuthenticated = false                 │
  │  }                                          │
  │                                             │
  ├─ PrivateRoute detects !isAuthenticated     │
  │                                             │
  ├─ Navigate('/login')                        │
  │  "Please login again"                      │
  │                                             │
```

---

## 🔐 Security Concepts

### Why Interceptors Matter

Without interceptors:
```typescript
// BAD: Manual token handling everywhere
const notes = await axios.get('/notes', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('access_token')}`
  }
})
```

**Problems:**
- 🔴 Easy to forget token on some requests
- 🔴 Copy-paste errors
- 🔴 Inconsistent behavior
- 🔴 Hard to update token handling globally

With interceptors:
```typescript
// GOOD: Automatic, consistent, centralized
const notes = await apiClient.get('/notes')
// Token injected automatically ✅
```

**Benefits:**
- ✅ Token added to EVERY request
- ✅ Consistent behavior
- ✅ Easy to debug (one place)
- ✅ Easy to add more logic (refresh tokens, etc)

### Why localStorage vs sessionStorage?

| Feature | localStorage | sessionStorage |
|---------|-------------|-----------------|
| **Duration** | Survives browser close | Cleared on tab close |
| **XSS Risk** | Higher (always accessible) | Same |
| **CSRF Protection** | Requires manual implementation | Requires manual implementation |
| **Use Case** | "Remember me" flows | Per-tab sessions |

**For this app:** localStorage (so user stays logged in after browser close)

**⚠️ Security Note:** In production, tokens should be stored in:
- HttpOnly cookies (not accessible to JS, prevents XSS)
- RAM only (cleared on close, requires refresh endpoint)

---

## 🧠 Understanding the Token

JWT structure: `header.payload.signature`

Decode at [jwt.io](https://jwt.io):

```json
// HEADER
{
  "alg": "HS256",
  "typ": "JWT"
}

// PAYLOAD
{
  "sub": "bob@example.com",
  "user_id": 42,
  "exp": 1716281400  // expires May 20, 2024 15:30
}

// SIGNATURE
hmac_sha256(
  base64(header) + "." + base64(payload),
  "super-secret-key-change-this"
)
```

**Backend verification:**
1. Receives token in Authorization header
2. Verifies signature (proves it wasn't tampered)
3. Checks expiration time
4. Extracts user_id and proceeds

**Frontend doesn't decode** - just sends it. Backend trusts it because of signature.

---

## 🚀 Performance Optimizations (Future)

Once this is working, you can add:

1. **Token Refresh**
   ```typescript
   // Instead of 30-min expiration:
   // - Short-lived access token (5 min)
   // - Long-lived refresh token (7 days)
   // - Auto-refresh when access_token expires
   ```

2. **Caching**
   ```typescript
   // Avoid fetching same data repeatedly
   // Simple in-memory cache or React Query
   ```

3. **Error Retry**
   ```typescript
   // Automatically retry failed requests
   // Exponential backoff for rate limits
   ```

4. **Request Debouncing**
   ```typescript
   // Avoid duplicate requests during fast clicks
   ```

---

## 🎯 Summary

**Key Takeaway:**
The frontend is not just a pretty UI. It's a **request orchestrator** that:
- ✅ Manages authentication state
- ✅ Automatically injects tokens
- ✅ Handles errors gracefully
- ✅ Persists sessions
- ✅ Protects routes

All of this enables the **seamless user experience** you expect from modern apps.

Next time you use any app with login/auth, you now understand what's happening behind the scenes! 🎉
