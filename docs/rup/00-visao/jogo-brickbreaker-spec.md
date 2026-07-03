<!-- docs/rup/00-visao/jogo-brickbreaker-spec.md -->
# Visão do Produto — Brikaya

## Propósito
Consolidar visão, público e objetivos do Brikaya como PWA offline-first, garantindo alinhamento entre gameplay, arquitetura e testes descritos no plano de próximos passos.

## Público-Alvo
- Jogadores casuais em navegadores desktop e mobile
- Usuários mobile usando builds Capacitor (Android/iOS) sem conexão constante
- Equipe técnica validando engine, logging e comportamento offline

## Objetivos de Produto
- Garantir jogabilidade fluida e acessível sem dependência de rede
- Registrar pontuação e logs de sessão no IndexedDB para histórico local
- Oferecer experiência consistente em desktop e mobile via PWA/Capacitor
- Preparar base para recursos avançados (power-ups, níveis progressivos, efeitos sonoros)

## Escopo Atual (Fase 1)
- Gameplay básico implementado (bola, tijolos, raquete, multiplicação de bolinhas)
- Penalidade de linha extra ao errar blocos
- Pontuação persistente e sistema de logging reativado
- Service Worker registrando shell essencial e manifesto de assets para operação offline sob demanda

## Escopo Planejado (Fases 2 e 3)
- Níveis progressivos e power-ups (#005, #006)
- High-scores e efeitos audiovisuais (#007, #008)
- Builds nativos e testes E2E em plataformas móveis (#009–#012)

## Métricas de Sucesso
- FPS médio ≥ 55 em dispositivos de entrada
- Tempo de carregamento inicial ≤ 3s com shell pré-cacheado e assets sob demanda
- Cobertura mínima de testes: 60% (curto prazo), 80% (fase de release)
- Zero falhas críticas em sessões de 10 minutos registradas nos logs

## Rastreabilidade
- Roadmap: `docs/rup/99-anexos/plano-desenvolvimento-proximos-passos.md`
- Issues: #001–#012 (prioridades de testes, gameplay e builds nativos)
- Pendências: `PENDING.md` mantém itens abertos e concluídos
- Changelog: atualizações registradas em `CHANGELOG.md`

## Critérios de Aceite da Visão
- Experiência jogável offline após primeiro load
- Logs e pontuação persistidos e recuperados em reinícios
- Plano de testes ativo para GameEngine, logging e PWA offline
- Documentação de visão revisada a cada sprint ou ao concluir fases do roadmap
