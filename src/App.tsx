import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { useAuth } from '@/hooks/useAuth'
import Toast from '@/components/ui/Toast'

export default function App() {
  useAuth()
  return (
    <>
      <RouterProvider router={router} />
      <Toast />
    </>
  )
}