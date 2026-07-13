import axiosClient from './axiosClient'

export const fetchMeals = () => axiosClient.get('/meals/')
export const createMeal = (payload) => axiosClient.post('/meals/', payload)
export const updateMeal = (id, payload) => axiosClient.put(`/meals/${id}/`, payload)
export const deleteMeal = (id) => axiosClient.delete(`/meals/${id}/`)
export const fetchFavorites = () => axiosClient.get('/favorite-meals/')
export const createFavorite = (payload) => axiosClient.post('/favorite-meals/', payload)

export const fetchDietLog = (date) => axiosClient.get(`/diet-logs/${date}/`)
export const saveDietLog = (date, payload) => axiosClient.put(`/diet-logs/${date}/`, { date, ...payload })
export const deleteDietLog = (date) => axiosClient.delete(`/diet-logs/${date}/`)
