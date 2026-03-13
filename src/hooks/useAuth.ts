import { useEffect } from 'react'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { setUser, setAuthLoading } = useAuthStore()

  useEffect(() => {
    authService
      .me()
      .then(setUser)
      .catch(() => {
        // not authenticated — no action needed
      })
      .finally(() => setAuthLoading(false))
  }, [setUser, setAuthLoading])
}