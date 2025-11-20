# Prompt de Correção: Função current_user Ausente

## Problema Identificado

<problem_description>
O sistema PostgREST está retornando o erro:
```
{"code":"PGRST202","details":"Searched for the function sacir.current_user without parameters, but no matches were found in the schema cache.","hint":"Perhaps you meant to call the function sacir.current_user_info","message":"Could not find the function sacir.current_user without parameters in the schema cache"}
```

**Causa**: A VIEW `sacir.current_user` existe no código, mas o PostgREST não consegue encontrá-la ou não está sendo exposta corretamente como uma função RPC.

**Contexto**: O cliente está fazendo uma requisição para `/rpc/current_user` usando o header customizado `X-Auth-Token`, mas o PostgREST espera uma função, não uma VIEW.
</problem_description>

## Análise do Código Atual

<current_code_analysis>
No arquivo `00-bootstrap.psql`, existe:

```sql
-- VIEW atual (PROBLEMÁTICA para RPC)
CREATE OR REPLACE VIEW sacir.current_user AS
SELECT * FROM sacir.current_user_info();

-- Função que funciona corretamente
CREATE OR REPLACE FUNCTION sacir.current_user_info()
RETURNS TABLE (
  email               text,
  role                text,
  session_id          uuid,
  session_created_at  timestamptz,
  session_expires_at  timestamptz,
  session_last_seen   timestamptz,
  session_revoked_at  timestamptz,
  user_agent          text,
  remote_addr         text,
  session_metadata    jsonb
)
-- [implementação completa]
```

**Problema**: PostgREST trata VIEWs e FUNCTIONs de forma diferente para RPCs. Para `/rpc/current_user`, ele procura uma FUNCTION, não uma VIEW.
</current_code_analysis>

## Solução Requerida

<solution_requirements>
1. **Converter a VIEW em FUNCTION**: Criar `sacir.current_user()` como uma função que retorna o mesmo resultado que `sacir.current_user_info()`

2. **Manter compatibilidade**: A função deve funcionar tanto com autenticação PostgREST padrão quanto com header customizado `X-Auth-Token`

3. **Preservar funcionalidade**: O resultado deve ser idêntico ao da função `current_user_info`

4. **Garantir permissões**: A função deve ter as permissões corretas para ser acessível via RPC
</solution_requirements>

## Implementação Específica

<implementation_code>
### Substituir no arquivo `00-bootstrap.psql`

**REMOVER** (linha aproximada 800):
```sql
CREATE OR REPLACE VIEW sacir.current_user AS
SELECT * FROM sacir.current_user_info();
```

**ADICIONAR** no mesmo local:
```sql
-- Função RPC para obter dados do usuário logado (compatível com /rpc/current_user)
CREATE OR REPLACE FUNCTION sacir.current_user()
RETURNS TABLE (
  email               text,
  role                text,
  session_id          uuid,
  session_created_at  timestamptz,
  session_expires_at  timestamptz,
  session_last_seen   timestamptz,
  session_revoked_at  timestamptz,
  user_agent          text,
  remote_addr         text,
  session_metadata    jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = sacir, public
AS $$
DECLARE
  v_claims     jsonb := sacir.current_claims();
  v_email      text;
  v_role       text;
  v_session_id uuid;
  v_session    sacir.sessions;
BEGIN
  IF v_claims IS NULL THEN
    RETURN;
  END IF;

  v_email      := v_claims->>'email';
  v_role       := v_claims->>'role';
  v_session_id := (v_claims->>'sid')::uuid;

  IF v_email IS NULL OR v_session_id IS NULL THEN
    RETURN;
  END IF;

  v_session := sacir.touch_session(v_session_id);

  IF v_session.id IS NULL THEN
    RETURN;
  END IF;

  email              := v_email;
  role               := v_role;
  session_id         := v_session.id;
  session_created_at := v_session.created_at;
  session_expires_at := v_session.expires_at;
  session_last_seen  := v_session.last_seen_at;
  session_revoked_at := v_session.revoked_at;
  user_agent         := v_session.user_agent;
  remote_addr        := v_session.remote_addr;
  session_metadata   := v_session.metadata;

  RETURN NEXT;
END;
$$;

-- Permissões para RPC
REVOKE ALL ON FUNCTION sacir.current_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION sacir.current_user() TO anon;
```
</implementation_code>

