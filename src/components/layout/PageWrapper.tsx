import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

interface Props {
  children: ReactNode
}

export function PageWrapper({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="min-h-screen pt-16 flex-1">{children}</main>
      <Footer />
    </div>
  )
}