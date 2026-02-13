import { useEffect, useRef, useMemo, useState } from 'react'
import {
  createChart,
  ColorType,
  LineSeries,
  HistogramSeries,
} from 'lightweight-charts'
import type { IChartApi } from 'lightweight-charts'
import { useChart } from '../../contexts/ChartContext'
import { useChartSync } from './hooks/useChartSync'
import {
  calculateMACD,
  calculateRSI,
  calculateATR,
  MACD_COLORS,
  RSI_COLORS,
  RSI_LEVELS,
  ATR_COLORS,
} from '../../utils/indicators'
import type { IndicatorType } from '../../types/chart'

interface IndicatorChartProps {
  type: IndicatorType
  height?: number
}

export default function IndicatorChart({ type, height = 120 }: IndicatorChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const [chartInstance, setChartInstance] = useState<IChartApi | null>(null)
  const { candleData, isLoading } = useChart()

  // 同步图表
  const { syncToMain } = useChartSync(chartInstance, false)

  // 计算指标数据
  const indicatorData = useMemo(() => {
    if (type === 'MACD') {
      return { type: 'macd', data: calculateMACD(candleData) }
    } else if (type === 'RSI') {
      return { type: 'rsi', data: calculateRSI(candleData) }
    } else if (type === 'ATR') {
      return { type: 'atr', data: calculateATR(candleData) }
    }
    return null
  }, [candleData, type])

  useEffect(() => {
    if (!chartContainerRef.current || !indicatorData) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        visible: false, // 隐藏时间轴（由主图显示）
      },
      crosshair: {
        mode: 1,
        vertLine: { color: 'rgba(255, 255, 255, 0.3)' },
        horzLine: { color: 'rgba(255, 255, 255, 0.3)' },
      },
      height,
    })

    chartRef.current = chart
    setChartInstance(chart)

    if (indicatorData.type === 'macd') {
      renderMACD(chart, indicatorData.data as ReturnType<typeof calculateMACD>)
    } else if (indicatorData.type === 'rsi') {
      renderRSI(chart, indicatorData.data as ReturnType<typeof calculateRSI>)
    } else if (indicatorData.type === 'atr') {
      renderATR(chart, indicatorData.data as ReturnType<typeof calculateATR>)
    }

    chart.timeScale().fitContent()

    // 响应式调整
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }

    handleResize()
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartContainerRef.current)

    return () => {
      resizeObserver.disconnect()
      setChartInstance(null)
      chart.remove()
    }
  }, [type, indicatorData, height])

  // 数据更新时同步
  useEffect(() => {
    syncToMain()
  }, [candleData, syncToMain])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <span className="text-subtext text-sm">加载中...</span>
      </div>
    )
  }

  const labelMap: Record<string, string> = {
    'MACD': 'MACD (12,26,9)',
    'RSI': 'RSI (7/14)',
    'ATR': 'ATR (14)',
  }

  return (
    <div className="border-t border-border/50 pt-2">
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-xs text-subtext font-medium">{labelMap[type] || type}</span>
      </div>
      <div ref={chartContainerRef} className="w-full" style={{ height }} />
    </div>
  )
}

// 渲染 MACD (12, 26, 9)
function renderMACD(chart: IChartApi, data: ReturnType<typeof calculateMACD>) {
  if (data.length === 0) return

  // 柱状图
  const histogramSeries = chart.addSeries(HistogramSeries, {
    priceLineVisible: false,
    lastValueVisible: false,
  })
  histogramSeries.setData(
    data.map((d) => ({
      time: d.time,
      value: d.histogram,
      color: d.histogram >= 0 ? MACD_COLORS.histogramUp : MACD_COLORS.histogramDown,
    }))
  )

  // MACD 线 (DIF)
  const macdSeries = chart.addSeries(LineSeries, {
    color: MACD_COLORS.macd,
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false,
  })
  macdSeries.setData(data.map((d) => ({ time: d.time, value: d.macd })))

  // 信号线 (DEA)
  const signalSeries = chart.addSeries(LineSeries, {
    color: MACD_COLORS.signal,
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false,
  })
  signalSeries.setData(data.map((d) => ({ time: d.time, value: d.signal })))
}

// 渲染 RSI (7, 14)
function renderRSI(chart: IChartApi, data: ReturnType<typeof calculateRSI>) {
  if (data.length === 0) return

  // RSI(7) 线
  const rsi7Series = chart.addSeries(LineSeries, {
    color: RSI_COLORS.rsi7,
    lineWidth: 2,
    priceLineVisible: false,
    lastValueVisible: true,
    title: 'RSI(7)',
  })
  rsi7Series.setData(data.map((d) => ({ time: d.time, value: d.rsi7 })))

  // RSI(14) 线
  const rsi14Series = chart.addSeries(LineSeries, {
    color: RSI_COLORS.rsi14,
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: true,
    title: 'RSI(14)',
  })
  rsi14Series.setData(data.map((d) => ({ time: d.time, value: d.rsi14 })))

  // 设置价格刻度范围
  chart.priceScale('right').applyOptions({
    scaleMargins: { top: 0.05, bottom: 0.05 },
    autoScale: false,
  })

  // 超买线 70
  const overboughtData = data.map((d) => ({ time: d.time, value: RSI_LEVELS.overbought }))
  const overboughtSeries = chart.addSeries(LineSeries, {
    color: RSI_COLORS.overbought,
    lineWidth: 1,
    lineStyle: 2, // Dashed
    priceLineVisible: false,
    lastValueVisible: false,
  })
  overboughtSeries.setData(overboughtData)

  // 超卖线 30
  const oversoldData = data.map((d) => ({ time: d.time, value: RSI_LEVELS.oversold }))
  const oversoldSeries = chart.addSeries(LineSeries, {
    color: RSI_COLORS.oversold,
    lineWidth: 1,
    lineStyle: 2,
    priceLineVisible: false,
    lastValueVisible: false,
  })
  oversoldSeries.setData(oversoldData)
}

// 渲染 ATR (14)
function renderATR(chart: IChartApi, data: ReturnType<typeof calculateATR>) {
  if (data.length === 0) return

  const atrSeries = chart.addSeries(LineSeries, {
    color: ATR_COLORS.line,
    lineWidth: 2,
    priceLineVisible: false,
    lastValueVisible: true,
  })
  atrSeries.setData(data)
}
