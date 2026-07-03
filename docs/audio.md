<!-- docs/audio.md -->
# Pacote de Áudios — BrickBreaker

## Objetivo

Definir o pacote completo de áudios necessários para aquisição ou produção futura do BrickBreaker. Este documento especifica músicas, efeitos, sons de interface e reservas para recursos planejados, sem baixar, produzir, licenciar, integrar ou versionar arquivos de áudio nesta etapa.

## Premissas offline

- Todos os áudios futuros devem ser arquivos locais do projeto, precacheáveis pelo service worker e funcionais sem rede após o primeiro carregamento.
- Não usar CDN, streaming, bancos de áudio remotos em tempo de execução, scripts externos, serviços pagos ou dependências que quebrem a experiência offline-first.
- O jogo deve continuar totalmente jogável quando o usuário mutar o áudio, quando o navegador bloquear autoplay ou quando o dispositivo não oferecer saída de som.
- Preferências futuras de áudio devem ser locais: mudo, volume mestre, volume de música e volume de efeitos.
- Placeholders de publicidade não devem tocar áudio.

## Direção sonora

- Estilo: arcade limpo.
- Caráter: sons curtos, brilhantes, responsivos e pouco cansativos.
- Objetivo de experiência: reforçar leitura de colisões, progressão, risco e recompensa sem encobrir o tabuleiro nem competir com atenção visual.
- Evitar: sustos agressivos, loops longos demais, timbres estridentes, vozes, música com graves dominantes, efeitos que pareçam erro técnico e qualquer som que incentive interpretação fora do contexto do jogo.

## Regras de mix

- Volume mestre inicial futuro: 70%.
- Música: 25% a 35% do volume mestre.
- Efeitos de gameplay comuns: 55% a 75% do volume mestre.
- Eventos críticos ou recompensas: 75% a 90% do volume mestre.
- Interface: 20% a 45% do volume mestre.
- Sons de colisão devem ficar acima da música, mas abaixo de alertas de perda, fase concluída e novo recorde.
- Quando um evento importante tocar, a música deve reduzir aproximadamente 6 dB por 250 ms a 700 ms, conforme a prioridade do evento.
- Fade-in e fade-out devem evitar cortes secos em músicas, painéis, mudança de fase e fim de jogo.
- Sons repetitivos, como parede e tijolo, precisam de variações ou pequena randomização de pitch para evitar fadiga.

## Catálogo de áudios

