# Relatório de Validação: Bypass de Autenticação JWT no PostgREST

## 1. Introdução

Este relatório tem como objetivo validar as sugestões de mudanças para contornar (bypass) a validação de JSON Web Tokens (JWT) no PostgREST, movendo a lógica de autenticação para o banco de dados PostgreSQL. A análise verifica se as sugestões são tecnicamente corretas e implementáveis, ou se representam uma interpretação equivocada (alucinação) do funcionamento do PostgREST.

As sugestões foram analisadas em conjunto com os scripts SQL e de configuração fornecidos, e comparadas com a documentação oficial do PostgREST e as especificações técnicas (RFCs) relevantes.

## 2. Análise da Sugestão Principal

A sugestão central para o bypass consiste em dois passos:

1.  **Remover a variável `PGRST_JWT_SECRET`** da configuração do PostgREST, com a expectativa de que todas as requisições sejam encaminhadas ao banco com a role `anon`.
2.  **Implementar a validação do JWT no banco de dados**, utilizando funções SQL para decodificar, verificar a assinatura e as claims do token.

### 2.1. Validação da Proposta de Bypass

A pesquisa na documentação oficial do PostgREST e em discussões da comunidade revelou que a premissa da sugestão está **incorreta**.

> **Citação da Documentação Oficial do PostgREST:**
> "If this parameter is not specified then PostgREST refuses authentication requests."
> – [PostgREST Configuration Documentation](https://docs.postgrest.org/en/latest/references/configuration.html#jwt-secret)

Isso significa que, ao contrário do que foi sugerido, o PostgREST **não delega a requisição para a role `anon`** se um `Authorization: Bearer <token>` for enviado sem que o `jwt-secret` esteja configurado. Em vez disso, ele rejeita a requisição com um erro, impedindo que o token chegue ao banco de dados para validação.

Tentativas de forçar esse comportamento, como configurar o `PGRST_JWT_SECRET` como uma string vazia, resultam no erro `JWSError JWSInvalidSignature`, como documentado em discussões na comunidade [1].

| Comportamento Sugerido | Comportamento Real (Documentado) |
| :--- | :--- |
| Requisição com `Authorization` header passa como `anon`. | Requisição com `Authorization` header é **rejeitada (401 Unauthorized)**. |
| O banco de dados recebe o token para validação. | A requisição **não chega** ao banco de dados. |

**Conclusão**: A sugestão de remover o `PGRST_JWT_SECRET` para realizar o bypass **não é funcional** e representa uma compreensão incorreta do mecanismo de autenticação do PostgREST.

## 3. Validação da Implementação SQL

Apesar da falha na estratégia de bypass, a implementação SQL proposta para a validação do JWT no banco de dados foi analisada e considerada **tecnicamente sólida e correta**.

### 3.1. Funções de Decodificação e Verificação

As funções `sacir._b64url_to_bytea` e `sacir.jwt_verify_hs256` estão em conformidade com as especificações do padrão JWT (RFC 7519).

-   **Base64URL Decoding**: A função `_b64url_to_bytea` lida corretamente com a conversão do formato Base64URL para o Base64 padrão, incluindo a substituição de caracteres (`-`, `_`) e o preenchimento (`padding`) com `=`, conforme especificado na [RFC 4648, Seção 5](https://datatracker.ietf.org/doc/html/rfc4648#section-5).
-   **Verificação de Assinatura (HS256)**: A função `jwt_verify_hs256` recria a assinatura HMAC-SHA256 usando a chave secreta e compara o resultado com a assinatura fornecida no token. Este é o procedimento padrão para validar assinaturas simétricas.
-   **Validação de Claims**: A implementação verifica corretamente a claim de expiração (`exp`). Embora não valide `nbf` (Not Before) ou `iat` (Issued At), a lógica presente é correta.

### 3.2. Função de Autenticação e Propagação de Claims

A função `sacir.auth_with_token` é um exemplo robusto de como a autenticação pode ser gerenciada no banco de dados:

-   **SECURITY DEFINER**: O uso de `SECURITY DEFINER` é apropriado para permitir que a função execute com privilégios elevados para consultar tabelas de sessão e configurar o ambiente.
-   **Integração com Sessões**: A verificação cruzada com a tabela `sacir.sessions` adiciona uma camada de segurança essencial, permitindo a revogação de tokens.
-   **Propagação de Claims para RLS**: O uso de `set_config('app.jwt.claims', ..., true)` é a abordagem correta para disponibilizar as informações do token para as políticas de Row-Level Security (RLS) e outras funções na transação.

**Conclusão**: A parte da sugestão referente à implementação da lógica de validação de JWT em SQL **não é uma alucinação**. É uma implementação funcional e bem fundamentada nas capacidades do PostgreSQL.

## 4. Alternativas Viáveis para Validação no Banco

Dado que o bypass direto não é possível da forma sugerida, existem outras abordagens para alcançar um objetivo semelhante:

1.  **Utilizar um Header Customizado**: Em vez de `Authorization`, o token pode ser enviado em um header diferente (ex: `X-Auth-Token`). O PostgREST ignorará este header, permitindo que uma função no banco de dados o leia (`current_setting('request.header.x-auth-token', true)`) e execute a validação.

2.  **Validação Dupla**: Manter o `PGRST_JWT_SECRET` configurado, permitindo que o PostgREST valide a assinatura e o `role`, e então executar uma segunda camada de validação no banco (via `pre-request` ou triggers) para verificar claims customizadas ou a tabela de sessões.

3.  **RPC de Autenticação**: Criar um endpoint de RPC (Remote Procedure Call), como a função `sacir.login` já existente, que recebe o token como um parâmetro no corpo da requisição, em vez de no header. A validação seria feita inteiramente dentro desta função.

## 5. Veredito Final: Real ou Alucinação?

A sugestão fornecida é um **híbrido de realidade e alucinação**.

-   **Realidade**: A implementação da validação de JWT (assinatura HS256, claims, etc.) diretamente em PostgreSQL é **totalmente viável e foi corretamente demonstrada** nos exemplos de código SQL. As funções propostas são funcionais e seguem as especificações técnicas.

-   **Alucinação**: A estratégia para **fazer o PostgREST contornar sua própria validação JWT** (removendo o `jwt-secret`) está **incorreta** e baseia-se em uma premissa falsa sobre o comportamento do software. A documentação oficial e testes práticos confirmam que o PostgREST não funciona dessa maneira.

Em resumo, a IA sugeriu uma solução de programação SQL válida, mas a integrou em um fluxo de arquitetura que não é compatível com a ferramenta (PostgREST) em questão.

## 6. Referências

[1] PostgREST/postgrest. (2023). *I need to disable authorization from Postgrest completely. (Issue #2758)*. GitHub. [https://github.com/PostgREST/postgrest/issues/2758](https://github.com/PostgREST/postgrest/issues/2758)

