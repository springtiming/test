/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import type { IChartApi, LogicalRange } from 'lightweight-charts'
import type { Timeframe, IndicatorType, ChartConfig, CandleData, TradeMarker, EquityPoint } from '../types/chart'
import { DEFAULT_CHART_CONFIG, TIMEFRAME_MINUTES } from '../types/chart'
import { generateEquityCurve } from '../data/mockData'
import { fetchDecisionDetail, fetchDecisionMarkers, fetchKlines, type DecisionDetailResponse } from '../api/researchApiData'

interface ChartContextType {
  // 配置
  config: ChartConfig
  setTimeframe: (tf: Timeframe) => void
  toggleIndicator: (indicator: IndicatorType) => void
  setShowVolume: (show: boolean) => void
  setShowEquityCurve: (show: boolean) => void
  // 数据
  symbol: string
  setSymbol: (symbol: string) => void
  direction: 'LONG' | 'SHORT'
  setDirection: (direction: 'LONG' | 'SHORT') => void
  candleData: CandleData[]
  tradeMarkers: TradeMarker[]
  equityCurve: EquityPoint[]
  // 图表同步
  mainChart: IChartApi | null
  setMainChart: (chart: IChartApi | null) => void
  visibleRange: LogicalRange | null
  setVisibleRange: (range: LogicalRange | null) => void
  // 加载状态
  isLoading: boolean
  dataError: string | null

  // 决策详情弹窗（点选标记）
  selectedDecisionId: number | null
  decisionDetail: DecisionDetailResponse | null
  isDetailLoading: boolean
  detailError: string | null
  openDecisionDetail: (decisionId: number) => void
  closeDecisionDetail: () => void
}

const ChartContext = createContext<ChartContextType | null>(null)

interface ChartProviderProps {
  children: ReactNode
  initialSymbol?: string
  initialDirection?: 'LONG' | 'SHORT'
}

