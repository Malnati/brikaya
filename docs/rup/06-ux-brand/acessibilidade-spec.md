<!-- docs/rup/06-ux-brand/acessibilidade.md -->
# Acessibilidade

> Base: [./acessibilidade.md](./acessibilidade.md)


## Requisitos gerais
- Cumprir WCAG 2.2 AA com foco em formulários extensos (`REQ-002`, `REQ-004`, `REQ-016`).
- Fornecer controle de contraste (paleta 60-30-10) e tipografia 4x2 ajustáveis, mantendo tokens definidos em `AGENTS.md`.
- Garantir navegação por teclado, leitores de tela e descrição textual dos indicadores ESG (`REQ-006`, `REQ-034`).

## Formulários críticos
- Dividir cadastros longos (Organização, Localização, Lote, Transporte) em etapas curtas com sumário de campos obrigatórios e feedback imediato.
- Oferecer máscaras e validação assistida para CNAE, CFOP, CNPJ/CPF e coordenadas geográficas, com instruções de voz e texto simultâneas.
- Disponibilizar botões “Salvar e concluir depois” para perfis com baixa conectividade, sincronizando em segundo plano.

## Relatórios e acessos restritos
- Inserir avisos acessíveis quando relatórios fiscais ou ESG estiverem protegidos por permissão (`REQ-009`, `REQ-024`, `REQ-040`) e orientar o usuário sobre como solicitar acesso.
- Converter hashes, métricas e tokens APP COIN em linguagem simples com equivalentes textuais (“Este lote evitou 1,2 t CO₂”).
- Oferecer áudio descrição e legenda em relatórios multimídia (vídeos de impacto, treinamentos, storytelling de cooperativas).

## Capacitação contínua
- Disponibilizar biblioteca com vídeos legendados, podcasts e textos simplificados explicando cada etapa do onboarding, emissão fiscal e resgate de APP COIN.
- Manter suporte multilíngue (português, espanhol, libras) e chat acessível para orientação humana quando necessário (`REQ-010`, `REQ-031`…`REQ-033`).

[Voltar à UX & Brand](./README-spec.md)
