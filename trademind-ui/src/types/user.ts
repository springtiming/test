export type UserRole = 'guest' | 'researcher' | 'admin'

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  avatar?: string
  level?: number
  title?: string
  createdAt: string
}

export interface ResearcherApplication {
  id: string
  userId: string
  username: string
  email: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
}
