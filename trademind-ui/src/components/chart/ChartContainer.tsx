import ChartToolbar from './ChartToolbar'
import MainChart from './MainChart'
import IndicatorChart from './IndicatorChart'
import EquityCurve from './EquityCurve'
import { useChart } from '../../contexts/ChartContext'
import { SUB_CHART_INDICATORS } from '../../types/chart'

interface ChartContainerProps {
  className?: string
}

export default function ChartContainer({ className = '' }: ChartContainerProps) {
  const { config, dataError } = useChart()

  // 获取当前启用的副图指标
  const activeSubIndicators = config.indicators.filter((i) =>
    SUB_CHART_INDICATORS.includes(i)
  )

  return (
    <div className={`bg-surface rounded-custom p-4 border border-border ${className}`}>
      <ChartToolbar />

      {dataError && (
        <div className="mb-3 px-3 py-2 rounded-custom bg-danger/10 border border-danger/30 text-danger text-sm">
          {dataError}
        </div>
      )}

      {/* 主图 */}
      <MainChart height={280} />

      {/* 副图指标 */}
      {activeSubIndicators.map((indicator) => (
        <IndicatorChart key={indicator} type={indicator} height={100} />
      ))}

      {/* 收益曲线 */}
      {config.showEquityCurve && <EquityCurve height={120} />}
    </div>
  )
}
