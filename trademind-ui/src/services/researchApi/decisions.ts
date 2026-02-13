import { researchApi } from './client';
import type { Decision, DecisionFilter, Direction, DecisionStatus } from '../../types/decision';

// Mock data generator for development
const generateMockDecisions = (): Decision[] => {
    return Array.from({ length: 20 }).map((_, i) => ({
        id: `D${1000 + i}`,
        symbol: i % 2 === 0 ? 'BTC/USDT' : 'ETH/USDT',
        direction: (i % 3 === 0 ? 'SHORT' : 'LONG') as Direction,
        status: (i % 4 === 0 ? 'open' : 'closed') as DecisionStatus,
        researcherId: `R${100 + (i % 5)}`,
        researcherName: `Researcher ${100 + (i % 5)}`,
        researcherAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        entryTime: new Date(Date.now() - i * 86400000).toISOString(),
        entryPrice: 50000 + i * 100,
        entryReason: 'Technical analysis suggests a breakout.',
        pnl: i % 4 === 0 ? undefined : (Math.random() * 20 - 5),
        score: 5 + Math.random() * 5,
        reviewCount: Math.floor(Math.random() * 50),
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
        // Adding missing required properties from interface
        stopLoss: 48000,
        takeProfit: 55000,
    }));
};

const MOCK_DECISIONS = generateMockDecisions();
// ... rest of the file logic 
export const getDecisions = async (filter?: DecisionFilter): Promise<{ data: { items: Decision[], total: number, page: number, pageSize: number } }> => {
    // Simulator for development if no backend
    if (!import.meta.env.VITE_RESEARCH_API_BASE_URL) {
        // Simple client-side filtering
        let items = [...MOCK_DECISIONS];
        if (filter?.symbol) items = items.filter(d => d.symbol.includes(filter.symbol!));
        if (filter?.status) items = items.filter(d => d.status === filter.status);

        // Pagination logic
        const page = filter?.page || 1;
        const pageSize = filter?.pageSize || 20;
        const start = (page - 1) * pageSize;
        const pagedItems = items.slice(start, start + pageSize);

        return {
            data: {
                items: pagedItems,
                total: items.length,
                page,
                pageSize
            }
        };
    }

    const response = await researchApi.get('/decisions', { params: filter });
    return response.data;
};

export const getDecisionById = async (id: string): Promise<{ data: Decision }> => {
    if (!import.meta.env.VITE_RESEARCH_API_BASE_URL) {
        const decision = MOCK_DECISIONS.find(d => d.id === id);
        if (decision) return { data: decision };
        // Simulate Axios error
        throw { response: { status: 404 } };
    }
    const response = await researchApi.get(`/decisions/${id}`);
    return response.data;
};

export const getDecisionChart = async (id: string, timeframe: string = '4h') => {
    // Return mock chart data structure
    if (!import.meta.env.VITE_RESEARCH_API_BASE_URL) {
        return {
            data: {
                candles: [], // In real app, generate mock candles
                markers: []
            }
        }
    }
    const response = await researchApi.get(`/decisions/${id}/chart`, { params: { timeframe } });
    return response.data;
}
