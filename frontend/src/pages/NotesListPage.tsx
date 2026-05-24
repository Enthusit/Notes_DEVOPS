import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchNotes, deleteNote } from '../services/notesService'
import { NoteResponse } from '../types'
import { useAuth } from '../context/AuthContext'
import { AxiosError } from 'axios'

/**
 * Notes List Page
 * 
 * Displays all notes for the logged-in user
 * 
 * Key concepts:
 * 1. useEffect fetches notes when page loads (depends on token)
 * 2. Axios interceptor automatically adds JWT token to request
 * 3. Backend filters by current_user (from JWT)
 * 4. Each note shows title, preview, created_at
 * 5. Links to view/edit individual notes
 * 6. Delete button for each note
 */
export const NotesListPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [notes, setNotes] = useState<NoteResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Fetch notes on page load
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setIsLoading(true)
        const fetchedNotes = await fetchNotes()
        setNotes(fetchedNotes)
      } catch (err) {
        const axiosError = err as AxiosError<{ detail: string }>
        if (axiosError.response?.status === 401) {
          // Token expired
          logout()
          navigate('/login')
        } else {
          setError('Failed to load notes')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [logout, navigate])

  const handleDelete = async (noteId: number) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return
    }

    try {
      await deleteNote(noteId)
      setNotes((prev) => prev.filter((note) => note.id !== noteId))
    } catch (err) {
      setError('Failed to delete note')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading notes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/notes/new')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                + New Note
              </button>
              <button
                onClick={logout}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
          <p className="text-gray-600 mt-2">Welcome, {user?.email}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {notes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No notes yet</p>
            <button
              onClick={() => navigate('/notes/new')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Create your first note
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
              >
                <h2
                  onClick={() => navigate(`/notes/${note.id}`)}
                  className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600"
                >
                  {note.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {note.content}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/notes/${note.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
