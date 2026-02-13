import type { CandleData, MAData } from '../../types/chart'

/**
 * 计算简单移动平均线 (SMA)
 */
export function calculateSMA(data: CandleData[], period: number): MAData[] {
  const result: MAData[] = []

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close
    }
    result.push({
      time: data[i].time,
      value: Math.round((sum / period) * 100) / 100,
    })
  }

  return result
}

/**
 * 计算指数移动平均线 (EMA)
 */
export function calculateEMA(data: CandleData[], period: number): MAData[] {
  if (period <= 0) return []
  if (data.length < period) return []

  const result: MAData[] = []
  const multiplier = 2 / (period + 1)

  // 第一个 EMA 值等于 SMA
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += data[i].close
  }
  let ema = sum / period

  result.push({
    time: data[period - 1].time,
    value: Math.round(ema * 100) / 100,
  })

  // 计算后续 EMA 值
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema
    result.push({
      time: data[i].time,
      value: Math.round(ema * 100) / 100,
    })
  }

  return result
}

/**
 * 计算 EMA 组（20和50周期）- 对应后端系统配置
 */
export function calculateEMAGroup(data: CandleData[]): { ema20: MAData[]; ema50: MAData[] } {
  return {
    ema20: calculateEMA(data, 20),
    ema50: calculateEMA(data, 50),
  }
}

// EMA 周期配置 - 对应后端 EMA(20, 50)
export const EMA_PERIODS = [20, 50] as const

// EMA 颜色配置
export const EMA_COLORS: Record<number, string> = {
  20: '#f59e0b',  // 黄色 - EMA20
  50: '#3b82f6',  // 蓝色 - EMA50
}
