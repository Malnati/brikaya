// src/constants/audio.ts
export const AUDIO_EVENT_IDS = [
  "bgm-menu-loop-main",
  "bgm-gameplay-loop-main",
  "bgm-gameplay-intense-layer",
  "sfx-game-start",
  "sfx-paddle-hit-center",
  "sfx-paddle-hit-edge",
  "sfx-wall-hit",
  "sfx-ceiling-hit",
  "sfx-brick-hit",
  "sfx-brick-break-red",
  "sfx-brick-break-blue",
  "sfx-brick-break-green",
  "sfx-brick-break-yellow",
  "sfx-brick-break-purple",
  "sfx-score-tick",
  "sfx-combo-small",
  "sfx-combo-large",
  "sfx-ball-lost",
  "sfx-game-over",
  "sfx-level-complete",
  "sfx-level-toast-in",
  "sfx-level-start",
  "sfx-restart",
  "sfx-reset-score",
  "sfx-button-press",
  "sfx-panel-open",
  "sfx-panel-close",
  "sfx-theme-toggle",
  "sfx-ad-placeholder-none",
  "sfx-powerup-spawn",
  "sfx-powerup-collect",
  "sfx-powerup-activate-multiball",
  "sfx-powerup-activate-wide-paddle",
  "sfx-powerup-activate-slow-ball",
  "sfx-powerup-activate-laser-fan",
  "sfx-powerup-expire",
  "sfx-highscore-new",
  "sfx-offline-ready",
  "sfx-error-soft"
] as const;

export type AudioId = typeof AUDIO_EVENT_IDS[number];
export type AudioCategory = 'music' | 'effect' | 'ui' | 'system' | 'future';

export interface AudioCatalogEntry {
  id: AudioId;
  type: AudioCategory;
  trigger: string;
  priorityLabel: string;
  priorityWeight: number;
  volume: number;
  fadeInMs: number;
  fadeOutMs: number;
  duckingMs: number;
  targetDuration: string;
  variations: string;
  uxNotes: string;
  loop: boolean;
  files: string[];
}

