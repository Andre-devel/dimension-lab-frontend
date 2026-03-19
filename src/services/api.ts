import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? ''
    const isAuthCheck = url.includes('/auth/me')
    const wasAuthenticated = useAuthStore.getState().isAuthenticated
    if (error.response?.status === 401 && !isAuthCheck && wasAuthenticated) {
      useAuthStore.getState().clearUser()
      window.location.href = '/'
    }
    return Promise.reject(error)
  },
)

export default api
