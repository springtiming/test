import React, { useState, useEffect, useCallback } from 'react';
import { getDecisions } from '../../../services/researchApi/decisions';
import type { Decision, DecisionStatus } from '../../../types/decision';

export const DecisionLibraryPage: React.FC = () => {
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters State
    const [symbol, setSymbol] = useState('');
    const [status, setStatus] = useState<DecisionStatus | ''>('');

    const fetchDecisions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getDecisions({
                symbol: symbol || undefined,
                status: status as DecisionStatus || undefined,
            });
            setDecisions(response.data.items);
        } catch (err) {
            setError('加载决策列表失败');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [symbol, status]);

    useEffect(() => {
        fetchDecisions();
    }, [fetchDecisions]);

    return (
        <div className="p-6 bg-bg min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-heading mb-8">决策库</h1>

                {/* Filter Bar */}
                <div className="bg-surface p-4 rounded-custom border border-border mb-6 flex gap-4 flex-wrap">
                    <input
                        type="text"
                        placeholder="搜索交易对（例如 BTC）"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        className="px-4 py-2 border rounded-md bg-input-bg text-text border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as DecisionStatus)}
                        className="px-4 py-2 border rounded-md bg-input-bg text-text border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">全部状态</option>
                        <option value="open">持仓中</option>
                        <option value="closed">已平仓</option>
                        <option value="cancelled">已取消</option>
                    </select>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-subtext">正在加载决策列表...</p>
                    </div>
                ) : error ? (
                    <div className="bg-danger/10 text-danger p-4 rounded-md">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {decisions.map((decision) => (
                            <div key={decision.id} className="bg-surface rounded-custom border border-border hover:border-primary/35 transition-colors overflow-hidden cursor-pointer">
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg text-heading">{decision.symbol}</span>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${decision.direction === 'LONG'
                                                ? 'bg-success/15 text-success'
                                                : 'bg-danger/15 text-danger'
                                                }`}>
                                                {decision.direction === 'LONG' ? '做多' : '做空'}
                                            </span>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${decision.status === 'open'
                                            ? 'bg-primary/15 text-primary'
                                            : 'bg-selected text-subtext'
                                            }`}>
                                            {formatStatus(decision.status)}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-text">
                                        <div className="flex justify-between">
                                            <span>入场价：</span>
                                            <span className="font-mono">{decision.entryPrice}</span>
                                        </div>
                                        {decision.pnl !== undefined && (
                                            <div className="flex justify-between">
                                                <span>收益率：</span>
                                                <span className={`font-mono font-bold ${decision.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {decision.pnl > 0 ? '+' : ''}{decision.pnl}%
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span>研究员：</span>
                                            <span>{decision.researcherName}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs text-subtext">
                                        <span>{new Date(decision.createdAt).toLocaleDateString()}</span>
                                        <div className="flex items-center gap-1">
                                            <span>{decision.score?.toFixed(1) || '-'}</span>
                                            <span>{decision.reviewCount || 0} 条评价</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

function formatStatus(status: DecisionStatus): string {
    switch (status) {
        case 'open':
            return '持仓中';
        case 'closed':
            return '已平仓';
        case 'cancelled':
            return '已取消';
        default:
            return status;
    }
}
