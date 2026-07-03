<!-- docs/rup/00-visao/jogo-brickbreaker.md -->
# Template de Visão do Produto — Brikaya

## 1. Contexto e Objetivo
Descreva o motivo da existência do Brikaya, quem se beneficia e por que a experiência offline é obrigatória.

## 2. Personas e Cenários
- Jogadores casuais em mobile (PWA/Capacitor)
- Usuários desktop focados em pontuação e leaderboard offline
- Testers e QA avaliando mecânicas principais

Para cada persona, documente motivação, dores e expectativas de sessão de jogo.

## 3. Proposta de Valor
Explique como o jogo difere de clones de jogos de quebrar blocos e como garante jogabilidade fluida sem rede.

## 4. Requisitos Essenciais
- Gameplay básico (bola, tijolos, raquete, vidas)
- Multiplicação de bolinhas e penalidade de linha extra
- Pontuação persistente em IndexedDB
- Logs de sessão armazenados offline
- Compatibilidade com builds iOS/Android via Capacitor

## 5. Métricas de Sucesso
- FPS médio ≥ 55 em dispositivos de entrada
- Tempo de carregamento inicial ≤ 3s (assets pré-cacheados)
- Taxa de crash 0% em sessões de 10 minutos
- Cobertura de testes unitários/integração > 60% no curto prazo

## 6. Restrições e Premissas
- Sem dependências de rede após primeiro load
- Imagens, fontes e sons embarcados localmente
- Scripts e assets versionados junto ao código

## 7. Roadmap Resumido
Mantenha link para o plano detalhado em `../99-anexos/plano-desenvolvimento-proximos-passos.md` e cite as fases vigentes.

## 8. Aprovação e Versões
Registre datas de revisão, responsáveis e referências a issues GitHub (#001–#012) quando atualizações forem aprovadas.
