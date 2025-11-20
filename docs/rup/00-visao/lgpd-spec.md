<!-- docs/rup/00-visao/lgpd.md -->
# Diretrizes de LGPD e Compliance

> Base: [./lgpd.md](./lgpd.md)


## Tratamento de Dados Pessoais
- Coleta mínima necessária para abertura de conta digital, KYC/KYB socioambiental e adesão a programas de reciclagem, incluindo documentos fiscais (CNPJ/CPF, inscrições, CFOP) e licenças ambientais.
- Consentimento explícito para uso de dados operacionais de resíduos, indicadores de impacto e métricas de APP Coin em relatórios agregados.
- Segmentação de perfis sensíveis (cooperados, catadores autônomos, investidores não verificados) com anonimização, mascaramento e revisão periódica de necessidade.
- Registro de histórico (passaporte digital) com políticas de retenção diferenciadas para dados financeiros, fiscais e socioambientais.
- Política de Privacidade pública da landing page descrevendo categorias de dados, finalidades, bases legais e canal do DPO, conforme atualização registrada em `CHANGELOG/20251028170953.md`.

## Compartilhamento de Dados
- Integração com Open Finance, registradoras de créditos climáticos (Verra, Gold Standard, CERCARBONO) e sistemas fiscais (SEFAZ, prefeituras) mediante contratos de operador ou controlador conjunto.
- Transferência internacional condicionada a cláusulas padrão, avaliação de adequação e registro em relatório de impacto à proteção de dados (DPIA).
- Auditorias periódicas em parceiros logísticos, certificadoras, ERPs e provedores blockchain para garantir conformidade com LGPD, PLD/FT e requisitos ambientais.
- Logs imutáveis das ações de compartilhamento com hash/QR-code, assegurando rastreabilidade para auditorias regulatórias.

## Segurança da Informação
- Criptografia ponta a ponta para dados financeiros, tokens de resíduos, evidências fotográficas e documentos fiscais anexados.
- Gestão de identidades com MFA, segregação de funções, revisão de privilégios por perfil e detecção de acessos anômalos.
- Planos de resposta a incidentes integrando compliance financeiro, ambiental e comunicação pública, com gatilhos específicos para token APP Coin e passaporte digital.
- Registro imutável de logs (blockchain ou armazenamento WORM) para transações, emissões fiscais e consentimentos.

## Direitos dos Titulares
- Portal de privacidade para consulta, portabilidade, retificação e exclusão de dados, com SLA publicado.
- Canal dedicado a cooperativas e comunidades para dúvidas sobre uso de dados, repartição de valor e mecanismos de recompensa.
- Indicadores públicos sobre tempo médio de atendimento a solicitações, incidentes notificados e status das auditorias de parceiros.
- Formulários de cadastro exibem consentimento LGPD obrigatório e preferência opcional de comunicação, alinhados ao fluxo descrito em `landing/src/pages/RegistrationPage.tsx` e registrados no `CHANGELOG/20251028170953.md`.

## Retenção e Governança
- Política de retenção alinhada a exigências regulatórias (BACEN, Receita Federal, órgãos ambientais), com expurgo automático após prazos legais.
- Comitê de governança de dados para revisar novos usos (relatórios ESG, APP Coin, fundo garantidor) e registrar decisões em ata.
- Mecanismos de teste de anonimização antes de liberar dados para relatórios públicos ou compartilhamento com investidores.

[Voltar à Visão](./README-spec.md)
