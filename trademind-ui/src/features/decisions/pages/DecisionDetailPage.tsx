import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDecisionById } from '../../../services/researchApi/decisions';
import type { Decision } from '../../../types/decision';
import { ArrowLeft, Calendar, Clock, ChartBar, AlertTriangle, Award } from 'lucide-react';
import { createChart, ColorType } from 'lightweight-charts';

export const DecisionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [decision, setDecision] = useState<Decision | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const chartContainerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (id) {
            fetchDecisionDetail(id);
        }
    }, [id]);

    const fetchDecisionDetail = async (decisionId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getDecisionById(decisionId);
            setDecision(response.data);

            // Fetch chart data separately or handle if included
            // const chartData = await getDecisionChart(decisionId);
        } catch (err) {
            setError('加载决策详情失败');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Initialize Chart
    useEffect(() => {
        if (!chartContainerRef.current || !decision) return;

        const styles = getComputedStyle(document.documentElement)
        const textColor = styles.getPropertyValue('--t-subtext').trim()
        const gridColor = styles.getPropertyValue('--t-border').trim()

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor,
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor },
            },
        });

        // Add Series... This would need actual candle data which we are mocking for now
        // For now, we will just show the container

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [decision]);


    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (error || !decision) return (
        <div className="flex flex-col items-center justify-center h-screen text-subtext">
            <h2 className="text-xl font-bold mb-2">加载失败</h2>
            <p>{error || '未找到该决策'}</p>
            <button
                onClick={() => navigate('/decisions')}
                className="mt-4 text-primary hover:underline"
            >
                返回决策库
            </button>
        </div>
    );

    return (
        <div className="p-6 bg-bg min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header / Nav */}
                <button
                    onClick={() => navigate('/decisions')}
                    className="flex items-center text-subtext hover:text-heading mb-6 transition"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回决策库
                </button>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Chart & Evidence */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Chart Section */}
                        <div className="bg-surface rounded-custom p-4 border border-border">
                            <h2 className="text-lg font-bold mb-4 text-heading flex items-center justify-between">
                                <span>{decision.symbol} 图表</span>
                                <span className={`text-sm px-2 py-1 rounded ${decision.direction === 'LONG' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                                    }`}>
                                    {decision.direction === 'LONG' ? '做多' : '做空'}
                                </span>
                            </h2>
                            <div
                                ref={chartContainerRef}
                                className="w-full h-[400px] bg-bg rounded relative flex items-center justify-center text-subtext"
                            >
                                {!loading && "价格图表占位区域"}
                            </div>
                        </div>

                        {/* Analysis / Evidence */}
                        <div className="bg-surface rounded-custom p-6 border border-border">
                            <h3 className="text-lg font-bold mb-4 text-heading">分析与依据</h3>
                            <div className="text-text">
                                <p>{decision.entryReason}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Key Info & Stats */}
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-surface rounded-custom p-6 border border-border">
                            <div className="flex items-center gap-3 mb-6">
                                <img
                                    src={decision.researcherAvatar || `https://ui-avatars.com/api/?name=${decision.researcherName}`}
                                    alt={decision.researcherName}
                                    className="w-12 h-12 rounded-full border-2 border-border"
                                />
                                <div>
                                    <h3 className="font-bold text-heading">{decision.researcherName}</h3>
                                    <p className="text-xs text-subtext">研究员</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b border-border">
                                    <span className="text-subtext flex items-center gap-2"><Clock className="w-4 h-4" /> 状态</span>
                                    <span className={`font-medium ${decision.status === 'open' ? 'text-primary' : 'text-subtext'}`}>{formatStatus(decision.status)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border">
                                    <span className="text-subtext flex items-center gap-2"><ChartBar className="w-4 h-4" /> 入场价</span>
                                    <span className="font-mono">{decision.entryPrice}</span>
                                </div>
                                {decision.stopLoss && (
                                    <div className="flex justify-between py-2 border-b border-border">
                                        <span className="text-subtext flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" /> 止损价</span>
                                        <span className="font-mono text-warning">{decision.stopLoss}</span>
                                    </div>
                                )}
                                {decision.takeProfit && (
                                    <div className="flex justify-between py-2 border-b border-border">
                                        <span className="text-subtext flex items-center gap-2"><Award className="w-4 h-4 text-success" /> 止盈价</span>
                                        <span className="font-mono text-success">{decision.takeProfit}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-2 border-b border-border">
                                    <span className="text-subtext flex items-center gap-2"><Calendar className="w-4 h-4" /> 日期</span>
                                    <span className="text-sm">{new Date(decision.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function formatStatus(status: Decision['status']): string {
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
