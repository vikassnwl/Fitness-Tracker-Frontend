import axiosClient from './axiosClient'

export const fetchExercises = () => axiosClient.get('/exercises/')
export const createExercise = (payload) => axiosClient.post('/exercises/', payload)
export const updateExercise = (id, payload) => axiosClient.put(`/exercises/${id}/`, payload)
export const deleteExercise = (id) => axiosClient.delete(`/exercises/${id}/`)

export const fetchExercise = (id) => axiosClient.get(`/exercises/${id}/`)
export const searchExercises = (query) =>
	axiosClient.get('/exercises/search/', { params: { q: query } })

export const fetchWorkoutExercises = (workoutId) =>
	axiosClient.get('/workout-exercises/', { params: { workout: workoutId } })
export const createWorkoutExercise = (payload) => axiosClient.post('/workout-exercises/', payload)
export const updateWorkoutExercise = (id, payload) =>
	axiosClient.put(`/workout-exercises/${id}/`, payload)
export const deleteWorkoutExercise = (id) => axiosClient.delete(`/workout-exercises/${id}/`)

export const createExerciseSet = (payload) => axiosClient.post('/exercise-sets/', payload)
export const updateExerciseSet = (id, payload) => axiosClient.put(`/exercise-sets/${id}/`, payload)
export const deleteExerciseSet = (id) => axiosClient.delete(`/exercise-sets/${id}/`)

export const reorderWorkoutExercises = (items) =>
	axiosClient.post('/workout-exercises/reorder/', items)

export const fetchSplitDayExercises = (split) =>
	axiosClient.get('/split-day-exercises/', { params: split ? { split } : {} })
export const createSplitDayExercise = (payload) =>
	axiosClient.post('/split-day-exercises/', payload)
export const deleteSplitDayExercise = (id) =>
	axiosClient.delete(`/split-day-exercises/${id}/`)
export const reorderSplitDayExercises = (items) =>
	axiosClient.post('/split-day-exercises/reorder/', items)
