<!-- docs/rup/01-arquitetura/arquitetura-jogo.md -->
# Template de Arquitetura — Brikaya

## 1. Visão Geral
Descreva componentes principais (engine, renderização, UI React, armazenamento) e como se comunicam.

## 2. Diagramas
Inclua diagramas de camadas, fluxo de eventos e ciclo de vida offline/online.

## 3. Componentes
- GameEngine (física, colisão, atualização de estado)
- Componentes React (HUD, controles, lista de logs)
- Persistência (IndexedDB para pontuação e eventos)
- Service Worker (precache e cache-first)

## 4. Fluxos Críticos
- Ciclo de renderização e controle de input
- Persistência de pontuação e logs
- Multiplicação de bolinhas e penalidade de linha extra

## 5. Qualidade e Observabilidade
- Métricas de FPS e tempo de frame
- Logs de eventos chave
- Pontos de teste automatizados

## 6. Segurança e Privacidade
Documente limites de dados coletados (somente métricas de sessão) e ausência de rede.

## 7. Riscos e Mitigações
Liste riscos de performance, perdas de estado e divergência de caches com ações recomendadas.

## 8. Rastreabilidade
Aponte issues e requisitos associados (ex.: #001–#012) e links para testes e design.
