// Demo data: same formulas the dashboard always used, now pure functions of the selected period.
export type Period = '7D' | '15D' | '30D' | '90D' | '180D' | '1Y';
export const PERIODS: Period[] = ['7D', '15D', '30D', '90D', '180D', '1Y'];
export const PERIOD_LABEL: Record<Period, string> = {
  '7D': '7 Dias',
  '15D': '15 Dias',
  '30D': '30 Dias',
  '90D': '90 Dias',
  '180D': '180 Dias',
  '1Y': '1 Ano',
};

const QUANTITY: Record<Period, number> = { '7D': 0.6, '15D': 0.75, '30D': 1, '90D': 1.4, '180D': 1.8, '1Y': 2.5 };
const SECTOR: Record<Period, number> = { '7D': 0.75, '15D': 0.85, '30D': 1, '90D': 1.35, '180D': 1.65, '1Y': 2 };
const CONFIG: Record<Period, { days: number; baseValue: number; growth: number }> = {
  '7D': { days: 7, baseValue: 390000, growth: 2800 },
  '15D': { days: 15, baseValue: 385000, growth: 3000 },
  '30D': { days: 30, baseValue: 380000, growth: 3200 },
  '90D': { days: 90, baseValue: 350000, growth: 1500 },
  '180D': { days: 180, baseValue: 320000, growth: 800 },
  '1Y': { days: 365, baseValue: 280000, growth: 400 },
};
const COMPOSITION: Record<Period, { stocks: number; bonds: number; reserve: number }> = {
  '7D': { stocks: 82, bonds: 14, reserve: 4 },
  '15D': { stocks: 83, bonds: 13, reserve: 4 },
  '30D': { stocks: 85, bonds: 12, reserve: 3 },
  '90D': { stocks: 87, bonds: 10, reserve: 3 },
  '180D': { stocks: 88, bonds: 9, reserve: 3 },
  '1Y': { stocks: 90, bonds: 8, reserve: 2 },
};

export interface Asset {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  sector: string;
  dayChange: number;
  initialValue: number;
  currentValue: number;
  profit: number;
  profitPercent: string;
}
export interface HistoryPoint { date: string; value: number; benchmark: number; volume?: number }
export interface SectorPoint { sector: string; value: number; percentage: number }
export interface PerformancePoint { period: string; portfolio: number; benchmark: number }
export interface VolatilityPoint { time: number; value: number; upperBand: number; lowerBand: number }
export interface Layer { level: number; name: string; value: number; percentage: number; color: string }

export interface PortfolioData {
  assets: Asset[];
  historical: HistoryPoint[];
  trading: HistoryPoint[];
  sectors: SectorPoint[];
  performance: PerformancePoint[];
  volatility: VolatilityPoint[];
  layers: Layer[];
  totalCurrent: number;
  totalProfit: number;
  totalProfitPercent: string;
}

