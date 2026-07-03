<!-- docs/rup/02-design/gameplay-mecanicas-spec.md -->
# Design de Gameplay e Mecânicas — BrickBreaker

## Princípios de Experiência
- **Responsividade**: movimentos da raquete e da bolinha devem responder em <16ms por frame.
- **Legibilidade**: HUD deve manter contraste alto e fonte mínima de 14px em todas as plataformas.
- **Feedback**: impactos em tijolos e penalidades devem produzir feedback visual imediato; efeitos sonoros são opcionais e devem estar embarcados localmente.

## Mecânicas Centrais
- **Movimento da raquete**: suporta teclado e toque; limites do canvas impedem saída da área de jogo.
- **Física da bolinha**: ângulo varia de acordo com o ponto de colisão na raquete; velocidade ajustada para evitar travamentos.
- **Multiplicação de bolinhas**: colisões em tijolos com condição especial geram novas instâncias; engine deve evitar spawns infinitos.
- **Penalidade de linha extra**: quando a bolinha retorna sem destruir tijolos, insere linha adicional de tijolos e registra log.

## Progressão e Futuro
- **Níveis progressivos (#005)**: cada nova fase aumenta a velocidade-alvo e adiciona linhas de tijolos até o limite seguro do tabuleiro.
- **Power-ups e especiais (#006)**: itens coletáveis locais ativam multiball, paddle amplo, bola lenta e Laser em leque; cada ciclo registra `power_up` no IndexedDB.
- **Recordes gerais locais (#007)**: ranking no menu lista os maiores scores positivos salvos no dispositivo, mantendo compatibilidade com jogo 100% offline.

## Interface e HUD
- Elementos obrigatórios: pontuação atual, vidas restantes, contagem de bolinhas ativas e indicador de linha penalizada.
- Logs de sessão devem ser acessíveis via componente de visualização, alimentado pelo IndexedDB.
- Layout deve se manter consistente em PWA e builds nativos, sem dependências remotas.

## Acessibilidade
- Controles devem oferecer tolerância a toques imprecisos; adicionar zona de toque ampliada em mobile.
- Evitar flashes intensos; efeitos visuais precisam de fallback estático para jogadores sensíveis.

## Testabilidade
- Cada mecânica deve ter cenário de teste automatizado descrito em `../03-implementacao/testes-spec.md`.
- Cobrir input de teclado/toque, multiplicação de bolinhas, penalidade de linha e persistência de HUD.

## Rastreabilidade
- Plano: `../99-anexos/plano-desenvolvimento-proximos-passos.md`
- Issues: #005–#008 (gameplay), #001–#004 (testes)
- Arquitetura relacionada: `../01-arquitetura/arquitetura-jogo-spec.md`
