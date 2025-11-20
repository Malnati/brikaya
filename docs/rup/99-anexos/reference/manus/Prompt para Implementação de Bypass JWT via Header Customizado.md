# Prompt para Implementação de Bypass JWT via Header Customizado

## Contexto e Objetivo

<context>
Você está trabalhando em um sistema PostgREST + PostgreSQL que atualmente usa autenticação JWT padrão via header `Authorization: Bearer <token>`. O objetivo é implementar um sistema de bypass onde:

1. O PostgREST continua funcionando normalmente (mantém `PGRST_JWT_SECRET`)
2. Um header customizado `X-Auth-Token` é usado para autenticação alternativa
3. A validação do token no header customizado é feita 100% no banco de dados
4. As políticas RLS (Row Level Security) são adaptadas para funcionar com ambos os métodos

O sistema atual possui:
- Schema `sacir` com tabelas de dados geoespaciais
- Sistema de autenticação com `sacir.auth_users` e `sacir.sessions`
- Políticas RLS que dependem de `sacir.session_is_valid()` e `sacir.current_email()`
- Sistema de auditoria via `sacir.audit_log`
- Funções JWT nativas para assinatura (`public.jwt_sign`, `public.base64url_encode`)
</context>

## Arquivos do Sistema Atual

<current_files>
- `00-bootstrap.sh`: Script de inicialização do banco
- `00-bootstrap.psql`: Configuração inicial, roles, funções de autenticação
- `01-postgrest-preconfig.sql`: Pré-configuração do PostgREST
- `03-ddl-sacir.sql`: Definição das tabelas de dados (anos 1985-2023)
- `04-security-sacir.sql`: Políticas RLS e triggers de auditoria
- `06-index-sacir.sql`: Índices para performance
</current_files>

## Implementação Requerida

<requirements>
1. **Criar funções de validação JWT no banco** baseadas nas especificações RFC 7519:
   - Função para decodificar Base64URL
   - Função para verificar assinatura HS256
   - Função para validar claims (exp, nbf, iat)
   - Função para verificar contra tabela de sessões

2. **Implementar sistema de autenticação via header customizado**:
   - Função que lê `current_setting('request.header.x-auth-token', true)`
   - Validação completa do token recebido
   - Propagação das claims via `set_config('app.jwt.claims', ..., true)`

3. **Adaptar funções utilitárias existentes**:
   - `sacir.current_email()`: Ler de `app.jwt.claims` se `request.jwt.claims` não existir
   - `sacir.session_is_valid()`: Funcionar com ambos os contextos
   - `sacir.current_token()`: Ler do header customizado como fallback

4. **Manter compatibilidade total** com o sistema existente de autenticação PostgREST
</requirements>

## Estrutura de Código Esperada

<code_structure>
### Novas Funções (adicionar ao 00-bootstrap.psql)

```sql
-- Helpers Base64URL (RFC 4648 Section 5)
CREATE OR REPLACE FUNCTION sacir._b64url_to_bytea(t text)
RETURNS bytea LANGUAGE plpgsql IMMUTABLE AS $$
-- [implementação conforme RFC]
$$;

-- Verificação JWT HS256 (RFC 7519)
CREATE OR REPLACE FUNCTION sacir.jwt_verify_hs256(_token text, _secret text)
RETURNS jsonb LANGUAGE plpgsql IMMUTABLE AS $$
-- [implementação com validação de assinatura e claims]
$$;

-- Autenticação via header customizado
CREATE OR REPLACE FUNCTION sacir.auth_with_custom_header()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
-- [lê X-Auth-Token, valida e propaga claims]
$$;
```

### Funções Modificadas (atualizar no 00-bootstrap.psql)

```sql
-- ANTES
CREATE OR REPLACE FUNCTION sacir.current_email()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_claims jsonb := NULLIF(current_setting('request.jwt.claims', true), '')::jsonb;
BEGIN
  IF v_claims IS NULL THEN RETURN NULL; END IF;
  RETURN v_claims->>'email';
END;
$$;

-- DEPOIS  
CREATE OR REPLACE FUNCTION sacir.current_email()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_claims jsonb;
BEGIN
  -- Tenta primeiro o contexto padrão do PostgREST
  v_claims := NULLIF(current_setting('request.jwt.claims', true), '')::jsonb;
  
  -- Se não encontrar, tenta o contexto do header customizado
  IF v_claims IS NULL THEN
    v_claims := NULLIF(current_setting('app.jwt.claims', true), '')::jsonb;
  END IF;
  
  IF v_claims IS NULL THEN RETURN NULL; END IF;
  RETURN v_claims->>'email';
END;
$$;
```
</code_structure>

