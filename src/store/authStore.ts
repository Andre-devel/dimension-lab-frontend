import { create } from 'zustand'
import type { User } from '@/types/user'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isAuthLoading: boolean
  setUser: (user: User | null) => void
  clearUser: () => void
  setAuthLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthLoading: true,
  setUser: (user) => set({ user, isAuthenticated: user !== null }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  setAuthLoading: (loading) => set({ isAuthLoading: loading }),
}))