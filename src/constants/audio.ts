// src/constants/audio.ts
export const AUDIO_EVENT_IDS = [
  "music_menu_loop",
  "music_gameplay_loop",
  "music_high_intensity_layer",
  "sfx_game_start",
  "sfx_paddle_hit_center",
  "sfx_paddle_hit_edge",
  "sfx_wall_hit",
  "sfx_ceiling_hit",
  "sfx_brick_hit",
  "sfx_brick_break_red",
  "sfx_brick_break_blue",
  "sfx_brick_break_green",
  "sfx_brick_break_yellow",
  "sfx_brick_break_purple",
  "sfx_score_tick",
  "sfx_combo_small",
  "sfx_combo_large",
  "sfx_ball_lost",
  "sfx_game_over",
  "sfx_level_complete",
  "sfx_level_toast_in",
  "sfx_level_start",
  "sfx_restart",
  "sfx_reset_score",
  "sfx_button_press",
  "sfx_panel_open",
  "sfx_panel_close",
  "sfx_theme_toggle",
  "sfx_ad_placeholder_none",
  "sfx_powerup_spawn",
  "sfx_powerup_collect",
  "sfx_powerup_activate_multiball",
  "sfx_powerup_activate_wide_paddle",
  "sfx_powerup_activate_slow_ball",
  "sfx_powerup_expire",
  "sfx_highscore_new",
  "sfx_offline_ready",
  "sfx_error_soft"
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
  "music_menu_loop": {
    "id": "music_menu_loop",
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
      "/assets/audio/music_menu_loop-01.mp3"
    ]
  },
  "music_gameplay_loop": {
    "id": "music_gameplay_loop",
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
      "/assets/audio/music_gameplay_loop-01.mp3"
    ]
  },
  "music_high_intensity_layer": {
    "id": "music_high_intensity_layer",
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
      "/assets/audio/music_high_intensity_layer-01.mp3"
    ]
  },
  "sfx_game_start": {
    "id": "sfx_game_start",
    "type": "effect",
    "trigger": "Primeira partida ou reinício iniciado por ação humana",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0,
    "fadeInMs": 0,
    "fadeOutMs": 80,
    "duckingMs": 300,
    "targetDuration": "300 ms a 600 ms",
    "variations": "2",
    "uxNotes": "Deve comunicar prontidão, não vitória.",
    "loop": false,
    "files": [
      "/assets/audio/sfx_game_start-01.mp3",
      "/assets/audio/sfx_game_start-02.mp3"
    ]
  },
  "sfx_paddle_hit_center": {
    "id": "sfx_paddle_hit_center",
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
      "/assets/audio/sfx_paddle_hit_center-01.mp3",
      "/assets/audio/sfx_paddle_hit_center-02.mp3",
      "/assets/audio/sfx_paddle_hit_center-03.mp3",
      "/assets/audio/sfx_paddle_hit_center-04.mp3"
    ]
  },
  "sfx_paddle_hit_edge": {
    "id": "sfx_paddle_hit_edge",
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
      "/assets/audio/sfx_paddle_hit_edge-01.mp3",
      "/assets/audio/sfx_paddle_hit_edge-02.mp3",
      "/assets/audio/sfx_paddle_hit_edge-03.mp3",
      "/assets/audio/sfx_paddle_hit_edge-04.mp3"
    ]
  },
  "sfx_wall_hit": {
    "id": "sfx_wall_hit",
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
      "/assets/audio/sfx_wall_hit-01.mp3",
      "/assets/audio/sfx_wall_hit-02.mp3",
      "/assets/audio/sfx_wall_hit-03.mp3",
      "/assets/audio/sfx_wall_hit-04.mp3",
      "/assets/audio/sfx_wall_hit-05.mp3"
    ]
  },
  "sfx_ceiling_hit": {
    "id": "sfx_ceiling_hit",
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
      "/assets/audio/sfx_ceiling_hit-01.mp3",
      "/assets/audio/sfx_ceiling_hit-02.mp3",
      "/assets/audio/sfx_ceiling_hit-03.mp3",
      "/assets/audio/sfx_ceiling_hit-04.mp3"
    ]
  },
  "sfx_brick_hit": {
    "id": "sfx_brick_hit",
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
      "/assets/audio/sfx_brick_hit-01.mp3",
      "/assets/audio/sfx_brick_hit-02.mp3",
      "/assets/audio/sfx_brick_hit-03.mp3",
      "/assets/audio/sfx_brick_hit-04.mp3",
      "/assets/audio/sfx_brick_hit-05.mp3"
    ]
  },
  "sfx_brick_break_red": {
    "id": "sfx_brick_break_red",
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
      "/assets/audio/sfx_brick_break_red-01.mp3",
      "/assets/audio/sfx_brick_break_red-02.mp3",
      "/assets/audio/sfx_brick_break_red-03.mp3"
    ]
  },
  "sfx_brick_break_blue": {
    "id": "sfx_brick_break_blue",
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
      "/assets/audio/sfx_brick_break_blue-01.mp3",
      "/assets/audio/sfx_brick_break_blue-02.mp3",
      "/assets/audio/sfx_brick_break_blue-03.mp3"
    ]
  },
  "sfx_brick_break_green": {
    "id": "sfx_brick_break_green",
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
      "/assets/audio/sfx_brick_break_green-01.mp3",
      "/assets/audio/sfx_brick_break_green-02.mp3",
      "/assets/audio/sfx_brick_break_green-03.mp3"
    ]
  },
  "sfx_brick_break_yellow": {
    "id": "sfx_brick_break_yellow",
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
      "/assets/audio/sfx_brick_break_yellow-01.mp3",
      "/assets/audio/sfx_brick_break_yellow-02.mp3",
      "/assets/audio/sfx_brick_break_yellow-03.mp3"
    ]
  },
  "sfx_brick_break_purple": {
    "id": "sfx_brick_break_purple",
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
      "/assets/audio/sfx_brick_break_purple-01.mp3",
      "/assets/audio/sfx_brick_break_purple-02.mp3",
      "/assets/audio/sfx_brick_break_purple-03.mp3"
    ]
  },
  "sfx_score_tick": {
    "id": "sfx_score_tick",
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
      "/assets/audio/sfx_score_tick-01.mp3",
      "/assets/audio/sfx_score_tick-02.mp3",
      "/assets/audio/sfx_score_tick-03.mp3"
    ]
  },
  "sfx_combo_small": {
    "id": "sfx_combo_small",
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
      "/assets/audio/sfx_combo_small-01.mp3",
      "/assets/audio/sfx_combo_small-02.mp3"
    ]
  },
  "sfx_combo_large": {
    "id": "sfx_combo_large",
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
      "/assets/audio/sfx_combo_large-01.mp3",
      "/assets/audio/sfx_combo_large-02.mp3"
    ]
  },
  "sfx_ball_lost": {
    "id": "sfx_ball_lost",
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
      "/assets/audio/sfx_ball_lost-01.mp3",
      "/assets/audio/sfx_ball_lost-02.mp3"
    ]
  },
  "sfx_game_over": {
    "id": "sfx_game_over",
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
      "/assets/audio/sfx_game_over-01.mp3"
    ]
  },
  "sfx_level_complete": {
    "id": "sfx_level_complete",
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
      "/assets/audio/sfx_level_complete-01.mp3",
      "/assets/audio/sfx_level_complete-02.mp3"
    ]
  },
  "sfx_level_toast_in": {
    "id": "sfx_level_toast_in",
    "type": "ui",
    "trigger": "Toast de próxima fase aparece acima dos tijolos",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0,
    "fadeInMs": 80,
    "fadeOutMs": 120,
    "duckingMs": 180,
    "targetDuration": "200 ms a 450 ms",
    "variations": "2",
    "uxNotes": "Deve acompanhar o enter visual do toast sem parecer notificação externa.",
    "loop": false,
    "files": [
      "/assets/audio/sfx_level_toast_in-01.mp3",
      "/assets/audio/sfx_level_toast_in-02.mp3"
    ]
  },
  "sfx_level_start": {
    "id": "sfx_level_start",
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
      "/assets/audio/sfx_level_start-01.mp3",
      "/assets/audio/sfx_level_start-02.mp3"
    ]
  },
  "sfx_restart": {
    "id": "sfx_restart",
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
      "/assets/audio/sfx_restart-01.mp3",
      "/assets/audio/sfx_restart-02.mp3"
    ]
  },
  "sfx_reset_score": {
    "id": "sfx_reset_score",
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
      "/assets/audio/sfx_reset_score-01.mp3"
    ]
  },
  "sfx_button_press": {
    "id": "sfx_button_press",
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
      "/assets/audio/sfx_button_press-01.mp3",
      "/assets/audio/sfx_button_press-02.mp3",
      "/assets/audio/sfx_button_press-03.mp3",
      "/assets/audio/sfx_button_press-04.mp3"
    ]
  },
  "sfx_panel_open": {
    "id": "sfx_panel_open",
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
      "/assets/audio/sfx_panel_open-01.mp3",
      "/assets/audio/sfx_panel_open-02.mp3"
    ]
  },
  "sfx_panel_close": {
    "id": "sfx_panel_close",
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
      "/assets/audio/sfx_panel_close-01.mp3",
      "/assets/audio/sfx_panel_close-02.mp3"
    ]
  },
  "sfx_theme_toggle": {
    "id": "sfx_theme_toggle",
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
      "/assets/audio/sfx_theme_toggle-01.mp3",
      "/assets/audio/sfx_theme_toggle-02.mp3"
    ]
  },
  "sfx_ad_placeholder_none": {
    "id": "sfx_ad_placeholder_none",
    "type": "system",
    "trigger": "Placeholder offline de publicidade aparece ou permanece visível",
    "priorityLabel": "Baixa",
    "priorityWeight": 1,
    "volume": 0,
    "fadeInMs": 0,
    "fadeOutMs": 0,
    "duckingMs": 0,
    "targetDuration": "Silêncio",
    "variations": "0",
    "uxNotes": "Silêncio intencional; área não funcional não deve chamar atenção sonora.",
    "loop": false,
    "files": []
  },
  "sfx_powerup_spawn": {
    "id": "sfx_powerup_spawn",
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
      "/assets/audio/sfx_powerup_spawn-01.mp3",
      "/assets/audio/sfx_powerup_spawn-02.mp3",
      "/assets/audio/sfx_powerup_spawn-03.mp3"
    ]
  },
  "sfx_powerup_collect": {
    "id": "sfx_powerup_collect",
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
      "/assets/audio/sfx_powerup_collect-01.mp3",
      "/assets/audio/sfx_powerup_collect-02.mp3",
      "/assets/audio/sfx_powerup_collect-03.mp3"
    ]
  },
  "sfx_powerup_activate_multiball": {
    "id": "sfx_powerup_activate_multiball",
    "type": "future",
    "trigger": "Power-up de múltiplas bolas é ativado",
    "priorityLabel": "Alta",
    "priorityWeight": 3,
    "volume": 0,
    "fadeInMs": 0,
    "fadeOutMs": 200,
    "duckingMs": 450,
    "targetDuration": "500 ms a 900 ms",
    "variations": "2",
    "uxNotes": "Expansão estéreo curta; deve indicar multiplicação sem confundir com fase concluída.",
    "loop": false,
    "files": [
      "/assets/audio/sfx_powerup_activate_multiball-01.mp3",
      "/assets/audio/sfx_powerup_activate_multiball-02.mp3"
    ]
  },
  "sfx_powerup_activate_wide_paddle": {
    "id": "sfx_powerup_activate_wide_paddle",
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
      "/assets/audio/sfx_powerup_activate_wide_paddle-01.mp3",
      "/assets/audio/sfx_powerup_activate_wide_paddle-02.mp3"
    ]
  },
  "sfx_powerup_activate_slow_ball": {
    "id": "sfx_powerup_activate_slow_ball",
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
      "/assets/audio/sfx_powerup_activate_slow_ball-01.mp3",
      "/assets/audio/sfx_powerup_activate_slow_ball-02.mp3"
    ]
  },
  "sfx_powerup_expire": {
    "id": "sfx_powerup_expire",
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
      "/assets/audio/sfx_powerup_expire-01.mp3",
      "/assets/audio/sfx_powerup_expire-02.mp3"
    ]
  },
  "sfx_highscore_new": {
    "id": "sfx_highscore_new",
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
      "/assets/audio/sfx_highscore_new-01.mp3",
      "/assets/audio/sfx_highscore_new-02.mp3"
    ]
  },
  "sfx_offline_ready": {
    "id": "sfx_offline_ready",
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
      "/assets/audio/sfx_offline_ready-01.mp3"
    ]
  },
  "sfx_error_soft": {
    "id": "sfx_error_soft",
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
      "/assets/audio/sfx_error_soft-01.mp3",
      "/assets/audio/sfx_error_soft-02.mp3"
    ]
  }
} satisfies Record<AudioId, AudioCatalogEntry>;

