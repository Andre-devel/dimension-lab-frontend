export type UserRole = 'CLIENT' | 'ADMIN'

export interface User {
  id: string
  name?: string
  email: string
  phone?: string
  role: UserRole
}
