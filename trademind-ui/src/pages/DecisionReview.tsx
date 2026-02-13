import { useState, useMemo } from 'react'
import { Lock, ImagePlus } from 'lucide-react'
import DecisionCard from '../components/DecisionCard'
import ReviewItem from '../components/ReviewItem'
import { ChartContainer } from '../components/chart'
import { DecisionDetailModal, DecisionLogPanel } from '../components/decision'
import { TabButton, ChatInput, ScorePicker } from '../components/UIComponents'
import { ChartProvider, useChart } from '../contexts/ChartContext'
import { useAuth } from '../contexts/AuthContext'
import { useReview } from '../contexts/ReviewContext'
import { mockDecisionLogs, mockDecisionStats } from '../data/mockData'
import type { DecisionSummary } from '../types/decision'

// 从 mockDecisionLogs 生成决策摘要
const decisions: DecisionSummary[] = mockDecisionLogs.map((log) => ({
  id: log.id,
  symbol: log.symbol,
  direction: log.direction,
  researcher: log.researcherName,
  time: getRelativeTime(log.createdAt),
  pnl: log.pnl ?? 0,
  score: log.score ?? 0,
}))

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  return `${diffDays}天前`
}

export default function DecisionReview() {
  const [activeId, setActiveId] = useState('T2039')
  const [sortTab, setSortTab] = useState<'hot' | 'new'>('hot')
  const [inputContent, setInputContent] = useState('')
  const [inputScore, setInputScore] = useState(0)
  const { isAuthenticated, canSubmitReview, canLikeReview, canDeleteReview } = useAuth()
  const { getReviewsByDecisionId, addReview, deleteReview, toggleLike, isLikedByCurrentUser } = useReview()

  // 获取当前选中的决策
  const activeDecision = useMemo(() => {
    return decisions.find(d => d.id === activeId)
  }, [activeId])

  // 获取当前决策的评价列表
  const currentReviews = useMemo(() => {
    const reviews = getReviewsByDecisionId(activeId)

    if (sortTab === 'hot') {
      return [...reviews].sort((a, b) => b.likes - a.likes)
    } else {
      return [...reviews].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }
  }, [activeId, sortTab, getReviewsByDecisionId])

  // 提交评价
  const handleSubmit = () => {
    if (inputContent.length < 10 || inputContent.length > 500 || inputScore === 0) {
      return
    }

    const success = addReview({
      decisionId: activeId,
      content: inputContent,
      score: inputScore
    })

    if (success) {
      setInputContent('')
      setInputScore(0)
    }
  }

  // 删除评价
  const handleDelete = (reviewId: string) => {
    if (window.confirm('确定要删除这条评价吗？')) {
      deleteReview(reviewId)
    }
  }

  // 点赞评价
  const handleLike = (reviewId: string) => {
    toggleLike(reviewId)
  }

  // 处理决策日志点击
  const handleLogClick = (logId: string) => {
    setActiveId(logId)
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* 左侧边栏 - 币种选择 */}
      <aside className="w-48 border-r border-border/50 bg-bg flex flex-col">
        <div className="flex-1 overflow-y-auto py-2">
          {decisions.map((d) => (
            <DecisionCard
              key={d.id}
              {...d}
              active={activeId === d.id}
              onClick={() => setActiveId(d.id)}
            />
          ))}
        </div>
      </aside>

      {/* 中间主内容区 - 图表+评论 */}
      <main className="flex-1 flex flex-col bg-bg overflow-hidden relative">
        {/* 可滚动区域 */}
        <div className="flex-1 overflow-y-auto">
          {/* 图表容器 - 使用 ChartProvider 包裹 */}
          <div className="p-6">
            <ChartProvider
              initialSymbol={activeDecision?.symbol}
              initialDirection={activeDecision?.direction}
            >
              <ChartContainer />
              <DecisionDetailModalHost />
            </ChartProvider>
          </div>

          {/* 评价列表 */}
          <div className="px-6 pb-32">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">研究员评价 ({currentReviews.length})</h3>
              <div className="flex bg-surface rounded-custom p-1">
                <TabButton active={sortTab === 'hot'} onClick={() => setSortTab('hot')}>热门</TabButton>
                <TabButton active={sortTab === 'new'} onClick={() => setSortTab('new')}>最新</TabButton>
              </div>
            </div>

            {currentReviews.length === 0 ? (
              <div className="text-center py-12 text-subtext">
                暂无评价，成为第一个评价者吧！
              </div>
            ) : (
              currentReviews.map((review) => (
                <ReviewItem
                  key={review.id}
                  id={review.id}
                  authorId={review.authorId}
                  avatar={review.authorAvatar}
                  name={review.authorName}
                  level={`等级 ${review.authorLevel}`}
                  title={review.authorTitle}
                  score={review.score}
                  content={review.content}
                  date={review.createdAt}
                  likes={review.likes}
                  liked={isLikedByCurrentUser(review.id)}
                  canLike={canLikeReview}
                  canDelete={canDeleteReview(review.authorId)}
                  onLike={() => handleLike(review.id)}
                  onDelete={() => handleDelete(review.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* 底部发送栏 */}
        <div className="absolute bottom-0 w-full bg-bg border-t border-border p-4 px-6 z-20">
          {canSubmitReview ? (
            <div className="flex flex-col gap-3">
              {/* 第一行：输入框 */}
              <ChatInput
                placeholder="发表你的专业评审意见..."
                value={inputContent}
                onChange={setInputContent}
              />
              {/* 第二行：图片上传、评分、发送按钮 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* 图片上传按钮 */}
                  <button
                    className="flex items-center gap-1.5 text-subtext hover:text-heading transition-colors"
                    title="上传图片"
                  >
                    <ImagePlus className="w-5 h-5" />
                  </button>
                  {/* 评分选择器 */}
                  <ScorePicker score={inputScore} onScoreChange={setInputScore} />
                </div>
                {/* 发送按钮 */}
                <button
                  onClick={handleSubmit}
                  disabled={inputContent.length < 10 || inputContent.length > 500 || inputScore === 0}
                  className={`font-bold px-6 py-2 rounded-custom text-sm transition shadow-lg ${inputContent.length >= 10 && inputContent.length <= 500 && inputScore > 0
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-primary/20 text-subtext cursor-not-allowed'
                    }`}
                >
                  发送
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2 text-subtext text-sm">
              <Lock className="w-4 h-4" />
              {isAuthenticated ? (
                <span>成为研究员后才能发表评价</span>
              ) : (
                <span>登录并成为研究员后才能发表评价</span>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 右侧边栏 - 决策日志 */}
      <aside className="w-72 border-l border-border/50 bg-bg flex flex-col">
        <DecisionLogPanel
          logs={mockDecisionLogs}
          stats={mockDecisionStats}
          activeLogId={activeId}
          onLogClick={handleLogClick}
        />
      </aside>
    </div>
  )
}

function DecisionDetailModalHost() {
  const { selectedDecisionId, closeDecisionDetail, isDetailLoading, detailError, decisionDetail } = useChart()

  return (
    <DecisionDetailModal
      open={selectedDecisionId !== null}
      onClose={closeDecisionDetail}
      loading={isDetailLoading}
      error={detailError}
      detail={decisionDetail}
    />
  )
}
