import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? ''
    const isAuthCheck = url.includes('/auth/me')
    if (error.response?.status === 401 && !isAuthCheck) {
      window.location.href = '/'
    }
    return Promise.reject(error)
  },
)

export default api
