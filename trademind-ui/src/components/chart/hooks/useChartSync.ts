import { useEffect, useCallback, useRef } from 'react'
import type { IChartApi, LogicalRange } from 'lightweight-charts'
import { useChart } from '../../../contexts/ChartContext'

/**
 * 多图表时间轴同步 Hook
 * 用于同步主图和副图的可见范围
 */
export function useChartSync(chart: IChartApi | null, isMainChart: boolean = false) {
  const { mainChart, setMainChart, visibleRange, setVisibleRange } = useChart()
  const isUpdatingRef = useRef(false)

  // 注册主图
  useEffect(() => {
    if (isMainChart && chart) {
      setMainChart(chart)
      return () => setMainChart(null)
    }
  }, [chart, isMainChart, setMainChart])

  // 订阅主图的范围变化
  useEffect(() => {
    if (!isMainChart || !chart) return

    const handler = (range: LogicalRange | null) => {
      if (!isUpdatingRef.current && range) {
        setVisibleRange(range)
      }
    }

    chart.timeScale().subscribeVisibleLogicalRangeChange(handler)
    return () => chart.timeScale().unsubscribeVisibleLogicalRangeChange(handler)
  }, [chart, isMainChart, setVisibleRange])

  // 同步副图到主图范围
  useEffect(() => {
    if (isMainChart || !chart || !visibleRange) return

    isUpdatingRef.current = true
    chart.timeScale().setVisibleLogicalRange(visibleRange)
    // 延迟重置标志，避免循环更新
    requestAnimationFrame(() => {
      isUpdatingRef.current = false
    })
  }, [chart, isMainChart, visibleRange])

  // 手动同步方法
  const syncToMain = useCallback(() => {
    if (!chart || !mainChart) return

    const range = mainChart.timeScale().getVisibleLogicalRange()
    if (range) {
      chart.timeScale().setVisibleLogicalRange(range)
    }
  }, [chart, mainChart])

  return { syncToMain }
}
