// What the top search can jump to (ids match the panels in the dashboard view).
export interface Searchable {
  id: string;
  name: string;
  keywords: string[];
}

export const SEARCHABLE: Searchable[] = [
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

export const matches = (item: Searchable, term: string): boolean => {
  const s = term.trim().toLowerCase();
  if (!s) return true;
  return item.name.toLowerCase().includes(s) || item.keywords.some((k) => k.includes(s));
};
