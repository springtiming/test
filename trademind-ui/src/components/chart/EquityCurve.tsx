import { useEffect, useRef, useMemo, useState } from 'react'
import { createChart, ColorType, LineSeries, AreaSeries } from 'lightweight-charts'
import type { IChartApi } from 'lightweight-charts'
import { useChart } from '../../contexts/ChartContext'
import { useChartSync } from './hooks/useChartSync'

interface EquityCurveProps {
  height?: number
}

export default function EquityCurve({ height = 150 }: EquityCurveProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const [chartInstance, setChartInstance] = useState<IChartApi | null>(null)
  const { equityCurve, isLoading } = useChart()

  // 同步图表
  const { syncToMain } = useChartSync(chartInstance, false)

  // 计算统计数据
  const stats = useMemo(() => {
    if (equityCurve.length === 0) return null
    const first = equityCurve[0]
    const last = equityCurve[equityCurve.length - 1]
    const maxDrawdown = Math.max(...equityCurve.map((d) => d.drawdown))
    const totalReturn = ((last.equity - first.equity) / first.equity) * 100

    return {
      totalReturn: totalReturn.toFixed(2),
      maxDrawdown: maxDrawdown.toFixed(2),
      currentEquity: last.equity.toFixed(2),
    }
  }, [equityCurve])

  useEffect(() => {
    if (!chartContainerRef.current || equityCurve.length === 0) return

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
      },
      leftPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        visible: true,
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        visible: false,
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

    // 收益曲线（右侧 Y 轴）
    const equitySeries = chart.addSeries(AreaSeries, {
      lineColor: '#22c55e',
      topColor: 'rgba(34, 197, 94, 0.3)',
      bottomColor: 'rgba(34, 197, 94, 0.05)',
      lineWidth: 2,
      priceScaleId: 'right',
      priceLineVisible: false,
    })
    equitySeries.setData(equityCurve.map((d) => ({ time: d.time, value: d.equity })))

    // 回撤曲线（左侧 Y 轴）
    const drawdownSeries = chart.addSeries(LineSeries, {
      color: '#ef4444',
      lineWidth: 1,
      priceScaleId: 'left',
      priceLineVisible: false,
      lastValueVisible: false,
    })
    drawdownSeries.setData(equityCurve.map((d) => ({ time: d.time, value: -d.drawdown })))

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
  }, [equityCurve, height])

  // 数据更新时同步
  useEffect(() => {
    syncToMain()
  }, [equityCurve, syncToMain])

  if (isLoading || equityCurve.length === 0) {
    return null
  }

  return (
    <div className="border-t border-border/50 pt-2 mt-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs text-subtext font-medium">收益 / 回撤</span>
        {stats && (
          <div className="flex gap-4 text-xs">
            <span className={Number(stats.totalReturn) >= 0 ? 'text-green-500' : 'text-red-500'}>
              收益率: {stats.totalReturn}%
            </span>
            <span className="text-red-500">最大回撤: {stats.maxDrawdown}%</span>
            <span className="text-subtext">净值: ${stats.currentEquity}</span>
          </div>
        )}
      </div>
      <div ref={chartContainerRef} className="w-full" style={{ height }} />
    </div>
  )
}
