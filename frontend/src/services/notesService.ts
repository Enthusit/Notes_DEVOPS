import apiClient from './apiClient'
import {
  NoteCreate,
  NoteUpdate,
  NoteResponse,
} from '../types'

/**
 * Notes API Service
 * 
 * All endpoints require authentication (JWT token)
 * Token is automatically injected by apiClient interceptor
 */

/**
 * Fetch all notes for current user
 * 
 * GET /notes
 * 
 * Backend filters by current_user (via JWT token)
 */
export const fetchNotes = async (): Promise<NoteResponse[]> => {
  const response = await apiClient.get('/notes')
  return response.data
}

/**
 * Fetch single note by ID
 * 
 * GET /notes/{note_id}
 * 
 * Backend verifies ownership before returning
 */
export const fetchNote = async (noteId: number): Promise<NoteResponse> => {
  const response = await apiClient.get(`/notes/${noteId}`)
  return response.data
}

/**
 * Create a new note
 * 
 * POST /notes
 * 
 * Backend automatically sets owner_id from JWT token
 */
export const createNote = async (
  payload: NoteCreate
): Promise<NoteResponse> => {
  const response = await apiClient.post('/notes', payload)
  return response.data
}

/**
 * Update note
 * 
 * PUT /notes/{note_id}
 * 
 * Backend verifies ownership before updating
 */
export const updateNote = async (
  noteId: number,
  payload: NoteUpdate
): Promise<NoteResponse> => {
  const response = await apiClient.put(`/notes/${noteId}`, payload)
  return response.data
}

/**
 * Delete note
 * 
 * DELETE /notes/{note_id}
 * 
 * Backend verifies ownership before deleting
 */
export const deleteNote = async (noteId: number): Promise<void> => {
  await apiClient.delete(`/notes/${noteId}`)
}
