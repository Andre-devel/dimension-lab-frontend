const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export function fileUrl(path: string | undefined | null): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return API_BASE + path
}