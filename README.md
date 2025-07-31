# 🎮 BrickBreaker - Jogo Offline com Logging Robusto

Um jogo clássico de Breakout implementado em TypeScript/React com um sistema robusto de logging que registra todas as condições e eventos do jogo no IndexedDB.

## ✨ Características Principais

### 🎯 Sistema de Logging Robusto
- **Registro Completo**: Todos os eventos do jogo são registrados com informações detalhadas
- **IndexedDB**: Armazenamento persistente no navegador
- **Posições Detalhadas**: Posições da bola, raquete e objetos em colisão
- **Estados do Jogo**: Pontuação, número de bolas, blocos restantes, etc.
- **Metadados Ricos**: Informações sobre colisões, velocidades, ângulos, etc.

### 📊 Eventos Registrados
- 🎮 **Início e Fim do Jogo**: Com duração e resultado
- 📈 **Atualizações de Pontuação**: Com motivo e progresso
- 💀 **Bolas Perdidas**: Com posição e velocidade
- 🧱 **Blocos Destruídos**: Com índice, cor e posição
- 💥 **Colisões**: Com paredes, raquete, teto e blocos
- 🏓 **Movimento da Raquete**: Por teclado e touch
- 🔄 **Mudanças de Estado**: Vitória, derrota, etc.
- 🔄 **Reinícios de Jogo**: Com histórico

### 🎨 Interface Moderna
- **Design Responsivo**: Funciona em desktop e mobile
- **Visualizador de Logs**: Interface para analisar dados do jogo
- **Estatísticas Detalhadas**: Métricas completas do desempenho
- **Exportação de Dados**: JSON com todos os logs

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Instalação
```bash
# Clonar o repositório
git clone https://github.com/Malnati/gm-offline-brickbreaker.git
cd gm-offline-brickbreaker

# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev
```

### Build para Produção
```bash
# Build PWA
npm run build

# Build para plataformas nativas (iOS/Android)
make build-all
```

## 📊 Sistema de Logging

### Estrutura dos Dados
Cada evento registrado contém:

```typescript
interface GameEvent {
  id: string;
  timestamp: number;
  type: 'game_start' | 'game_end' | 'score_update' | 'ball_lost' | 
        'brick_destroyed' | 'collision' | 'paddle_move' | 'game_state_change';
  gameState: {
    score: number;
    ballsCount: number;
    bricksRemaining: number;
    gameWon: boolean;
    gameOver: boolean;
    level: number;
    canvasSize: { width: number; height: number };
    gameDimensions: {
      brickWidth: number;
      brickHeight: number;
      brickCols: number;
      brickRows: number;
      paddleWidth: number;
      paddleHeight: number;
      ballRadius: number;
    };
  };
  ballPositions: Array<{
    x: number;
    y: number;
    velocity: { dx: number; dy: number };
    radius: number;
  }>;
  paddlePosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  collisionInfo?: {
    type: 'wall' | 'paddle' | 'brick' | 'ceiling';
    ballPosition: { x: number; y: number };
    targetPosition?: { x: number; y: number; width?: number; height?: number };
    brickIndex?: { col: number; row: number };
    brickColorIndex?: number;
    wallType?: 'left' | 'right';
    hitPosition?: number;
    collisionAngle?: number;
    velocityBefore?: { dx: number; dy: number };
    velocityAfter?: { dx: number; dy: number };
  };
  metadata?: Record<string, any>;
}
```

### Condições Monitoradas

#### 🎮 Estados do Jogo
- **Início do Jogo**: Configuração inicial, posições, dimensões
- **Fim do Jogo**: Vitória (todos os blocos destruídos) ou derrota (sem bolas)
- **Reinício**: Reset completo do jogo

#### 📈 Pontuação
- **Destruição de Blocos**: +10 pontos por bloco
- **Progresso do Jogo**: Porcentagem de conclusão
- **Histórico de Pontuação**: Evolução durante o jogo

#### 💥 Colisões
- **Com Paredes**: Posição exata e tipo (esquerda/direita)
- **Com Teto**: Posição e mudança de velocidade
- **Com Raquete**: Posição do hit (0-100%), ângulo de rebatida
- **Com Blocos**: Índice, cor, posição, velocidade antes/depois

