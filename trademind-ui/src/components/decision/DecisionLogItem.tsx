import { TrendingUp, TrendingDown, Clock } from 'lucide-react'
import type { Decision } from '../../types/decision'

interface DecisionLogItemProps {
  log: Decision
  isActive?: boolean
  onClick?: () => void
}

export default function DecisionLogItem({ log, isActive = false, onClick }: DecisionLogItemProps) {
  const isLong = log.direction === 'LONG'
  const isProfitable = (log.pnl ?? 0) > 0

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border transition-all cursor-pointer ${isActive
          ? 'bg-primary/10 border-primary/30'
          : 'bg-surface/50 border-border/50 hover:border-border hover:bg-surface'
        }`}
    >
      {/* 头部：方向和时间 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${isLong
                ? 'bg-success/20 text-success'
                : 'bg-danger/20 text-danger'
              }`}
          >
            {isLong ? '做多' : '做空'}
          </span>
          <span className="text-xs text-subtext">{log.id}</span>
        </div>
        <span className={`text-xs ${log.status === 'open' ? 'text-warning' : 'text-subtext'}`}>
          {log.status === 'open' ? '持仓中' : '已平仓'}
        </span>
      </div>

      {/* 入场信息 */}
      <div className="mb-2">
        <div className="flex items-center gap-1 text-xs text-subtext mb-1">
          <Clock className="w-3 h-3" />
          <span>入场: {formatTime(log.entryTime)}</span>
        </div>
        <div className="text-sm">
          <span className="text-subtext">入场价: </span>
          <span className="text-heading font-medium">${log.entryPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* 入场原因 */}
      <p className="text-xs text-subtext line-clamp-2 mb-2">{log.entryReason}</p>

      {/* 盈亏和风控 */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        {log.pnl !== undefined ? (
          <div className="flex items-center gap-1">
            {isProfitable ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-danger" />
            )}
            <span
              className={`text-sm font-bold ${isProfitable ? 'text-success' : 'text-danger'
                }`}
            >
              {isProfitable ? '+' : ''}{log.pnl.toFixed(2)}%
            </span>
          </div>
        ) : (
          <div className="text-xs text-subtext">--</div>
        )}

        <div className="flex gap-2 text-xs">
          {log.stopLoss && (
            <span className="text-danger">止损: ${log.stopLoss.toLocaleString()}</span>
          )}
          {log.takeProfit && (
            <span className="text-success">止盈: ${log.takeProfit.toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* 研究员和评分 */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
            {log.researcherName.charAt(0)}
          </div>
          <span className="text-xs text-subtext">{log.researcherName}</span>
        </div>
        {log.score && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-yellow-500">★</span>
            <span className="text-xs font-medium">{log.score.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
}
