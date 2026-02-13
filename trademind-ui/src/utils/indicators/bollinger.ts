import type { CandleData, BollingerData } from '../../types/chart'
import { calculateSMA } from './ma'

/**
 * 计算布林带指标 - 对应后端 Bollinger(20, 2)
 * @param data K线数据
 * @param period 周期 (默认20)
 * @param stdDev 标准差倍数 (默认2)
 */
export function calculateBollinger(
  data: CandleData[],
  period: number = 20,
  stdDev: number = 2
): BollingerData[] {
  if (data.length < period) return []

  const result: BollingerData[] = []
  const sma = calculateSMA(data, period)

  for (let i = period - 1; i < data.length; i++) {
    const smaIndex = i - (period - 1)
    const middle = sma[smaIndex].value

    // 计算标准差
    let sumSquares = 0
    for (let j = 0; j < period; j++) {
      const diff = data[i - j].close - middle
      sumSquares += diff * diff
    }
    const std = Math.sqrt(sumSquares / period)

    result.push({
      time: data[i].time,
      upper: Math.round((middle + stdDev * std) * 100) / 100,
      middle: Math.round(middle * 100) / 100,
      lower: Math.round((middle - stdDev * std) * 100) / 100,
    })
  }

  return result
}

// 布林带参数配置 - 对应后端 Bollinger(20, 2)
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