export const MUSIC_AUDIO_IDS = [
  "music_menu_loop",
  "music_gameplay_loop",
  "music_high_intensity_layer"
] as const;

export const AUDIO_PUBLIC_PATHS = [
  "/assets/audio/music_gameplay_loop-01.mp3",
  "/assets/audio/music_high_intensity_layer-01.mp3",
  "/assets/audio/music_menu_loop-01.mp3",
  "/assets/audio/sfx_ball_lost-01.mp3",
  "/assets/audio/sfx_ball_lost-02.mp3",
  "/assets/audio/sfx_brick_break_blue-01.mp3",
  "/assets/audio/sfx_brick_break_blue-02.mp3",
  "/assets/audio/sfx_brick_break_blue-03.mp3",
  "/assets/audio/sfx_brick_break_green-01.mp3",
  "/assets/audio/sfx_brick_break_green-02.mp3",
  "/assets/audio/sfx_brick_break_green-03.mp3",
  "/assets/audio/sfx_brick_break_purple-01.mp3",
  "/assets/audio/sfx_brick_break_purple-02.mp3",
  "/assets/audio/sfx_brick_break_purple-03.mp3",
  "/assets/audio/sfx_brick_break_red-01.mp3",
  "/assets/audio/sfx_brick_break_red-02.mp3",
  "/assets/audio/sfx_brick_break_red-03.mp3",
  "/assets/audio/sfx_brick_break_yellow-01.mp3",
  "/assets/audio/sfx_brick_break_yellow-02.mp3",
  "/assets/audio/sfx_brick_break_yellow-03.mp3",
  "/assets/audio/sfx_brick_hit-01.mp3",
  "/assets/audio/sfx_brick_hit-02.mp3",
  "/assets/audio/sfx_brick_hit-03.mp3",
  "/assets/audio/sfx_brick_hit-04.mp3",
  "/assets/audio/sfx_brick_hit-05.mp3",
  "/assets/audio/sfx_button_press-01.mp3",
  "/assets/audio/sfx_button_press-02.mp3",
  "/assets/audio/sfx_button_press-03.mp3",
  "/assets/audio/sfx_button_press-04.mp3",
  "/assets/audio/sfx_ceiling_hit-01.mp3",
  "/assets/audio/sfx_ceiling_hit-02.mp3",
  "/assets/audio/sfx_ceiling_hit-03.mp3",
  "/assets/audio/sfx_ceiling_hit-04.mp3",
  "/assets/audio/sfx_combo_large-01.mp3",
  "/assets/audio/sfx_combo_large-02.mp3",
  "/assets/audio/sfx_combo_small-01.mp3",
  "/assets/audio/sfx_combo_small-02.mp3",
  "/assets/audio/sfx_error_soft-01.mp3",
  "/assets/audio/sfx_error_soft-02.mp3",
  "/assets/audio/sfx_game_over-01.mp3",
  "/assets/audio/sfx_game_start-01.mp3",
  "/assets/audio/sfx_game_start-02.mp3",
  "/assets/audio/sfx_highscore_new-01.mp3",
  "/assets/audio/sfx_highscore_new-02.mp3",
  "/assets/audio/sfx_level_complete-01.mp3",
  "/assets/audio/sfx_level_complete-02.mp3",
  "/assets/audio/sfx_level_start-01.mp3",
  "/assets/audio/sfx_level_start-02.mp3",
  "/assets/audio/sfx_level_toast_in-01.mp3",
  "/assets/audio/sfx_level_toast_in-02.mp3",
  "/assets/audio/sfx_offline_ready-01.mp3",
  "/assets/audio/sfx_paddle_hit_center-01.mp3",
  "/assets/audio/sfx_paddle_hit_center-02.mp3",
  "/assets/audio/sfx_paddle_hit_center-03.mp3",
  "/assets/audio/sfx_paddle_hit_center-04.mp3",
  "/assets/audio/sfx_paddle_hit_edge-01.mp3",
  "/assets/audio/sfx_paddle_hit_edge-02.mp3",
  "/assets/audio/sfx_paddle_hit_edge-03.mp3",
  "/assets/audio/sfx_paddle_hit_edge-04.mp3",
  "/assets/audio/sfx_panel_close-01.mp3",
  "/assets/audio/sfx_panel_close-02.mp3",
  "/assets/audio/sfx_panel_open-01.mp3",
  "/assets/audio/sfx_panel_open-02.mp3",
  "/assets/audio/sfx_powerup_activate_multiball-01.mp3",
  "/assets/audio/sfx_powerup_activate_multiball-02.mp3",
  "/assets/audio/sfx_powerup_activate_slow_ball-01.mp3",
  "/assets/audio/sfx_powerup_activate_slow_ball-02.mp3",
  "/assets/audio/sfx_powerup_activate_wide_paddle-01.mp3",
  "/assets/audio/sfx_powerup_activate_wide_paddle-02.mp3",
  "/assets/audio/sfx_powerup_collect-01.mp3",
  "/assets/audio/sfx_powerup_collect-02.mp3",
  "/assets/audio/sfx_powerup_collect-03.mp3",
  "/assets/audio/sfx_powerup_expire-01.mp3",
  "/assets/audio/sfx_powerup_expire-02.mp3",
  "/assets/audio/sfx_powerup_spawn-01.mp3",
  "/assets/audio/sfx_powerup_spawn-02.mp3",
  "/assets/audio/sfx_powerup_spawn-03.mp3",
  "/assets/audio/sfx_reset_score-01.mp3",
  "/assets/audio/sfx_restart-01.mp3",
  "/assets/audio/sfx_restart-02.mp3",
  "/assets/audio/sfx_score_tick-01.mp3",
  "/assets/audio/sfx_score_tick-02.mp3",
  "/assets/audio/sfx_score_tick-03.mp3",
  "/assets/audio/sfx_theme_toggle-01.mp3",
  "/assets/audio/sfx_theme_toggle-02.mp3",
  "/assets/audio/sfx_wall_hit-01.mp3",
  "/assets/audio/sfx_wall_hit-02.mp3",
  "/assets/audio/sfx_wall_hit-03.mp3",
  "/assets/audio/sfx_wall_hit-04.mp3",
  "/assets/audio/sfx_wall_hit-05.mp3"
] as const;

