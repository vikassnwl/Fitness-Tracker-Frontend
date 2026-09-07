import axiosClient from './axiosClient'

export const fetchWorkouts = () => axiosClient.get('/workouts/')
export const fetchWorkout = (id) => axiosClient.get(`/workouts/${id}/`)
export const createWorkout = (payload) => axiosClient.post('/workouts/', payload)
export const updateWorkout = (id, payload) => axiosClient.put(`/workouts/${id}/`, payload)
export const saveWorkoutLog = (id, sets) => axiosClient.put(`/workouts/${id}/save_log/`, { sets })
export const deleteWorkout = (id) => axiosClient.delete(`/workouts/${id}/`)
export const fetchDashboard = () => axiosClient.get('/dashboard/')
export const fetchAnalytics = () => axiosClient.get('/analytics/')