## Especificações Técnicas

<technical_specs>
### Validação JWT (RFC 7519)
- **Algoritmo**: HS256 (HMAC-SHA256)
- **Estrutura**: `header.payload.signature`
- **Encoding**: Base64URL (RFC 4648 Section 5)
- **Claims obrigatórias**: `exp` (expiration time)
- **Claims opcionais**: `nbf` (not before), `iat` (issued at)
- **Claims customizadas**: `email`, `sid` (session ID), `role`

### Header Customizado
- **Nome**: `X-Auth-Token`
- **Formato**: Token JWT completo (sem prefixo "Bearer")
- **Leitura**: `current_setting('request.header.x-auth-token', true)`
- **Fallback**: Se header não existir, usar autenticação padrão

### Propagação de Claims
- **Contexto padrão**: `request.jwt.claims` (PostgREST)
- **Contexto customizado**: `app.jwt.claims` (header customizado)
- **Escopo**: `true` (disponível para toda a transação)
</technical_specs>

## Arquivos a Modificar

<files_to_modify>
1. **00-bootstrap.psql** (PRINCIPAL):
   - Adicionar funções de validação JWT
   - Adicionar função de autenticação via header customizado
   - Modificar funções utilitárias existentes (`current_email`, `session_is_valid`, `current_token`)

2. **04-security-sacir.sql** (OPCIONAL):
   - Verificar se as políticas RLS funcionam com o novo contexto
   - Adicionar comentários sobre compatibilidade

3. **01-postgrest-preconfig.sql** (DOCUMENTAÇÃO):
   - Adicionar comentários sobre o sistema híbrido
   - Documentar as duas formas de autenticação
</files_to_modify>

## Casos de Teste

<test_cases>
### Cenário 1: Autenticação PostgREST (atual)
```bash
curl -H "Authorization: Bearer <jwt_token>" \
     -H "Content-Type: application/json" \
     "http://localhost:3000/sacir/current_user"
```

### Cenário 2: Autenticação via Header Customizado (novo)
```bash
curl -H "X-Auth-Token: <jwt_token>" \
     -H "Content-Type: application/json" \
     "http://localhost:3000/sacir/current_user"
```

### Cenário 3: Sem Autenticação (role anon)
```bash
curl -H "Content-Type: application/json" \
     "http://localhost:3000/sacir/env"
```

### Validações Esperadas:
- Ambos os cenários 1 e 2 devem retornar os mesmos dados do usuário
- As políticas RLS devem funcionar identicamente
- O sistema de auditoria deve registrar ambos os tipos de autenticação
- Performance deve ser similar (validação no banco vs PostgREST)
</test_cases>

## Critérios de Sucesso

<success_criteria>
1. **Compatibilidade**: Sistema atual continua funcionando sem modificações
2. **Funcionalidade**: Header customizado permite autenticação completa
3. **Segurança**: Validação JWT no banco é tão segura quanto no PostgREST
4. **Performance**: Impacto mínimo na performance das consultas
5. **Auditoria**: Ambos os métodos são registrados no `audit_log`
6. **RLS**: Políticas funcionam com ambos os contextos de claims
</success_criteria>

## Instruções de Implementação

<implementation_instructions>
1. **Analise o código atual** nos arquivos fornecidos para entender a estrutura
2. **Implemente as funções JWT** seguindo rigorosamente as especificações RFC 7519
3. **Modifique as funções utilitárias** para suportar ambos os contextos
4. **Teste a compatibilidade** com o sistema existente
5. **Documente as mudanças** com comentários claros no código
6. **Forneça exemplos de uso** para ambos os métodos de autenticação

**IMPORTANTE**: Mantenha a compatibilidade total com o sistema existente. O header customizado deve ser uma funcionalidade adicional, não uma substituição.
</implementation_instructions>
