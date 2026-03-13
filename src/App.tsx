import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'

export default function App() {
  useAuth()
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading)

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
      </div>
    )
  }

  return <RouterProvider router={router} />
}