import type { Time } from 'lightweight-charts'

// 时间周期 - 对应后端系统的双周期架构
export type Timeframe = '3m' | '4h'

export const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  '3m': '3分钟',
  '4h': '4小时',
}

export const TIMEFRAME_MINUTES: Record<Timeframe, number> = {
  '3m': 3,
  '4h': 240,
}

// 指标类型 - 对应后端系统的技术指标
export type IndicatorType = 'EMA' | 'MACD' | 'RSI' | 'ATR' | 'BOLL'

export const INDICATOR_LABELS: Record<IndicatorType, string> = {
  EMA: 'EMA (20/50)',
  MACD: 'MACD (12,26,9)',
  RSI: 'RSI (7/14)',
  ATR: 'ATR (14)',
  BOLL: '布林带 (20,2)',
}

// 主图指标（叠加在K线上）
export const MAIN_CHART_INDICATORS: IndicatorType[] = ['EMA', 'BOLL']

// 副图指标（独立子图）
export const SUB_CHART_INDICATORS: IndicatorType[] = ['MACD', 'RSI', 'ATR']

// 决策动作类型 - 对应后端 LLM 输出
export type DecisionAction = 'buy_to_enter' | 'sell_to_enter' | 'hold'

// 交易标记
export interface TradeMarker {
  time: Time
  type: 'buy' | 'sell'
  action: DecisionAction
  price: number
  label?: string
  confidence?: number      // 置信度
  leverage?: number        // 杠杆
  hardTakeProfit?: number  // 硬止盈
  hardStopLoss?: number    // 硬止损
  decisionId?: number      // 对应后端决策记录 ID（用于点选查看详情）
  approvedByGuard?: boolean
  rationale?: string
  rejectionReason?: string
  responseHash?: string
}

// 收益曲线数据点
export interface EquityPoint {
  time: Time
  equity: number      // 账户净值
  drawdown: number    // 回撤百分比
}

// K线数据（扩展lightweight-charts类型）
export interface CandleData {
  time: Time
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

// MACD 数据 (12, 26, 9)
export interface MACDData {
  time: Time
  macd: number      // MACD 线 (DIF)
  signal: number    // 信号线 (DEA)
  histogram: number // 柱状图
}

// RSI 数据
export interface RSIData {
  time: Time
  rsi7: number      // RSI(7)
  rsi14: number     // RSI(14)
}

// ATR 数据
export interface ATRData {
  time: Time
  value: number
}

// 移动平均线数据
export interface MAData {
  time: Time
  value: number
}

// EMA 数据组（20和50周期）
export interface EMAGroupData {
  ema20: MAData[]
  ema50: MAData[]
}

// 布林带数据 (20, 2)
export interface BollingerData {
  time: Time
  upper: number
  middle: number
  lower: number
}

// 图表配置
export interface ChartConfig {
  timeframe: Timeframe
  indicators: IndicatorType[]
  showVolume: boolean
  showEquityCurve: boolean
}

// 默认图表配置
export const DEFAULT_CHART_CONFIG: ChartConfig = {
  timeframe: '3m',
  indicators: ['EMA'],
  showVolume: true,
  showEquityCurve: false,
}

// EMA 周期配置
export const EMA_PERIODS = [20, 50] as const

// EMA 颜色配置
export const EMA_COLORS: Record<number, string> = {
  20: '#f59e0b',  // 黄色 - EMA20
  50: '#3b82f6',  // 蓝色 - EMA50
}

// RSI 周期配置
export const RSI_PERIODS = [7, 14] as const

// RSI 颜色配置
export const RSI_COLORS = {
  rsi7: '#a855f7',        // 紫色 - RSI(7)
  rsi14: '#06b6d4',       // 青色 - RSI(14)
  overbought: '#ef4444',  // 红色 - 超买线 (70)
  oversold: '#22c55e',    // 绿色 - 超卖线 (30)
  middle: '#6b7280',      // 灰色 - 中线 (50)
}

// RSI 阈值
export const RSI_LEVELS = {
  overbought: 70,
  oversold: 30,
  middle: 50,
}

// MACD 参数配置
export const MACD_PARAMS = {
  fast: 12,
  slow: 26,
  signal: 9,
} as const

// MACD 颜色配置
export const MACD_COLORS = {
  macd: '#3b82f6',          // 蓝色 - MACD线
  signal: '#f59e0b',        // 黄色 - 信号线
  histogramUp: '#22c55e',   // 绿色 - 正柱
  histogramDown: '#ef4444', // 红色 - 负柱
}

// ATR 参数配置
export const ATR_PERIOD = 14

// ATR 颜色配置
export const ATR_COLORS = {
  line: '#f97316',  // 橙色
}

// 布林带参数配置
export const BOLLINGER_PARAMS = {
  period: 20,
  stdDev: 2,
} as const

// 布林带颜色配置
export const BOLLINGER_COLORS = {
  upper: '#ef4444',    // 红色 - 上轨
  middle: '#6b7280',   // 灰色 - 中轨
  lower: '#22c55e',    // 绿色 - 下轨
  fill: 'rgba(107, 114, 128, 0.1)', // 填充区域
}
