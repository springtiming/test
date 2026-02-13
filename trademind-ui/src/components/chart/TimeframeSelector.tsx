import { useChart } from '../../contexts/ChartContext'
import type { Timeframe } from '../../types/chart'
import { TIMEFRAME_LABELS } from '../../types/chart'

const TIMEFRAMES: Timeframe[] = ['3m', '4h']

export default function TimeframeSelector() {
  const { config, setTimeframe } = useChart()

  return (
    <div className="flex gap-1 bg-surface rounded-custom p-1">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          onClick={() => setTimeframe(tf)}
          className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
            config.timeframe === tf
              ? 'bg-primary text-white'
              : 'text-subtext hover:text-heading hover:bg-heading/5'
          }`}
          title={TIMEFRAME_LABELS[tf]}
        >
          {tf === '3m' ? '3分钟' : '4小时'}
        </button>
      ))}
    </div>
  )
}
