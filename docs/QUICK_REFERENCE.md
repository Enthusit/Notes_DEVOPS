# 🎯 Quick Reference: Frontend Files & Concepts

## 📁 File Structure Map

```
frontend/
│
├─── Configuration Files (Set up once, rarely change)
│    ├── package.json              ← npm dependencies
│    ├── vite.config.ts            ← Vite bundler config
│    ├── tsconfig.json             ← TypeScript config
│    ├── tailwind.config.js        ← Tailwind CSS setup
│    ├── postcss.config.js         ← CSS preprocessing
│    ├── Dockerfile                ← Container image
│    └── .env, .env.local          ← Secrets & config
│
├─── Source Code (What you actually edit)
│    │
│    ├── src/types/
│    │   └── index.ts
│    │       ├── LoginCredentials      interface
│    │       ├── RegisterCredentials   interface
│    │       ├── NoteResponse          interface
│    │       └── AuthContextType       interface
│    │       
│    │       WHY: TypeScript for type safety
│    │       WHEN: Add new data types? Add here first!
│    │
│    ├── src/services/
│    │   ├── apiClient.ts
│    │   │   ├── Request Interceptor   (add JWT token)
│    │   │   ├── Response Interceptor  (handle 401)
│    │   │   └── Axios instance        (baseURL, headers)
│    │   │
│    │   │   WHY: Central place for API configuration
│    │   │   WHEN: Need to add headers? Change here!
│    │   │
│    │   ├── authService.ts
│    │   │   ├── loginUser()           POST /auth/login
│    │   │   ├── registerUser()        POST /auth/register
│    │   │   └── verifyToken()         (future)
│    │   │
│    │   │   WHY: Separate auth API calls
│    │   │   WHEN: Backend adds new auth endpoint? Add here!
│    │   │
│    │   └── notesService.ts
│    │       ├── fetchNotes()          GET /notes
│    │       ├── fetchNote()           GET /notes/:id
│    │       ├── createNote()          POST /notes
│    │       ├── updateNote()          PUT /notes/:id
│    │       └── deleteNote()          DELETE /notes/:id
│    │
│    │       WHY: Separate notes API calls
│    │       WHEN: Backend adds note features? Add here!
│    │
│    ├── src/context/
│    │   └── AuthContext.tsx
│    │       ├── AuthProvider          (wraps entire app)
│    │       ├── useAuth() hook        (access auth anywhere)
│    │       ├── State:                
│    │       │   ├── user
│    │       │   ├── token
│    │       │   └── isAuthenticated
│    │       ├── Methods:
│    │       │   ├── login()
│    │       │   ├── register()
│    │       │   └── logout()
│    │       └── localStorage persistence
│    │
│    │       WHY: Global state without Redux
│    │       WHEN: Need auth anywhere? Use useAuth()!
│    │
│    ├── src/components/
│    │   └── PrivateRoute.tsx
│    │       ├── Check isAuthenticated
│    │       ├── If yes → render component
│    │       ├── If no → redirect to /login
│    │       └── Show loading state
│    │
│    │       WHY: Protect routes from unauthorized access
│    │       WHEN: Add new protected page? Wrap in <PrivateRoute>!
│    │
│    ├── src/pages/
│    │   ├── LoginPage.tsx
│    │   │   ├── Email input
│    │   │   ├── Password input
│    │   │   ├── Submit form
│    │   │   └── Link to register
│    │   │
│    │   │   FLOW: Submit → login() → Store token → Navigate /notes
│    │   │   WHEN: User clicks "Login" button
│    │   │
│    │   ├── RegisterPage.tsx
│    │   │   ├── Full name input
│    │   │   ├── Email input
│    │   │   ├── Password input
│    │   │   ├── Submit form
│    │   │   └── Link to login
│    │   │
│    │   │   FLOW: Submit → register() → Show success → Navigate /login
│    │   │   WHEN: User clicks "Register" button
│    │   │
│    │   ├── NotesListPage.tsx
│    │   │   ├── Fetch notes on mount
│    │   │   ├── Display as grid
│    │   │   ├── Show title, preview, date
│    │   │   ├── "New Note" button
│    │   │   ├── Edit link (navigate to NoteEditorPage)
│    │   │   ├── Delete button (confirm → delete)
│    │   │   ├── Logout button
│    │   │   └── Welcome message
│    │   │
│    │   │   FLOW: useEffect → fetchNotes() → setNotes() → render grid
│    │   │   WHEN: User logged in, views dashboard
│    │   │
│    │   └── NoteEditorPage.tsx
│    │       ├── Check if /notes/new (create) or /notes/:id (edit)
│    │       ├── Title input
│    │       ├── Content textarea
│    │       ├── Submit button
│    │       ├── Cancel button
│    │       └── Handle both create & edit
│    │
│    │       FLOW: 
│    │         Create: Submit → createNote() → Navigate /notes
│    │         Edit:   Load → fetchNote() → Submit → updateNote() → Navigate /notes
│    │       WHEN: User creates new note or edits existing
│    │
│    ├── src/App.tsx
│    │   ├── Define all routes
│    │   ├── Public routes: /login, /register
│    │   ├── Protected routes: /notes, /notes/new, /notes/:id
│    │   ├── Redirect / to /notes
│    │   ├── Wrap with AuthProvider (context available to all)
│    │   └── Wrap protected routes with PrivateRoute
│    │
│    │   WHY: Central routing configuration
│    │   WHEN: Add new page? Define route here!
│    │
│    ├── src/main.tsx
│    │   ├── Import React + ReactDOM
│    │   ├── Import App component
│    │   ├── Mount to #root div
│    │   └── Strict mode for dev
│    │
│    │   WHY: Entry point, rarely modified
│    │
│    └── src/index.css
│        ├── Tailwind imports
│        ├── Global styles
│        └── Font setup
│
├─── Build Output (Auto-generated, don't edit)
│    ├── node_modules/             ← All dependencies
│    ├── dist/                     ← Production build
│    └── .vite/                    ← Vite cache
│
└─── Documentation (Learn from these!)
     ├── README.md                 ← Frontend guide
     ├── ../FRONTEND_ARCHITECTURE.md   ← Request flows
     ├── ../DOCKER_GUIDE.md        ← Container setup
     └── ../LEARNING_PATH.md       ← Full-stack journey
```

