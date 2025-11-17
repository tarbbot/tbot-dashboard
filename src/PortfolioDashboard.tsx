import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Sector,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const PortfolioDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModule, setActiveModule] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [hoveredCircle, setHoveredCircle] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeSectorIndex, setActiveSectorIndex] = useState<number | undefined>(undefined);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30D');
  const [isPieChartVisible, setIsPieChartVisible] = useState(true);
  const [areLineChartsVisible, setAreLineChartsVisible] = useState(true);
  const [areBarChartsVisible, setAreBarChartsVisible] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Animated counter states
  const [animatedTotalValue, setAnimatedTotalValue] = useState(0);
  const [animatedProfit, setAnimatedProfit] = useState(0);
  const [animatedAssetCount, setAnimatedAssetCount] = useState(0);
  const [animatedDayChange, setAnimatedDayChange] = useState(0);

  // Responsive states
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  useEffect(() => {
    setIsPieChartVisible(false);
    setAreLineChartsVisible(false);
    setAreBarChartsVisible(false);
    const pieTimer = setTimeout(() => {
      setIsPieChartVisible(true);
    }, 100);
    const lineTimer = setTimeout(() => {
      setAreLineChartsVisible(true);
    }, 50);
    const barTimer = setTimeout(() => {
      setAreBarChartsVisible(true);
    }, 150);
    return () => {
      clearTimeout(pieTimer);
      clearTimeout(lineTimer);
      clearTimeout(barTimer);
    };
  }, [selectedPeriod]);

  // Define searchable components
  const componentList = [
    { id: 'valor-total', name: 'Valor Total', keywords: ['valor', 'total', 'patrimonio'] },
    { id: 'lucro-realizado', name: 'Lucro Realizado', keywords: ['lucro', 'realizado', 'ganho'] },
    { id: 'ativos', name: 'Ativos', keywords: ['ativos', 'quantidade'] },
    { id: 'performance', name: 'Performance', keywords: ['performance', 'rentabilidade'] },
    { id: 'crescimento', name: 'Crescimento Patrimonial', keywords: ['crescimento', 'patrimonial', 'evolucao', 'grafico'] },
    { id: 'setores', name: 'Distribuição por Setor', keywords: ['distribuicao', 'setor', 'setores', 'pizza'] },
    { id: 'comparativa', name: 'Performance Comparativa', keywords: ['comparativa', 'benchmark', 'barras'] },
    { id: 'volume', name: 'Volume por Ativo', keywords: ['volume', 'ativo', 'quantidade'] },
    { id: 'circulos', name: 'Composição em Camadas', keywords: ['circulos', 'camadas', 'composicao', 'aneis'] },
  ];

  // Check if component should be visible
  const isComponentVisible = (componentId: string) => {
    if (searchTerm.trim() === '') return true;
    
    const search = searchTerm.toLowerCase();
    const component = componentList.find(c => c.id === componentId);
    
    if (!component) return true;
    
    return component.name.toLowerCase().includes(search) || 
           component.keywords.some(kw => kw.includes(search));
  };

  // Get search suggestions
  const searchSuggestions = searchTerm.trim() === '' 
    ? [] 
    : componentList.filter(comp => {
        const search = searchTerm.toLowerCase();
        return comp.name.toLowerCase().includes(search) || 
               comp.keywords.some(kw => kw.includes(search));
      });

  // Mock Data - quantities vary DRAMATICALLY based on period
  const getQuantityMultiplier = (period: string) => {
    switch (period) {
      case '7D': return 0.6;
      case '15D': return 0.75;
      case '30D': return 1.0;
      case '90D': return 1.4;
      case '180D': return 1.8;
      case '1Y': return 2.5;
      default: return 1.0;
    }
  };

  const quantityMultiplier = getQuantityMultiplier(selectedPeriod);

  const portfolioAssets = [
    { symbol: 'AAPL', name: 'Apple Inc.', quantity: Math.round(150 * quantityMultiplier), avgPrice: 145.30, currentPrice: 178.50, sector: 'Technology', dayChange: 2.3 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', quantity: Math.round(80 * quantityMultiplier), avgPrice: 2750, currentPrice: 3150.75, sector: 'Technology', dayChange: 1.8 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', quantity: Math.round(200 * quantityMultiplier), avgPrice: 310.20, currentPrice: 385.20, sector: 'Technology', dayChange: 1.5 },
    { symbol: 'TSLA', name: 'Tesla Inc.', quantity: Math.round(120 * quantityMultiplier), avgPrice: 215.40, currentPrice: 245.80, sector: 'Automotive', dayChange: -0.8 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', quantity: Math.round(90 * quantityMultiplier), avgPrice: 445.80, currentPrice: 498.30, sector: 'Technology', dayChange: 3.2 },
    { symbol: 'JPM', name: 'JPMorgan', quantity: Math.round(180 * quantityMultiplier), avgPrice: 142.50, currentPrice: 156.90, sector: 'Finance', dayChange: 0.5 },
  ].map(asset => ({
    ...asset,
    initialValue: asset.quantity * asset.avgPrice,
    currentValue: asset.quantity * asset.currentPrice,
    profit: (asset.quantity * asset.currentPrice) - (asset.quantity * asset.avgPrice),
    profitPercent: (((asset.currentPrice - asset.avgPrice) / asset.avgPrice) * 100).toFixed(2),
  }));

  // Generate historical data based on selected period
  const getPeriodConfig = (period: string) => {
    switch (period) {
      case '7D': return { days: 7, baseValue: 390000, growth: 2800 };
      case '15D': return { days: 15, baseValue: 385000, growth: 3000 };
      case '30D': return { days: 30, baseValue: 380000, growth: 3200 };
      case '90D': return { days: 90, baseValue: 350000, growth: 1500 };
      case '180D': return { days: 180, baseValue: 320000, growth: 800 };
      case '1Y': return { days: 365, baseValue: 280000, growth: 400 };
      default: return { days: 30, baseValue: 380000, growth: 3200 };
    }
  };

  const config = getPeriodConfig(selectedPeriod);

  const historicalData = Array.from({ length: config.days }, (_, i) => {
    // Using a seeded pseudo-random value based on index for consistency
    const seededRandom1 = Math.sin(i * 12.9898) * 0.5 + 0.5;
    const seededRandom2 = Math.sin(i * 78.233) * 0.5 + 0.5;
    const seededRandom3 = Math.sin(i * 43.758) * 0.5 + 0.5;

    // Portfolio grows much faster than benchmark
    // Portfolio maintains full growth rate
    // Benchmark grows at only 60% of portfolio rate
    const portfolioGrowth = config.growth;
    const benchmarkGrowth = config.growth * 0.60;

    return {
      date: `${i + 1}`,
      value: config.baseValue + (i * portfolioGrowth) + (seededRandom1 * 4000),
      benchmark: config.baseValue + (i * benchmarkGrowth) + (seededRandom2 * 3000),
      volume: 15000000 + seededRandom3 * 10000000,
    };
  });

  // Volatile trading data - more volatile than historical data with inverse correlation
  const volatileTradingData = Array.from({ length: config.days }, (_, i) => {
    const baseValue = 60000;
    const trend = i * (400 / (config.days / 30)); // Adjust trend based on period

    // Main volatility waves with very high amplitude
    const frequency = 0.5 * (30 / config.days); // Adjust frequency based on period
    const mainWave = Math.sin(i * frequency) * 30000;
    const secondWave = Math.cos(i * frequency * 0.6) * 20000;

    // Sharp spikes and drops using deterministic pattern
    const spikeInterval = Math.floor(config.days / 10);
    const seededSpike = Math.sin(i * 9.123) * 0.5;
    const spike = i % spikeInterval === 0 ? seededSpike * 35000 : 0;

    // Deterministic noise using sine wave
    const randomNoise = Math.sin(i * 15.789) * 12000;

    const tradingValue = baseValue + trend + mainWave + secondWave + spike + randomNoise;

    // Benchmark is INVERSELY proportional - when trading goes up, benchmark goes down
    const inverseBenchmarkWave = -Math.sin(i * frequency) * 28000;
    const inverseBenchmarkSecondWave = -Math.cos(i * frequency * 0.6) * 18000;

    // Additional inverse spike pattern
    const seededInverseSpike = Math.sin(i * 11.456) * 0.5;
    const inverseSpike = i % spikeInterval === 0 ? -seededInverseSpike * 30000 : 0;

    const benchmarkNoise = Math.sin(i * 23.567) * 10000;

    const benchmarkValue = baseValue + trend + inverseBenchmarkWave + inverseBenchmarkSecondWave + inverseSpike + benchmarkNoise;

    return {
      date: `${i + 1}`,
      value: tradingValue,
      benchmark: benchmarkValue,
    };
  });

  // Sector data changes DRAMATICALLY based on period
  const getSectorMultiplier = (period: string) => {
    switch (period) {
      case '7D': return 0.75;
      case '15D': return 0.85;
      case '30D': return 1.0;
      case '90D': return 1.35;
      case '180D': return 1.65;
      case '1Y': return 2.0;
      default: return 1.0;
    }
  };

  const multiplier = getSectorMultiplier(selectedPeriod);

  const sectorData = [
    {
      sector: 'Technology',
      value: Math.round(185000 * multiplier),
      percentage: Math.round(45 + (multiplier - 1) * 15)
    },
    {
      sector: 'Finance',
      value: Math.round(82000 * multiplier),
      percentage: Math.round(20 - (multiplier - 1) * 5)
    },
    {
      sector: 'Healthcare',
      value: Math.round(61500 * multiplier),
      percentage: Math.round(15 + (multiplier - 1) * 8)
    },
    {
      sector: 'Automotive',
      value: Math.round(41000 * multiplier),
      percentage: Math.round(10 - (multiplier - 1) * 3)
    },
    {
      sector: 'Energy',
      value: Math.round(28500 * multiplier),
      percentage: Math.round(7 + (multiplier - 1) * 4)
    },
    {
      sector: 'Real Estate',
      value: Math.round(12000 * multiplier),
      percentage: Math.round(3 - (multiplier - 1) * 1)
    },
  ];

  // Performance data based on selected period
  const getPerformanceData = (period: string) => {
    const baseMultiplier = getSectorMultiplier(period);
    return [
      {
        period: '1D',
        portfolio: Number((2.3 * baseMultiplier * 0.9).toFixed(1)),
        benchmark: Number((1.8 * baseMultiplier * 0.9).toFixed(1))
      },
      {
        period: '1W',
        portfolio: Number((5.2 * baseMultiplier * 0.95).toFixed(1)),
        benchmark: Number((4.1 * baseMultiplier * 0.95).toFixed(1))
      },
      {
        period: '1M',
        portfolio: Number((8.7 * baseMultiplier).toFixed(1)),
        benchmark: Number((6.5 * baseMultiplier).toFixed(1))
      },
      {
        period: '3M',
        portfolio: Number((15.3 * baseMultiplier * 1.05).toFixed(1)),
        benchmark: Number((12.8 * baseMultiplier * 1.05).toFixed(1))
      },
      {
        period: '6M',
        portfolio: Number((22.4 * baseMultiplier * 1.1).toFixed(1)),
        benchmark: Number((18.9 * baseMultiplier * 1.1).toFixed(1))
      },
      {
        period: '1Y',
        portfolio: Number((34.2 * baseMultiplier * 1.15).toFixed(1)),
        benchmark: Number((28.5 * baseMultiplier * 1.15).toFixed(1))
      },
    ];
  };

  const performanceData = getPerformanceData(selectedPeriod);

  // Volatility data for the new chart
  const volatilityData = Array.from({ length: 40 }, (_, i) => {
    const base = 100;
    const trend = i * 0.8;
    const volatility = Math.sin(i * 0.5) * 8 + Math.cos(i * 0.3) * 5;
    const spike = i % 8 === 0 ? Math.random() * 12 - 6 : 0;
    return {
      time: i,
      value: base + trend + volatility + spike,
      upperBand: base + trend + volatility + spike + 8,
      lowerBand: base + trend + volatility + spike - 8,
    };
  });

  const totalCurrentValue = portfolioAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const totalInitialValue = portfolioAssets.reduce((sum, asset) => sum + asset.initialValue, 0);
  const totalProfit = totalCurrentValue - totalInitialValue;
  const totalProfitPercent = ((totalProfit / totalInitialValue) * 100).toFixed(2);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  };

  const formatPercent = (value: number | string) => {
    return `${Number(value) >= 0 ? '+' : ''}${value}%`;
  };

  // Animate numbers on mount and period change
  useEffect(() => {
    const animateValue = (
      start: number,
      end: number,
      duration: number,
      setter: (value: number) => void
    ) => {
      const startTime = performance.now();
      const difference = end - start;

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out cubic)
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        const current = start + difference * easeProgress;
        setter(current);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setter(end);
        }
      };

      requestAnimationFrame(step);
    };

    // Reset values to 0 first
    setAnimatedTotalValue(0);
    setAnimatedProfit(0);
    setAnimatedAssetCount(0);
    setAnimatedDayChange(0);

    // Start animations with slight delays for staggered effect
    setTimeout(() => animateValue(0, totalCurrentValue, 1500, setAnimatedTotalValue), 100);
    setTimeout(() => animateValue(0, totalProfit, 1500, setAnimatedProfit), 200);
    setTimeout(() => animateValue(0, portfolioAssets.length, 1200, setAnimatedAssetCount), 300);
    setTimeout(() => animateValue(0, 2.3, 1200, setAnimatedDayChange), 400);
  }, [selectedPeriod, totalCurrentValue, totalProfit, portfolioAssets.length]);

  // Custom active shape renderer for pie chart
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{
            filter: `brightness(1.3) drop-shadow(0 0 12px ${fill})`,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </g>
    );
  };

  // Cores vibrantes para gráficos circulares com interpolação
  const VIVID_COLORS = ['#FF006E', '#FF4495', '#8338EC', '#3A86FF', '#06FFA5', '#FFBE0B'];
  
  // Nested circles data - Portfolio composition by layers (changes with period)
  const getCompositionPercentages = (period: string) => {
    switch (period) {
      case '7D': return { stocks: 82, bonds: 14, reserve: 4 };
      case '15D': return { stocks: 83, bonds: 13, reserve: 4 };
      case '30D': return { stocks: 85, bonds: 12, reserve: 3 };
      case '90D': return { stocks: 87, bonds: 10, reserve: 3 };
      case '180D': return { stocks: 88, bonds: 9, reserve: 3 };
      case '1Y': return { stocks: 90, bonds: 8, reserve: 2 };
      default: return { stocks: 85, bonds: 12, reserve: 3 };
    }
  };

  const composition = getCompositionPercentages(selectedPeriod);

  const nestedCirclesData = [
    {
      level: 1,
      name: 'Portfolio Total',
      value: totalCurrentValue,
      percentage: 100,
      color: '#FF006E',
      size: 180
    },
    {
      level: 2,
      name: 'Ações',
      value: totalCurrentValue * (composition.stocks / 100),
      percentage: composition.stocks,
      color: '#8338EC',
      size: 145
    },
    {
      level: 3,
      name: 'Renda Fixa',
      value: totalCurrentValue * (composition.bonds / 100),
      percentage: composition.bonds,
      color: '#3A86FF',
      size: 110
    },
    {
      level: 4,
      name: 'Reserva',
      value: totalCurrentValue * (composition.reserve / 100),
      percentage: composition.reserve,
      color: '#06FFA5',
      size: 75
    },
  ];
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'markets', label: 'Mercados' },
    { id: 'reports', label: 'Relatórios' },
    { id: 'settings', label: 'Config' },
  ];

  const getMenuIcon = (id: string, isActive: boolean) => {
    const color = isActive ? '#8338EC' : 'rgba(255, 255, 255, 0.6)';
    const size = 20;

    switch(id) {
      case 'dashboard':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        );
      case 'portfolio':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        );
      case 'analytics':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        );
      case 'markets':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        );
      case 'reports':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
      case 'settings':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m-6-6H1m6 0h6m6 0h5" />
            <path d="m19.07 4.93-4.24 4.24m0 5.66 4.24 4.24M4.93 4.93l4.24 4.24m0 5.66-4.24 4.24" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0f0518 50%, #000000 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '100vw',
      boxSizing: 'border-box'
    }}>
      {/* Animated background gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(131, 56, 236, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(58, 134, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(6, 255, 165, 0.1) 0%, transparent 40%)',
        pointerEvents: 'none',
        animation: 'float 20s ease-in-out infinite'
      }}></div>

      {/* Floating particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${VIVID_COLORS[i % VIVID_COLORS.length]}80, transparent)`,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `floatParticle ${Math.random() * 10 + 15}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5 + 0.3
            }}
          />
        ))}
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileSidebar && isMobile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 999,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: isMobile ? '280px' : '240px',
        background: 'linear-gradient(180deg, rgba(10, 10, 31, 0.95) 0%, rgba(26, 10, 46, 0.95) 50%, rgba(15, 5, 24, 0.95) 100%)',
        backdropFilter: 'blur(30px)',
        borderRight: '1px solid rgba(131, 56, 236, 0.15)',
        display: isMobile && !showMobileSidebar ? 'none' : 'flex',
        flexDirection: 'column',
        padding: isMobile ? '24px 16px' : '32px 24px',
        boxShadow: '4px 0 60px rgba(131, 56, 236, 0.2), inset -1px 0 0 rgba(255, 255, 255, 0.03)',
        zIndex: 1000,
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        bottom: 0,
        gap: isMobile ? '24px' : '32px',
        transition: 'transform 0.3s ease',
        transform: isMobile && showMobileSidebar ? 'translateX(0)' : isMobile ? 'translateX(-100%)' : 'translateX(0)'
      }}>
        {/* Logo Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #8338EC 0%, #6D28D9 50%, #3A86FF 100%)',
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(131, 56, 236, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05) rotate(5deg)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(131, 56, 236, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(131, 56, 236, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)';
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#fff',
              letterSpacing: '-0.5px'
            }}>
              Portfolio
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.4)',
              fontWeight: '600',
              letterSpacing: '0.5px',
              marginTop: '2px'
            }}>
              PRO DASHBOARD
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{
            fontSize: '10px',
            fontWeight: '700',
            color: 'rgba(255, 255, 255, 0.3)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px',
            paddingLeft: '12px'
          }}>
            Menu
          </div>
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              style={{
                width: '100%',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '0 14px',
                borderRadius: '14px',
                background: activeModule === item.id
                  ? 'linear-gradient(135deg, rgba(131, 56, 236, 0.15) 0%, rgba(58, 134, 255, 0.15) 100%)'
                  : 'transparent',
                border: activeModule === item.id
                  ? '1px solid rgba(131, 56, 236, 0.3)'
                  : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                boxShadow: activeModule === item.id
                  ? '0 4px 20px rgba(131, 56, 236, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeModule !== item.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                } else {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(131, 56, 236, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeModule !== item.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.border = '1px solid transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                } else {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(131, 56, 236, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                }
              }}
            >
              {activeModule === item.id && (
                <div style={{
                  position: 'absolute',
                  left: '0',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '3px',
                  height: '24px',
                  background: 'linear-gradient(180deg, #8338EC 0%, #3A86FF 100%)',
                  borderRadius: '0 4px 4px 0',
                  boxShadow: '0 0 12px rgba(131, 56, 236, 0.8)'
                }} />
              )}
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: activeModule === item.id ? 'drop-shadow(0 0 8px rgba(131, 56, 236, 0.6))' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {getMenuIcon(item.id, activeModule === item.id)}
              </span>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: activeModule === item.id ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '0.2px',
                transition: 'all 0.3s ease'
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
        width: isMobile ? '100%' : 'auto',
        maxWidth: isMobile ? '100vw' : 'none',
        overflowX: 'hidden'
      }}>
        {/* Top Header Bar */}
        <div style={{
          height: isMobile ? '64px' : '80px',
          background: 'linear-gradient(180deg, rgba(10, 10, 31, 0.9) 0%, rgba(26, 10, 46, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(131, 56, 236, 0.2)',
          display: 'flex',
          alignItems: 'center',
          padding: isMobile ? '0 16px' : '0 40px',
          gap: isMobile ? '12px' : '32px',
          boxShadow: '0 4px 40px rgba(131, 56, 236, 0.2)',
          position: 'relative',
          zIndex: 9999
        }}>
          {/* Hamburger Menu Button (Mobile Only) */}
          {isMobile && (
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              style={{
                background: 'rgba(131, 56, 236, 0.2)',
                border: '1px solid rgba(131, 56, 236, 0.3)',
                borderRadius: '12px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          )}

          {/* Search Bar with Suggestions */}
          {!isMobile && (
          <div style={{ position: 'relative', flex: 1, maxWidth: '600px', zIndex: 10000 }}>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.4)'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Pesquisar componentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px 14px 52px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: '500',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.border = '1px solid rgba(131, 56, 236, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                }}
              />
            </div>

            {/* Search Suggestions Dropdown */}
            {searchSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.98) 0%, rgba(26, 10, 46, 0.98) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(131, 56, 236, 0.3)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(131, 56, 236, 0.4)',
                overflow: 'hidden',
                zIndex: 10000
              }}>
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    onClick={() => setSearchTerm(suggestion.name)}
                    style={{
                      padding: '12px 20px',
                      cursor: 'pointer',
                      borderBottom: index < searchSuggestions.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(131, 56, 236, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600',
                      color: '#fff',
                      marginBottom: '4px'
                    }}>
                      {suggestion.name}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'rgba(255, 255, 255, 0.5)'
                    }}>
                      {suggestion.keywords.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Period Selector */}
          {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {['7D', '15D', '30D', '90D', '180D', '1Y'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                style={{
                  padding: isTablet ? '8px 14px' : '10px 18px',
                  background: selectedPeriod === period
                    ? 'linear-gradient(135deg, rgba(131, 56, 236, 0.3) 0%, rgba(58, 134, 255, 0.3) 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: selectedPeriod === period
                    ? '1px solid rgba(131, 56, 236, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: selectedPeriod === period ? '#8338EC' : 'rgba(255, 255, 255, 0.7)',
                  fontSize: isTablet ? '12px' : '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedPeriod === period ? '0 4px 20px rgba(131, 56, 236, 0.4)' : 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  if (selectedPeriod !== period) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(131, 56, 236, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPeriod !== period) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                {period}
              </button>
            ))}
          </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Right Side Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(131, 56, 236, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(131, 56, 236, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#FF006E',
                  border: '2px solid rgba(10, 10, 31, 0.9)',
                  boxShadow: '0 0 8px #FF006E',
                  animation: 'pulse 2s ease-in-out infinite'
                }}></div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowMessages(!showMessages)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(131, 56, 236, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(131, 56, 236, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
            </div>

            {/* Divider */}
            <div style={{
              width: '1px',
              height: '32px',
              background: 'rgba(255, 255, 255, 0.1)'
            }} />

            {/* User Profile Button */}
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 16px',
                  background: showUserMenu ? 'rgba(6, 255, 165, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: showUserMenu ? '1px solid rgba(6, 255, 165, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(6, 255, 165, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(6, 255, 165, 0.3)';
                }}
                onMouseLeave={(e) => {
                  if (!showUserMenu) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #06FFA5 0%, #3A86FF 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(6, 255, 165, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#fff',
                    lineHeight: '1.2'
                  }}>
                    User Name
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(6, 255, 165, 0.8)',
                    fontWeight: '600'
                  }}>
                    Premium
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '240px',
                  background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.98) 0%, rgba(26, 10, 46, 0.98) 100%)',
                  backdropFilter: 'blur(30px)',
                  border: '1px solid rgba(6, 255, 165, 0.3)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(6, 255, 165, 0.4)',
                  overflow: 'hidden',
                  zIndex: 10000
                }}>
                  {/* Profile Info */}
                  <div style={{
                    padding: '20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#fff',
                      marginBottom: '4px'
                    }}>
                      User Name
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.5)'
                    }}>
                      user@email.com
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div style={{ padding: '8px' }}>
                    <div
                      onClick={() => {
                        console.log('Profile clicked');
                        setShowUserMenu(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }}>
                        Meu Perfil
                      </span>
                    </div>

                    <div
                      onClick={() => {
                        console.log('Settings clicked');
                        setShowUserMenu(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6" />
                        <path d="m4.93 4.93 4.24 4.24m5.66 0 4.24-4.24" />
                        <path d="M1 12h6m6 0h6" />
                        <path d="m4.93 19.07 4.24-4.24m5.66 0 4.24 4.24" />
                      </svg>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }}>
                        Configurações
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{
                    height: '1px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    margin: '8px 0'
                  }} />

                  {/* Logout */}
                  <div style={{ padding: '8px' }}>
                    <div
                      onClick={() => {
                        setIsLoggedIn(!isLoggedIn);
                        setShowUserMenu(false);
                        console.log(isLoggedIn ? 'Logging out...' : 'Logging in...');
                      }}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: 'rgba(131, 56, 236, 0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(131, 56, 236, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(131, 56, 236, 0.05)';
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8338EC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#FF006E' }}>
                        {isLoggedIn ? 'Logout' : 'Login'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div style={{
          flex: 1,
          padding: isMobile ? '12px' : isTablet ? '24px' : '40px',
          overflowY: 'auto',
          overflowX: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Dashboard Module */}
          {activeModule === 'dashboard' && (
            <>
          {/* Mobile Period Selector */}
          {isMobile && (
            <div style={{ marginBottom: '20px' }}>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(131, 56, 236, 0.2)',
                  border: '1px solid rgba(131, 56, 236, 0.5)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="7D" style={{ background: '#1a0a2e' }}>7 Dias</option>
                <option value="15D" style={{ background: '#1a0a2e' }}>15 Dias</option>
                <option value="30D" style={{ background: '#1a0a2e' }}>30 Dias</option>
                <option value="90D" style={{ background: '#1a0a2e' }}>90 Dias</option>
                <option value="180D" style={{ background: '#1a0a2e' }}>180 Dias</option>
                <option value="1Y" style={{ background: '#1a0a2e' }}>1 Ano</option>
              </select>
            </div>
          )}

          {/* Top Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '16px' : '24px',
            marginBottom: isMobile ? '20px' : '32px'
          }}>
            {/* Card 1: Total Value */}
            <div style={{
              display: isComponentVisible('valor-total') ? 'block' : 'none',
              background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: isMobile ? '12px' : '24px',
              padding: isMobile ? '16px' : '28px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(131, 56, 236, 0.3), 0 0 0 1px rgba(131, 56, 236, 0.2)',
              boxSizing: 'border-box'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                opacity: 0.1,
                transform: 'rotate(15deg)'
              }}>
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#FF006E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v12M9 9c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2a2 2 0 0 0-2 2 2 2 0 0 0 2 2h2a2 2 0 0 1 2 2" />
                </svg>
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '600', marginBottom: '12px' }}>
                VALOR TOTAL
              </div>
              <div style={{
                fontSize: isMobile ? '24px' : '36px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #8338EC 0%, #3A86FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
                lineHeight: '1.2',
                wordBreak: 'break-word'
              }}>
                {formatCurrency(animatedTotalValue)}
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: totalProfit >= 0 ? '#06FFA5' : '#FF006E',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>{totalProfit >= 0 ? '↗' : '↘'}</span>
                {formatPercent(totalProfitPercent)}
              </div>
            </div>

            {/* Card 2: Realized Profit */}
            <div style={{
              display: isComponentVisible('lucro-realizado') ? 'block' : 'none',
              background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: isMobile ? '12px' : '24px',
              padding: isMobile ? '16px' : '28px',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(6, 255, 165, 0.3), 0 0 0 1px rgba(6, 255, 165, 0.2)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                opacity: 0.1,
                transform: 'rotate(15deg)'
              }}>
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#06FFA5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  <path d="M18 7l4-4m0 0l-4-4m4 4h-8" />
                </svg>
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '600', marginBottom: '12px' }}>
                LUCRO REALIZADO
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #06FFA5 0%, #3A86FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}>
                {formatCurrency(animatedProfit)}
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#06FFA5',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>✓</span>
                Rentabilidade: {totalProfitPercent}%
              </div>
            </div>

            {/* Card 3: Assets */}
            <div style={{
              display: isComponentVisible('ativos') ? 'block' : 'none',
              background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: isMobile ? '12px' : '24px',
              padding: isMobile ? '16px' : '28px',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(131, 56, 236, 0.3), 0 0 0 1px rgba(131, 56, 236, 0.2)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                opacity: 0.1,
                transform: 'rotate(15deg)'
              }}>
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#8338EC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '600', marginBottom: '12px' }}>
                ATIVOS
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #8338EC 0%, #3A86FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}>
                {Math.round(animatedAssetCount)}
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: '700'
              }}>
                Em {sectorData.length} setores
              </div>
            </div>

            {/* Card 4: Performance */}
            <div style={{
              display: isComponentVisible('performance') ? 'block' : 'none',
              background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: isMobile ? '12px' : '24px',
              padding: isMobile ? '16px' : '28px',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(58, 134, 255, 0.3), 0 0 0 1px rgba(58, 134, 255, 0.2)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                opacity: 0.1,
                transform: 'rotate(15deg)'
              }}>
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#FFBE0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '600', marginBottom: '12px' }}>
                PERFORMANCE (1Y)
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #3A86FF 0%, #8338EC 50%, #6D28D9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}>
                +{animatedDayChange.toFixed(1)}%
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#FFBE0B',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>🔥</span>
                vs Benchmark: +28.5%
              </div>
            </div>
          </div>

          {/* Middle Charts Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile || isTablet ? '1fr' : '2fr 1fr',
            gap: isMobile ? '16px' : '24px',
            marginTop: isMobile ? '30px' : '0',
            marginBottom: isMobile ? '20px' : '32px'
          }}>
            {/* Left Column - Growth Charts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Growth Chart */}
              <div style={{
                display: isComponentVisible('crescimento') ? 'block' : 'none',
                background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: isMobile ? '12px' : '24px',
                padding: isMobile ? '12px 6px' : '32px',
                boxSizing: 'border-box',
                boxShadow: '0 8px 32px rgba(131, 56, 236, 0.3), 0 0 0 1px rgba(131, 56, 236, 0.2)',
                height: isMobile ? 'auto' : '352px',
                minHeight: isMobile ? '340px' : 'auto'
              }}>
                <h3 style={{
                  fontSize: isMobile ? '16px' : '20px',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #8338EC 0%, #3A86FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: isMobile ? '0 0 12px 0' : '0 0 24px 0'
                }}>
                  📊 Crescimento Patrimonial
                </h3>
                {areLineChartsVisible && (
                <ResponsiveContainer width="100%" height={isMobile ? 240 : 200} key={`growth-${selectedPeriod}`}>
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF006E" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#8338EC" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3A86FF" stopOpacity={0.6}/>
                        <stop offset="100%" stopColor="#06FFA5" stopOpacity={0.1}/>
                      </linearGradient>
                      {/* Animated shine gradient for main line (left to right) */}
                      <linearGradient id="lineShineGrowth" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF006E" stopOpacity="1" />
                        <stop offset="-0.15" stopColor="#FF006E" stopOpacity="1">
                          <animate attributeName="offset" values="-0.15; 1.0" dur="2.5s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="-0.05" stopColor="#ffffff" stopOpacity="1">
                          <animate attributeName="offset" values="-0.05; 1.1" dur="2.5s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="0.05" stopColor="#FF006E" stopOpacity="1">
                          <animate attributeName="offset" values="0.05; 1.2" dur="2.5s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="#FF006E" stopOpacity="1" />
                      </linearGradient>
                      {/* Animated shine gradient for benchmark line (right to left) */}
                      <linearGradient id="lineShineGrowthReverse" x1="100%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#3A86FF" stopOpacity="1" />
                        <stop offset="-0.15" stopColor="#3A86FF" stopOpacity="1">
                          <animate attributeName="offset" values="-0.15; 1.0" dur="2.5s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="-0.05" stopColor="#ffffff" stopOpacity="1">
                          <animate attributeName="offset" values="-0.05; 1.1" dur="2.5s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="0.05" stopColor="#3A86FF" stopOpacity="1">
                          <animate attributeName="offset" values="0.05; 1.2" dur="2.5s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="#3A86FF" stopOpacity="1" />
                      </linearGradient>
                      <filter id="glowGrowth">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255, 255, 255, 0.3)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                      stroke="rgba(255, 255, 255, 0.3)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12, fontWeight: 600 }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div style={{
                              background: 'rgba(10, 10, 31, 0.98)',
                              border: '1px solid rgba(131, 56, 236, 0.5)',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              backdropFilter: 'blur(10px)'
                            }}>
                              <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>
                                {payload[0].payload.date}
                              </div>
                              {payload.map((entry: any, index: number) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: index < payload.length - 1 ? '6px' : '0' }}>
                                  <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: entry.name === 'Portfolio' ? '#FF006E' : '#3A86FF',
                                    boxShadow: `0 0 6px ${entry.name === 'Portfolio' ? '#FF006E' : '#3A86FF'}`
                                  }} />
                                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>
                                    {entry.name}:
                                  </span>
                                  <span style={{ fontSize: '14px', color: '#fff', fontWeight: '700' }}>
                                    {formatCurrency(Number(entry.value))}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="benchmark"
                      stroke="url(#lineShineGrowthReverse)"
                      strokeWidth={2}
                      fill="url(#colorBenchmark)"
                      name="Benchmark"
                      isAnimationActive={false}
                      filter="url(#glowGrowth)"
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="url(#lineShineGrowth)"
                      strokeWidth={3}
                      fill="url(#colorValue)"
                      name="Portfolio"
                      isAnimationActive={false}
                      filter="url(#glowGrowth)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                )}
              </div>

              {/* Volatile Trading Chart */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: isMobile ? '12px' : '24px',
                padding: isMobile ? '12px 6px' : '32px',
                boxSizing: 'border-box',
                boxShadow: '0 8px 32px rgba(6, 255, 165, 0.3), 0 0 0 1px rgba(6, 255, 165, 0.2)',
                height: isMobile ? 'auto' : '352px',
                minHeight: isMobile ? '340px' : 'auto'
              }}>
                <h3 style={{
                  fontSize: isMobile ? '16px' : '20px',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #06FFA5 0%, #3A86FF 50%, #8338EC 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: isMobile ? '0 0 12px 0' : '0 0 24px 0'
                }}>
                  ⚡ Operações Intraday
                </h3>
                {areLineChartsVisible && (
                <ResponsiveContainer width="100%" height={isMobile ? 240 : 200} key={`trading-${selectedPeriod}`}>
                  <AreaChart data={volatileTradingData}>
                    <defs>
                      <linearGradient id="colorTradingValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FB5607" stopOpacity={0.8}/>
                        <stop offset="50%" stopColor="#FF006E" stopOpacity={0.5}/>
                        <stop offset="100%" stopColor="#FFBE0B" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorTradingBenchmark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06FFA5" stopOpacity={0.6}/>
                        <stop offset="100%" stopColor="#3A86FF" stopOpacity={0.1}/>
                      </linearGradient>
                      {/* Animated shine gradient for main line (left to right) */}
                      <linearGradient id="lineShineTrading" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FB5607" stopOpacity="1" />
                        <stop offset="-0.15" stopColor="#FB5607" stopOpacity="1">
                          <animate attributeName="offset" values="-0.15; 1.0" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
                        </stop>
                        <stop offset="-0.05" stopColor="#ffffff" stopOpacity="1">
                          <animate attributeName="offset" values="-0.05; 1.1" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
                        </stop>
                        <stop offset="0.05" stopColor="#FB5607" stopOpacity="1">
                          <animate attributeName="offset" values="0.05; 1.2" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
                        </stop>
                        <stop offset="100%" stopColor="#FB5607" stopOpacity="1" />
                      </linearGradient>
                      {/* Animated shine gradient for benchmark line (right to left) */}
                      <linearGradient id="lineShineTradingReverse" x1="100%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#06FFA5" stopOpacity="1" />
                        <stop offset="-0.15" stopColor="#06FFA5" stopOpacity="1">
                          <animate attributeName="offset" values="-0.15; 1.0" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
                        </stop>
                        <stop offset="-0.05" stopColor="#ffffff" stopOpacity="1">
                          <animate attributeName="offset" values="-0.05; 1.1" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
                        </stop>
                        <stop offset="0.05" stopColor="#06FFA5" stopOpacity="1">
                          <animate attributeName="offset" values="0.05; 1.2" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
                        </stop>
                        <stop offset="100%" stopColor="#06FFA5" stopOpacity="1" />
                      </linearGradient>
                      <filter id="glowTrading">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255, 255, 255, 0.3)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                      stroke="rgba(255, 255, 255, 0.3)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12, fontWeight: 600 }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div style={{
                              background: 'rgba(10, 10, 31, 0.98)',
                              border: '1px solid rgba(251, 86, 7, 0.5)',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              backdropFilter: 'blur(10px)'
                            }}>
                              <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>
                                {payload[0].payload.date}
                              </div>
                              {payload.map((entry: any, index: number) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: index < payload.length - 1 ? '6px' : '0' }}>
                                  <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: entry.name === 'Trading' ? '#FB5607' : '#06FFA5',
                                    boxShadow: `0 0 6px ${entry.name === 'Trading' ? '#FB5607' : '#06FFA5'}`
                                  }} />
                                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>
                                    {entry.name}:
                                  </span>
                                  <span style={{ fontSize: '14px', color: '#fff', fontWeight: '700' }}>
                                    {formatCurrency(Number(entry.value))}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="benchmark"
                      stroke="url(#lineShineTradingReverse)"
                      strokeWidth={2}
                      fill="url(#colorTradingBenchmark)"
                      name="Referência"
                      isAnimationActive={false}
                      filter="url(#glowTrading)"
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="url(#lineShineTrading)"
                      strokeWidth={3}
                      fill="url(#colorTradingValue)"
                      name="Trading"
                      isAnimationActive={false}
                      filter="url(#glowTrading)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                )}
              </div>

              {/* New Row - 3 Cards Below Intraday */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: isMobile ? '12px' : '16px',
                marginTop: isMobile ? '12px' : '16px'
              }}>
                {/* Card 1: Daily Volume */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '32px 28px',
                  boxShadow: '0 4px 16px rgba(131, 56, 236, 0.2), 0 0 0 1px rgba(131, 56, 236, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '265px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                    Volume Diário
                  </div>
                  <div>
                    <div style={{
                      fontSize: '36px',
                      fontWeight: '900',
                      color: '#FF006E',
                      marginBottom: '8px',
                      lineHeight: '1'
                    }}>
                      R$ 2.8M
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '600' }}>
                      <span style={{ color: '#06FFA5' }}>↗</span> +12.5% vs ontem
                    </div>
                  </div>
                </div>

                {/* Card 2: Active Positions */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '32px 28px',
                  boxShadow: '0 4px 16px rgba(6, 255, 165, 0.2), 0 0 0 1px rgba(6, 255, 165, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                    Posições Ativas
                  </div>
                  <div>
                    <div style={{
                      fontSize: '36px',
                      fontWeight: '900',
                      color: '#06FFA5',
                      marginBottom: '8px',
                      lineHeight: '1'
                    }}>
                      18
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '600' }}>
                      3 abertas hoje
                    </div>
                  </div>
                </div>

                {/* Card 3: Win Rate */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '32px 28px',
                  boxShadow: '0 4px 16px rgba(131, 56, 236, 0.2), 0 0 0 1px rgba(131, 56, 236, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                    Taxa de Acerto
                  </div>
                  <div>
                    <div style={{
                      fontSize: '36px',
                      fontWeight: '900',
                      color: '#8338EC',
                      marginBottom: '8px',
                      lineHeight: '1'
                    }}>
                      68.5%
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '600' }}>
                      Últimos 30 dias
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sector Distribution + Nested Circles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Sector Pie Chart */}
              <div style={{
                display: isComponentVisible('setores') ? 'block' : 'none',
                background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: isMobile ? '12px' : '24px',
                padding: isMobile ? '12px 6px' : '32px',
                boxSizing: 'border-box',
                boxShadow: '0 8px 32px rgba(131, 56, 236, 0.3), 0 0 0 1px rgba(131, 56, 236, 0.2)',
                height: isMobile ? 'auto' : '352px',
                minHeight: isMobile ? '340px' : 'auto'
              }}>
                <h3 style={{
                  fontSize: isMobile ? '16px' : '20px',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #8338EC 0%, #3A86FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0 0 16px 0'
                }}>
                  🎯 Distribuição por Setor
                </h3>
                {isPieChartVisible && (
                <div style={{
                  animation: 'pieChartReveal 2.5s ease-in-out',
                  width: '100%',
                  height: '240px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                <ResponsiveContainer width="100%" height={isMobile ? 250 : 240} key={`pie-${selectedPeriod}`}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      dataKey="percentage"
                      nameKey="sector"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={2}
                      label={({ sector, percentage }) => `${percentage}%`}
                      labelLine={false}
                      stroke="rgba(10, 10, 31, 0.95)"
                      strokeWidth={2}
                      activeIndex={activeSectorIndex}
                      activeShape={renderActiveShape}
                      isAnimationActive={false}
                      onMouseEnter={(data, index) => setActiveSectorIndex(index)}
                      onMouseMove={(data, index) => {
                        if (activeSectorIndex !== index) {
                          setActiveSectorIndex(index);
                        }
                      }}
                      onMouseLeave={() => setActiveSectorIndex(undefined)}
                    >
                      {sectorData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={VIVID_COLORS[index % VIVID_COLORS.length]}
                          style={{
                            filter: activeSectorIndex === index ? 'brightness(1.2) drop-shadow(0 0 10px currentColor)' : 'brightness(1)',
                            cursor: 'pointer',
                            transition: 'all 0.5s ease-in-out'
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: activeSectorIndex !== undefined
                          ? `linear-gradient(135deg, ${VIVID_COLORS[activeSectorIndex % VIVID_COLORS.length]}20, ${VIVID_COLORS[activeSectorIndex % VIVID_COLORS.length]}40)`
                          : 'rgba(10, 10, 31, 0.98)',
                        border: activeSectorIndex !== undefined
                          ? `2px solid ${VIVID_COLORS[activeSectorIndex % VIVID_COLORS.length]}`
                          : '1px solid rgba(131, 56, 236, 0.5)',
                        borderRadius: '12px',
                        color: '#fff',
                        backdropFilter: 'blur(20px)',
                        boxShadow: activeSectorIndex !== undefined
                          ? `0 8px 32px ${VIVID_COLORS[activeSectorIndex % VIVID_COLORS.length]}60`
                          : 'none',
                        transition: 'all 0.3s ease'
                      }}
                      itemStyle={{
                        color: '#fff',
                        fontWeight: '600'
                      }}
                      labelStyle={{
                        color: activeSectorIndex !== undefined
                          ? VIVID_COLORS[activeSectorIndex % VIVID_COLORS.length]
                          : '#fff',
                        fontWeight: '700',
                        fontSize: '14px'
                      }}
                      formatter={(value, name, props) => [
                        `${value}% (${formatCurrency(props.payload.value)})`,
                        props.payload.sector
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                </div>
                )}
              </div>

              {/* Nested Circles - Portfolio Composition */}
              <div style={{
                display: isComponentVisible('circulos') ? 'block' : 'none',
                background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(58, 134, 255, 0.3), 0 0 0 1px rgba(58, 134, 255, 0.2)'
              }}>
                <h3 style={{
                  fontSize: isMobile ? '16px' : '20px',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #3A86FF 0%, #06FFA5 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: isMobile ? '0 0 12px 0' : '0 0 24px 0'
                }}>
                  🎪 Composição em Camadas
                </h3>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  {/* Visual nested circles representation - Kinvo style */}
                  <div 
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '220px',
                      position: 'relative'
                    }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMousePosition({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top
                      });
                    }}
                  >
                    {/* Tooltip que acompanha o mouse */}
                    {hoveredCircle !== null && (
                      <div style={{
                        position: 'absolute',
                        left: `${mousePosition.x}px`,
                        top: `${mousePosition.y}px`,
                        transform: 'translate(20px, -50%)',
                        background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.98) 0%, rgba(26, 10, 46, 0.98) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: `2px solid ${nestedCirclesData[hoveredCircle].color}`,
                        borderRadius: '16px',
                        padding: '16px 20px',
                        boxShadow: `0 8px 32px ${nestedCirclesData[hoveredCircle].color}60`,
                        zIndex: 1000,
                        pointerEvents: 'none',
                        minWidth: '180px',
                        textAlign: 'left'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: '600',
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}>
                          {nestedCirclesData[hoveredCircle].name}
                        </div>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: '900',
                          color: nestedCirclesData[hoveredCircle].color,
                          marginBottom: '4px'
                        }}>
                          {formatCurrency(nestedCirclesData[hoveredCircle].value)}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: 'rgba(255, 255, 255, 0.8)'
                        }}>
                          {nestedCirclesData[hoveredCircle].percentage}% do total
                        </div>
                      </div>
                    )}

                    {/* SVG com todos os círculos */}
                    <svg
                      width="220"
                      height="220"
                      style={{
                        transform: 'rotate(-90deg)',
                        position: 'absolute',
                        animation: 'pulse 3s ease-in-out infinite'
                      }}
                    >
                      {nestedCirclesData.map((circle, index) => {
                        const strokeWidth = 16;
                        const radius = 85 - (index * 20);
                        const circumference = 2 * Math.PI * radius;
                        const offset = circumference - (circle.percentage / 100) * circumference;
                        
                        return (
                          <g key={index} style={{
                            animationDelay: `${index * 0.2}s`
                          }}>
                            {/* Background circle */}
                            <circle
                              cx="110"
                              cy="110"
                              r={radius}
                              fill="none"
                              stroke="rgba(255, 255, 255, 0.05)"
                              strokeWidth={strokeWidth}
                            />
                            {/* Progress circle with hover detection */}
                            <circle
                              cx="110"
                              cy="110"
                              r={radius}
                              fill="none"
                              stroke={circle.color}
                              strokeWidth={strokeWidth}
                              strokeDasharray={circumference}
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                              style={{
                                transition: 'stroke-dashoffset 0.8s ease-in-out, opacity 0.3s ease',
                                filter: `drop-shadow(0 0 1px ${circle.color})`,
                                opacity: hoveredCircle === null || hoveredCircle === index ? 1 : 0.3,
                                cursor: 'pointer'
                              }}
                              onMouseEnter={() => setHoveredCircle(index)}
                              onMouseLeave={() => setHoveredCircle(null)}
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Legends with values */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {nestedCirclesData.map((circle, index) => (
                      <div key={index}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '6px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <div style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: circle.color,
                              boxShadow: `0 0 8px ${circle.color}`
                            }}></div>
                            <span style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: 'rgba(255, 255, 255, 0.8)'
                            }}>
                              {circle.name}
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: 'rgba(255, 255, 255, 0.6)'
                            }}>
                              {formatCurrency(circle.value)}
                            </span>
                            <span style={{
                              fontSize: '13px',
                              fontWeight: '900',
                              color: circle.color,
                              minWidth: '45px',
                              textAlign: 'right'
                            }}>
                              {circle.percentage}%
                            </span>
                          </div>
                        </div>
                        <div style={{
                          height: '6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '3px',
                          overflow: 'visible',
                          position: 'relative'
                        }}>
                          <div style={{
                            width: `${circle.percentage}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${circle.color}, ${circle.color}80)`,
                            borderRadius: '3px',
                            boxShadow: `0 0 10px ${circle.color}`,
                            transition: 'width 1s ease',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            {/* Shine effect - covering full bar */}
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: '-60px',
                              width: '60px',
                              height: '100%',
                              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.4), transparent)',
                              animation: `progressShine 2.5s ease-in-out infinite`,
                              filter: 'blur(3px)',
                              pointerEvents: 'none'
                            }}></div>
                            {/* Vapor effect at the right end */}
                            <div style={{
                              position: 'absolute',
                              top: '-2px',
                              right: '-4px',
                              width: '12px',
                              height: '10px',
                              opacity: 0.7
                            }}>
                              {/* Multiple vapor particles */}
                              {[0, 1, 2].map((i) => (
                                <div
                                  key={i}
                                  style={{
                                    position: 'absolute',
                                    width: '4px',
                                    height: '4px',
                                    borderRadius: '50%',
                                    background: `radial-gradient(circle, ${circle.color}80, transparent)`,
                                    animation: `vaporRise${i} ${1.5 + i * 0.3}s ease-out infinite`,
                                    animationDelay: `${i * 0.2}s`,
                                    filter: 'blur(1px)'
                                  }}
                                ></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div style={{
                    marginTop: '12px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(6, 255, 165, 0.1) 0%, rgba(58, 134, 255, 0.1) 100%)',
                    border: '1px solid rgba(6, 255, 165, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#06FFA5', 
                      fontWeight: '700',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      💡 Análise da Estrutura
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: '1.6'
                    }}>
                      Portfolio bem diversificado com <strong style={{ color: '#8338EC' }}>85% em ações</strong>, 
                      proporcionando crescimento, e <strong style={{ color: '#3A86FF' }}>12% em renda fixa</strong> para 
                      estabilidade, com <strong style={{ color: '#06FFA5' }}>3% de reserva</strong> para oportunidades.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Charts Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? '16px' : '24px'
          }}>
            {/* Volatility Chart - NEW */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: isMobile ? '12px' : '24px',
              padding: isMobile ? '12px 6px' : '32px',
              boxSizing: 'border-box',
              boxShadow: '0 8px 32px rgba(131, 56, 236, 0.3), 0 0 0 1px rgba(131, 56, 236, 0.2)',
              height: isMobile ? 'auto' : '352px',
              minHeight: isMobile ? '360px' : 'auto'
            }}>
              <h3 style={{
                fontSize: isMobile ? '16px' : '20px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #8338EC 0%, #6D28D9 50%, #3A86FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: '0 0 24px 0'
              }}>
                📉 Análise de Volatilidade
              </h3>
              {areLineChartsVisible && (
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 240}>
                <LineChart data={volatilityData}>
                  <defs>
                    <linearGradient id="volatilityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF006E" stopOpacity={0.8}/>
                      <stop offset="50%" stopColor="#FF4495" stopOpacity={0.5}/>
                      <stop offset="100%" stopColor="#8338EC" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8338EC" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#3A86FF" stopOpacity={0.1}/>
                    </linearGradient>
                    {/* Animated shine gradient for line */}
                    <linearGradient id="lineShineVolatility" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF006E" stopOpacity="1" />
                      <stop offset="-0.15" stopColor="#FF006E" stopOpacity="1">
                        <animate attributeName="offset" values="-0.15; 1.0" dur="2.5s" repeatCount="indefinite" begin="1s" />
                      </stop>
                      <stop offset="-0.05" stopColor="#ffffff" stopOpacity="1">
                        <animate attributeName="offset" values="-0.05; 1.1" dur="2.5s" repeatCount="indefinite" begin="1s" />
                      </stop>
                      <stop offset="0.05" stopColor="#FF006E" stopOpacity="1">
                        <animate attributeName="offset" values="0.05; 1.2" dur="2.5s" repeatCount="indefinite" begin="1s" />
                      </stop>
                      <stop offset="100%" stopColor="#FF006E" stopOpacity="1" />
                    </linearGradient>
                    <filter id="glowVolatility">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis
                    dataKey="time"
                    stroke="rgba(255, 255, 255, 0.3)"
                    tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 11, fontWeight: 600 }}
                    interval={4}
                  />
                  <YAxis
                    stroke="rgba(255, 255, 255, 0.3)"
                    tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 11, fontWeight: 600 }}
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{
                            background: 'rgba(10, 10, 31, 0.98)',
                            border: '1px solid rgba(255, 68, 149, 0.5)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            backdropFilter: 'blur(10px)'
                          }}>
                            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>
                              Período {label}
                            </div>
                            {payload.filter((entry: any) => entry.dataKey === 'value').map((entry: any, index: number) => (
                              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  background: '#FF006E',
                                  boxShadow: '0 0 6px #FF006E'
                                }} />
                                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>
                                  Volatilidade:
                                </span>
                                <span style={{ fontSize: '14px', color: '#fff', fontWeight: '700' }}>
                                  {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Upper band area */}
                  <Area
                    type="monotone"
                    dataKey="upperBand"
                    stroke="none"
                    fill="url(#bandGradient)"
                    fillOpacity={0.4}
                  />
                  {/* Lower band area */}
                  <Area
                    type="monotone"
                    dataKey="lowerBand"
                    stroke="none"
                    fill="url(#bandGradient)"
                    fillOpacity={0.2}
                  />
                  {/* Main line */}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="url(#lineShineVolatility)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{
                      r: 6,
                      fill: '#FF006E',
                      stroke: '#fff',
                      strokeWidth: 2,
                      filter: 'drop-shadow(0 0 8px #FF006E)'
                    }}
                    filter="url(#glowVolatility)"
                  />
                </LineChart>
              </ResponsiveContainer>
              )}
            </div>

            {/* Performance Bars */}
            <div style={{
              display: isComponentVisible('comparativa') ? 'block' : 'none',
              background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: isMobile ? '12px' : '24px',
              padding: isMobile ? '12px 6px' : '32px',
              boxSizing: 'border-box',
              boxShadow: '0 8px 32px rgba(6, 255, 165, 0.3), 0 0 0 1px rgba(6, 255, 165, 0.2)',
              height: isMobile ? 'auto' : '352px',
              minHeight: isMobile ? '360px' : 'auto'
            }}>
              <h3 style={{
                fontSize: isMobile ? '16px' : '20px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #06FFA5 0%, #3A86FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: '0 0 24px 0'
              }}>
                📊 Performance Comparativa
              </h3>
              {areBarChartsVisible && (
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 240} key={`performance-${selectedPeriod}`}>
                <BarChart data={performanceData}>
                  <defs>
                    <linearGradient id="barGrad1" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#06FFA5">
                        <animate attributeName="offset" values="0;0.3;0" dur="3s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="30%" stopColor="#06FFA5" stopOpacity="0.8">
                        <animate attributeName="offset" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="60%" stopColor="#3A86FF" stopOpacity="0.6">
                        <animate attributeName="offset" values="0.6;0.9;0.6" dur="3s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="100%" stopColor="#3A86FF" stopOpacity="0.3">
                        <animate attributeName="offset" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" />
                      </stop>
                    </linearGradient>
                    <linearGradient id="barGrad2" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#FF006E">
                        <animate attributeName="offset" values="0;0.3;0" dur="2.5s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="30%" stopColor="#FF006E" stopOpacity="0.8">
                        <animate attributeName="offset" values="0.3;0.6;0.3" dur="2.5s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="60%" stopColor="#8338EC" stopOpacity="0.6">
                        <animate attributeName="offset" values="0.6;0.9;0.6" dur="2.5s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="100%" stopColor="#8338EC" stopOpacity="0.3">
                        <animate attributeName="offset" values="0.9;1;0.9" dur="2.5s" repeatCount="indefinite" />
                      </stop>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis 
                    dataKey="period" 
                    stroke="rgba(255, 255, 255, 0.3)" 
                    tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis 
                    stroke="rgba(255, 255, 255, 0.3)" 
                    tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12, fontWeight: 600 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{
                            background: 'rgba(10, 10, 31, 0.98)',
                            border: '1px solid rgba(6, 255, 165, 0.5)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            backdropFilter: 'blur(10px)'
                          }}>
                            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>
                              {payload[0].payload.period}
                            </div>
                            {payload.map((entry: any, index: number) => (
                              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: index < payload.length - 1 ? '6px' : '0' }}>
                                <div style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  background: entry.dataKey === 'portfolio' ? '#06FFA5' : '#FF006E',
                                  boxShadow: `0 0 6px ${entry.dataKey === 'portfolio' ? '#06FFA5' : '#FF006E'}`
                                }} />
                                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>
                                  {entry.dataKey === 'portfolio' ? 'Portfolio' : 'Benchmark'}:
                                </span>
                                <span style={{ fontSize: '14px', color: '#fff', fontWeight: '700' }}>
                                  {entry.value}%
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={false}
                  />
                  <Bar
                    dataKey="portfolio"
                    fill="url(#barGrad1)"
                    radius={[10, 10, 0, 0]}
                    animationDuration={1800}
                    animationEasing="ease-in-out"
                    isAnimationActive={true}
                  />
                  <Bar
                    dataKey="benchmark"
                    fill="url(#barGrad2)"
                    radius={[10, 10, 0, 0]}
                    animationDuration={1800}
                    animationEasing="ease-in-out"
                    isAnimationActive={true}
                  />
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>

            {/* Volume Chart */}
            <div style={{
              display: isComponentVisible('volume') ? 'block' : 'none',
              background: 'linear-gradient(135deg, rgba(10, 10, 31, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: isMobile ? '12px' : '24px',
              padding: isMobile ? '12px 6px' : '32px',
              boxSizing: 'border-box',
              boxShadow: '0 8px 32px rgba(58, 134, 255, 0.3), 0 0 0 1px rgba(58, 134, 255, 0.2)',
              height: isMobile ? 'auto' : '352px',
              minHeight: isMobile ? '360px' : 'auto'
            }}>
              <h3 style={{
                fontSize: isMobile ? '16px' : '20px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #3A86FF 0%, #8338EC 50%, #6D28D9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: '0 0 24px 0'
              }}>
                📈 Volume por Ativo
              </h3>
              {areBarChartsVisible && (
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 240} key={`volume-${selectedPeriod}`}>
                <BarChart data={portfolioAssets.slice(0, 6)}>
                  <defs>
                    <linearGradient id="volumeGrad" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#FFBE0B">
                        <animate attributeName="offset" values="0;0.25;0" dur="2.8s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="25%" stopColor="#FFBE0B" stopOpacity="0.9">
                        <animate attributeName="offset" values="0.25;0.5;0.25" dur="2.8s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="50%" stopColor="#FB5607" stopOpacity="0.7">
                        <animate attributeName="offset" values="0.5;0.75;0.5" dur="2.8s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="75%" stopColor="#FF006E" stopOpacity="0.5">
                        <animate attributeName="offset" values="0.75;1;0.75" dur="2.8s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="100%" stopColor="#FF006E" stopOpacity="0.3">
                        <animate attributeName="offset" values="0.9;1;0.9" dur="2.8s" repeatCount="indefinite" />
                      </stop>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis 
                    dataKey="symbol" 
                    stroke="rgba(255, 255, 255, 0.3)" 
                    tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis 
                    stroke="rgba(255, 255, 255, 0.3)" 
                    tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const entry = payload[0];
                        return (
                          <div style={{
                            background: 'rgba(10, 10, 31, 0.98)',
                            border: '1px solid rgba(255, 190, 11, 0.5)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            backdropFilter: 'blur(10px)'
                          }}>
                            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>
                              {entry.payload.symbol}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: '#FFBE0B',
                                boxShadow: '0 0 6px #FFBE0B'
                              }} />
                              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>
                                Quantidade:
                              </span>
                              <span style={{ fontSize: '14px', color: '#fff', fontWeight: '700' }}>
                                {entry.value}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={false}
                  />
                  <Bar
                    dataKey="quantity"
                    fill="url(#volumeGrad)"
                    radius={[10, 10, 0, 0]}
                    animationDuration={1800}
                    animationEasing="ease-in-out"
                    isAnimationActive={true}
                  />
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>
            </>
          )}

          {/* Portfolio Module */}
          {activeModule === 'portfolio' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '80vh',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div style={{
                fontSize: '64px',
                opacity: 0.3
              }}>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #8338EC 0%, #3A86FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}>
                Portfolio
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '16px' }}>
                Esta seção está em desenvolvimento
              </p>
            </div>
          )}

          {/* Analytics Module */}
          {activeModule === 'analytics' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '80vh',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div style={{
                fontSize: '64px',
                opacity: 0.3
              }}>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #8338EC 0%, #3A86FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}>
                Analytics
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '16px' }}>
                Esta seção está em desenvolvimento
              </p>
            </div>
          )}

          {/* Markets Module */}
          {activeModule === 'markets' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '80vh',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div style={{
                fontSize: '64px',
                opacity: 0.3
              }}>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #8338EC 0%, #3A86FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}>
                Mercados
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '16px' }}>
                Esta seção está em desenvolvimento
              </p>
            </div>
          )}

          {/* Reports Module */}
          {activeModule === 'reports' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '80vh',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div style={{
                fontSize: '64px',
                opacity: 0.3
              }}>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #8338EC 0%, #3A86FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}>
                Relatórios
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '16px' }}>
                Esta seção está em desenvolvimento
              </p>
            </div>
          )}

          {/* Settings Module */}
          {activeModule === 'settings' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '80vh',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div style={{
                fontSize: '64px',
                opacity: 0.3
              }}>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6m-6-6H1m6 0h6m6 0h5" />
                  <path d="m19.07 4.93-4.24 4.24m0 5.66 4.24 4.24M4.93 4.93l4.24 4.24m0 5.66-4.24 4.24" />
                </svg>
              </div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #8338EC 0%, #3A86FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}>
                Configurações
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '16px' }}>
                Esta seção está em desenvolvimento
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(10px, -10px) rotate(5deg); }
          66% { transform: translate(-10px, 10px) rotate(-5deg); }
        }
        @keyframes floatParticle {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.3;
          }
          25% { 
            transform: translate(30px, -40px) scale(1.2); 
            opacity: 0.6;
          }
          50% { 
            transform: translate(-20px, -80px) scale(0.8); 
            opacity: 0.4;
          }
          75% { 
            transform: translate(40px, -120px) scale(1.1); 
            opacity: 0.5;
          }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pieChartReveal {
          0% {
            opacity: 0;
            clip-path: circle(0% at 50% 50%);
          }
          10% {
            opacity: 1;
            clip-path: circle(10% at 50% 50%);
          }
          30% {
            clip-path: circle(30% at 50% 50%);
          }
          50% {
            clip-path: circle(45% at 50% 50%);
          }
          70% {
            clip-path: circle(55% at 50% 50%);
          }
          85% {
            clip-path: circle(65% at 50% 50%);
          }
          100% {
            clip-path: circle(100% at 50% 50%);
          }
        }
        @keyframes lineChartReveal {
          0% {
            clip-path: inset(0 100% 0 0);
          }
          100% {
            clip-path: inset(0 0 0 0);
          }
        }
        @keyframes progressShine {
          0% {
            left: -60px;
            opacity: 0;
          }
          5% {
            opacity: 0.8;
          }
          95% {
            opacity: 0.8;
          }
          100% {
            left: calc(100% + 60px);
            opacity: 0;
          }
        }
        @keyframes vaporRise0 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translate(4px, -8px) scale(1.3);
            opacity: 0.5;
          }
          100% {
            transform: translate(8px, -16px) scale(0.6);
            opacity: 0;
          }
        }
        @keyframes vaporRise1 {
          0% {
            transform: translate(0, 0) scale(0.8);
            opacity: 0.7;
          }
          50% {
            transform: translate(2px, -10px) scale(1.4);
            opacity: 0.4;
          }
          100% {
            transform: translate(6px, -18px) scale(0.5);
            opacity: 0;
          }
        }
        @keyframes vaporRise2 {
          0% {
            transform: translate(0, 0) scale(0.9);
            opacity: 0.6;
          }
          50% {
            transform: translate(6px, -12px) scale(1.5);
            opacity: 0.3;
          }
          100% {
            transform: translate(10px, -20px) scale(0.4);
            opacity: 0;
          }
        }
        input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        svg {
          shape-rendering: geometricPrecision;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        svg:focus, svg *:focus {
          outline: none !important;
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default PortfolioDashboard;
