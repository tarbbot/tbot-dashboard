export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

export const formatPercent = (value: number | string): string => `${Number(value) >= 0 ? '+' : ''}${value}%`;
