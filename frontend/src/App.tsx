import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute } from './components/PrivateRoute'

// Pages
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { NotesListPage } from './pages/NotesListPage'
import { NoteEditorPage } from './pages/NoteEditorPage'

/**
 * Main App Component
 * 
 * Routing structure:
 * - /login → Public (unauthenticated users)
 * - /register → Public (unauthenticated users)
 * - /notes → Protected (authenticated users only)
 * - /notes/new → Protected (create note)
 * - /notes/:id → Protected (edit note)
 * - / → Redirects to /notes
 * 
 * Key concepts:
 * 1. AuthProvider wraps entire app - provides context to all pages
 * 2. PrivateRoute component enforces authentication
 * 3. If unauthenticated user tries to access /notes, redirects to /login
 * 4. AuthContext handles token persistence via localStorage
 */
export function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/notes"
            element={
              <PrivateRoute>
                <NotesListPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/notes/new"
            element={
              <PrivateRoute>
                <NoteEditorPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/notes/:id"
            element={
              <PrivateRoute>
                <NoteEditorPage />
              </PrivateRoute>
            }
          />

          {/* Redirect root to notes */}
          <Route path="/" element={<Navigate to="/notes" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/notes" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
