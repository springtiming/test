import { useEffect, useRef, useMemo, useState } from 'react'
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
  createSeriesMarkers,
} from 'lightweight-charts'
import type { IChartApi, SeriesMarker, Time } from 'lightweight-charts'
import { useChart } from '../../contexts/ChartContext'
import { useChartSync } from './hooks/useChartSync'
import {
  calculateEMAGroup,
  calculateBollinger,
  EMA_COLORS,
  BOLLINGER_COLORS,
} from '../../utils/indicators'

interface MainChartProps {
  height?: number
}

export default function MainChart({ height = 320 }: MainChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const [chartInstance, setChartInstance] = useState<IChartApi | null>(null)
  const { candleData, tradeMarkers, config, isLoading, setMainChart, openDecisionDetail } = useChart()

  // 注册为主图
  useChartSync(chartInstance, true)

  // 计算主图指标
  const mainIndicators = useMemo(() => {
    const result: {
      ema?: { ema20: { time: Time; value: number }[]; ema50: { time: Time; value: number }[] }
      boll?: ReturnType<typeof calculateBollinger>
    } = {}

    if (config.indicators.includes('EMA')) {
      result.ema = calculateEMAGroup(candleData)
    }

    if (config.indicators.includes('BOLL')) {
      result.boll = calculateBollinger(candleData)
    }

    return result
  }, [candleData, config.indicators])

  // 转换交易标记为 lightweight-charts 格式
  const chartMarkers = useMemo((): SeriesMarker<Time>[] => {
    return tradeMarkers.map((m) => ({
      time: m.time,
      position: m.type === 'buy' ? 'belowBar' : 'aboveBar',
      color: m.type === 'buy' ? '#22c55e' : '#ef4444',
      shape: m.type === 'buy' ? 'arrowUp' : 'arrowDown',
      text: m.label || (m.action === 'buy_to_enter' ? '做多' : m.action === 'sell_to_enter' ? '做空' : ''),
    }))
  }, [tradeMarkers])

  const decisionIdByTime = useMemo(() => {
    const map = new Map<number, number>()
    for (const marker of tradeMarkers) {
      if (typeof marker.time !== 'number') continue
      if (!marker.decisionId) continue
      map.set(marker.time, marker.decisionId)
    }
    return map
  }, [tradeMarkers])

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'rgba(255, 255, 255, 0.3)',
          labelBackgroundColor: '#374151',
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.3)',
          labelBackgroundColor: '#374151',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
      height,
    })

    chartRef.current = chart
    setChartInstance(chart)
    setMainChart(chart)

    // K线系列
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })
    candlestickSeries.setData(candleData)

    // 添加交易标记
    if (chartMarkers.length > 0) {
      createSeriesMarkers(candlestickSeries, chartMarkers)
    }

    const handleClick = (param: { time?: Time }) => {
      const time = param.time
      if (typeof time !== 'number') return
      const decisionId = decisionIdByTime.get(time)
      if (decisionId) openDecisionDetail(decisionId)
    }

    chart.subscribeClick(handleClick)

    // 添加 EMA 指标 (20, 50)
    if (mainIndicators.ema) {
      // EMA20
      if (mainIndicators.ema.ema20.length > 0) {
        const ema20Series = chart.addSeries(LineSeries, {
          color: EMA_COLORS[20],
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          title: 'EMA20',
        })
        ema20Series.setData(mainIndicators.ema.ema20)
      }

      // EMA50
      if (mainIndicators.ema.ema50.length > 0) {
        const ema50Series = chart.addSeries(LineSeries, {
          color: EMA_COLORS[50],
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          title: 'EMA50',
        })
        ema50Series.setData(mainIndicators.ema.ema50)
      }
    }

    // 添加布林带
    if (mainIndicators.boll && mainIndicators.boll.length > 0) {
      const bollData = mainIndicators.boll
      // 上轨
      const upperSeries = chart.addSeries(LineSeries, {
        color: BOLLINGER_COLORS.upper,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      })
      upperSeries.setData(bollData.map((d) => ({ time: d.time, value: d.upper })))

      // 中轨
      const middleSeries = chart.addSeries(LineSeries, {
        color: BOLLINGER_COLORS.middle,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      })
      middleSeries.setData(bollData.map((d) => ({ time: d.time, value: d.middle })))

      // 下轨
      const lowerSeries = chart.addSeries(LineSeries, {
        color: BOLLINGER_COLORS.lower,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      })
      lowerSeries.setData(bollData.map((d) => ({ time: d.time, value: d.lower })))
    }

    chart.timeScale().fitContent()

    // 响应式调整
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    handleResize()
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartContainerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.unsubscribeClick(handleClick)
      setChartInstance(null)
      setMainChart(null)
      chart.remove()
    }
  }, [candleData, chartMarkers, mainIndicators, height, setMainChart, decisionIdByTime, openDecisionDetail])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <span className="text-subtext text-sm">加载中...</span>
      </div>
    )
  }

  return <div ref={chartContainerRef} className="w-full" style={{ height }} />
}