| ID lógico | Tipo | Gatilho exato no jogo | Prioridade | Volume relativo | Fade-in / fade-out | Ducking sobre música | Duração alvo | Variações | Observações de UX |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `bgm-menu-loop-main` | Música | Tela inicial, pausa futura ou estado entre partidas quando não houver partida ativa | Média | 28% | Fade-in 800 ms / fade-out 500 ms | Recebe ducking de eventos de UI e início | Loop de 30 s a 60 s | 1 loop principal | Deve sugerir arcade leve, sem urgência. Não tocar se o usuário ainda não interagiu e o navegador bloquear autoplay. |
| `bgm-gameplay-loop-main` | Música | Durante partida ativa após início ou reinício humano | Média | 32% | Fade-in 700 ms / fade-out 700 ms | Recebe ducking de colisões críticas e eventos de fase | Loop de 45 s a 90 s | 1 loop principal | Deve manter energia constante e ficar claramente abaixo dos efeitos de tijolo, raquete e perda de bola. |
| `bgm-gameplay-intense-layer` | Música | Fases altas ou velocidade acima de 1.6x, quando esse controle for implementado | Baixa | 18% | Fade-in 1200 ms / fade-out 900 ms | Recebe ducking junto da música principal | Loop sincronizável de 30 s a 60 s | 1 camada | Camada opcional; não deve mudar a mecânica, apenas aumentar tensão. |
| `sfx-game-start` | Efeito | Primeira partida, fim da contagem inicial ou reinício iniciado por ação humana | Alta | 72% | Sem fade-in / fade-out 80 ms | Reduz música por 300 ms | 300 ms a 600 ms | 2 | Deve comunicar prontidão, não vitória. |
| `sfx-paddle-hit-center` | Efeito | Bola colide com o centro da raquete | Alta | 62% | Sem fade-in / fade-out 40 ms | Reduz música por 180 ms | 60 ms a 120 ms | 4 | Som elástico e preciso; deve reforçar controle do jogador. |
| `sfx-paddle-hit-edge` | Efeito | Bola colide perto das bordas da raquete e sai com ângulo acentuado | Alta | 68% | Sem fade-in / fade-out 40 ms | Reduz música por 220 ms | 70 ms a 140 ms | 4 | Mais agudo que colisão central para indicar risco e mudança de direção. |
| `sfx-wall-hit` | Efeito | Bola colide com parede lateral | Média | 48% | Sem fade-in / fade-out 30 ms | Sem ducking ou ducking máximo de 100 ms | 40 ms a 100 ms | 5 | Deve ser discreto porque ocorre com frequência. |
| `sfx-ceiling-hit` | Efeito | Bola colide com o teto | Média | 50% | Sem fade-in / fade-out 30 ms | Sem ducking ou ducking máximo de 100 ms | 40 ms a 100 ms | 4 | Ligeiramente mais agudo que parede lateral para orientar posição vertical. |
| `sfx-brick-hit` | Efeito | Bola toca um tijolo antes ou junto do efeito de destruição | Alta | 64% | Sem fade-in / fade-out 40 ms | Reduz música por 180 ms | 60 ms a 130 ms | 5 | Deve dar feedback imediato de impacto. Pode ser combinado com o som específico de cor. |
| `sfx-brick-break-red` | Efeito | Tijolo vermelho é destruído | Alta | 70% | Sem fade-in / fade-out 50 ms | Reduz música por 220 ms | 90 ms a 180 ms | 3 | Timbre quente. Não deve soar mais importante que conclusão de fase. |
| `sfx-brick-break-blue` | Efeito | Tijolo azul é destruído | Alta | 68% | Sem fade-in / fade-out 50 ms | Reduz música por 220 ms | 90 ms a 180 ms | 3 | Timbre claro e frio, com mesma presença do vermelho. |
| `sfx-brick-break-green` | Efeito | Tijolo verde é destruído | Alta | 66% | Sem fade-in / fade-out 50 ms | Reduz música por 200 ms | 90 ms a 180 ms | 3 | Timbre macio para evitar excesso de brilho em sequências. |
| `sfx-brick-break-yellow` | Efeito | Tijolo amarelo é destruído | Alta | 72% | Sem fade-in / fade-out 50 ms | Reduz música por 230 ms | 90 ms a 180 ms | 3 | Timbre mais brilhante, mas sem estridência. |
| `sfx-brick-break-purple` | Efeito | Tijolo roxo é destruído | Alta | 68% | Sem fade-in / fade-out 60 ms | Reduz música por 220 ms | 100 ms a 200 ms | 3 | Timbre um pouco mais grave ou espacial para diferenciar cor. |
| `sfx-score-tick` | Efeito | Pontuação aumenta após destruição de tijolo | Média | 38% | Sem fade-in / fade-out 30 ms | Sem ducking | 40 ms a 80 ms | 3 | Deve ficar 8 dB a 10 dB abaixo do som de tijolo; não duplicar sensação de impacto. |
| `sfx-combo-small` | Futuro | Sequência curta de 3 ou mais tijolos destruídos em janela de combo futura | Média | 65% | Sem fade-in / fade-out 80 ms | Reduz música por 250 ms | 180 ms a 350 ms | 2 | Usar cooldown mínimo de 500 ms para não empilhar em excesso. |
| `sfx-combo-large` | Futuro | Combo alto futuro, acima do limite definido pela mecânica | Alta | 78% | Sem fade-in / fade-out 120 ms | Reduz música por 400 ms | 350 ms a 700 ms | 2 | Deve soar como recompensa, não como fim de fase. |
| `sfx-ball-lost` | Efeito | Bola passa pela raquete e sai da área de jogo | Crítica | 75% | Sem fade-in / fade-out 180 ms | Reduz música por 500 ms | 350 ms a 700 ms | 2 | Queda curta; precisa comunicar erro sem punição emocional exagerada. |
| `sfx-game-over` | Efeito | Estado de fim de jogo é confirmado | Crítica | 85% | Sem fade-in / fade-out 500 ms | Reduz ou encerra música por 700 ms | 800 ms a 1500 ms | 1 | Grave limpo e conclusivo; deve deixar espaço para leitura da mensagem final. |
| `sfx-level-complete` | Efeito | Último tijolo ativo da fase é destruído e o jogo entra em transição | Crítica | 82% | Sem fade-in / fade-out 250 ms | Reduz música por 600 ms | 700 ms a 1200 ms | 2 | Deve antecipar a pausa e reforçar recompensa de fase. |
| `sfx-level-toast-in` | UI | Mensagem de subida de fase aparece entre fases | Alta | 50% | Fade-in 80 ms / fade-out 120 ms | Reduz música por 180 ms | 200 ms a 450 ms | 2 | Deve acompanhar o enter visual da mensagem sem parecer notificação externa. |
| `sfx-level-start` | Efeito | Nova fase começa após a pausa de transição | Crítica | 76% | Sem fade-in / fade-out 200 ms | Música volta gradualmente após 450 ms | 400 ms a 800 ms | 2 | Pulso ascendente; comunica retorno à ação e aumento de velocidade. |
| `sfx-restart` | UI | Botão Reiniciar ou Jogar de novo é acionado | Alta | 58% | Sem fade-in / fade-out 80 ms | Reduz música por 220 ms | 200 ms a 400 ms | 2 | Deve soar como reset voluntário, não como falha. |
| `sfx-reset-score` | UI | Botão Zerar pontuação é acionado | Média | 45% | Sem fade-in / fade-out 100 ms | Sem ducking | 180 ms a 350 ms | 1 | Som discreto; não deve sugerir erro ou conquista. |
| `sfx-button-press` | UI | Botões comuns são pressionados, incluindo Logs, Colisões, Claro e Escuro | Baixa | 28% a 35% | Sem fade-in / fade-out 40 ms | Sem ducking | 40 ms a 100 ms | 4 | Deve ser tátil e baixo para não competir com gameplay. |
| `sfx-panel-open` | UI | Painel de logs ou colisões é aberto | Média | 38% | Fade-in 80 ms / fade-out 120 ms | Sem ducking | 180 ms a 350 ms | 2 | Sweep curto, indicando que uma camada de leitura foi aberta. |
| `sfx-panel-close` | UI | Painel de logs ou colisões é fechado | Média | 34% | Fade-in 60 ms / fade-out 120 ms | Sem ducking | 160 ms a 300 ms | 2 | Sweep descendente, mais baixo que abertura. |
| `sfx-theme-toggle` | UI | Alternância entre tema claro e escuro | Baixa | 36% | Sem fade-in / fade-out 80 ms | Sem ducking | 120 ms a 250 ms | 2 | Chime curto; não deve parecer evento de pontuação. |
| `sfx-ad-placeholder-none` | Sistema | Placeholder offline de publicidade aparece ou permanece visível | Baixa | 0% | Não aplicável | Não aplicável | Silêncio | 0 | Silêncio intencional; área não funcional não deve chamar atenção sonora. |
| `sfx-powerup-spawn` | Futuro | Power-up futuro aparece no tabuleiro | Média | 55% | Sem fade-in / fade-out 100 ms | Reduz música por 160 ms | 200 ms a 450 ms | 3 | Spark leve; deve avisar oportunidade sem distrair da bola. |
| `sfx-powerup-collect` | Futuro | Jogador coleta power-up futuro | Alta | 72% | Sem fade-in / fade-out 160 ms | Reduz música por 300 ms | 350 ms a 700 ms | 3 | Chime positivo acima de tijolo comum. |
| `sfx-powerup-activate-multiball` | Futuro | Power-up de múltiplas bolas é ativado | Alta | 80% | Sem fade-in / fade-out 200 ms | Reduz música por 450 ms | 500 ms a 900 ms | 2 | Expansão estéreo curta; deve indicar multiplicação sem confundir com fase concluída. |
| `sfx-powerup-activate-wide-paddle` | Futuro | Power-up aumenta largura da raquete | Alta | 68% | Sem fade-in / fade-out 160 ms | Reduz música por 260 ms | 350 ms a 650 ms | 2 | Sweep horizontal, associado à raquete. |
| `sfx-powerup-activate-slow-ball` | Futuro | Power-up reduz velocidade da bola | Alta | 64% | Sem fade-in / fade-out 180 ms | Reduz música por 250 ms | 350 ms a 700 ms | 2 | Pitch-down suave; deve comunicar desaceleração sem parecer perda. |
| `sfx-powerup-activate-laser-fan` | Futuro | Power-up Laser em leque é ativado | Alta | 78% | Sem fade-in / fade-out 180 ms | Reduz música por 350 ms | 180 ms a 350 ms | 1 | Disparo curto e brilhante; deve comunicar raios em leque sem parecer explosão ou conclusão de fase. |
| `sfx-powerup-expire` | Futuro | Efeito de power-up futuro termina | Média | 45% | Sem fade-in / fade-out 120 ms | Sem ducking | 180 ms a 350 ms | 2 | Blip neutro e baixo, sem tom punitivo. |
| `sfx-highscore-new` | Futuro | Novo recorde ou high-score futuro é confirmado | Crítica | 88% | Sem fade-in / fade-out 600 ms | Reduz música por 700 ms | 900 ms a 1800 ms | 2 | Fanfarra curta; maior recompensa sonora fora de conclusão de fase. |
| `sfx-offline-ready` | Sistema | Estado futuro informa que o jogo está pronto para uso offline | Baixa | 30% | Fade-in 80 ms / fade-out 120 ms | Sem ducking | 160 ms a 300 ms | 1 | Opcional e só deve tocar se houver feedback visual correspondente. |
| `sfx-error-soft` | Sistema | Erro não-crítico visível ao usuário, como falha de leitura local recuperável | Média | 50% | Sem fade-in / fade-out 180 ms | Reduz música por 250 ms | 250 ms a 500 ms | 2 | Tom baixo, claro e não alarmista; nunca deve expor detalhe técnico. |

