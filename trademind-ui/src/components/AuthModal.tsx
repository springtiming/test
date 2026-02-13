import { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMode = 'login' | 'register'

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('两次输入的密码不一致')
          setLoading(false)
          return
        }
        if (formData.password.length < 6) {
          setError('密码至少6位')
          setLoading(false)
          return
        }
        const success = await register(formData.username, formData.email, formData.password)
        if (success) {
          onClose()
          resetForm()
        } else {
          setError('该邮箱已被注册')
        }
      } else {
        const success = await login(formData.email, formData.password)
        if (success) {
          onClose()
          resetForm()
        } else {
          setError('邮箱或密码错误')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ username: '', email: '', password: '', confirmPassword: '' })
    setError('')
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* 模态框 */}
      <div className="relative bg-surface border border-border rounded-custom w-full max-w-md mx-4 shadow-2xl">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-subtext hover:text-heading transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 标题 */}
        <div className="p-6 pb-0">
          <h2 className="text-xl font-bold text-heading">
            {mode === 'login' ? '欢迎回来' : '创建账号'}
          </h2>
          <p className="text-subtext text-sm mt-1">
            {mode === 'login' ? '登录您的平台账号' : '注册成为平台用户'}
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm text-subtext mb-1.5">用户名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="输入用户名"
                  className="w-full bg-input-bg border border-selected rounded-custom py-2.5 pl-10 pr-4 text-text text-sm placeholder:text-subtext focus:outline-none focus:border-primary transition"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-subtext mb-1.5">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="输入邮箱地址"
                  className="w-full bg-input-bg border border-selected rounded-custom py-2.5 pl-10 pr-4 text-text text-sm placeholder:text-subtext focus:outline-none focus:border-primary transition"
                  required
                />
            </div>
          </div>

          <div>
            <label className="block text-sm text-subtext mb-1.5">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="输入密码"
                  className="w-full bg-input-bg border border-selected rounded-custom py-2.5 pl-10 pr-10 text-text text-sm placeholder:text-subtext focus:outline-none focus:border-primary transition"
                  required
                />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext hover:text-heading transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm text-subtext mb-1.5">确认密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="再次输入密码"
                  className="w-full bg-input-bg border border-selected rounded-custom py-2.5 pl-10 pr-4 text-text text-sm placeholder:text-subtext focus:outline-none focus:border-primary transition"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-custom">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-custom text-sm transition disabled:opacity-50"
          >
            {loading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
          </button>
        </form>

        {/* 切换模式 */}
        <div className="px-6 pb-6 text-center text-sm">
          <span className="text-subtext">
            {mode === 'login' ? '还没有账号？' : '已有账号？'}
          </span>
          <button
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            className="text-primary hover:underline ml-1"
          >
            {mode === 'login' ? '立即注册' : '立即登录'}
          </button>
        </div>

        {/* 测试账号提示 */}
        <div className="px-6 pb-6 border-t border-border pt-4">
          <p className="text-xs text-subtext text-center mb-2">测试账号：</p>
          <div className="text-xs text-subtext space-y-1">
            <p>管理员: admin@trademind.com</p>
            <p>研究员: satoshi@trademind.com</p>
            <p className="text-subtext">密码任意（至少6位）</p>
          </div>
        </div>
      </div>
    </div>
  )
}
