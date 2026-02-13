export interface DecisionDetailResponse {
    decision: any;
    trade: any;
    conversation: any;
}

export const fetchDecisionDetail = async (id: string) => { return { decision: {}, trade: {}, conversation: {} }; }
export const fetchDecisionMarkers = async (id: string) => { return []; }
export const fetchKlines = async (symbol: string, timeframe: string) => { return []; }
