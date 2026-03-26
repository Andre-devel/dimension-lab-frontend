import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { router } from '@/router'
import { useAuth } from '@/hooks/useAuth'
import Toast from '@/components/ui/Toast'
import { setVisitorId } from '@/utils/analytics'

export default function App() {
  useAuth()

  useEffect(() => {
    FingerprintJS.load()
      .then(fp => fp.get())
      .then(({ visitorId }) => setVisitorId(visitorId))
      .catch(() => {})
  }, [])

  return (
    <>
      <RouterProvider router={router} />
      <Toast />
    </>
  )
}