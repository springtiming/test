import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useChart } from '../../contexts/ChartContext'
import type { IndicatorType } from '../../types/chart'
import { INDICATOR_LABELS, MAIN_CHART_INDICATORS, SUB_CHART_INDICATORS } from '../../types/chart'

export default function IndicatorSelector() {
  const { config, toggleIndicator } = useChart()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedCount = config.indicators.length

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-custom text-sm text-subtext hover:text-heading transition-colors"
      >
        <span>指标</span>
        {selectedCount > 0 && (
          <span className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded">
            {selectedCount}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-surface border border-border rounded-custom shadow-lg z-50 py-1">
          {/* 主图指标 */}
          <div className="px-3 py-1.5 text-xs text-subtext font-medium border-b border-border">
            主图指标
          </div>
          {MAIN_CHART_INDICATORS.map((indicator) => (
            <IndicatorOption
              key={indicator}
              indicator={indicator}
              selected={config.indicators.includes(indicator)}
              onClick={() => toggleIndicator(indicator)}
            />
          ))}

          {/* 副图指标 */}
          <div className="px-3 py-1.5 text-xs text-subtext font-medium border-b border-t border-border mt-1">
            副图指标
          </div>
          {SUB_CHART_INDICATORS.map((indicator) => (
            <IndicatorOption
              key={indicator}
              indicator={indicator}
              selected={config.indicators.includes(indicator)}
              onClick={() => toggleIndicator(indicator)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface IndicatorOptionProps {
  indicator: IndicatorType
  selected: boolean
  onClick: () => void
}

function IndicatorOption({ indicator, selected, onClick }: IndicatorOptionProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-heading/5 transition-colors"
    >
      <span className={selected ? 'text-heading' : 'text-subtext'}>{INDICATOR_LABELS[indicator]}</span>
      {selected && <Check className="w-4 h-4 text-primary" />}
    </button>
  )
}
