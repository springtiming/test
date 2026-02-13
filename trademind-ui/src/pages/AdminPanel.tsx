import { Shield, Check, X, Clock, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export default function AdminPanel() {
  const { user, canApproveResearcher, pendingApplications, approveApplication, rejectApplication } = useAuth()

  // 权限检查
  if (!canApproveResearcher) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-heading flex items-center gap-3">
            <Shield className="w-7 h-7 text-primary" />
            管理员面板
          </h1>
          <p className="text-subtext text-sm mt-2">管理研究员申请和系统设置</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-custom p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-heading">{pendingApplications.length}</div>
                <div className="text-xs text-subtext">待审核申请</div>
              </div>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-custom p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-heading">2</div>
                <div className="text-xs text-subtext">研究员总数</div>
              </div>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-custom p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-gold" />
              </div>
              <div>
                <div className="text-2xl font-bold text-heading">{user?.username}</div>
                <div className="text-xs text-subtext">当前管理员</div>
              </div>
            </div>
          </div>
        </div>

        {/* 待审核申请列表 */}
        <div className="bg-surface border border-border rounded-custom overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-bold text-heading flex items-center gap-2">
              <Clock className="w-4 h-4 text-subtext" />
              待审核的研究员申请
            </h2>
          </div>

          {pendingApplications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-selected rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-subtext" />
              </div>
              <p className="text-subtext">暂无待审核的申请</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingApplications.map((application) => (
                <div key={application.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${application.username}`}
                        className="w-12 h-12 rounded-full bg-border"
                        alt={application.username}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-heading">{application.username}</span>
                          <span className="text-xs text-subtext bg-selected px-2 py-0.5 rounded">
                            待审核
                          </span>
                        </div>
                        <div className="text-xs text-subtext mb-2">{application.email}</div>
                        <div className="text-sm text-text bg-bg rounded-custom p-3">
                          <p className="font-medium text-subtext text-xs mb-1">申请理由：</p>
                          {application.reason}
                        </div>
                        <div className="text-xs text-subtext mt-2">
                          申请时间: {new Date(application.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => approveApplication(application.id)}
                        className="flex items-center gap-1.5 bg-success/20 hover:bg-success/30 text-success px-4 py-2 rounded-custom text-sm font-medium transition"
                      >
                        <Check className="w-4 h-4" />
                        通过
                      </button>
                      <button
                        onClick={() => rejectApplication(application.id)}
                        className="flex items-center gap-1.5 bg-danger/20 hover:bg-danger/30 text-danger px-4 py-2 rounded-custom text-sm font-medium transition"
                      >
                        <X className="w-4 h-4" />
                        拒绝
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