export function ChartProvider({
  children,
  initialSymbol = 'BTC/USDT',
  initialDirection = 'LONG',
}: ChartProviderProps) {
  const [config, setConfig] = useState<ChartConfig>(DEFAULT_CHART_CONFIG)
  const [symbol, setSymbolState] = useState(initialSymbol)
  const [direction, setDirectionState] = useState<'LONG' | 'SHORT'>(initialDirection)
  const [candleData, setCandleData] = useState<CandleData[]>([])
  const [tradeMarkers, setTradeMarkers] = useState<TradeMarker[]>([])
  const [mainChart, setMainChart] = useState<IChartApi | null>(null)
  const [visibleRange, setVisibleRange] = useState<LogicalRange | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)

  const [selectedDecisionId, setSelectedDecisionId] = useState<number | null>(null)
  const [decisionDetail, setDecisionDetail] = useState<DecisionDetailResponse | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  // 拉取真实K线 + 决策标记（来自公网 research_api）
  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setDataError(null)

      const limit = config.timeframe === '3m' ? 200 : 100
      const interval = config.timeframe

      try {
        const [klines, markers] = await Promise.all([
          fetchKlines({ symbol, interval, limit }),
          fetchDecisionMarkers({ symbol, interval, limit }),
        ])

        if (cancelled) return

        const candles: CandleData[] = klines.map((bar) => ({
          time: bar.time as CandleData['time'],
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: bar.volume ?? undefined,
        }))
        setCandleData(candles)

        const closeByTime = new Map<number, number>()
        for (const c of candles) {
          if (typeof c.time === 'number') closeByTime.set(c.time, c.close)
        }

        const mapped: TradeMarker[] = markers
          .filter((m) => typeof m.time === 'number')
          .map((m) => {
            const isBuy = String(m.action).startsWith('buy')
            const price = closeByTime.get(m.time) ?? 0
            return {
              time: m.time as TradeMarker['time'],
              type: isBuy ? 'buy' : 'sell',
              action: isBuy ? 'buy_to_enter' : 'sell_to_enter',
              price,
              label: isBuy ? '做多' : '做空',
              confidence: m.confidence ?? undefined,
              leverage: m.leverage ?? undefined,
              hardTakeProfit: m.hard_take_profit ?? undefined,
              hardStopLoss: m.hard_stop_loss ?? undefined,
              decisionId: m.decision_id ?? undefined,
              approvedByGuard: m.approved_by_guard ?? undefined,
              rationale: m.rationale ?? undefined,
              rejectionReason: m.rejection_reason ?? undefined,
              responseHash: m.response_hash ?? undefined,
            }
          })
        setTradeMarkers(mapped)
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : '加载失败'
        setDataError(message)
        setCandleData([])
        setTradeMarkers([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // direction 不参与数据拉取（标记来自后端）
  }, [symbol, config.timeframe])

  // 生成收益曲线
  const equityCurve = useMemo(() => {
    if (!config.showEquityCurve || candleData.length === 0) return []
    const startTime = (candleData[0].time as number) * 1000
    const intervalMinutes = TIMEFRAME_MINUTES[config.timeframe]
    return generateEquityCurve(startTime, candleData.length, intervalMinutes)
  }, [candleData, config.showEquityCurve, config.timeframe])

  const setTimeframe = useCallback((tf: Timeframe) => {
    setConfig((prev) => ({ ...prev, timeframe: tf }))
  }, [])

  const toggleIndicator = useCallback((indicator: IndicatorType) => {
    setConfig((prev) => {
      const indicators = prev.indicators.includes(indicator)
        ? prev.indicators.filter((i) => i !== indicator)
        : [...prev.indicators, indicator]
      return { ...prev, indicators }
    })
  }, [])

  const setShowVolume = useCallback((show: boolean) => {
    setConfig((prev) => ({ ...prev, showVolume: show }))
  }, [])

  const setShowEquityCurve = useCallback((show: boolean) => {
    setConfig((prev) => ({ ...prev, showEquityCurve: show }))
  }, [])

  const setSymbol = useCallback((newSymbol: string) => {
    setSymbolState(newSymbol)
  }, [])

  const setDirection = useCallback((newDirection: 'LONG' | 'SHORT') => {
    setDirectionState(newDirection)
  }, [])

  const openDecisionDetail = useCallback((decisionId: number) => {
    if (!Number.isFinite(decisionId) || decisionId <= 0) return
    setSelectedDecisionId(decisionId)
  }, [])

  const closeDecisionDetail = useCallback(() => {
    setSelectedDecisionId(null)
    setDecisionDetail(null)
    setDetailError(null)
    setIsDetailLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadDetail(decisionId: number) {
      setIsDetailLoading(true)
      setDetailError(null)
      setDecisionDetail(null)
      try {
        const detail = await fetchDecisionDetail(decisionId)
        if (!cancelled) setDecisionDetail(detail)
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : '加载失败'
        setDetailError(message)
      } finally {
        if (!cancelled) setIsDetailLoading(false)
      }
    }

    if (selectedDecisionId) {
      loadDetail(selectedDecisionId)
    }

    return () => {
      cancelled = true
    }
  }, [selectedDecisionId])

  return (
    <ChartContext.Provider
      value={{
        config,
        setTimeframe,
        toggleIndicator,
        setShowVolume,
        setShowEquityCurve,
        symbol,
        setSymbol,
        direction,
        setDirection,
        candleData,
        tradeMarkers,
        equityCurve,
        mainChart,
        setMainChart,
        visibleRange,
        setVisibleRange,
        isLoading,
        dataError,
        selectedDecisionId,
        decisionDetail,
        isDetailLoading,
        detailError,
        openDecisionDetail,
        closeDecisionDetail,
      }}
    >
      {children}
    </ChartContext.Provider>
  )
}

export function useChart() {
  const context = useContext(ChartContext)
  if (!context) {
    throw new Error('useChart must be used within a ChartProvider')
  }
  return context
}
