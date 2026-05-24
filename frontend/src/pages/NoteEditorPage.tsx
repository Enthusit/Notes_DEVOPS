import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createNote,
  fetchNote,
  updateNote,
} from '../services/notesService'
import { NoteResponse } from '../types'
import { AxiosError } from 'axios'

/**
 * Note Editor Page
 * 
 * Create new note or edit existing note
 * 
 * Routes:
 * - /notes/new → Create new note
 * - /notes/:id → Edit existing note (fetches from API)
 * 
 * Key concepts:
 * 1. Conditional rendering: new vs edit mode
 * 2. Fetch single note for editing
 * 3. Form submission with API call
 * 4. Error handling for not found (404)
 */
export const NoteEditorPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [note, setNote] = useState<NoteResponse | null>(null)
  const [isLoading, setIsLoading] = useState(!!id)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })

  // Load note if editing
  useEffect(() => {
    if (!id) return

    const loadNote = async () => {
      try {
        setIsLoading(true)
        const fetchedNote = await fetchNote(parseInt(id))
        setNote(fetchedNote)
        setFormData({
          title: fetchedNote.title,
          content: fetchedNote.content,
        })
      } catch (err) {
        const axiosError = err as AxiosError<{ detail: string }>
        if (axiosError.response?.status === 404) {
          setError('Note not found')
        } else {
          setError('Failed to load note')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadNote()
  }, [id])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.currentTarget
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      if (id) {
        // Update existing note
        await updateNote(parseInt(id), formData)
      } else {
        // Create new note
        await createNote(formData)
      }

      navigate('/notes')
    } catch (err) {
      const axiosError = err as AxiosError<{ detail: string }>
      setError(
        axiosError.response?.data?.detail || 'Failed to save note'
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading note...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Edit Note' : 'Create Note'}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Note title"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder="Note content"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {isSaving ? 'Saving...' : 'Save Note'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/notes')}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
