<!-- docs/checklists/008-entrega-implantacao-checklist.md -->
# Checklist de Entrega e Implantação

## Ambientes e Configurações
- [ ] Validar descrição e status dos ambientes DEV, HML e PRD, incluindo URLs e políticas de acesso.
- [ ] Confirmar que cada ambiente expõe health-checks (`/health`) e métricas (`/metrics`) obrigatórios.
- [ ] Checar variáveis de ambiente documentadas para APIs, notificações, ElevenLabs e branding.
- [ ] Garantir que configuração de consentimento e aprovação administrativa esteja sincronizada entre ambientes.

## Empacotamento e Publicação
- [ ] Confirmar que a extensão Chrome está empacotada conforme políticas da Chrome Web Store corporativa.
- [ ] Garantir versionamento semântico e registros no changelog para cada release.
- [ ] Validar que imagens Docker/NestJS e builds da UI são produzidos via pipelines aprovados e armazenados em registries autorizados.

## Operação e Monitoramento
- [ ] Checar que planos de rollback e contingência estão documentados para serviços críticos.
- [ ] Confirmar que dashboards de observabilidade incluem métricas de upload, fila de diagnósticos, notificações e geração de áudio.
- [ ] Garantir que alertas e notificações de incidentes sigam o fluxo de governança (responsáveis, SLAs, escalonamento).

## Documentação de Implantação
- [ ] Verificar que guias de deploy, requisitos de infraestrutura e dependências externas estão atualizados.
- [ ] Confirmar que ajustes em portas, coletores ou dashboards foram registrados e aprovados.
