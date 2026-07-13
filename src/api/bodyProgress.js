import axiosClient from './axiosClient'

export const fetchBodyEntries = () => axiosClient.get('/body-entries/')
export const createBodyEntry = (payload) => axiosClient.post('/body-entries/', payload)
export const updateBodyEntry = (id, payload) => axiosClient.put(`/body-entries/${id}/`, payload)
export const deleteBodyEntry = (id) => axiosClient.delete(`/body-entries/${id}/`)
