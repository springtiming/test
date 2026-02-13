/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Review, ReviewInput } from '../types/review'
import { useAuth } from './AuthContext'

interface ReviewContextType {
  reviews: Review[]
  getReviewsByDecisionId: (decisionId: string) => Review[]
  addReview: (input: ReviewInput) => boolean
  deleteReview: (reviewId: string) => boolean
  toggleLike: (reviewId: string) => boolean
  isLikedByCurrentUser: (reviewId: string) => boolean
}

const ReviewContext = createContext<ReviewContextType | null>(null)

// 模拟初始评价数据
const initialReviews: Review[] = [
  {
    id: 'r1',
    decisionId: 'T2039',
    authorId: '2',
    authorName: 'Satoshi_Nakamoto',
    authorAvatar: 'Felix',
    authorLevel: 5,
    authorTitle: '首席研究员',
    score: 9.5,
    content: '入场点位非常精准，正好是在支撑位确认后的反弹。止盈位置也很理智，避开了上方的强压力区。',
    createdAt: '2023-10-27 14:30',
    likes: 45,
    likedBy: []
  },
  {
    id: 'r2',
    decisionId: 'T2039',
    authorId: '3',
    authorName: 'BearHunter',
    authorAvatar: 'Bear',
    authorLevel: 2,
    authorTitle: '见习研究员',
    score: 7.0,
    content: '虽然盈利了，但是入场时的波动率太高，风险收益比其实不太理想。',
    createdAt: '2023-10-27 15:10',
    likes: 12,
    likedBy: []
  },
  {
    id: 'r3',
    decisionId: 'T2038',
    authorId: '2',
    authorName: 'Satoshi_Nakamoto',
    authorAvatar: 'Felix',
    authorLevel: 5,
    authorTitle: '首席研究员',
    score: 6.0,
    content: '做空时机选择欠妥，ETH当时处于上升趋势中，逆势操作风险较大。',
    createdAt: '2023-10-27 16:00',
    likes: 8,
    likedBy: []
  }
]

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const { user, canSubmitReview, canLikeReview, canDeleteReview } = useAuth()

  const getReviewsByDecisionId = useCallback((decisionId: string): Review[] => {
    return reviews.filter(r => r.decisionId === decisionId)
  }, [reviews])

  const addReview = useCallback((input: ReviewInput): boolean => {
    if (!user || !canSubmitReview) return false
    if (!input.content.trim() || input.content.length < 10) return false
    if (input.score < 1 || input.score > 10) return false

    const newReview: Review = {
      id: `r_${Date.now()}`,
      decisionId: input.decisionId,
      authorId: user.id,
      authorName: user.username,
      authorAvatar: user.avatar || user.username,
      authorLevel: user.level || 1,
      authorTitle: user.title || '研究员',
      score: input.score,
      content: input.content.trim(),
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-'),
      likes: 0,
      likedBy: []
    }

    setReviews(prev => [newReview, ...prev])
    return true
  }, [user, canSubmitReview])

  const deleteReview = useCallback((reviewId: string): boolean => {
    const review = reviews.find(r => r.id === reviewId)
    if (!review) return false
    if (!canDeleteReview(review.authorId)) return false

    setReviews(prev => prev.filter(r => r.id !== reviewId))
    return true
  }, [reviews, canDeleteReview])

  const toggleLike = useCallback((reviewId: string): boolean => {
    if (!user || !canLikeReview) return false

    setReviews(prev => prev.map(review => {
      if (review.id !== reviewId) return review

      const isLiked = review.likedBy.includes(user.id)
      if (isLiked) {
        return {
          ...review,
          likes: review.likes - 1,
          likedBy: review.likedBy.filter(id => id !== user.id)
        }
      } else {
        return {
          ...review,
          likes: review.likes + 1,
          likedBy: [...review.likedBy, user.id]
        }
      }
    }))
    return true
  }, [user, canLikeReview])

  const isLikedByCurrentUser = useCallback((reviewId: string): boolean => {
    if (!user) return false
    const review = reviews.find(r => r.id === reviewId)
    return review ? review.likedBy.includes(user.id) : false
  }, [user, reviews])

  return (
    <ReviewContext.Provider value={{
      reviews,
      getReviewsByDecisionId,
      addReview,
      deleteReview,
      toggleLike,
      isLikedByCurrentUser
    }}>
      {children}
    </ReviewContext.Provider>
  )
}

export function useReview() {
  const context = useContext(ReviewContext)
  if (!context) {
    throw new Error('useReview must be used within a ReviewProvider')
  }
  return context
}