## Validação da Correção

<validation_tests>
### Teste 1: Autenticação via Header Customizado (deve funcionar)
```bash
curl -H "X-Auth-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIiA6ICJ3ZWIiLCAiZW1haWwiIDogImFkbWluQHNhY2lyLmxvY2FsIiwgImV4cCIgOiAx\nNzU5OTU0Mjg1LCAic2lkIiA6ICIyYTJmNTkzZS04MWY0LTQzMTQtYWQ4NC05NjRkOGQwNjk4MDIi\nfQ.doNUMSJ4uXbx6sT51RTCERYWo-A3guXGJPvvbwv59xk" \
     -H "Content-Type: application/json" \
     "https://dominio.com.br/rpc/current_user"
```

**Resultado esperado**: JSON com dados do usuário (email, role, session_id, etc.)

### Teste 2: Autenticação via Authorization Header (deve continuar funcionando)
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIiA6ICJ3ZWIiLCAiZW1haWwiIDogImFkbWluQHNhY2lyLmxvY2FsIiwgImV4cCIgOiAx\nNzU5OTU0Mjg1LCAic2lkIiA6ICIyYTJmNTkzZS04MWY0LTQzMTQtYWQ4NC05NjRkOGQwNjk4MDIi\nfQ.doNUMSJ4uXbx6sT51RTCERYWo-A3guXGJPvvbwv59xk" \
     -H "Content-Type: application/json" \
     "https://dominio.com.br/rpc/current_user"
```

**Resultado esperado**: Mesmo JSON com dados do usuário

### Teste 3: Sem autenticação (deve retornar vazio)
```bash
curl -H "Content-Type: application/json" \
     "https://dominio.com.br/rpc/current_user"
```

**Resultado esperado**: Array vazio `[]` ou sem dados
</validation_tests>

## Fluxo de Funcionamento

<functionality_flow>
1. **Cliente faz requisição** para `/rpc/current_user` com `X-Auth-Token`
2. **PostgREST procura** pela função `sacir.current_user()` (não VIEW)
3. **Função executa** `sacir.current_claims()` que:
   - Primeiro tenta `request.jwt.claims` (PostgREST padrão)
   - Se não encontrar, executa `sacir.auth_with_custom_header()`
   - Retorna as claims do header customizado
4. **Função valida** sessão e retorna dados do usuário
5. **PostgREST retorna** JSON com os dados
</functionality_flow>

## Arquivos a Modificar

<files_to_modify>
**Arquivo único**: `00-bootstrap.psql`

**Localização**: Aproximadamente linha 800, onde está:
```sql
CREATE OR REPLACE VIEW sacir.current_user AS
SELECT * FROM sacir.current_user_info();
```

**Ação**: Substituir a VIEW pela FUNCTION conforme código acima.
</files_to_modify>

## Critérios de Sucesso

<success_criteria>
1. ✅ **RPC funciona**: `/rpc/current_user` retorna dados do usuário
2. ✅ **Header customizado**: `X-Auth-Token` é reconhecido e validado
3. ✅ **Compatibilidade**: `Authorization: Bearer` continua funcionando
4. ✅ **Dados corretos**: Retorna email, role, session_id, timestamps, etc.
5. ✅ **Sem erros**: Não há mais erro PGRST202 sobre função não encontrada
</success_criteria>

## Observações Importantes

<important_notes>
- **Não alterar** `sacir.current_user_info()` - ela está funcionando corretamente
- **Manter** todas as outras funções como estão
- **A nova função** `sacir.current_user()` é essencialmente uma cópia de `current_user_info()` para compatibilidade com RPC
- **O sistema híbrido** de autenticação (PostgREST + header customizado) já está funcionando através de `sacir.current_claims()`
</important_notes>
