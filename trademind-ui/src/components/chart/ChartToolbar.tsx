import { TrendingUp } from 'lucide-react'
import TimeframeSelector from './TimeframeSelector'
import IndicatorSelector from './IndicatorSelector'
import { useChart } from '../../contexts/ChartContext'

export default function ChartToolbar() {
  const { config, setShowEquityCurve } = useChart()

  return (
    <div className="flex items-center justify-between gap-4 mb-3">
      <div className="flex items-center gap-3">
        <TimeframeSelector />
        <IndicatorSelector />
      </div>

      <div className="flex items-center gap-2">
        {/* 收益曲线开关 */}
        <button
          onClick={() => setShowEquityCurve(!config.showEquityCurve)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-custom transition-colors ${
            config.showEquityCurve
              ? 'bg-primary/20 text-primary'
              : 'bg-surface text-subtext hover:text-heading'
          }`}
          title="显示收益曲线"
        >
          <TrendingUp className="w-4 h-4" />
          <span>收益曲线</span>
        </button>
      </div>
    </div>
  )
}