const BASE_ASSETS = [
  { symbol: 'AAPL', name: 'Apple Inc.', quantity: 150, avgPrice: 145.3, currentPrice: 178.5, sector: 'Technology', dayChange: 2.3 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', quantity: 80, avgPrice: 2750, currentPrice: 3150.75, sector: 'Technology', dayChange: 1.8 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', quantity: 200, avgPrice: 310.2, currentPrice: 385.2, sector: 'Technology', dayChange: 1.5 },
  { symbol: 'TSLA', name: 'Tesla Inc.', quantity: 120, avgPrice: 215.4, currentPrice: 245.8, sector: 'Automotive', dayChange: -0.8 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', quantity: 90, avgPrice: 445.8, currentPrice: 498.3, sector: 'Technology', dayChange: 3.2 },
  { symbol: 'JPM', name: 'JPMorgan', quantity: 180, avgPrice: 142.5, currentPrice: 156.9, sector: 'Finance', dayChange: 0.5 },
];
const SECTORS = [
  { sector: 'Technology', value: 185000, base: 45, k: 15 },
  { sector: 'Finance', value: 82000, base: 20, k: -5 },
  { sector: 'Healthcare', value: 61500, base: 15, k: 8 },
  { sector: 'Automotive', value: 41000, base: 10, k: -3 },
  { sector: 'Energy', value: 28500, base: 7, k: 4 },
  { sector: 'Real Estate', value: 12000, base: 3, k: -1 },
];
const PERF = [
  { period: '1D', p: 2.3, b: 1.8, f: 0.9 },
  { period: '1W', p: 5.2, b: 4.1, f: 0.95 },
  { period: '1M', p: 8.7, b: 6.5, f: 1 },
  { period: '3M', p: 15.3, b: 12.8, f: 1.05 },
  { period: '6M', p: 22.4, b: 18.9, f: 1.1 },
  { period: '1Y', p: 34.2, b: 28.5, f: 1.15 },
];

// Deterministic, so a re-render never reshuffles the charts.
const seeded = (i: number, k: number) => Math.sin(i * k) * 0.5 + 0.5;

export function buildPortfolio(period: Period): PortfolioData {
  const qm = QUANTITY[period];
  const cfg = CONFIG[period];
  const sm = SECTOR[period];

  const assets: Asset[] = BASE_ASSETS.map((a) => {
    const quantity = Math.round(a.quantity * qm);
    return {
      ...a,
      quantity,
      initialValue: quantity * a.avgPrice,
      currentValue: quantity * a.currentPrice,
      profit: quantity * a.currentPrice - quantity * a.avgPrice,
      profitPercent: (((a.currentPrice - a.avgPrice) / a.avgPrice) * 100).toFixed(2),
    };
  });
  const totalCurrent = assets.reduce((s, a) => s + a.currentValue, 0);
  const totalInitial = assets.reduce((s, a) => s + a.initialValue, 0);
  const totalProfit = totalCurrent - totalInitial;

  const historical: HistoryPoint[] = Array.from({ length: cfg.days }, (_, i) => ({
    date: `${i + 1}`,
    value: cfg.baseValue + i * cfg.growth + seeded(i, 12.9898) * 4000,
    benchmark: cfg.baseValue + i * cfg.growth * 0.6 + seeded(i, 78.233) * 3000,
    volume: 15000000 + seeded(i, 43.758) * 10000000,
  }));

  const trading: HistoryPoint[] = Array.from({ length: cfg.days }, (_, i) => {
    const base = 60000;
    const trend = i * (400 / (cfg.days / 30));
    const freq = 0.5 * (30 / cfg.days);
    const interval = Math.max(1, Math.floor(cfg.days / 10));
    const hit = i % interval === 0;
    const wave = Math.sin(i * freq) * 30000 + Math.cos(i * freq * 0.6) * 20000;
    const spike = hit ? Math.sin(i * 9.123) * 0.5 * 35000 : 0;
    const noise = Math.sin(i * 15.789) * 12000;
    const iwave = -Math.sin(i * freq) * 28000 - Math.cos(i * freq * 0.6) * 18000;
    const ispike = hit ? -Math.sin(i * 11.456) * 0.5 * 30000 : 0;
    const inoise = Math.sin(i * 23.567) * 10000;
    return { date: `${i + 1}`, value: base + trend + wave + spike + noise, benchmark: base + trend + iwave + ispike + inoise };
  });

  const sectors: SectorPoint[] = SECTORS.map((s) => ({
    sector: s.sector,
    value: Math.round(s.value * sm),
    percentage: Math.round(s.base + (sm - 1) * s.k),
  }));

  const performance: PerformancePoint[] = PERF.map((r) => ({
    period: r.period,
    portfolio: Number((r.p * sm * r.f).toFixed(1)),
    benchmark: Number((r.b * sm * r.f).toFixed(1)),
  }));

  const volatility: VolatilityPoint[] = Array.from({ length: 40 }, (_, i) => {
    const v = 100 + i * 0.8 + Math.sin(i * 0.5) * 8 + Math.cos(i * 0.3) * 5 + (i % 8 === 0 ? Math.sin(i * 7.7) * 6 : 0);
    return { time: i, value: v, upperBand: v + 8, lowerBand: v - 8 };
  });

  const c = COMPOSITION[period];
  const layers: Layer[] = [
    { level: 1, name: 'Portfolio Total', value: totalCurrent, percentage: 100, color: '#ff3ccf' },
    { level: 2, name: 'Ações', value: (totalCurrent * c.stocks) / 100, percentage: c.stocks, color: '#8b5cf6' },
    { level: 3, name: 'Renda Fixa', value: (totalCurrent * c.bonds) / 100, percentage: c.bonds, color: '#22e6ff' },
    { level: 4, name: 'Reserva', value: (totalCurrent * c.reserve) / 100, percentage: c.reserve, color: '#b6ff3b' },
  ];

  return {
    assets,
    historical,
    trading,
    sectors,
    performance,
    volatility,
    layers,
    totalCurrent,
    totalProfit,
    totalProfitPercent: ((totalProfit / totalInitial) * 100).toFixed(2),
  };
}
