import type { CandleData, RSIData } from '../../types/chart'

/**
 * 计算单周期 RSI 指标
 */
function calculateSingleRSI(data: CandleData[], period: number): { time: number; value: number }[] {
  if (data.length < period + 1) return []

  const result: { time: number; value: number }[] = []
  const gains: number[] = []
  const losses: number[] = []

  // 计算价格变动
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? -change : 0)
  }

  // 计算第一个平均涨跌幅
  let avgGain = 0
  let avgLoss = 0
  for (let i = 0; i < period; i++) {
    avgGain += gains[i]
    avgLoss += losses[i]
  }
  avgGain /= period
  avgLoss /= period

  // 计算第一个 RSI
  const firstRSI = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
  result.push({
    time: data[period].time as number,
    value: Math.round(firstRSI * 100) / 100,
  })

  // 计算后续 RSI（使用 Wilder 平滑）
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period

    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
    result.push({
      time: data[i + 1].time as number,
      value: Math.round(rsi * 100) / 100,
    })
  }

  return result
}

/**
 * 计算双周期 RSI 指标 - 对应后端 RSI(7, 14)
 */
export function calculateRSI(data: CandleData[]): RSIData[] {
  const rsi7Data = calculateSingleRSI(data, 7)
  const rsi14Data = calculateSingleRSI(data, 14)

  // 合并两个周期的数据（以较长周期的起始点为准）
  const result: RSIData[] = []

  // RSI14 开始的位置比 RSI7 晚，以 RSI14 为准
  const rsi7Map = new Map(rsi7Data.map((d) => [d.time, d.value]))

  for (const item of rsi14Data) {
    const rsi7Value = rsi7Map.get(item.time)
    if (rsi7Value !== undefined) {
      result.push({
        time: item.time as RSIData['time'],
        rsi7: rsi7Value,
        rsi14: item.value,
      })
    }
  }

  return result
}

// RSI 周期配置 - 对应后端 RSI(7, 14)
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