export const AUDIO_CATALOG = {
  "bgm-menu-loop-main": {
    "id": "bgm-menu-loop-main",
    "type": "music",
    "trigger": "Tela inicial, pausa futura ou estado entre partidas quando não houver partida ativa",
    "priorityLabel": "Média",
    "priorityWeight": 2,
    "volume": 0.28,
    "fadeInMs": 800,
    "fadeOutMs": 500,
    "duckingMs": 0,
    "targetDuration": "Loop de 30 s a 60 s",
    "variations": "1 loop principal",
    "uxNotes": "Deve sugerir arcade leve, sem urgência. Não tocar se o usuário ainda não interagiu e o navegador bloquear autoplay.",
    "loop": true,
    "files": [
      "/assets/audio/bgm-menu-loop-main-01.mp3"
    ]
  },
  "bgm-gameplay-loop-main": {
    "id": "bgm-gameplay-loop-main",
    "type": "music",
    "trigger": "Durante partida ativa após início ou reinício humano",
    "priorityLabel": "Média",
    "priorityWeight": 2,
    "volume": 0.32,
    "fadeInMs": 700,
    "fadeOutMs": 700,
    "duckingMs": 0,
    "targetDuration": "Loop de 45 s a 90 s",
    "variations": "1 loop principal",
    "uxNotes": "Deve manter energia constante e ficar claramente abaixo dos efeitos de tijolo, raquete e perda de bola.",
    "loop": true,
    "files": [
      "/assets/audio/bgm-gameplay-loop-main-01.mp3"
    ]
  },
  "bgm-gameplay-intense-layer": {
    "id": "bgm-gameplay-intense-layer",
    "type": "music",
    "trigger": "Fases altas ou velocidade acima de 1.6x, quando esse controle for implementado",
    "priorityLabel": "Baixa",
    "priorityWeight": 1,
    "volume": 0.18,
    "fadeInMs": 1200,
    "fadeOutMs": 900,
    "duckingMs": 0,
    "targetDuration": "Loop sincronizável de 30 s a 60 s",
    "variations": "1 camada",
    "uxNotes": "Camada opcional; não deve mudar a mecânica, apenas aumentar tensão.",
    "loop": true,
    "files": [
      "/assets/audio/bgm-gameplay-intense-layer-01.mp3"
    ]
  },
  "sfx-game-start": {
    "id": "sfx-game-start",
    "type": "effect",
    "trigger": "Primeira partida, fim da contagem inicial ou reinício iniciado por ação humana",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0.72,
    "fadeInMs": 0,
    "fadeOutMs": 80,
    "duckingMs": 300,
    "targetDuration": "300 ms a 600 ms",
    "variations": "2",
    "uxNotes": "Deve comunicar prontidão, não vitória.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-game-start-01.mp3",
      "/assets/audio/sfx-game-start-02.mp3"
    ]
  },
  "sfx-paddle-hit-center": {
    "id": "sfx-paddle-hit-center",
    "type": "effect",
    "trigger": "Bola colide com o centro da raquete",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0.62,
    "fadeInMs": 0,
    "fadeOutMs": 40,
    "duckingMs": 180,
    "targetDuration": "60 ms a 120 ms",
    "variations": "4",
    "uxNotes": "Som elástico e preciso; deve reforçar controle do jogador.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-paddle-hit-center-01.mp3",
      "/assets/audio/sfx-paddle-hit-center-02.mp3",
      "/assets/audio/sfx-paddle-hit-center-03.mp3",
      "/assets/audio/sfx-paddle-hit-center-04.mp3"
    ]
  },
  "sfx-paddle-hit-edge": {
    "id": "sfx-paddle-hit-edge",
    "type": "effect",
    "trigger": "Bola colide perto das bordas da raquete e sai com ângulo acentuado",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0.68,
    "fadeInMs": 0,
    "fadeOutMs": 40,
    "duckingMs": 220,
    "targetDuration": "70 ms a 140 ms",
    "variations": "4",
    "uxNotes": "Mais agudo que colisão central para indicar risco e mudança de direção.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-paddle-hit-edge-01.mp3",
      "/assets/audio/sfx-paddle-hit-edge-02.mp3",
      "/assets/audio/sfx-paddle-hit-edge-03.mp3",
      "/assets/audio/sfx-paddle-hit-edge-04.mp3"
    ]
  },
  "sfx-wall-hit": {
    "id": "sfx-wall-hit",
    "type": "effect",
    "trigger": "Bola colide com parede lateral",
    "priorityLabel": "Média",
    "priorityWeight": 2,
    "volume": 0.48,
    "fadeInMs": 0,
    "fadeOutMs": 30,
    "duckingMs": 100,
    "targetDuration": "40 ms a 100 ms",
    "variations": "5",
    "uxNotes": "Deve ser discreto porque ocorre com frequência.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-wall-hit-01.mp3",
      "/assets/audio/sfx-wall-hit-02.mp3",
      "/assets/audio/sfx-wall-hit-03.mp3",
      "/assets/audio/sfx-wall-hit-04.mp3",
      "/assets/audio/sfx-wall-hit-05.mp3"
    ]
  },
  "sfx-ceiling-hit": {
    "id": "sfx-ceiling-hit",
    "type": "effect",
    "trigger": "Bola colide com o teto",
    "priorityLabel": "Média",
    "priorityWeight": 2,
    "volume": 0,
    "fadeInMs": 0,
    "fadeOutMs": 30,
    "duckingMs": 100,
    "targetDuration": "40 ms a 100 ms",
    "variations": "4",
    "uxNotes": "Ligeiramente mais agudo que parede lateral para orientar posição vertical.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-ceiling-hit-01.mp3",
      "/assets/audio/sfx-ceiling-hit-02.mp3",
      "/assets/audio/sfx-ceiling-hit-03.mp3",
      "/assets/audio/sfx-ceiling-hit-04.mp3"
    ]
  },
  "sfx-brick-hit": {
    "id": "sfx-brick-hit",
    "type": "effect",
    "trigger": "Bola toca um tijolo antes ou junto do efeito de destruição",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0.64,
    "fadeInMs": 0,
    "fadeOutMs": 40,
    "duckingMs": 180,
    "targetDuration": "60 ms a 130 ms",
    "variations": "5",
    "uxNotes": "Deve dar feedback imediato de impacto. Pode ser combinado com o som específico de cor.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-brick-hit-01.mp3",
      "/assets/audio/sfx-brick-hit-02.mp3",
      "/assets/audio/sfx-brick-hit-03.mp3",
      "/assets/audio/sfx-brick-hit-04.mp3",
      "/assets/audio/sfx-brick-hit-05.mp3"
    ]
  },
  "sfx-brick-break-red": {
    "id": "sfx-brick-break-red",
    "type": "effect",
    "trigger": "Tijolo vermelho é destruído",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0,
    "fadeInMs": 0,
    "fadeOutMs": 50,
    "duckingMs": 220,
    "targetDuration": "90 ms a 180 ms",
    "variations": "3",
    "uxNotes": "Timbre quente. Não deve soar mais importante que conclusão de fase.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-brick-break-red-01.mp3",
      "/assets/audio/sfx-brick-break-red-02.mp3",
      "/assets/audio/sfx-brick-break-red-03.mp3"
    ]
  },
  "sfx-brick-break-blue": {
    "id": "sfx-brick-break-blue",
    "type": "effect",
    "trigger": "Tijolo azul é destruído",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0.68,
    "fadeInMs": 0,
    "fadeOutMs": 50,
    "duckingMs": 220,
    "targetDuration": "90 ms a 180 ms",
    "variations": "3",
    "uxNotes": "Timbre claro e frio, com mesma presença do vermelho.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-brick-break-blue-01.mp3",
      "/assets/audio/sfx-brick-break-blue-02.mp3",
      "/assets/audio/sfx-brick-break-blue-03.mp3"
    ]
  },
  "sfx-brick-break-green": {
    "id": "sfx-brick-break-green",
    "type": "effect",
    "trigger": "Tijolo verde é destruído",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0.66,
    "fadeInMs": 0,
    "fadeOutMs": 50,
    "duckingMs": 200,
    "targetDuration": "90 ms a 180 ms",
    "variations": "3",
    "uxNotes": "Timbre macio para evitar excesso de brilho em sequências.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-brick-break-green-01.mp3",
      "/assets/audio/sfx-brick-break-green-02.mp3",
      "/assets/audio/sfx-brick-break-green-03.mp3"
    ]
  },
  "sfx-brick-break-yellow": {
    "id": "sfx-brick-break-yellow",
    "type": "effect",
    "trigger": "Tijolo amarelo é destruído",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0.72,
    "fadeInMs": 0,
    "fadeOutMs": 50,
    "duckingMs": 230,
    "targetDuration": "90 ms a 180 ms",
    "variations": "3",
    "uxNotes": "Timbre mais brilhante, mas sem estridência.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-brick-break-yellow-01.mp3",
      "/assets/audio/sfx-brick-break-yellow-02.mp3",
      "/assets/audio/sfx-brick-break-yellow-03.mp3"
    ]
  },
  "sfx-brick-break-purple": {
    "id": "sfx-brick-break-purple",
    "type": "effect",
    "trigger": "Tijolo roxo é destruído",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0.68,
    "fadeInMs": 0,
    "fadeOutMs": 60,
    "duckingMs": 220,
    "targetDuration": "100 ms a 200 ms",
    "variations": "3",
    "uxNotes": "Timbre um pouco mais grave ou espacial para diferenciar cor.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-brick-break-purple-01.mp3",
      "/assets/audio/sfx-brick-break-purple-02.mp3",
      "/assets/audio/sfx-brick-break-purple-03.mp3"
    ]
  },
  "sfx-score-tick": {
    "id": "sfx-score-tick",
    "type": "effect",
    "trigger": "Pontuação aumenta após destruição de tijolo",
    "priorityLabel": "Média",
    "priorityWeight": 2,
    "volume": 0.38,
    "fadeInMs": 0,
    "fadeOutMs": 30,
    "duckingMs": 0,
    "targetDuration": "40 ms a 80 ms",
    "variations": "3",
    "uxNotes": "Deve ficar 8 dB a 10 dB abaixo do som de tijolo; não duplicar sensação de impacto.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-score-tick-01.mp3",
      "/assets/audio/sfx-score-tick-02.mp3",
      "/assets/audio/sfx-score-tick-03.mp3"
    ]
  },
  "sfx-combo-small": {
    "id": "sfx-combo-small",
    "type": "future",
    "trigger": "Sequência curta de 3 ou mais tijolos destruídos em janela de combo futura",
    "priorityLabel": "Média",
    "priorityWeight": 2,
    "volume": 0.65,
    "fadeInMs": 0,
    "fadeOutMs": 80,
    "duckingMs": 250,
    "targetDuration": "180 ms a 350 ms",
    "variations": "2",
    "uxNotes": "Usar cooldown mínimo de 500 ms para não empilhar em excesso.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-combo-small-01.mp3",
      "/assets/audio/sfx-combo-small-02.mp3"
    ]
  },
  "sfx-combo-large": {
    "id": "sfx-combo-large",
    "type": "future",
    "trigger": "Combo alto futuro, acima do limite definido pela mecânica",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0.78,
    "fadeInMs": 0,
    "fadeOutMs": 120,
    "duckingMs": 400,
    "targetDuration": "350 ms a 700 ms",
    "variations": "2",
    "uxNotes": "Deve soar como recompensa, não como fim de fase.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-combo-large-01.mp3",
      "/assets/audio/sfx-combo-large-02.mp3"
    ]
  },
  "sfx-ball-lost": {
    "id": "sfx-ball-lost",
    "type": "effect",
    "trigger": "Bola passa pela raquete e sai da área de jogo",
    "priorityLabel": "Crítica",
    "priorityWeight": 4,
    "volume": 0.75,
    "fadeInMs": 0,
    "fadeOutMs": 180,
    "duckingMs": 500,
    "targetDuration": "350 ms a 700 ms",
    "variations": "2",
    "uxNotes": "Queda curta; precisa comunicar erro sem punição emocional exagerada.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-ball-lost-01.mp3",
      "/assets/audio/sfx-ball-lost-02.mp3"
    ]
  },
  "sfx-game-over": {
    "id": "sfx-game-over",
    "type": "effect",
    "trigger": "Estado de fim de jogo é confirmado",
    "priorityLabel": "Crítica",
    "priorityWeight": 4,
    "volume": 0.85,
    "fadeInMs": 0,
    "fadeOutMs": 500,
    "duckingMs": 700,
    "targetDuration": "800 ms a 1500 ms",
    "variations": "1",
    "uxNotes": "Grave limpo e conclusivo; deve deixar espaço para leitura da mensagem final.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-game-over-01.mp3"
    ]
  },
  "sfx-level-complete": {
    "id": "sfx-level-complete",
    "type": "effect",
    "trigger": "Último tijolo ativo da fase é destruído e o jogo entra em transição",
    "priorityLabel": "Crítica",
    "priorityWeight": 4,
    "volume": 0.82,
    "fadeInMs": 0,
    "fadeOutMs": 250,
    "duckingMs": 600,
    "targetDuration": "700 ms a 1200 ms",
    "variations": "2",
    "uxNotes": "Deve antecipar a pausa e reforçar recompensa de fase.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-level-complete-01.mp3",
      "/assets/audio/sfx-level-complete-02.mp3"
    ]
  },
  "sfx-level-toast-in": {
    "id": "sfx-level-toast-in",
    "type": "ui",
    "trigger": "Mensagem de subida de fase aparece entre fases",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0.5,
    "fadeInMs": 80,
    "fadeOutMs": 120,
    "duckingMs": 180,
    "targetDuration": "200 ms a 450 ms",
    "variations": "2",
    "uxNotes": "Deve acompanhar o enter visual da mensagem sem parecer notificação externa.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-level-toast-in-01.mp3",
      "/assets/audio/sfx-level-toast-in-02.mp3"
    ]
  },
  "sfx-level-start": {
    "id": "sfx-level-start",
    "type": "effect",
    "trigger": "Nova fase começa após a pausa de transição",
    "priorityLabel": "Crítica",
    "priorityWeight": 4,
    "volume": 0.76,
    "fadeInMs": 0,
    "fadeOutMs": 200,
    "duckingMs": 450,
    "targetDuration": "400 ms a 800 ms",
    "variations": "2",
    "uxNotes": "Pulso ascendente; comunica retorno à ação e aumento de velocidade.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-level-start-01.mp3",
      "/assets/audio/sfx-level-start-02.mp3"
    ]
  },
  "sfx-restart": {
    "id": "sfx-restart",
    "type": "ui",
    "trigger": "Botão Reiniciar ou Jogar de novo é acionado",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0.58,
    "fadeInMs": 0,
    "fadeOutMs": 80,
    "duckingMs": 220,
    "targetDuration": "200 ms a 400 ms",
    "variations": "2",
    "uxNotes": "Deve soar como reset voluntário, não como falha.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-restart-01.mp3",
      "/assets/audio/sfx-restart-02.mp3"
    ]
  },
  "sfx-reset-score": {
    "id": "sfx-reset-score",
    "type": "ui",
    "trigger": "Botão Zerar pontuação é acionado",
    "priorityLabel": "Média",
    "priorityWeight": 2,
    "volume": 0.45,
    "fadeInMs": 0,
    "fadeOutMs": 100,
    "duckingMs": 0,
    "targetDuration": "180 ms a 350 ms",
    "variations": "1",
    "uxNotes": "Som discreto; não deve sugerir erro ou conquista.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-reset-score-01.mp3"
    ]
  },
  "sfx-button-press": {
    "id": "sfx-button-press",
    "type": "ui",
    "trigger": "Botões comuns são pressionados, incluindo Logs, Colisões, Claro e Escuro",
    "priorityLabel": "Baixa",
    "priorityWeight": 1,
    "volume": 0.315,
    "fadeInMs": 0,
    "fadeOutMs": 40,
    "duckingMs": 0,
    "targetDuration": "40 ms a 100 ms",
    "variations": "4",
    "uxNotes": "Deve ser tátil e baixo para não competir com gameplay.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-button-press-01.mp3",
      "/assets/audio/sfx-button-press-02.mp3",
      "/assets/audio/sfx-button-press-03.mp3",
      "/assets/audio/sfx-button-press-04.mp3"
    ]
  },
  "sfx-panel-open": {
    "id": "sfx-panel-open",
    "type": "ui",
    "trigger": "Painel de logs ou colisões é aberto",
    "priorityLabel": "Média",
    "priorityWeight": 2,
    "volume": 0.38,
    "fadeInMs": 80,
    "fadeOutMs": 120,
    "duckingMs": 0,
    "targetDuration": "180 ms a 350 ms",
    "variations": "2",
    "uxNotes": "Sweep curto, indicando que uma camada de leitura foi aberta.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-panel-open-01.mp3",
      "/assets/audio/sfx-panel-open-02.mp3"
    ]
  },
  "sfx-panel-close": {
    "id": "sfx-panel-close",
    "type": "ui",
    "trigger": "Painel de logs ou colisões é fechado",
    "priorityLabel": "Média",
    "priorityWeight": 2,
    "volume": 0.34,
    "fadeInMs": 60,
    "fadeOutMs": 120,
    "duckingMs": 0,
    "targetDuration": "160 ms a 300 ms",
    "variations": "2",
    "uxNotes": "Sweep descendente, mais baixo que abertura.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-panel-close-01.mp3",
      "/assets/audio/sfx-panel-close-02.mp3"
    ]
  },
  "sfx-theme-toggle": {
    "id": "sfx-theme-toggle",
    "type": "ui",
    "trigger": "Alternância entre tema claro e escuro",
    "priorityLabel": "Baixa",
    "priorityWeight": 1,
    "volume": 0.36,
    "fadeInMs": 0,
    "fadeOutMs": 80,
    "duckingMs": 0,
    "targetDuration": "120 ms a 250 ms",
    "variations": "2",
    "uxNotes": "Chime curto; não deve parecer evento de pontuação.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-theme-toggle-01.mp3",
      "/assets/audio/sfx-theme-toggle-02.mp3"
    ]
  },
  "sfx-ad-placeholder-none": {
    "id": "sfx-ad-placeholder-none",
    "type": "system",
    "trigger": "Referência silenciosa interna para fluxos sem áudio real",
    "priorityLabel": "Baixa",
    "priorityWeight": 1,
    "volume": 0,
    "fadeInMs": 0,
    "fadeOutMs": 0,
    "duckingMs": 0,
    "targetDuration": "Silêncio",
    "variations": "0",
    "uxNotes": "Silêncio intencional; não deve aparecer nem chamar atenção na interface.",
    "loop": false,
    "files": []
  },
  "sfx-powerup-spawn": {
    "id": "sfx-powerup-spawn",
    "type": "future",
    "trigger": "Power-up futuro aparece no tabuleiro",
    "priorityLabel": "Média",
    "priorityWeight": 2,
    "volume": 0.55,
    "fadeInMs": 0,
    "fadeOutMs": 100,
    "duckingMs": 160,
    "targetDuration": "200 ms a 450 ms",
    "variations": "3",
    "uxNotes": "Spark leve; deve avisar oportunidade sem distrair da bola.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-powerup-spawn-01.mp3",
      "/assets/audio/sfx-powerup-spawn-02.mp3",
      "/assets/audio/sfx-powerup-spawn-03.mp3"
    ]
  },
  "sfx-powerup-collect": {
    "id": "sfx-powerup-collect",
    "type": "future",
    "trigger": "Jogador coleta power-up futuro",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0.72,
    "fadeInMs": 0,
    "fadeOutMs": 160,
    "duckingMs": 300,
    "targetDuration": "350 ms a 700 ms",
    "variations": "3",
    "uxNotes": "Chime positivo acima de tijolo comum.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-powerup-collect-01.mp3",
      "/assets/audio/sfx-powerup-collect-02.mp3",
      "/assets/audio/sfx-powerup-collect-03.mp3"
    ]
  },
  "sfx-powerup-activate-multiball": {
    "id": "sfx-powerup-activate-multiball",
    "type": "future",
    "trigger": "Power-up de múltiplas bolas é ativado",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0.8,
    "fadeInMs": 0,
    "fadeOutMs": 200,
    "duckingMs": 450,
    "targetDuration": "500 ms a 900 ms",
    "variations": "2",
    "uxNotes": "Expansão estéreo curta; deve indicar multiplicação sem confundir com fase concluída.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-powerup-activate-multiball-01.mp3",
      "/assets/audio/sfx-powerup-activate-multiball-02.mp3"
    ]
  },
  "sfx-powerup-activate-wide-paddle": {
    "id": "sfx-powerup-activate-wide-paddle",
    "type": "future",
    "trigger": "Power-up aumenta largura da raquete",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0.68,
    "fadeInMs": 0,
    "fadeOutMs": 160,
    "duckingMs": 260,
    "targetDuration": "350 ms a 650 ms",
    "variations": "2",
    "uxNotes": "Sweep horizontal, associado à raquete.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-powerup-activate-wide-paddle-01.mp3",
      "/assets/audio/sfx-powerup-activate-wide-paddle-02.mp3"
    ]
  },
  "sfx-powerup-activate-slow-ball": {
    "id": "sfx-powerup-activate-slow-ball",
    "type": "future",
    "trigger": "Power-up reduz velocidade da bola",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0.64,
    "fadeInMs": 0,
    "fadeOutMs": 180,
    "duckingMs": 250,
    "targetDuration": "350 ms a 700 ms",
    "variations": "2",
    "uxNotes": "Pitch-down suave; deve comunicar desaceleração sem parecer perda.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-powerup-activate-slow-ball-01.mp3",
      "/assets/audio/sfx-powerup-activate-slow-ball-02.mp3"
    ]
  },
  "sfx-powerup-activate-laser-fan": {
    "id": "sfx-powerup-activate-laser-fan",
    "type": "future",
    "trigger": "Power-up Laser em leque é ativado",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0.78,
    "fadeInMs": 0,
    "fadeOutMs": 180,
    "duckingMs": 350,
    "targetDuration": "180 ms a 350 ms",
    "variations": "1",
    "uxNotes": "Disparo curto e brilhante; deve comunicar raios em leque sem parecer explosão ou conclusão de fase.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-powerup-activate-laser-fan-01.mp3"
    ]
  },
  "sfx-powerup-expire": {
    "id": "sfx-powerup-expire",
    "type": "future",
    "trigger": "Efeito de power-up futuro termina",
    "priorityLabel": "Média",
    "priorityWeight": 2,
    "volume": 0.45,
    "fadeInMs": 0,
    "fadeOutMs": 120,
    "duckingMs": 0,
    "targetDuration": "180 ms a 350 ms",
    "variations": "2",
    "uxNotes": "Blip neutro e baixo, sem tom punitivo.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-powerup-expire-01.mp3",
      "/assets/audio/sfx-powerup-expire-02.mp3"
    ]
  },
  "sfx-highscore-new": {
    "id": "sfx-highscore-new",
    "type": "future",
    "trigger": "Novo recorde ou high-score futuro é confirmado",
    "priorityLabel": "Crítica",
    "priorityWeight": 4,
    "volume": 0.88,
    "fadeInMs": 0,
    "fadeOutMs": 600,
    "duckingMs": 700,
    "targetDuration": "900 ms a 1800 ms",
    "variations": "2",
    "uxNotes": "Fanfarra curta; maior recompensa sonora fora de conclusão de fase.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-highscore-new-01.mp3",
      "/assets/audio/sfx-highscore-new-02.mp3"
    ]
  },
  "sfx-offline-ready": {
    "id": "sfx-offline-ready",
    "type": "system",
    "trigger": "Estado futuro informa que o jogo está pronto para uso offline",
    "priorityLabel": "Baixa",
    "priorityWeight": 1,
    "volume": 0,
    "fadeInMs": 80,
    "fadeOutMs": 120,
    "duckingMs": 0,
    "targetDuration": "160 ms a 300 ms",
    "variations": "1",
    "uxNotes": "Opcional e só deve tocar se houver feedback visual correspondente.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-offline-ready-01.mp3"
    ]
  },
  "sfx-error-soft": {
    "id": "sfx-error-soft",
    "type": "system",
    "trigger": "Erro não-crítico visível ao usuário, como falha de leitura local recuperável",
    "priorityLabel": "Média",
    "priorityWeight": 2,
    "volume": 0,
    "fadeInMs": 0,
    "fadeOutMs": 180,
    "duckingMs": 250,
    "targetDuration": "250 ms a 500 ms",
    "variations": "2",
    "uxNotes": "Tom baixo, claro e não alarmista; nunca deve expor detalhe técnico.",
    "loop": false,
    "files": [
      "/assets/audio/sfx-error-soft-01.mp3",
      "/assets/audio/sfx-error-soft-02.mp3"
    ]
  }
} satisfies Record<AudioId, AudioCatalogEntry>;

