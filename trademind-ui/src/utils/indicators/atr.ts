import type { CandleData, ATRData } from '../../types/chart'

/**
 * 计算 ATR 指标 - 对应后端 ATR(14)
 * @param data K线数据
 * @param period 周期 (默认14)
 */
export function calculateATR(data: CandleData[], period: number = 14): ATRData[] {
  if (data.length < period + 1) return []

  const result: ATRData[] = []
  const trueRanges: number[] = []

  // 计算 True Range
  for (let i = 1; i < data.length; i++) {
    const high = data[i].high
    const low = data[i].low
    const prevClose = data[i - 1].close

    // TR = max(High - Low, |High - PrevClose|, |Low - PrevClose|)
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    )
    trueRanges.push(tr)
  }

  // 计算第一个 ATR（简单平均）
  let atr = 0
  for (let i = 0; i < period; i++) {
    atr += trueRanges[i]
  }
  atr /= period

  result.push({
    time: data[period].time,
    value: Math.round(atr * 100) / 100,
  })

  // 计算后续 ATR（Wilder 平滑）
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period
    result.push({
      time: data[i + 1].time,
      value: Math.round(atr * 100) / 100,
    })
  }

  return result
}

// ATR 周期配置 - 对应后端 ATR(14)
export const ATR_PERIOD = 14

// ATR 颜色配置
export const ATR_COLORS = {
  line: '#f97316',  // 橙色
}