## Critérios de produção ou aquisição

- Cada áudio deve ter licença compatível com distribuição web, PWA e builds nativos, sem obrigação de requisição remota em runtime.
- Entregar arquivos finais em formatos web locais e leves, com versão fonte preservada fora do pacote de runtime quando aplicável.
- Loops de música devem ser editados para repetição contínua sem clique audível.
- Efeitos curtos devem ser normalizados por percepção, não apenas por pico, para preservar hierarquia do mix.
- O pacote deve incluir metadados mínimos por arquivo: ID lógico, duração, versão, autor ou fornecedor, licença, data de aquisição ou produção e observações de edição.
- Variações de colisão devem manter a mesma identidade sonora e diferir apenas o suficiente para reduzir repetição.
- Nenhum arquivo deve conter voz, marca, nome de fornecedor, watermark audível ou mensagem fora do universo do jogo.

## Critérios de aceite futuro

- O jogo funciona sem rede depois do primeiro carregamento com todos os áudios precacheados.
- O usuário consegue jogar com áudio ligado, parcialmente reduzido ou mudo sem perda de informação essencial.
- Música não encobre colisões, perda de bola, fase concluída, nova fase ou fim de jogo.
- Sons de UI não competem com gameplay e não disparam em placeholders de publicidade.
- Eventos frequentes não causam fadiga sonora em sessões de 10 minutos.
- Navegador que bloqueia autoplay não impede início da partida, pontuação, logs, colisões ou progressão.
- Testes futuros devem verificar que não há requisições externas de áudio e que cada ID lógico referenciado existe no manifesto local.
