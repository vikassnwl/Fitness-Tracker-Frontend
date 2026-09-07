import axiosClient from './axiosClient'

export const fetchDayNotes = (params = {}) =>
  axiosClient.get('/day-notes/', { params })

export const createDayNote = (payload) =>
  axiosClient.post('/day-notes/', payload)

export const updateDayNote = (id, payload) =>
  axiosClient.put(`/day-notes/${id}/`, payload)

export const deleteDayNote = (id) =>
  axiosClient.delete(`/day-notes/${id}/`)

export const DAY_NOTE_REASONS = [
  { value: 'injury', label: 'Injury' },
  { value: 'sick', label: 'Sick' },
  { value: 'travel', label: 'Travel' },
  { value: 'event', label: 'Event' },
  { value: 'rest', label: 'Rest' },
  { value: 'other', label: 'Other' },
]
