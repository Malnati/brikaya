<!-- docs/checklists/002-visao-estrategica-checklist.md -->
# Checklist de Visão Estratégica e Escopo

## Visão do Produto
- [ ] Confirmar que a extensão Chrome intercepta downloads de documentos, envia às APIs da organização e distribui tokens de diagnóstico com relatórios PDF e áudio.
- [ ] Garantir que benefícios estratégicos (redução de análise manual, distribuição omnicanal, rastreabilidade completa) estejam evidenciados na solução entregue.
- [ ] Validar premissas: APIs da organização disponíveis, modelos de IA governados, permissões Chrome homologadas e catálogo de destinatários mantido pela organização.
- [ ] Verificar limitações respeitadas: somente Google Chrome Manifest V3, modelos de IA sujeitos a validação clínica, canais homologados e análise prévia para novos formatos/portais.

## Escopo e Entregáveis
- [ ] Checar que elementos em escopo foram implementados (extensão manifest v3, upload seguro, orquestração dos serviços, notificações, configurações de destinatários, auditoria ponta a ponta).
- [ ] Assegurar que itens fora de escopo permanecem não implementados (outros navegadores, alterações em portais de terceiros, substituição de ERPs, execução de IA fora de ambientes certificados).
- [ ] Confirmar entregáveis previstos: extensão empacotada, APIs versionadas, automação IA com evidências de validação e documentação operacional completa.
- [ ] Validar critérios de sucesso: interceptação automática, geração de relatórios com token único, notificações confirmadas e cumprimento da LGPD.

## Stakeholders e Responsabilidades
- [ ] Garantir que governança da organização esteja ativa como controladora e mantenedora do produto.
- [ ] Validar que laboratórios/hospitais possam configurar destinatários, consentimentos e revisar diagnósticos.
- [ ] Confirmar que operadores da extensão recebem instruções claras para habilitar interceptação e apoiar usuários finais.
- [ ] Assegurar que destinatários notificados (médicos, pacientes, integrações) possuem fluxo para consumir tokens e confirmar recebimento.

## Diretrizes de LGPD
- [ ] Checar base legal aplicada (legítimo interesse e execução contratual) e identificação da controladora (organização).
- [ ] Validar que dados tratados limitam-se a JWT, identificadores de sessão e contatos fornecidos voluntariamente.
- [ ] Confirmar finalidade restrita (autenticação, upload e notificação sem armazenamento externo) e armazenamento apenas local (IndexedDB).
- [ ] Verificar que consentimento é exibido antes do login, versionado e reapresentado a cada atualização de política.
- [ ] Garantir segurança: CSP restrita, HTTPS obrigatório e uso do cabeçalho `Authorization: Bearer <JWT>`.
- [ ] Certificar que domínio operacional permanece `https://dominio.com.br` (com equivalentes DEV/HML/PRD).

## Comunicação Estratégica
- [ ] Registrar revisão periódica da política LGPD pela organização e comunicação contínua com stakeholders conforme cronograma interno.
