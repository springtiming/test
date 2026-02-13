import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Settings, User, Mail, Lock, Camera, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

type SettingTab = 'profile' | 'security'

export default function SettingsPage() {
  const { user, isAuthenticated, updateProfile, updatePassword, updateEmail } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingTab>('profile')

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-heading flex items-center gap-3">
            <Settings className="w-7 h-7 text-primary" />
            账号设置
          </h1>
          <p className="text-subtext text-sm mt-2">管理您的个人信息和账号安全</p>
        </div>

        <div className="flex gap-6">
          {/* 侧边导航 */}
          <div className="w-48 shrink-0">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-custom text-sm font-medium transition ${
                  activeTab === 'profile'
                    ? 'bg-selected text-heading'
                    : 'text-subtext hover:text-heading hover:bg-selected/50'
                }`}
              >
                <User className="w-4 h-4" />
                个人资料
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-custom text-sm font-medium transition ${
                  activeTab === 'security'
                    ? 'bg-selected text-heading'
                    : 'text-subtext hover:text-heading hover:bg-selected/50'
                }`}
              >
                <Lock className="w-4 h-4" />
                账号安全
              </button>
            </nav>
          </div>

          {/* 内容区 */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <ProfileSettings user={user} onUpdateProfile={updateProfile} />
            )}
            {activeTab === 'security' && (
              <SecuritySettings
                user={user}
                onUpdatePassword={updatePassword}
                onUpdateEmail={updateEmail}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

// 个人资料设置
function ProfileSettings({
  user,
  onUpdateProfile
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>
  onUpdateProfile: (data: { username?: string; avatar?: string }) => Promise<boolean>
}) {
  const [username, setUsername] = useState(user.username)
  const [avatar, setAvatar] = useState(user.avatar || user.username)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    setMessage(null)

    const success = await onUpdateProfile({ username: username.trim(), avatar })

    if (success) {
      setMessage({ type: 'success', text: '个人资料已更新' })
    } else {
      setMessage({ type: 'error', text: '更新失败，请重试' })
    }
    setLoading(false)
  }

  // 预设头像列表
  const presetAvatars = ['Felix', 'Bear', 'Whale', 'Master', 'Alex', 'Moon', 'Star', 'Crypto']

  return (
    <div className="bg-surface border border-border rounded-custom">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="font-bold text-heading">个人资料</h2>
        <p className="text-xs text-subtext mt-1">更新您的昵称和头像</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* 头像设置 */}
        <div>
          <label className="block text-sm text-subtext mb-3">头像</label>
          <div className="flex items-start gap-6">
            <div className="relative">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar}`}
                className="w-20 h-20 rounded-full bg-border"
                alt="当前头像"
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-subtext mb-3">选择预设头像或输入自定义种子</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {presetAvatars.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAvatar(preset)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition ${
                      avatar === preset ? 'border-primary' : 'border-transparent hover:border-selected'
                    }`}
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${preset}`}
                      className="w-full h-full"
                      alt={preset}
                    />
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="输入自定义头像种子"
                className="w-full bg-input-bg border border-selected rounded-custom py-2 px-3 text-text text-sm placeholder:text-subtext focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>
        </div>

        {/* 昵称 */}
        <div>
          <label className="block text-sm text-subtext mb-1.5">昵称</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入您的昵称"
              className="w-full bg-input-bg border border-selected rounded-custom py-2.5 pl-10 pr-4 text-text text-sm placeholder:text-subtext focus:outline-none focus:border-primary transition"
              required
            />
          </div>
        </div>

        {/* 提示消息 */}
        {message && (
          <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-custom ${
            message.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}>
            {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-custom text-sm transition disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存更改'}
        </button>
      </form>
    </div>
  )
}

// 账号安全设置
function SecuritySettings({
  user,
  onUpdatePassword,
  onUpdateEmail
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>
  onUpdatePassword: (oldPassword: string, newPassword: string) => Promise<boolean>
  onUpdateEmail: (newEmail: string, password: string) => Promise<boolean>
}) {
  // 修改密码
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 换绑邮箱
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  })
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: '新密码至少6位' })
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: '两次输入的密码不一致' })
      return
    }

    setPasswordLoading(true)
    const success = await onUpdatePassword(passwordForm.oldPassword, passwordForm.newPassword)

    if (success) {
      setPasswordMessage({ type: 'success', text: '密码已更新' })
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } else {
      setPasswordMessage({ type: 'error', text: '原密码错误' })
    }
    setPasswordLoading(false)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailMessage(null)

    if (!emailForm.newEmail.includes('@')) {
      setEmailMessage({ type: 'error', text: '请输入有效的邮箱地址' })
      return
    }

    setEmailLoading(true)
    const success = await onUpdateEmail(emailForm.newEmail, emailForm.password)

    if (success) {
      setEmailMessage({ type: 'success', text: '邮箱已更新' })
      setEmailForm({ newEmail: '', password: '' })
    } else {
      setEmailMessage({ type: 'error', text: '密码错误或邮箱已被使用' })
    }
    setEmailLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* 修改密码 */}
      <div className="bg-surface border border-border rounded-custom">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-bold text-heading">修改密码</h2>
          <p className="text-xs text-subtext mt-1">定期更换密码可以提高账号安全性</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-subtext mb-1.5">当前密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" />
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                placeholder="输入当前密码"
                className="w-full bg-input-bg border border-selected rounded-custom py-2.5 pl-10 pr-4 text-text text-sm placeholder:text-subtext focus:outline-none focus:border-primary transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-subtext mb-1.5">新密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" />
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="输入新密码（至少6位）"
                className="w-full bg-input-bg border border-selected rounded-custom py-2.5 pl-10 pr-4 text-text text-sm placeholder:text-subtext focus:outline-none focus:border-primary transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-subtext mb-1.5">确认新密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" />
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="再次输入新密码"
                className="w-full bg-input-bg border border-selected rounded-custom py-2.5 pl-10 pr-4 text-text text-sm placeholder:text-subtext focus:outline-none focus:border-primary transition"
                required
              />
            </div>
          </div>

          {passwordMessage && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-custom ${
              passwordMessage.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            }`}>
              {passwordMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {passwordMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={passwordLoading}
            className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-custom text-sm transition disabled:opacity-50"
          >
            {passwordLoading ? '更新中...' : '更新密码'}
          </button>
        </form>
      </div>

      {/* 换绑邮箱 */}
      <div className="bg-surface border border-border rounded-custom">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-bold text-heading">换绑邮箱</h2>
          <p className="text-xs text-subtext mt-1">
            当前邮箱: <span className="text-heading">{user.email}</span>
          </p>
        </div>

        <form onSubmit={handleEmailSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-subtext mb-1.5">新邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" />
              <input
                type="email"
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                placeholder="输入新邮箱地址"
                className="w-full bg-input-bg border border-selected rounded-custom py-2.5 pl-10 pr-4 text-text text-sm placeholder:text-subtext focus:outline-none focus:border-primary transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-subtext mb-1.5">当前密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" />
              <input
                type="password"
                value={emailForm.password}
                onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                placeholder="输入当前密码以确认"
                className="w-full bg-input-bg border border-selected rounded-custom py-2.5 pl-10 pr-4 text-text text-sm placeholder:text-subtext focus:outline-none focus:border-primary transition"
                required
              />
            </div>
          </div>

          {emailMessage && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-custom ${
              emailMessage.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            }`}>
              {emailMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {emailMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={emailLoading}
            className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-custom text-sm transition disabled:opacity-50"
          >
            {emailLoading ? '更新中...' : '更新邮箱'}
          </button>
        </form>
      </div>
    </div>
  )
}
