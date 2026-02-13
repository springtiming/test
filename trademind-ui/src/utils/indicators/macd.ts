import type { CandleData, MACDData } from '../../types/chart'
import { calculateEMA } from './ma'

/**
 * 计算 MACD 指标 - 对应后端 MACD(12, 26, 9)
 * @param data K线数据
 * @param fastPeriod 快线周期 (默认12)
 * @param slowPeriod 慢线周期 (默认26)
 * @param signalPeriod 信号线周期 (默认9)
 */
export function calculateMACD(
  data: CandleData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDData[] {
  if (data.length < slowPeriod) return []

  // 计算快线和慢线 EMA
  const fastEMA = calculateEMA(data, fastPeriod)
  const slowEMA = calculateEMA(data, slowPeriod)

  // 计算 MACD 线 (DIF)
  const macdLine: { time: number; value: number }[] = []
  const startIndex = slowPeriod - fastPeriod

  for (let i = 0; i < slowEMA.length; i++) {
    const fastValue = fastEMA[i + startIndex]
    const slowValue = slowEMA[i]
    if (fastValue && slowValue) {
      macdLine.push({
        time: slowValue.time as number,
        value: fastValue.value - slowValue.value,
      })
    }
  }

  // 计算信号线 (DEA)
  const signalLine: number[] = []
  const multiplier = 2 / (signalPeriod + 1)

  if (macdLine.length >= signalPeriod) {
    // 第一个信号值是前 signalPeriod 个 MACD 值的平均
    let sum = 0
    for (let i = 0; i < signalPeriod; i++) {
      sum += macdLine[i].value
    }
    let signal = sum / signalPeriod
    signalLine.push(signal)

    // 计算后续信号值
    for (let i = signalPeriod; i < macdLine.length; i++) {
      signal = (macdLine[i].value - signal) * multiplier + signal
      signalLine.push(signal)
    }
  }

  // 组合结果
  const result: MACDData[] = []
  const signalStartIndex = signalPeriod - 1

  for (let i = signalStartIndex; i < macdLine.length; i++) {
    const macdValue = macdLine[i].value
    const signalValue = signalLine[i - signalStartIndex]
    result.push({
      time: macdLine[i].time as MACDData['time'],
      macd: Math.round(macdValue * 100) / 100,
      signal: Math.round(signalValue * 100) / 100,
      histogram: Math.round((macdValue - signalValue) * 100) / 100,
    })
  }

  return result
}

// MACD 参数配置 - 对应后端 MACD(12, 26, 9)
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