export const MUSIC_AUDIO_IDS = [
  "bgm-menu-loop-main",
  "bgm-gameplay-loop-main",
  "bgm-gameplay-intense-layer"
] as const;

export const AUDIO_ASSET_PATHS = {
  bgmGameplayIntenseLayer01: '/assets/audio/bgm-gameplay-intense-layer-01.mp3',
  bgmGameplayLoopMain01: '/assets/audio/bgm-gameplay-loop-main-01.mp3',
  bgmMenuLoopMain01: '/assets/audio/bgm-menu-loop-main-01.mp3',
  sfxBallLost01: '/assets/audio/sfx-ball-lost-01.mp3',
  sfxBallLost02: '/assets/audio/sfx-ball-lost-02.mp3',
  sfxBrickBreakBlue01: '/assets/audio/sfx-brick-break-blue-01.mp3',
  sfxBrickBreakBlue02: '/assets/audio/sfx-brick-break-blue-02.mp3',
  sfxBrickBreakBlue03: '/assets/audio/sfx-brick-break-blue-03.mp3',
  sfxBrickBreakGreen01: '/assets/audio/sfx-brick-break-green-01.mp3',
  sfxBrickBreakGreen02: '/assets/audio/sfx-brick-break-green-02.mp3',
  sfxBrickBreakGreen03: '/assets/audio/sfx-brick-break-green-03.mp3',
  sfxBrickBreakPurple01: '/assets/audio/sfx-brick-break-purple-01.mp3',
  sfxBrickBreakPurple02: '/assets/audio/sfx-brick-break-purple-02.mp3',
  sfxBrickBreakPurple03: '/assets/audio/sfx-brick-break-purple-03.mp3',
  sfxBrickBreakRed01: '/assets/audio/sfx-brick-break-red-01.mp3',
  sfxBrickBreakRed02: '/assets/audio/sfx-brick-break-red-02.mp3',
  sfxBrickBreakRed03: '/assets/audio/sfx-brick-break-red-03.mp3',
  sfxBrickBreakYellow01: '/assets/audio/sfx-brick-break-yellow-01.mp3',
  sfxBrickBreakYellow02: '/assets/audio/sfx-brick-break-yellow-02.mp3',
  sfxBrickBreakYellow03: '/assets/audio/sfx-brick-break-yellow-03.mp3',
  sfxBrickHit01: '/assets/audio/sfx-brick-hit-01.mp3',
  sfxBrickHit02: '/assets/audio/sfx-brick-hit-02.mp3',
  sfxBrickHit03: '/assets/audio/sfx-brick-hit-03.mp3',
  sfxBrickHit04: '/assets/audio/sfx-brick-hit-04.mp3',
  sfxBrickHit05: '/assets/audio/sfx-brick-hit-05.mp3',
  sfxButtonPress01: '/assets/audio/sfx-button-press-01.mp3',
  sfxButtonPress02: '/assets/audio/sfx-button-press-02.mp3',
  sfxButtonPress03: '/assets/audio/sfx-button-press-03.mp3',
  sfxButtonPress04: '/assets/audio/sfx-button-press-04.mp3',
  sfxCeilingHit01: '/assets/audio/sfx-ceiling-hit-01.mp3',
  sfxCeilingHit02: '/assets/audio/sfx-ceiling-hit-02.mp3',
  sfxCeilingHit03: '/assets/audio/sfx-ceiling-hit-03.mp3',
  sfxCeilingHit04: '/assets/audio/sfx-ceiling-hit-04.mp3',
  sfxComboLarge01: '/assets/audio/sfx-combo-large-01.mp3',
  sfxComboLarge02: '/assets/audio/sfx-combo-large-02.mp3',
  sfxComboSmall01: '/assets/audio/sfx-combo-small-01.mp3',
  sfxComboSmall02: '/assets/audio/sfx-combo-small-02.mp3',
  sfxErrorSoft01: '/assets/audio/sfx-error-soft-01.mp3',
  sfxErrorSoft02: '/assets/audio/sfx-error-soft-02.mp3',
  sfxGameOver01: '/assets/audio/sfx-game-over-01.mp3',
  sfxGameStart01: '/assets/audio/sfx-game-start-01.mp3',
  sfxGameStart02: '/assets/audio/sfx-game-start-02.mp3',
  sfxHighscoreNew01: '/assets/audio/sfx-highscore-new-01.mp3',
  sfxHighscoreNew02: '/assets/audio/sfx-highscore-new-02.mp3',
  sfxLevelComplete01: '/assets/audio/sfx-level-complete-01.mp3',
  sfxLevelComplete02: '/assets/audio/sfx-level-complete-02.mp3',
  sfxLevelStart01: '/assets/audio/sfx-level-start-01.mp3',
  sfxLevelStart02: '/assets/audio/sfx-level-start-02.mp3',
  sfxLevelToastIn01: '/assets/audio/sfx-level-toast-in-01.mp3',
  sfxLevelToastIn02: '/assets/audio/sfx-level-toast-in-02.mp3',
  sfxOfflineReady01: '/assets/audio/sfx-offline-ready-01.mp3',
  sfxPaddleHitCenter01: '/assets/audio/sfx-paddle-hit-center-01.mp3',
  sfxPaddleHitCenter02: '/assets/audio/sfx-paddle-hit-center-02.mp3',
  sfxPaddleHitCenter03: '/assets/audio/sfx-paddle-hit-center-03.mp3',
  sfxPaddleHitCenter04: '/assets/audio/sfx-paddle-hit-center-04.mp3',
  sfxPaddleHitEdge01: '/assets/audio/sfx-paddle-hit-edge-01.mp3',
  sfxPaddleHitEdge02: '/assets/audio/sfx-paddle-hit-edge-02.mp3',
  sfxPaddleHitEdge03: '/assets/audio/sfx-paddle-hit-edge-03.mp3',
  sfxPaddleHitEdge04: '/assets/audio/sfx-paddle-hit-edge-04.mp3',
  sfxPanelClose01: '/assets/audio/sfx-panel-close-01.mp3',
  sfxPanelClose02: '/assets/audio/sfx-panel-close-02.mp3',
  sfxPanelOpen01: '/assets/audio/sfx-panel-open-01.mp3',
  sfxPanelOpen02: '/assets/audio/sfx-panel-open-02.mp3',
  sfxPowerupActivateLaserFan01: '/assets/audio/sfx-powerup-activate-laser-fan-01.mp3',
  sfxPowerupActivateMultiball01: '/assets/audio/sfx-powerup-activate-multiball-01.mp3',
  sfxPowerupActivateMultiball02: '/assets/audio/sfx-powerup-activate-multiball-02.mp3',
  sfxPowerupActivateSlowBall01: '/assets/audio/sfx-powerup-activate-slow-ball-01.mp3',
  sfxPowerupActivateSlowBall02: '/assets/audio/sfx-powerup-activate-slow-ball-02.mp3',
  sfxPowerupActivateWidePaddle01: '/assets/audio/sfx-powerup-activate-wide-paddle-01.mp3',
  sfxPowerupActivateWidePaddle02: '/assets/audio/sfx-powerup-activate-wide-paddle-02.mp3',
  sfxPowerupCollect01: '/assets/audio/sfx-powerup-collect-01.mp3',
  sfxPowerupCollect02: '/assets/audio/sfx-powerup-collect-02.mp3',
  sfxPowerupCollect03: '/assets/audio/sfx-powerup-collect-03.mp3',
  sfxPowerupExpire01: '/assets/audio/sfx-powerup-expire-01.mp3',
  sfxPowerupExpire02: '/assets/audio/sfx-powerup-expire-02.mp3',
  sfxPowerupSpawn01: '/assets/audio/sfx-powerup-spawn-01.mp3',
  sfxPowerupSpawn02: '/assets/audio/sfx-powerup-spawn-02.mp3',
  sfxPowerupSpawn03: '/assets/audio/sfx-powerup-spawn-03.mp3',
  sfxResetScore01: '/assets/audio/sfx-reset-score-01.mp3',
  sfxRestart01: '/assets/audio/sfx-restart-01.mp3',
  sfxRestart02: '/assets/audio/sfx-restart-02.mp3',
  sfxScoreTick01: '/assets/audio/sfx-score-tick-01.mp3',
  sfxScoreTick02: '/assets/audio/sfx-score-tick-02.mp3',
  sfxScoreTick03: '/assets/audio/sfx-score-tick-03.mp3',
  sfxThemeToggle01: '/assets/audio/sfx-theme-toggle-01.mp3',
  sfxThemeToggle02: '/assets/audio/sfx-theme-toggle-02.mp3',
  sfxWallHit01: '/assets/audio/sfx-wall-hit-01.mp3',
  sfxWallHit02: '/assets/audio/sfx-wall-hit-02.mp3',
  sfxWallHit03: '/assets/audio/sfx-wall-hit-03.mp3',
  sfxWallHit04: '/assets/audio/sfx-wall-hit-04.mp3',
  sfxWallHit05: '/assets/audio/sfx-wall-hit-05.mp3',
} as const;

