import { researchApi } from './client';
import type { DecisionStats } from '../../types/decision';

// Mock data
const MOCK_STATS: DecisionStats = {
    totalTrades: 156,
    winRate: 62.5,
    profitFactor: 1.85,
    avgPnl: 3.2,
    maxDrawdown: 12.5,
    sharpeRatio: 1.42,
    totalPnl: 45.8
};

export const getDecisionStats = async (): Promise<{ data: DecisionStats }> => {
    if (!import.meta.env.VITE_RESEARCH_API_BASE_URL) {
        return { data: MOCK_STATS };
    }
    const response = await researchApi.get('/analytics/decisions/summary');
    return response.data;
};
