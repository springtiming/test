// 决策方向
export type Direction = 'LONG' | 'SHORT'

// 决策状态
export type DecisionStatus = 'open' | 'closed' | 'cancelled'

// 决策日志
export interface Decision {
  id: string
  symbol: string
  direction: Direction
  status: DecisionStatus
  researcherId: string
  researcherName: string
  researcherAvatar?: string
  // 入场信息
  entryTime: string
  entryPrice: number
  entryReason: string
  // 出场信息（如果已平仓）
  exitTime?: string
  exitPrice?: number
  exitReason?: string
  // 盈亏
  pnl?: number           // 盈亏百分比
  pnlAmount?: number     // 盈亏金额
  // 风控
  stopLoss?: number
  takeProfit?: number
  // 评分
  score?: number
  reviewCount?: number
  // 时间
  createdAt: string
  updatedAt: string
}

// 决策统计
export interface DecisionStats {
  totalTrades: number
  winRate: number        // 胜率
  profitFactor: number   // 盈亏比
  avgPnl: number         // 平均盈亏
  maxDrawdown: number    // 最大回撤
  sharpeRatio: number    // 夏普比率
  totalPnl: number       // 总盈亏
}

// 决策摘要（用于左侧列表）
export interface DecisionSummary {
  id: string
  symbol: string
  direction: Direction
  researcher: string
  time: string
  pnl: number
  score: number
}

// 决策筛选条件
export interface DecisionFilter {
  symbol?: string
  direction?: Direction
  status?: DecisionStatus
  researcherId?: string
  dateFrom?: string
  dateTo?: string
  sort?: 'hot' | 'new' | 'pnl' | 'score'
  page?: number
  pageSize?: number
}
