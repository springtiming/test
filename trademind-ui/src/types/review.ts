export interface Review {
  id: string
  decisionId: string
  authorId: string
  authorName: string
  authorAvatar: string
  authorLevel: number
  authorTitle: string
  score: number          // 1-10
  content: string
  createdAt: string
  likes: number
  likedBy: string[]      // 已点赞用户ID列表
}

export interface ReviewInput {
  decisionId: string
  content: string
  score: number
}