---

## 🔄 Common Modification Scenarios

### Scenario 1: "Add a new field to login form"

1. **Update types** (`src/types/index.ts`)
   ```typescript
   export interface LoginCredentials {
     email: string
     password: string
     // Add:
     rememberMe: boolean  // NEW
   }
   ```

2. **Update form** (`src/pages/LoginPage.tsx`)
   ```typescript
   const [formData, setFormData] = useState({
     email: '',
     password: '',
     rememberMe: false,  // NEW
   })
   
   // Add checkbox in JSX
   <input type="checkbox" name="rememberMe" ... />
   ```

3. **Update API call** (`src/services/authService.ts`)
   ```typescript
   // If backend needs it:
   const loginUser = async (credentials: LoginCredentials) => {
     const formData = new FormData()
     formData.append('username', credentials.email)
     formData.append('password', credentials.password)
     // Add if backend supports:
     if (credentials.rememberMe) {
       formData.append('remember_me', 'true')
     }
     // ...
   }
   ```

### Scenario 2: "Backend added a new /api endpoint"

1. **Add to services** (`src/services/notesService.ts` or new file)
   ```typescript
   export const newEndpoint = async (param: string) => {
     const response = await apiClient.post('/new-endpoint', { param })
     return response.data
   }
   ```

2. **Use in component** (pages/*.tsx)
   ```typescript
   const handleAction = async () => {
     try {
       const result = await newEndpoint('value')
       // Handle result
     } catch (err) {
       setError('Failed')
     }
   }
   ```

### Scenario 3: "Change loading indicator design"

**All loading UI handled in:**
- `src/pages/LoginPage.tsx` (line ~70)
- `src/pages/NotesListPage.tsx` (line ~65)
- `src/pages/NoteEditorPage.tsx` (line ~100)
- `src/components/PrivateRoute.tsx` (line ~25)

Replace loading div with your component everywhere.

### Scenario 4: "Add a new protected page (e.g., Settings)"

1. **Create page** (`src/pages/SettingsPage.tsx`)
   ```typescript
   export const SettingsPage: React.FC = () => {
     const { user } = useAuth()
     return <div>Settings for {user?.email}</div>
   }
   ```

2. **Add route** (`src/App.tsx`)
   ```typescript
   <Route
     path="/settings"
     element={
       <PrivateRoute>
         <SettingsPage />
       </PrivateRoute>
     }
   />
   ```

3. **Add navigation link** (any page)
   ```typescript
   <Link to="/settings">Settings</Link>
   ```

---

## 🧠 Mental Model: Data Flow

### When User Performs Action

```
USER ACTION (click, submit)
         ↓
REACT STATE UPDATES (formData, loading)
         ↓
API SERVICE CALL (authService.login, notesService.createNote)
         ↓
AXIOS REQUEST INTERCEPTOR (add token)
         ↓
HTTP REQUEST (POST /endpoint)
         ↓
BACKEND PROCESSES
         ↓
HTTP RESPONSE (200, 201, 401, 404, etc)
         ↓
AXIOS RESPONSE INTERCEPTOR (check status, clear storage if 401)
         ↓
CATCH ERROR OR RETURN DATA
         ↓
REACT STATE UPDATES (setNotes, setError, navigate)
         ↓
RE-RENDER COMPONENT (user sees result)
```

---

## ⚡ Performance Tips

### Do:
✅ Use `const` instead of `let` (immutability)
✅ Use `useCallback` for functions passed to children
✅ Use `React.memo` for expensive list items
✅ Implement pagination (don't fetch all notes at once)
✅ Debounce search inputs

### Don't:
❌ Create new objects/arrays in render
❌ Call API in every render (use useEffect)
❌ Store large data in localStorage (limit ~5MB)
❌ Create contexts for every state (too many re-renders)
❌ Fetch all data on app start

---

## 🐛 Debugging Checklist

### Frontend not loading?
```bash
npm install
npm run dev
```

### Styles not working?
```bash
# Check Tailwind classes are valid
# Check postcss.config.js is correct
# Check index.css has @tailwind imports
```

### API calls failing?
```javascript
// Add console.log to interceptor:
apiClient.interceptors.request.use((config) => {
  console.log('Request:', config.url, config.headers)
  return config
})
```

### State not updating?
```javascript
// Check:
// 1. setError() called (not setState typo)
// 2. useState initialized correctly
// 3. useEffect dependency array includes variables
```

### Authentication not working?
```javascript
// Check:
// 1. Token in localStorage: F12 → Storage → LocalStorage
// 2. Token in Authorization header: F12 → Network → POST /auth/login
// 3. Backend returns token (check response)
// 4. CORS headers present (F12 → Network → Response Headers)
```

---

## 📚 Key Files Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `types/index.ts` | Data types | Adding new fields to any data structure |
| `services/apiClient.ts` | HTTP setup | Need to add headers, change API URL |
| `services/authService.ts` | Auth API | Backend auth endpoint changes |
| `services/notesService.ts` | Notes API | Backend note endpoint changes |
| `context/AuthContext.tsx` | Auth state | Change auth flow, add new auth methods |
| `components/PrivateRoute.tsx` | Route protection | Change protection logic |
| `pages/LoginPage.tsx` | Login form | Change login UI/logic |
| `pages/RegisterPage.tsx` | Register form | Change register UI/logic |
| `pages/NotesListPage.tsx` | Dashboard | Change notes display |
| `pages/NoteEditorPage.tsx` | Note form | Change note UI/logic |
| `App.tsx` | Routes | Add new pages/routes |
| `.env` | Config | Change API URL, app settings |

---

## 🎯 Common Questions

**Q: Where's the Redux setup?**
A: Not needed! Context API + localStorage handles auth. Keep it simple for learning.

**Q: Why no global error toast?**
A: Every page handles errors differently. Add if you want (Toastify library).

**Q: Why pages are .tsx not .ts?**
A: They contain JSX (React components), so they're TypeScript JSX files.

**Q: Can I add a logout confirmation?**
A: Yes, add before `logout()`: `if (window.confirm('Really logout?')) { logout() }`

**Q: How do I prevent duplicate API calls?**
A: Use loading state: `if (isLoading) return`. Or use `AbortController`.

**Q: Why are types in a separate file?**
A: Single source of truth. Any component needing `NoteResponse` imports from one place.

---

## 🚀 Next Features (Starter Ideas)

1. **User Profile** - `/profile` page showing user info
2. **Edit Profile** - Change password, email, name
3. **Note Tags** - Organize notes with tags
4. **Search** - Filter notes by title/content
5. **Sort** - By date created, modified, alphabetical
6. **Favorites** - Star important notes
7. **Share** - Send note to other users
8. **Export** - Download as PDF/JSON
9. **Dark Mode** - Toggle theme
10. **Keyboard Shortcuts** - Ctrl+S to save, etc

---

## ✅ Quality Checklist

Before committing code:

- [ ] No console errors (F12 → Console)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] No unused variables (TypeScript will warn)
- [ ] No hardcoded values (use .env or constants)
- [ ] Error messages are user-friendly
- [ ] Loading states show for all async operations
- [ ] Works on different screen sizes (Tailwind responsive)
- [ ] Accessibility considered (alt text, aria labels)
- [ ] No sensitive data in localStorage (only token, user email)

---

## 📞 Getting Help

1. **Error in browser?** Open DevTools (F12), check Console and Network tabs
2. **Build error?** Run `npm install` to ensure dependencies
3. **Type error?** Hover over red squiggly line in VS Code
4. **Logic not working?** Add `console.log()` to trace execution
5. **Still stuck?** Check corresponding backend endpoint in `/docs`

---

**This is your frontend! Understand it deeply, modify it confidently, build with it creatively!** 🚀

---

## 📖 One-Minute Summary

- **Frontend:** React components, routes, forms, API calls
- **State:** AuthContext stores user + token, persists to localStorage
- **API:** Axios with interceptor auto-injects JWT token
- **Routes:** Public (/login, /register), Protected (/notes, /notes/new, /notes/:id)
- **CRUD:** Create, Read, Update, Delete notes via backend API
- **Error Handling:** Try/catch, user-friendly messages
- **Development:** npm run dev (hot reload), Docker for production

**That's it! You're ready to build!** 🎉
