# Descobertas da Pesquisa: PostgREST e JWT

## Documentação Oficial do PostgREST

### Comportamento sem JWT Secret

**Fonte**: [Documentação oficial de configuração](https://docs.postgrest.org/en/latest/references/configuration.html#jwt-secret)

> **Descoberta Crítica**: "If `jwt-secret` is not set, PostgREST will refuse authentication requests."

**Implicação**: A sugestão de "remover PGRST_JWT_SECRET" está **INCORRETA**. O PostgREST não aceita requisições com header Authorization quando jwt-secret não está configurado.

### Comportamento com Role Anônima

**Fonte**: [Documentação de autenticação](https://docs.postgrest.org/en/latest/references/auth.html)

> "If the client included no JWT (or one without a role claim) then PostgREST switches into the anonymous role."

**Descoberta**: PostgREST só usa role anônima quando:
1. **Não há header Authorization**, OU
2. **JWT válido sem claim 'role'**

### Issues do GitHub

#### Issue #2758: "Disable authorization completely"
- **Status**: Convertida para discussão
- **Conclusão**: Não há forma oficial de desabilitar completamente a validação JWT
- **Tentativas falharam**: 
  - `PGRST_JWT_SECRET=""`
  - `PGRST_AUTH_JWT=off`

#### Issue #3002: "Verify JWTs without changing role"
- **Status**: Aberta (enhancement)
- **Proposta**: Permitir `jwt-role-claim-key = ""` para desabilitar mudança de role
- **Ainda não implementado** na versão atual

## Validação da Implementação JWT

### RFC 7519 - Especificação JWT

**Fonte**: [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)

#### Base64URL Encoding
- ✅ **Implementação correta** na sugestão
- Conversão `-_` para `+/` está conforme RFC
- Padding com `=` está correto

#### Estrutura JWT
- ✅ **Formato validado**: `header.payload.signature`
- ✅ **Regex correta**: `'^[^.]+\\.[^.]+\\.[^.]+$'`

#### Assinatura HS256
- ✅ **Algoritmo correto**: HMAC-SHA256
- ✅ **Processo válido**: `hmac(header.payload, secret, 'sha256')`
- ✅ **Comparação segura**: String comparison após base64url encoding

#### Validação de Claims
- ✅ **Claim 'exp'**: Verificação de expiração implementada corretamente
- ⚠️ **Claims 'iat' e 'nbf'**: Não implementadas (RFC recomenda)

## Análise de Viabilidade

### Cenário Real vs. Sugestão

**Sugestão Original**:
```
• Remova PGRST_JWT_SECRET do PostgREST
• Passe o token até o banco (header próprio)
```

**Realidade Descoberta**:
- ❌ **Impossível**: PostgREST rejeita requisições com Authorization header quando jwt-secret não está configurado
- ❌ **Não funciona**: Erro "JWSError JWSInvalidSignature" quando secret está vazio

### Alternativas Viáveis

#### Opção 1: Validação Dupla (Atual + Banco)
```
• Manter PGRST_JWT_SECRET configurado
• Implementar validação adicional no banco
• Usar ambas as validações em paralelo
```

#### Opção 2: Header Customizado
```
• Usar header diferente (ex: X-Auth-Token)
• PostgREST ignora headers customizados
• Validação 100% no banco via header customizado
```

#### Opção 3: Aguardar Feature Request
```
• Issue #3002 propõe jwt-role-claim-key = ""
• Permitiria validação sem mudança de role
• Ainda não implementado
```

## Conclusões da Pesquisa

### Sobre as Sugestões

1. **Implementação JWT**: ✅ **Tecnicamente correta**
2. **Bypass do PostgREST**: ❌ **Não é possível conforme sugerido**
3. **Validação no banco**: ✅ **Funcionalmente viável**

### Recomendações

1. **Não implementar** a remoção do PGRST_JWT_SECRET
2. **Considerar** header customizado para bypass real
3. **Validar** implementação HS256 em ambiente controlado
4. **Monitorar** Issue #3002 para futuras possibilidades

### Status da Análise

- ✅ **Não é alucinação**: Implementações baseadas em especificações reais
- ⚠️ **Parcialmente incorreta**: Método de bypass não funciona
- ✅ **Alternativas viáveis**: Existem outras abordagens possíveis
