import { useState } from 'react'
import { X, Award, FileText } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface ApplyResearcherModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ApplyResearcherModal({ isOpen, onClose }: ApplyResearcherModalProps) {
  const { applyForResearcher, user } = useAuth()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (reason.trim().length < 20) return

    setLoading(true)
    const success = await applyForResearcher(reason)
    setLoading(false)

    if (success) {
      setSubmitted(true)
    }
  }

  const handleClose = () => {
    setReason('')
    setSubmitted(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-surface border border-border rounded-custom w-full max-w-lg mx-4 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-subtext hover:text-heading transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          // 提交成功
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-bold text-heading mb-2">申请已提交</h2>
            <p className="text-subtext text-sm mb-6">
              感谢您的申请！管理员将在 1-3 个工作日内审核您的申请。
              审核结果将通过邮件通知您。
            </p>
            <button
              onClick={handleClose}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-custom text-sm transition"
            >
              知道了
            </button>
          </div>
        ) : (
          // 申请表单
          <>
            <div className="p-6 pb-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-heading">申请成为研究员</h2>
                  <p className="text-subtext text-sm">成为研究员后可以发表评价和参与互动</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* 用户信息 */}
              <div className="bg-bg rounded-custom p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-subtext">用户名</span>
                  <span className="text-heading">{user?.username}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-subtext">邮箱</span>
                  <span className="text-heading">{user?.email}</span>
                </div>
              </div>

              {/* 申请理由 */}
              <div>
                <label className="flex items-center gap-2 text-sm text-subtext mb-1.5">
                  <FileText className="w-4 h-4" />
                  申请理由
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="请简要介绍您的交易经验、专业背景，以及为什么想成为研究员...（至少20字）"
                  rows={4}
                  className="w-full bg-input-bg border border-selected rounded-custom py-2.5 px-4 text-text text-sm placeholder:text-subtext focus:outline-none focus:border-primary transition resize-none"
                  required
                />
                <div className="text-xs text-subtext mt-1 text-right">
                  {reason.length} / 20 字（最少）
                </div>
              </div>

              {/* 研究员权益 */}
              <div className="bg-primary/10 border border-primary/20 rounded-custom p-4">
                <h4 className="text-sm font-bold text-heading mb-2">研究员权益</h4>
                <ul className="text-xs text-subtext space-y-1">
                  <li>• 可以对决策发表专业评价</li>
                  <li>• 可以为其他评价点赞</li>
                  <li>• 获得研究员身份标识</li>
                  <li>• 参与更高权限的评审互动</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading || reason.trim().length < 20}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-custom text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '提交中...' : '提交申请'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
