import type { Time } from 'lightweight-charts'
import type { CandleData, EquityPoint, TradeMarker, Timeframe } from '../types/chart'
import type { Decision, DecisionSummary, DecisionStats } from '../types/decision'

// 生成模拟 K 线数据 - 支持 3m 和 4h 双周期
export function generateCandlestickData(
  symbol: string,
  timeframe: Timeframe = '3m',
  count: number = 200
): CandleData[] {
  const timeframeMinutes: Record<Timeframe, number> = {
    '3m': 3,
    '4h': 240,
  }

  const data: CandleData[] = []
  const basePrice = symbol.includes('BTC') ? 67000 : symbol.includes('ETH') ? 3500 : 150
  const volatility = basePrice * (timeframe === '4h' ? 0.03 : 0.015) // 4小时周期波动更大

  let currentPrice = basePrice
  const now = new Date()
  const intervalMs = timeframeMinutes[timeframe] * 60 * 1000

  for (let i = count; i >= 0; i--) {
    const time = Math.floor((now.getTime() - i * intervalMs) / 1000) as Time

    const change = (Math.random() - 0.5) * volatility
    const open = currentPrice
    const close = open + change
    const high = Math.max(open, close) + Math.random() * volatility * 0.3
    const low = Math.min(open, close) - Math.random() * volatility * 0.3
    const volume = Math.floor(Math.random() * 1000000) + 100000

    data.push({
      time,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    })

    currentPrice = close
  }

  return data
}

// 生成交易标记 - 对应后端决策格式
export function generateTradeMarkers(
  data: CandleData[],
  direction: 'LONG' | 'SHORT'
): TradeMarker[] {
  if (data.length < 20) return []

  const buyIndex = Math.floor(data.length * 0.7)
  const sellIndex = Math.floor(data.length * 0.9)

  const buyCandle = data[buyIndex]
  const sellCandle = data[sellIndex]

  if (direction === 'LONG') {
    return [
      {
        time: buyCandle.time,
        type: 'buy',
        action: 'buy_to_enter',
        price: buyCandle.low,
        label: '做多入场',
        confidence: 0.85,
        leverage: 10,
        hardTakeProfit: buyCandle.close * 1.05,
        hardStopLoss: buyCandle.close * 0.97,
      },
      {
        time: sellCandle.time,
        type: 'sell',
        action: 'sell_to_enter',
        price: sellCandle.high,
        label: '平仓',
      },
    ]
  } else {
    return [
      {
        time: buyCandle.time,
        type: 'sell',
        action: 'sell_to_enter',
        price: buyCandle.high,
        label: '做空入场',
        confidence: 0.78,
        leverage: 8,
        hardTakeProfit: buyCandle.close * 0.95,
        hardStopLoss: buyCandle.close * 1.03,
      },
      {
        time: sellCandle.time,
        type: 'buy',
        action: 'buy_to_enter',
        price: sellCandle.low,
        label: '平仓',
      },
    ]
  }
}

// 生成收益曲线数据
export function generateEquityCurve(
  startTime: number,
  count: number = 100,
  intervalMinutes: number = 3
): EquityPoint[] {
  const data: EquityPoint[] = []
  let equity = 10000 // 初始资金
  let maxEquity = equity

  for (let i = 0; i < count; i++) {
    const time = Math.floor((startTime + i * intervalMinutes * 60 * 1000) / 1000) as Time

    // 模拟收益变化
    const change = (Math.random() - 0.48) * 100 // 略微正向偏移
    equity = Math.max(equity + change, 0)
    maxEquity = Math.max(maxEquity, equity)

    const drawdown = maxEquity > 0 ? ((maxEquity - equity) / maxEquity) * 100 : 0

    data.push({
      time,
      equity: Math.round(equity * 100) / 100,
      drawdown: Math.round(drawdown * 100) / 100,
    })
  }

  return data
}