export const AUDIO_PUBLIC_PATHS = Object.values(AUDIO_ASSET_PATHS);

export const SILENT_AUDIO_ID: AudioId = 'sfx-ad-placeholder-none';
export const GAMEPLAY_MUSIC_AUDIO_ID: AudioId = 'bgm-gameplay-loop-main';
export const MENU_MUSIC_AUDIO_ID: AudioId = 'bgm-menu-loop-main';
export const HIGH_INTENSITY_MUSIC_AUDIO_ID: AudioId = 'bgm-gameplay-intense-layer';
export const AUDIO_QA_SCENARIO = 'audio-event-tour';
export const AUDIO_STORAGE_MUTED_KEY = 'brikaya-audio-muted';
export const MUSIC_STORAGE_MUTED_KEY = 'brikaya-music-muted';
export const AUDIO_STORAGE_ENABLED_VALUE = '0';
export const AUDIO_STORAGE_MUTED_VALUE = '1';
export const AUDIO_MASTER_VOLUME = 0.7;
export const AUDIO_DUCKING_GAIN = 0.5;
export const AUDIO_DUCKING_RELEASE_MS = 180;
export const AUDIO_DEFAULT_FADE_MS = 120;
export const AUDIO_MAX_SIMULTANEOUS_SFX = 8;

