import React, { useState, useEffect } from 'react';
import { getDecisionStats } from '../../../services/researchApi/analyticsData';
import type { DecisionStats } from '../../../types/decision';
import { TrendingUp, Activity, BarChart2, PieChart, Target, AlertOctagon, DollarSign } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
    const [stats, setStats] = useState<DecisionStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getDecisionStats();
                setStats(response.data);
            } catch (err) {
                console.error('加载统计数据失败', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!stats) return <div className="p-6 text-danger">加载统计数据失败</div>;

    const cards = [
        { label: '总交易数', value: stats.totalTrades, icon: Activity, color: 'text-primary' },
        { label: '胜率', value: `${stats.winRate}%`, icon: Target, color: 'text-success' },
        { label: '累计收益率', value: `${stats.totalPnl}%`, icon: DollarSign, color: stats.totalPnl >= 0 ? 'text-success' : 'text-danger' },
        { label: '平均收益率', value: `${stats.avgPnl}%`, icon: TrendingUp, color: stats.avgPnl >= 0 ? 'text-success' : 'text-danger' },
        { label: '盈亏比', value: stats.profitFactor, icon: BarChart2, color: 'text-primary' },
        { label: '最大回撤', value: `${stats.maxDrawdown}%`, icon: AlertOctagon, color: 'text-danger' },
        { label: '夏普比率', value: stats.sharpeRatio, icon: PieChart, color: 'text-primary' },
    ];

    return (
        <div className="p-6 bg-bg min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-heading mb-8">绩效分析</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, index) => (
                        <div key={index} className="bg-surface rounded-custom p-6 border border-border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-subtext text-sm font-medium">{card.label}</p>
                                    <h3 className={`text-2xl font-bold mt-1 ${card.color || 'text-heading'}`}>
                                        {card.value}
                                    </h3>
                                </div>
                                <div className={`p-3 rounded-full bg-selected ${card.color}`}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Placeholder for future charts */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-surface rounded-custom p-6 border border-border h-80 flex items-center justify-center text-subtext">
                        净值曲线预留区域
                    </div>
                    <div className="bg-surface rounded-custom p-6 border border-border h-80 flex items-center justify-center text-subtext">
                        月度表现预留区域
                    </div>
                </div>
            </div>
        </div>
    );
};