export const SILENT_AUDIO_ID: AudioId = 'sfx_ad_placeholder_none';
export const GAMEPLAY_MUSIC_AUDIO_ID: AudioId = 'music_gameplay_loop';
export const MENU_MUSIC_AUDIO_ID: AudioId = 'music_menu_loop';
export const HIGH_INTENSITY_MUSIC_AUDIO_ID: AudioId = 'music_high_intensity_layer';
export const AUDIO_QA_SCENARIO = 'audio-event-tour';
export const AUDIO_STORAGE_MUTED_KEY = 'brickbreaker-audio-muted';
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
  GAME_START: 'sfx_game_start',
  PADDLE_HIT_CENTER: 'sfx_paddle_hit_center',
  PADDLE_HIT_EDGE: 'sfx_paddle_hit_edge',
  WALL_HIT: 'sfx_wall_hit',
  CEILING_HIT: 'sfx_ceiling_hit',
  BRICK_HIT: 'sfx_brick_hit',
  BRICK_BREAK_RED: 'sfx_brick_break_red',
  BRICK_BREAK_BLUE: 'sfx_brick_break_blue',
  BRICK_BREAK_GREEN: 'sfx_brick_break_green',
  BRICK_BREAK_YELLOW: 'sfx_brick_break_yellow',
  BRICK_BREAK_PURPLE: 'sfx_brick_break_purple',
  SCORE_TICK: 'sfx_score_tick',
  COMBO_SMALL: 'sfx_combo_small',
  COMBO_LARGE: 'sfx_combo_large',
  BALL_LOST: 'sfx_ball_lost',
  GAME_OVER: 'sfx_game_over',
  LEVEL_COMPLETE: 'sfx_level_complete',
  LEVEL_TOAST_IN: 'sfx_level_toast_in',
  LEVEL_START: 'sfx_level_start',
  RESTART: 'sfx_restart',
  RESET_SCORE: 'sfx_reset_score',
  BUTTON_PRESS: 'sfx_button_press',
  PANEL_OPEN: 'sfx_panel_open',
  PANEL_CLOSE: 'sfx_panel_close',
  THEME_TOGGLE: 'sfx_theme_toggle',
  AD_PLACEHOLDER_NONE: 'sfx_ad_placeholder_none',
  POWERUP_SPAWN: 'sfx_powerup_spawn',
  POWERUP_COLLECT: 'sfx_powerup_collect',
  POWERUP_ACTIVATE_MULTIBALL: 'sfx_powerup_activate_multiball',
  POWERUP_ACTIVATE_WIDE_PADDLE: 'sfx_powerup_activate_wide_paddle',
  POWERUP_ACTIVATE_SLOW_BALL: 'sfx_powerup_activate_slow_ball',
  POWERUP_EXPIRE: 'sfx_powerup_expire',
  HIGHSCORE_NEW: 'sfx_highscore_new',
  OFFLINE_READY: 'sfx_offline_ready',
  ERROR_SOFT: 'sfx_error_soft',
} as const satisfies Record<string, AudioId>;
