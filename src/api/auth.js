import axiosClient from './axiosClient'

export function login(username, password) {
  return axiosClient.post('/auth/login/', { username, password })
}

export function register(username, password, email = '') {
  return axiosClient.post('/auth/register/', { username, password, email })
}

export function fetchMe() {
  return axiosClient.get('/auth/me/')
}

export function logout() {
  return axiosClient.post('/auth/logout/')
}
