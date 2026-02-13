import { useEffect, useRef } from 'react'
import { createChart, ColorType, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts'
import type { IChartApi, ISeriesApi, CandlestickData, Time, SeriesMarker, ISeriesMarkersPluginApi } from 'lightweight-charts'

interface CandlestickChartProps {
  symbol?: string
  direction?: 'LONG' | 'SHORT'
}

// 生成模拟 K 线数据
function generateCandlestickData(symbol: string): CandlestickData<Time>[] {
  const data: CandlestickData<Time>[] = []
  const basePrice = symbol.includes('BTC') ? 67000 : symbol.includes('ETH') ? 3500 : 150
  const volatility = basePrice * 0.02

  let currentPrice = basePrice
  const now = new Date()

  for (let i = 100; i >= 0; i--) {
    const time = Math.floor((now.getTime() - i * 15 * 60 * 1000) / 1000) // Unix 时间戳（秒）

    const change = (Math.random() - 0.5) * volatility
    const open = currentPrice
    const close = open + change
    const high = Math.max(open, close) + Math.random() * volatility * 0.3
    const low = Math.min(open, close) - Math.random() * volatility * 0.3

    data.push({
      time: time as Time,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    })

    currentPrice = close
  }

  return data
}

// 生成买入/卖出标记
function generateMarkers(data: CandlestickData<Time>[], direction: 'LONG' | 'SHORT'): SeriesMarker<Time>[] {
  if (data.length < 20) return []

  // 买入点：在数据的 70% 位置
  const buyIndex = Math.floor(data.length * 0.7)
  // 卖出点：在数据的 90% 位置
  const sellIndex = Math.floor(data.length * 0.9)

  const buyCandle = data[buyIndex]
  const sellCandle = data[sellIndex]

  if (direction === 'LONG') {
    // 做多：先买入后卖出
    return [
      {
        time: buyCandle.time,
        position: 'belowBar',
        color: '#22c55e',
        shape: 'arrowUp',
        text: '买入',
      },
      {
        time: sellCandle.time,
        position: 'aboveBar',
        color: '#ef4444',
        shape: 'arrowDown',
        text: '卖出',
      },
    ]
  } else {
    // 做空：先卖出后买入
    return [
      {
        time: buyCandle.time,
        position: 'aboveBar',
        color: '#ef4444',
        shape: 'arrowDown',
        text: '卖出',
      },
      {
        time: sellCandle.time,
        position: 'belowBar',
        color: '#22c55e',
        shape: 'arrowUp',
        text: '买入',
      },
    ]
  }
}

export default function CandlestickChart({ symbol = 'BTC/USDT', direction = 'LONG' }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // 创建图表
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
    })

    chartRef.current = chart

    // 添加 K 线系列 (v5 API)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    seriesRef.current = candlestickSeries

    // 设置数据
    const data = generateCandlestickData(symbol)
    candlestickSeries.setData(data)

    // 添加买入/卖出标记 (v5 API: createSeriesMarkers)
    const markers = generateMarkers(data, direction)
    const seriesMarkers = createSeriesMarkers(candlestickSeries, markers)
    markersRef.current = seriesMarkers

    // 自适应容器大小
    chart.timeScale().fitContent()

    // 响应式调整
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    // 使用 ResizeObserver 监听容器大小变化
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartContainerRef.current)

    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [symbol, direction])

  // 当 symbol 或 direction 变化时更新数据
  useEffect(() => {
    if (seriesRef.current && markersRef.current) {
      const data = generateCandlestickData(symbol)
      seriesRef.current.setData(data)
      markersRef.current.setMarkers(generateMarkers(data, direction))
      chartRef.current?.timeScale().fitContent()
    }
  }, [symbol, direction])

  return <div ref={chartContainerRef} className="w-full h-full" />
}
