import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import DecisionLogItem from './DecisionLogItem'
import type { Decision, DecisionStats } from '../../types/decision'

interface DecisionLogPanelProps {
  logs: Decision[]
  stats?: DecisionStats
  activeLogId?: string
  onLogClick?: (logId: string) => void
}

export default function DecisionLogPanel({
  logs,
  stats,
  activeLogId,
  onLogClick,
}: DecisionLogPanelProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all')

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true
    return log.status === filter
  })

  return (
    <div className="h-full flex flex-col">
      {/* 统计摘要 */}
      {stats && (
        <div className="p-3 bg-surface/50 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">交易统计</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-subtext">总交易: </span>
              <span className="text-heading">{stats.totalTrades}</span>
            </div>
            <div>
              <span className="text-subtext">胜率: </span>
              <span className="text-success">{stats.winRate}%</span>
            </div>
            <div>
              <span className="text-subtext">盈亏比: </span>
              <span className="text-heading">{stats.profitFactor}</span>
            </div>
            <div>
              <span className="text-subtext">最大回撤: </span>
              <span className="text-danger">{stats.maxDrawdown}%</span>
            </div>
            <div className="col-span-2">
              <span className="text-subtext">总收益: </span>
              <span className={stats.totalPnl >= 0 ? 'text-success' : 'text-danger'}>
                {stats.totalPnl >= 0 ? '+' : ''}{stats.totalPnl}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 筛选器 */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-medium">决策日志</span>
        <div className="flex gap-1 bg-bg rounded-md p-0.5">
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label="全部"
          />
          <FilterButton
            active={filter === 'open'}
            onClick={() => setFilter('open')}
            label="持仓"
          />
          <FilterButton
            active={filter === 'closed'}
            onClick={() => setFilter('closed')}
            label="已平"
          />
        </div>
      </div>

      {/* 日志列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-subtext text-sm">
            暂无决策记录
          </div>
        ) : (
          filteredLogs.map((log) => (
            <DecisionLogItem
              key={log.id}
              log={log}
              isActive={log.id === activeLogId}
              onClick={() => onLogClick?.(log.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  label: string
}

function FilterButton({ active, onClick, label }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 text-xs rounded transition-colors ${active
          ? 'bg-primary text-white'
          : 'text-subtext hover:text-heading'
        }`}
    >
      {label}
    </button>
  )
}