#### 🏓 Movimento da Raquete
- **Controles**: Teclado (setas) e touch
- **Posição**: Coordenadas x,y e dimensões
- **Histórico**: Posição anterior e distância movida

#### ⚽ Bolas
- **Posição**: Coordenadas x,y em tempo real
- **Velocidade**: Componentes dx, dy
- **Perda**: Posição exata onde passou pela raquete
- **Múltiplas**: Suporte a várias bolas simultâneas

### 📊 Estatísticas Geradas
- **Total de Jogos**: Vitórias e derrotas
- **Pontuação Média**: Por jogo
- **Duração Média**: Tempo por jogo
- **Blocos Destruídos**: Total e por jogo
- **Colisões**: Por tipo e frequência
- **Bolas Perdidas**: Média por jogo

## 🧪 Testes

### Teste do Sistema de Logging
```bash
# Abrir o arquivo de teste no navegador
open scripts/test-game-logging.html
```

O arquivo de teste permite:
- ✅ Testar todos os tipos de eventos
- 📊 Verificar estatísticas em tempo real
- 📤 Exportar dados para análise
- 🗑️ Limpar logs para testes
- 📥 Importar dados de teste

### Testes Automatizados
```bash
# Executar testes de colisão
npm run test:collision

# Executar testes de cores
npm run test:colors

# Verificar tracking de colisões
npm run test:tracking
```

## 📱 Builds Nativos

### iOS
```bash
make ios
```

### Android
```bash
make android
```

### Build Completo
```bash
make build-all
```

## 🛠️ Estrutura do Projeto

```
src/
├── components/
│   ├── Game.tsx              # Componente principal do jogo
│   ├── GameLogViewer.tsx     # Visualizador de logs
│   └── CollisionStats.tsx    # Estatísticas de colisões
├── logic/
│   └── GameEngine.ts         # Motor do jogo com logging
├── objects/
│   ├── Ball.ts              # Lógica da bola com colisões
│   ├── Bricks.ts            # Sistema de blocos
│   └── Paddle.ts            # Controle da raquete
├── storage/
│   ├── gameLogger.ts        # Sistema principal de logging
│   └── score.ts             # Armazenamento de pontuação
├── utils/
│   ├── collisionTracker.ts  # Rastreamento de colisões
│   └── assetLoader.ts       # Carregamento de assets
└── constants/
    ├── game.ts              # Configurações do jogo
    └── assets.ts            # Caminhos dos assets
```

## 📈 Análise de Dados

### Visualizador de Logs
- **Filtros**: Por tipo de evento
- **Detalhes**: Informações completas de cada evento
- **Estatísticas**: Métricas em tempo real
- **Exportação**: Dados em JSON para análise externa

### Exemplo de Análise
```javascript
// Buscar eventos de colisão
const collisions = await gameLogger.getEventsByType('collision');

// Analisar padrões de movimento da raquete
const paddleMoves = await gameLogger.getEventsByType('paddle_move');

// Calcular eficiência do jogador
const stats = await gameLogger.getGameStats();
const efficiency = stats.totalBricksDestroyed / stats.totalCollisions;
```

## 🔧 Configuração

### Dimensões Dinâmicas
O jogo se adapta automaticamente ao tamanho da tela:
- **Canvas**: Responsivo (320x240 até 800x600)
- **Blocos**: Proporcionais ao espaço disponível
- **Raquete**: Tamanho adaptativo
- **Bola**: Raio proporcional

### Logging Configurável
```typescript
// Habilitar/desabilitar tipos específicos
const LOG_CONFIG = {
  collisions: true,
  paddleMoves: true,
  scoreUpdates: true,
  gameStates: true
};
```

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Changelog

Veja [CHANGELOG.md](CHANGELOG.md) para histórico de mudanças.

## 🐛 Problemas Conhecidos

Veja [PROBLEMAS-DEPENDENCIAS.md](PROBLEMAS-DEPENDENCIAS.md) para problemas conhecidos e soluções.

---

**Desenvolvido com ❤️ para análise de dados de jogos**
