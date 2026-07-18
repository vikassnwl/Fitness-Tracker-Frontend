import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
const TOKEN_KEY = 'auth-token'

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const savedToken = localStorage.getItem(TOKEN_KEY)
if (savedToken) {
  axiosClient.defaults.headers.common.Authorization = `Token ${savedToken}`
}

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthEndpoint = String(error.config?.url || '').includes('/auth/')
      if (!isAuthEndpoint) {
        localStorage.removeItem(TOKEN_KEY)
        delete axiosClient.defaults.headers.common.Authorization
        if (window.location.pathname !== '/login') {
          window.location.assign('/login')
        }
      }
    }
    return Promise.reject(error)
  }
)

export default axiosClient
