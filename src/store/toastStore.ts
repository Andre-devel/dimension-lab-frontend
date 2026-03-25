import { create } from 'zustand'

export type ToastType = 'error' | 'warning' | 'info'

interface ToastState {
  message: string | null
  type: ToastType
  show: (message: string, type?: ToastType) => void
  clear: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'error',
  show: (message, type = 'error') => set({ message, type }),
  clear: () => set({ message: null }),
}))