<!-- docs/rup/04-qualidade-testes/criterios-de-aceite-spec.md -->
# Critérios de Aceite — Brikaya

## Finalidade
Definir critérios mínimos para aprovar entregas do jogo em cada sprint, mantendo rastreabilidade com o plano e evitando regressões no modo offline.

## Critérios Funcionais
- Gameplay básico completo: iniciar partida, mover raquete (teclado/toque), quebrar tijolos, multiplicar bolinhas e aplicar penalidade de linha extra.
- Persistência local: pontuação e logs devem ser gravados e restaurados ao reiniciar o jogo.
- Modo offline: após primeiro carregamento, o jogo deve funcionar sem rede e sem solicitações externas.
- Compatibilidade: HUD renderizado corretamente em desktop e mobile, com controles acessíveis.

## Critérios Não Funcionais
- FPS médio ≥ 55 em dispositivos alvo durante gameplay padrão.
- Tempo de carregamento inicial ≤ 3s com assets precacheados.
- Nenhum erro não tratado no console durante partidas de 10 minutos.

## Evidências e QA
- Testes unitários e integração executados com resultados anexados em relatórios de QA.
- Testes E2E registrando capturas de tela ou vídeos para fluxos críticos e offline.
- Incidentes e pendências documentados em `PENDING.md` e vinculados às issues (#001–#012).

## Revisão e Atualização
- Revisar critérios ao final de cada fase do roadmap (Fases 1–3).
- Registrar mudanças relevantes no `CHANGELOG.md` e referenciar este arquivo.

[Voltar ao arquivo de Qualidade](./README-spec.md)
