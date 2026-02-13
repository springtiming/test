/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User, ResearcherApplication } from '../types/user'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  applyForResearcher: (reason: string) => Promise<boolean>
  // 用户设置
  updateProfile: (data: { username?: string; avatar?: string }) => Promise<boolean>
  updatePassword: (oldPassword: string, newPassword: string) => Promise<boolean>
  updateEmail: (newEmail: string, password: string) => Promise<boolean>
  // 管理员功能
  pendingApplications: ResearcherApplication[]
  approveApplication: (applicationId: string) => void
  rejectApplication: (applicationId: string) => void
  // 权限检查
  canSubmitReview: boolean
  canLikeReview: boolean
  canDeleteReview: (reviewUserId: string) => boolean
  canApplyForResearcher: boolean
  canApproveResearcher: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

// 模拟数据存储
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@trademind.com',
    role: 'admin',
    avatar: 'Admin',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    username: 'Satoshi_Nakamoto',
    email: 'satoshi@trademind.com',
    role: 'researcher',
    avatar: 'Felix',
    level: 5,
    title: '首席研究员',
    createdAt: '2024-01-15'
  }
]

// 模拟密码存储 (实际应用中密码应该哈希存储在后端)
const mockPasswords: Record<string, string> = {
  '1': 'admin123',
  '2': 'satoshi123'
}

const mockApplications: ResearcherApplication[] = [
  {
    id: 'app1',
    userId: 'user3',
    username: 'NewTrader',
    email: 'newtrader@example.com',
    reason: '我有3年的加密货币交易经验，希望能成为研究员分享我的分析见解。',
    status: 'pending',
    createdAt: '2024-01-20'
  },
  {
    id: 'app2',
    userId: 'user4',
    username: 'CryptoAnalyst',
    email: 'analyst@example.com',
    reason: '专业金融分析师，擅长技术分析和基本面研究。',
    status: 'pending',
    createdAt: '2024-01-21'
  }
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [applications, setApplications] = useState<ResearcherApplication[]>(mockApplications)

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // 模拟登录验证
    const foundUser = mockUsers.find(u => u.email === email)
    if (foundUser && password.length >= 6) {
      setUser(foundUser)
      return true
    }
    // 模拟普通用户登录
    if (email && password.length >= 6) {
      const newUser: User = {
        id: `user_${Date.now()}`,
        username: email.split('@')[0],
        email,
        role: 'guest',
        avatar: email.split('@')[0],
        createdAt: new Date().toISOString()
      }
      mockUsers.push(newUser)
      mockPasswords[newUser.id] = password
      setUser(newUser)
      return true
    }
    return false
  }, [])

  const register = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
    // 检查邮箱是否已存在
    if (mockUsers.some(u => u.email === email)) {
      return false
    }
    if (username && email && password.length >= 6) {
      const newUser: User = {
        id: `user_${Date.now()}`,
        username,
        email,
        role: 'guest',
        avatar: username,
        createdAt: new Date().toISOString()
      }
      mockUsers.push(newUser)
      mockPasswords[newUser.id] = password
      setUser(newUser)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (data: { username?: string; avatar?: string }): Promise<boolean> => {
    if (!user) return false

    const updatedUser = { ...user }
    if (data.username) updatedUser.username = data.username
    if (data.avatar) updatedUser.avatar = data.avatar

    // 更新 mockUsers 中的数据
    const index = mockUsers.findIndex(u => u.id === user.id)
    if (index !== -1) {
      mockUsers[index] = updatedUser
    }

    setUser(updatedUser)
    return true
  }, [user])

  const updatePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false

    // 验证旧密码 (模拟验证，实际应在后端)
    const storedPassword = mockPasswords[user.id]
    if (storedPassword && storedPassword !== oldPassword) {
      return false
    }

    // 更新密码
    mockPasswords[user.id] = newPassword
    return true
  }, [user])

  const updateEmail = useCallback(async (newEmail: string, password: string): Promise<boolean> => {
    if (!user) return false

    // 检查邮箱是否已被使用
    if (mockUsers.some(u => u.email === newEmail && u.id !== user.id)) {
      return false
    }

    // 验证密码 (模拟验证)
    const storedPassword = mockPasswords[user.id]
    if (storedPassword && storedPassword !== password) {
      return false
    }

    // 更新邮箱
    const updatedUser = { ...user, email: newEmail }
    const index = mockUsers.findIndex(u => u.id === user.id)
    if (index !== -1) {
      mockUsers[index] = updatedUser
    }

    setUser(updatedUser)
    return true
  }, [user])

  const applyForResearcher = useCallback(async (reason: string): Promise<boolean> => {
    if (!user || user.role !== 'guest') return false

    const application: ResearcherApplication = {
      id: `app_${Date.now()}`,
      userId: user.id,
      username: user.username,
      email: user.email,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    setApplications(prev => [...prev, application])
    return true
  }, [user])

  const approveApplication = useCallback((applicationId: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        // 更新用户角色
        const targetUser = mockUsers.find(u => u.id === app.userId)
        if (targetUser) {
          targetUser.role = 'researcher'
          targetUser.level = 1
          targetUser.title = '初级研究员'
        }
        return { ...app, status: 'approved' as const, reviewedAt: new Date().toISOString() }
      }
      return app
    }))
  }, [])

  const rejectApplication = useCallback((applicationId: string) => {
    setApplications(prev => prev.map(app =>
      app.id === applicationId
        ? { ...app, status: 'rejected' as const, reviewedAt: new Date().toISOString() }
        : app
    ))
  }, [])

  // 权限检查
  const canSubmitReview = user?.role === 'researcher' || user?.role === 'admin'
  const canLikeReview = user?.role === 'researcher' || user?.role === 'admin'
  const canDeleteReview = (reviewUserId: string) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return user.role === 'researcher' && user.id === reviewUserId
  }
  const canApplyForResearcher = user?.role === 'guest'
  const canApproveResearcher = user?.role === 'admin'

  const pendingApplications = applications.filter(app => app.status === 'pending')

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
      updatePassword,
      updateEmail,
      applyForResearcher,
      pendingApplications,
      approveApplication,
      rejectApplication,
      canSubmitReview,
      canLikeReview,
      canDeleteReview,
      canApplyForResearcher,
      canApproveResearcher
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
