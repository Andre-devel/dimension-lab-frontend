import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? ''
    const isAuthCheck = url.includes('/auth/me')
    const status = error.response?.status

    if (status === 401 && !isAuthCheck && useAuthStore.getState().isAuthenticated) {
      useAuthStore.getState().clearUser()
      window.location.href = '/'
      return Promise.reject(error)
    }

    if (!status) {
      useToastStore.getState().show('Sem conexão com o servidor. Verifique sua internet.', 'error')
      return Promise.reject(error)
    }

    if (status >= 500) {
      useToastStore.getState().show('Erro interno no servidor. Tente novamente em instantes.', 'error')
    }

    return Promise.reject(error)
  },
)

export default api
