<!-- docs/checklists/003-arquitetura-plataforma-checklist.md -->
# Checklist de Arquitetura da Plataforma

## Camadas e Componentes
- [ ] Validar que a solução mantém front-end React (`app/ui/`) e API NestJS (`app/api/`) como camadas principais, respeitando responsabilidades documentadas.
- [ ] Confirmar que protótipos de branding (`prototype/`) permanecem alinhados com a UI e que tokens cromáticos são replicados via helpers dedicados.
- [ ] Garantir que fluxos clínicos completos (login, aprovação, onboarding, upload, fila, distribuição) seguem sequência descrita na arquitetura.

## Padrões da UI
- [ ] Verificar uso exclusivo do React oficial, respeitando Feature-Sliced Design (`app/ui/src/components/<feature>`) e Atomic Design (átomos, moléculas, organismos).
- [ ] Checar que IndexedDB (`wl-db`) está configurado com `DB_VERSION = 2` e cobre upload, branding e consentimento.
- [ ] Confirmar que estados de bloqueio (`PENDING`, `REJECTED`, `APPROVED`) espelham protótipos correspondentes.

## Serviços Backend e Contratos
- [ ] Garantir que `DiagnosticsController` valida tamanho (≤ 10 MB), tipos de arquivo e logging contextual.
- [ ] Confirmar que `DiagnosticsService` encapsula prompts médicos, geração de PDF/áudio e integrações ElevenLabs.
- [ ] Checar endpoints auxiliares (`/config`, `/debug/env`) para branding, limites e diagnósticos operacionais.

## Integrações com APIs
- [ ] Validar ambientes DEV/HML/PRD documentados e políticas de ativação de áudio.
- [ ] Garantir autenticação via `Authorization: Bearer <JWT>` e bloqueio de acesso ao dashboard sem aprovação administrativa.
- [ ] Checar persistência de consentimento LGPD e envio de indicadores nos requests críticos.
- [ ] Confirmar estratégias de resiliência: fila local em IndexedDB, logs estruturados e estados de erro com retry.

## Requisitos Não Funcionais
- [ ] Revisar validações de segurança (limite de upload, mascaramento de dados clínicos, logs discretos).
- [ ] Garantir privacidade (consentimento versionado, dados mínimos em IndexedDB, omissão de informações identificáveis em logs).
- [ ] Confirmar metas de desempenho (persistência em ≤ 1,5 s, interações < 200 ms, áudio sob demanda).
- [ ] Checar confiabilidade (retry de uploads, medição de duração de chamadas, cache de branding com invalidação controlada).
- [ ] Validar manutenibilidade (componentes tipados, serviços encapsulados, documentação sincronizada com mudanças).
- [ ] Assegurar padrões de UX/Acessibilidade (regra 60-30-10, microcopy orientada à ação, foco visível e navegação por teclado).
- [ ] Confirmar critérios de portabilidade (build via Vite, API containerizada, evidências em `docs/reports/`).
- [ ] Verificar critérios de conformidade: pipelines automatizados, bloqueios por consentimento/segurança e atualização dos contratos de API.
