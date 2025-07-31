<!-- AGENTS.md -->

Este repo utiliza um conjunto de regras adicionais localizado em `.cursor/rules/all.mdc`.
Siga todas as orientações presentes naquele arquivo ao realizar modificações neste projeto.

Regras Gerais de Engenharia
• Aplicar princípios DRY, SRP, coesão alta e acoplamento baixo.
• Componentes React com funções nomeadas.
• Separação por domínio lógico (components/, hooks/, logic/, etc.).
• Código limpo, legível e modular.
• Evitar dependências externas (CDNs, fontes, scripts remotos).

⸻

Regra Obrigatória — Funcionamento 100% Offline
• O projeto deve funcionar completamente offline após o primeiro carregamento.
• O sw.js deve:
  • Realizar precache de todos os arquivos necessários.
  • Atender a todas as requisições subsequentes com cache-first.
  • Ser registrado via registerServiceWorker.ts.
• O manifest.webmanifest deve conter:
  • display: standalone, start_url: '.', theme_color, background_color
  • Ícones locais (ex: /icons/icon-192.png)
• É proibido o uso de:
  • Fontes externas
  • Imagens ou scripts por CDN
  • Requisições de rede após o primeiro uso

⸻

Regra Obrigatória — Caminho do Arquivo no Topo

Cada arquivo gerado deve conter seu caminho completo como primeira linha comentada, respeitando a sintaxe da linguagem:

Tipo de ArquivoCaminho no TopoObservação
.ts, .tsx, .js, .jsx// caminho/arquivo.tsPrimeira linha
.sh com shebangSegunda linha: # caminho/arquivo.shApós #!/bin/bash
.html<!-- caminho/arquivo.html -->Primeira linha
.css/* caminho/arquivo.css */Primeira linha
.yaml, .yml# caminho/arquivo.yamlPrimeira linha
.json (ex: manifest)`
