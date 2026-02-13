import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, LogIn, Moon, Sun, LogOut, Shield, Award, ChevronDown, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import AuthModal from './AuthModal'
import ApplyResearcherModal from './ApplyResearcherModal'

export default function Header() {
  const location = useLocation()
  const { user, isAuthenticated, logout, canApplyForResearcher, canApproveResearcher, pendingApplications } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => location.pathname === path

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getRoleBadge = () => {
    if (!user) return null
    switch (user.role) {
      case 'admin':
        return <span className="text-xs bg-danger/20 text-danger px-1.5 py-0.5 rounded">管理员</span>
      case 'researcher':
        return <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">研究员</span>
      default:
        return <span className="text-xs bg-selected text-subtext px-1.5 py-0.5 rounded">访客</span>
    }
  }

  return (
    <>
      <header className="h-16 bg-bg border-b border-border/80 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tight text-heading flex items-center">
            <LayoutGrid className="w-5 h-5 text-primary mr-2" />
            交易智研
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-text">
            <Link
              to="/"
              className={`hover:text-primary transition ${isActive('/') ? 'text-heading' : ''}`}
            >
              浏览决策
            </Link>
            <Link
              to="/decisions"
              className={`hover:text-primary transition ${isActive('/decisions') ? 'text-heading' : ''}`}
            >
              决策库
            </Link>
            <Link
              to="/analytics"
              className={`hover:text-primary transition ${isActive('/analytics') ? 'text-heading' : ''}`}
            >
              复盘分析
            </Link>
            {canApproveResearcher && (
              <Link
                to="/admin"
                className={`hover:text-primary transition flex items-center gap-1 ${isActive('/admin') ? 'text-heading' : ''}`}
              >
                管理面板
                {pendingApplications.length > 0 && (
                  <span className="bg-danger text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {pendingApplications.length}
                  </span>
                )}
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="text-subtext hover:text-heading transition"
            title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isAuthenticated && user ? (
            // 已登录状态
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-selected px-3 py-1.5 rounded-custom transition"
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar || user.username}`}
                  className="w-8 h-8 rounded-full bg-border"
                  alt={user.username}
                />
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-heading">{user.username}</div>
                  <div className="text-xs text-subtext">{user.role === 'researcher' ? `等级 ${user.level} ${user.title}` : user.role === 'admin' ? '管理员' : '访客'}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-subtext transition ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* 下拉菜单 */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-custom shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-heading">{user.username}</span>
                      {getRoleBadge()}
                    </div>
                    <div className="text-xs text-subtext mt-0.5">{user.email}</div>
                  </div>

                  <div className="py-1">
                    {canApplyForResearcher && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          setShowApplyModal(true)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-subtext hover:text-heading hover:bg-selected transition flex items-center gap-2"
                      >
                        <Award className="w-4 h-4" />
                        申请成为研究员
                      </button>
                    )}

                    {canApproveResearcher && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-2 text-left text-sm text-subtext hover:text-heading hover:bg-selected transition flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        管理面板
                        {pendingApplications.length > 0 && (
                          <span className="bg-danger text-white text-xs px-1.5 py-0.5 rounded-full ml-auto">
                            {pendingApplications.length}
                          </span>
                        )}
                      </Link>
                    )}

                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2 text-left text-sm text-subtext hover:text-heading hover:bg-selected transition flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      账号设置
                    </Link>

                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        logout()
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-danger/10 transition flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // 未登录状态
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-surface border border-border text-heading hover:border-primary/40 px-5 py-2 rounded-custom text-sm font-bold flex items-center gap-2 transition"
            >
              <LogIn className="w-4 h-4" />
              登录
            </button>
          )}
        </div>
      </header>

      {/* 模态框 */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <ApplyResearcherModal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} />
    </>
  )
}