// 模拟决策日志数据 - 对应后端 BacktestDecisionRecord 格式
export const mockDecisionLogs: Decision[] = [
  {
    id: 'T2039',
    symbol: 'BTC/USDT',
    direction: 'LONG',
    status: 'closed',
    researcherId: 'R101',
    researcherName: 'DeepSeek AI',
    researcherAvatar: 'AI',
    entryTime: '2024-01-20T14:30:00Z',
    entryPrice: 65800,
    entryReason: 'EMA20 上穿 EMA50，MACD 金叉，RSI(14) 从超卖区回升至 45',
    exitTime: '2024-01-20 18:45:00',
    exitPrice: 67250,
    exitReason: '触发硬止盈 (hard_take_profit)',
    pnl: 5.23,
    pnlAmount: 1450,
    stopLoss: 64500,
    takeProfit: 67500,
    score: 9.2,
    reviewCount: 12,
    createdAt: '2024-01-20 14:30:00',
    updatedAt: '2024-01-20 18:45:00',
  },
  {
    id: 'T2038',
    symbol: 'ETH/USDT',
    direction: 'SHORT',
    status: 'closed',
    researcherId: 'R101',
    researcherName: 'DeepSeek AI',
    researcherAvatar: 'AI',
    entryTime: '2024-01-20T10:15:00Z',
    entryPrice: 3520,
    entryReason: 'RSI(7) 超买达 78，4小时级别形成顶背离，ATR 扩大',
    exitTime: '2024-01-20 12:30:00',
    exitPrice: 3562,
    exitReason: '触发硬止损 (hard_stop_loss)',
    pnl: -1.20,
    pnlAmount: -42,
    stopLoss: 3560,
    takeProfit: 3400,
    score: 6.5,
    reviewCount: 8,
    createdAt: '2024-01-20 10:15:00',
    updatedAt: '2024-01-20 12:30:00',
  },
  {
    id: 'T2035',
    symbol: 'SOL/USDT',
    direction: 'LONG',
    status: 'closed',
    researcherId: 'R101',
    researcherName: 'DeepSeek AI',
    researcherAvatar: 'AI',
    entryTime: '2024-01-19T22:00:00Z',
    entryPrice: 142,
    entryReason: '3分钟级别回调至布林带下轨，RSI(7) 超卖，4小时趋势仍向上',
    exitTime: '2024-01-20 08:30:00',
    exitPrice: 159.6,
    exitReason: '触发软止盈 (soft_take_profit)',
    pnl: 12.4,
    pnlAmount: 17.6,
    stopLoss: 136,
    takeProfit: 160,
    score: 8.9,
    reviewCount: 15,
    createdAt: '2024-01-19 22:00:00',
    updatedAt: '2024-01-20 08:30:00',
  },
  {
    id: 'T2034',
    symbol: 'BTC/USDT',
    direction: 'SHORT',
    status: 'open',
    researcherId: 'R101',
    researcherName: 'DeepSeek AI',
    researcherAvatar: 'AI',
    entryTime: '2024-01-20T20:00:00Z',
    entryPrice: 67500,
    entryReason: '4小时MACD顶背离，RSI(14) 超买达 72，接近前高阻力 68000',
    stopLoss: 68500,
    takeProfit: 65000,
    score: 7.8,
    reviewCount: 5,
    createdAt: '2024-01-20 20:00:00',
    updatedAt: '2024-01-20 20:00:00',
  },
]

// 决策摘要列表（用于左侧显示）
export const mockDecisionSummaries: DecisionSummary[] = mockDecisionLogs.map((log) => ({
  id: log.id,
  symbol: log.symbol,
  direction: log.direction,
  researcher: log.researcherName,
  time: getRelativeTime(log.createdAt),
  pnl: log.pnl ?? 0,
  score: log.score ?? 0,
}))

// 决策统计数据
export const mockDecisionStats: DecisionStats = {
  totalTrades: 156,
  winRate: 62.5,
  profitFactor: 1.85,
  avgPnl: 3.2,
  maxDrawdown: 12.5,
  sharpeRatio: 1.42,
  totalPnl: 45.8,
}

// 辅助函数：计算相对时间
function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

// 获取决策日志详情
export function getDecisionLogById(id: string): Decision | undefined {
  return mockDecisionLogs.find((log) => log.id === id)
}

// 可用的交易对 - 对应后端白名单
export const AVAILABLE_SYMBOLS = [
  'BTC/USDT',
  'ETH/USDT',
  'SOL/USDT',
  'BNB/USDT',
  'DOGE/USDT',
  'XRP/USDT',
]
