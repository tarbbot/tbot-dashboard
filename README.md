# 💎 Portfolio Dashboard (TypeScript)

Dashboard interativo e moderno para visualização de portfólio de investimentos com gráficos em tempo real, desenvolvido em TypeScript.

## 🚀 Características

- 📊 Múltiplos gráficos interativos (Área, Pizza, Barras, Círculos Concêntricos)
- 🔍 Sistema de busca inteligente com sugestões
- 🎨 Design moderno com gradientes vibrantes e animações
- 📱 Interface responsiva
- ⚡ Performance otimizada com React
- 🌈 Paleta de cores vibrante (#FF006E, #8338EC, #3A86FF, #06FFA5)
- 💪 Totalmente tipado com TypeScript

## 📦 Tecnologias

- React 18
- TypeScript 5.3
- Recharts (biblioteca de gráficos)
- React Scripts

## 🛠️ Instalação

### Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

### Passos

1. **Extraia o projeto**
   ```bash
   unzip portfolio-dashboard.zip
   cd portfolio-dashboard-project
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```
   ou
   ```bash
   yarn install
   ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   npm start
   ```
   ou
   ```bash
   yarn start
   ```

4. **Abra no navegador**
   
   O projeto será aberto automaticamente em [http://localhost:3000](http://localhost:3000)

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a versão de produção otimizada
- `npm test` - Executa os testes
- `npm run eject` - Ejeta as configurações (irreversível)

## 📁 Estrutura do Projeto

```
portfolio-dashboard-project/
├── public/
│   └── index.html              # HTML principal
├── src/
│   ├── App.tsx                 # Componente App principal
│   ├── index.tsx               # Entry point
│   ├── index.css               # Estilos globais
│   ├── react-app-env.d.ts      # Declarações de tipos
│   └── PortfolioDashboard.tsx  # Dashboard completo
├── .gitignore                  # Arquivos ignorados pelo Git
├── package.json                # Dependências e scripts
├── tsconfig.json               # Configuração do TypeScript
└── README.md                   # Documentação
```

## 🌐 Deploy

### Vercel (Recomendado)

1. Instale o Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Execute o deploy:
   ```bash
   vercel
   ```

### Netlify

1. Crie o build de produção:
   ```bash
   npm run build
   ```

2. Faça deploy da pasta `build/` no Netlify

### GitHub Pages

1. Instale gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Adicione ao package.json:
   ```json
   "homepage": "https://seu-usuario.github.io/portfolio-dashboard",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

3. Execute:
   ```bash
   npm run deploy
   ```

## 📊 Componentes Principais

### Cards de Métricas
- Valor Total do Portfolio
- Lucro Realizado
- Quantidade de Ativos
- Performance Anual

### Gráficos
- **Crescimento Patrimonial** - Gráfico de área com comparação ao benchmark
- **Distribuição por Setor** - Gráfico de pizza interativo
- **Composição em Camadas** - Círculos concêntricos estilo Kinvo
- **Performance Comparativa** - Gráfico de barras
- **Volume por Ativo** - Gráfico de barras por ação

### Funcionalidades
- Busca inteligente de componentes
- Tooltips interativos que acompanham o mouse
- Animações suaves com pulse effect
- Tema dark moderno

## 🎨 Personalização

### Alterar Cores

Edite o arquivo `src/PortfolioDashboard.tsx` e modifique a constante `VIVID_COLORS`:

```typescript
const VIVID_COLORS = ['#FF006E', '#FF4495', '#8338EC', '#3A86FF', '#06FFA5', '#FFBE0B'];
```

### Adicionar Dados Reais

Substitua os dados mockados pelas suas APIs reais:

```typescript
// Linha ~56 - portfolioAssets
const portfolioAssets = [
  // Seus dados aqui
];
```

### Criar Tipos Customizados

Adicione seus tipos em `src/types.ts`:

```typescript
export interface Asset {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  sector: string;
  dayChange: number;
}
```

## 💡 Vantagens do TypeScript

- ✅ **Type Safety**: Detecção de erros em tempo de desenvolvimento
- ✅ **IntelliSense**: Autocompletar e sugestões inteligentes
- ✅ **Refatoração**: Mais segura e eficiente
- ✅ **Documentação**: Tipos servem como documentação
- ✅ **Escalabilidade**: Facilita manutenção de projetos grandes

## 📱 Responsividade

O dashboard está otimizado para:
- Desktop (1920x1080+)
- Laptop (1366x768+)
- Tablet (768x1024+)
- Mobile (adaptar conforme necessário)

## 🐛 Troubleshooting

### Erro ao instalar dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erros de tipagem
```bash
# Reinstale os tipos
npm install --save-dev @types/react @types/react-dom
```

### Porta 3000 já está em uso
```bash
PORT=3001 npm start
```

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido com 💜 para visualização de portfólios de investimento.

---

**Dica:** Para melhor performance, sempre faça o build de produção antes do deploy:
```bash
npm run build
```

O TypeScript garante código mais robusto e manutenível! 🚀
