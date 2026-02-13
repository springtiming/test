import { X, Loader2, AlertTriangle } from 'lucide-react'
import type { DecisionDetailResponse } from '../../api/researchApiData'

interface DecisionDetailModalProps {
  open: boolean
  onClose: () => void
  loading: boolean
  error: string | null
  detail: DecisionDetailResponse | null
}

function formatMaybeNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-'
  return Number.isFinite(value) ? String(value) : '-'
}

function formatMaybeString(value: string | null | undefined): string {
  if (!value) return '-'
  return value
}

export default function DecisionDetailModal({ open, onClose, loading, error, detail }: DecisionDetailModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="absolute left-1/2 top-1/2 w-[min(720px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-custom border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-heading">决策详情</span>
            {detail?.decision?.id ? (
              <span className="text-xs text-subtext">决策 ID: {detail.decision.id}</span>
            ) : (
              <span className="text-xs text-subtext">—</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-subtext hover:text-heading hover:bg-heading/5 transition-colors"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[75vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-2 text-subtext text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>加载中...</span>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-start gap-2 p-3 rounded-custom bg-danger/10 border border-danger/30 text-danger text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5" />
              <div className="flex-1 whitespace-pre-wrap">{error}</div>
            </div>
          )}

          {!loading && !error && detail && (
            <div className="space-y-4">
              <section className="grid grid-cols-2 gap-3">
                <Info label="时间" value={formatMaybeString(detail.decision.timestamp)} />
                <Info label="交易对" value={formatMaybeString(detail.decision.symbol)} />
                <Info label="动作" value={detail.decision.action} />
                <Info label="杠杆" value={String(detail.decision.leverage)} />
                <Info label="数量" value={formatMaybeNumber(detail.decision.quantity)} />
                <Info label="风险(USD)" value={formatMaybeNumber(detail.decision.risk_usd)} />
                <Info
                  label="风控审批"
                  value={detail.decision.approved_by_guard ? '已通过' : '未通过'}
                />
                <Info label="拒绝原因" value={formatMaybeString(detail.decision.rejection_reason)} />
                <Info label="TP(硬)" value={formatMaybeNumber(detail.decision.hard_take_profit)} />
                <Info label="SL(硬)" value={formatMaybeNumber(detail.decision.hard_stop_loss)} />
                <Info label="TP(软)" value={formatMaybeNumber(detail.decision.soft_take_profit)} />
                <Info label="SL(软)" value={formatMaybeNumber(detail.decision.soft_stop_loss)} />
                <Info label="置信度" value={formatMaybeNumber(detail.decision.confidence)} />
                <Info label="响应哈希" value={formatMaybeString(detail.decision.response_hash)} />
              </section>

              <section className="bg-bg/40 rounded-custom border border-border p-3">
                <div className="text-xs text-subtext mb-2">决策说明</div>
                <div className="text-sm text-heading whitespace-pre-wrap">
                  {detail.decision.rationale ? detail.decision.rationale : '—'}
                </div>
              </section>

              <section className="grid grid-cols-2 gap-3">
                <Info label="成交价" value={formatMaybeNumber(detail.trade?.price)} />
                <Info label="成交量" value={formatMaybeNumber(detail.trade?.size)} />
                <Info label="方向" value={formatMaybeString(detail.trade?.side)} />
                <Info label="盈亏" value={formatMaybeNumber(detail.trade?.pnl)} />
                <Info label="订单状态" value={formatMaybeString(detail.trade?.status)} />
                <Info label="订单ID" value={formatMaybeString(detail.trade?.order_id)} />
              </section>

              <section className="bg-bg/40 rounded-custom border border-border p-3">
                <div className="text-xs text-subtext mb-2">模型对话（脱敏）</div>
                <div className="grid grid-cols-2 gap-3">
                  <Info label="时间" value={formatMaybeString(detail.conversation?.timestamp)} />
                  <Info label="提示词哈希" value={formatMaybeString(detail.conversation?.prompt_hash)} />
                  <Info label="响应哈希" value={formatMaybeString(detail.conversation?.response_hash)} />
                  <Info label="是否含提示词" value={detail.conversation?.prompt_present ? '是' : '否'} />
                  <Info label="是否含响应" value={detail.conversation?.response_present ? '是' : '否'} />
                  <Info label="响应字符数" value={String(detail.conversation?.response_chars ?? 0)} />
                </div>
              </section>
            </div>
          )}

          {!loading && !error && !detail && (
            <div className="text-subtext text-sm">暂无数据</div>
          )}
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-custom border border-border bg-bg/30 px-3 py-2">
      <div className="text-xs text-subtext">{label}</div>
      <div className="text-sm text-heading break-all">{value}</div>
    </div>
  )
}