export interface GameAudioSink {
  playAudio: (id: AudioId) => void;
  startGameplayMusic: () => void;
  startMenuMusic: () => void;
  setHighIntensity: (active: boolean) => void;
}

export const GAME_AUDIO_IDS = {
  GAME_START: 'sfx-game-start',
  PADDLE_HIT_CENTER: 'sfx-paddle-hit-center',
  PADDLE_HIT_EDGE: 'sfx-paddle-hit-edge',
  WALL_HIT: 'sfx-wall-hit',
  CEILING_HIT: 'sfx-ceiling-hit',
  BRICK_HIT: 'sfx-brick-hit',
  BRICK_BREAK_RED: 'sfx-brick-break-red',
  BRICK_BREAK_BLUE: 'sfx-brick-break-blue',
  BRICK_BREAK_GREEN: 'sfx-brick-break-green',
  BRICK_BREAK_YELLOW: 'sfx-brick-break-yellow',
  BRICK_BREAK_PURPLE: 'sfx-brick-break-purple',
  SCORE_TICK: 'sfx-score-tick',
  COMBO_SMALL: 'sfx-combo-small',
  COMBO_LARGE: 'sfx-combo-large',
  BALL_LOST: 'sfx-ball-lost',
  GAME_OVER: 'sfx-game-over',
  LEVEL_COMPLETE: 'sfx-level-complete',
  LEVEL_START: 'sfx-level-start',
  COUNTDOWN_TICK: 'sfx-score-tick',
  LEVEL_UP_OVERLAY: 'sfx-level-toast-in',
  RIP_OVERLAY: 'sfx-game-over',
  RESTART: 'sfx-restart',
  RESET_SCORE: 'sfx-reset-score',
  BUTTON_PRESS: 'sfx-button-press',
  PANEL_OPEN: 'sfx-panel-open',
  PANEL_CLOSE: 'sfx-panel-close',
  THEME_TOGGLE: 'sfx-theme-toggle',
  POWERUP_SPAWN: 'sfx-powerup-spawn',
  POWERUP_COLLECT: 'sfx-powerup-collect',
  POWERUP_ACTIVATE_MULTIBALL: 'sfx-powerup-activate-multiball',
  POWERUP_ACTIVATE_WIDE_PADDLE: 'sfx-powerup-activate-wide-paddle',
  POWERUP_ACTIVATE_SLOW_BALL: 'sfx-powerup-activate-slow-ball',
  POWERUP_ACTIVATE_LASER_FAN: 'sfx-powerup-activate-laser-fan',
  POWERUP_EXPIRE: 'sfx-powerup-expire',
  HIGHSCORE_NEW: 'sfx-highscore-new',
  OFFLINE_READY: 'sfx-offline-ready',
  UPDATE_PROGRESS: 'sfx-level-toast-in',
  UPDATE_INSTALLED: 'sfx-level-start',
  ERROR_SOFT: 'sfx-error-soft',
} as const satisfies Record<string, AudioId>;
