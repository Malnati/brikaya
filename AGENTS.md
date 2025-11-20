<!-- AGENTS.md -->

# Contribuição assistida por IA

Estas instruções se aplicam a **todo o repositório** e devem ser seguidas por qualquer agente automatizado responsável por gerar código ou documentação.

Este repo utiliza um conjunto de regras adicionais localizado em `.cursor/rules/all.mdc`.
Siga todas as orientações presentes naquele arquivo ao realizar modificações neste projeto.

## Sobre o Projeto

Este é um projeto de jogo **BrickBreaker** (Breakout) implementado em TypeScript/React como PWA (Progressive Web App) totalmente offline. O projeto utiliza:
- **React + TypeScript** para a interface
- **Vite** como bundler
- **Capacitor** para builds nativos (iOS/Android)
- **IndexedDB** para armazenamento persistente de logs e pontuação
- **Service Worker** para funcionamento offline completo

⸻

## Regras Gerais de Engenharia

- Aplicar princípios DRY, SRP, coesão alta e acoplamento baixo.
- Componentes React com funções nomeadas.
- Separação por domínio lógico (components/, hooks/, logic/, objects/, storage/, utils/, constants/).
- Código limpo, legível e modular.
- Evitar dependências externas (CDNs, fontes, scripts remotos).

⸻

## Regra Obrigatória — Funcionamento 100% Offline

- O projeto deve funcionar completamente offline após o primeiro carregamento.
- O `sw.js` deve:
  - Realizar precache de todos os arquivos necessários.
  - Atender a todas as requisições subsequentes com cache-first.
  - Ser registrado via `registerServiceWorker.ts`.
- O `manifest.webmanifest` deve conter:
  - `display: standalone`, `start_url: '.'`, `theme_color`, `background_color`
  - Ícones locais (ex: `/icons/icon-192.png`)
- É proibido o uso de:
  - Fontes externas
  - Imagens ou scripts por CDN
  - Requisições de rede após o primeiro uso

⸻

## Regra Obrigatória — Caminho do Arquivo no Topo

Cada arquivo gerado deve conter seu caminho completo como primeira linha comentada, respeitando a sintaxe da linguagem:

| Tipo de Arquivo | Caminho no Topo | Observação |
| --- | --- | --- |
| `.ts`, `.tsx`, `.js`, `.jsx` | `// caminho/arquivo.ts` | Primeira linha |
| `.sh` com shebang | Segunda linha: `# caminho/arquivo.sh` | Após `#!/bin/bash` |
| `.html` | `<!-- caminho/arquivo.html -->` | Primeira linha |
| `.css` | `/* caminho/arquivo.css */` | Primeira linha |
| `.yaml`, `.yml` | `# caminho/arquivo.yaml` | Primeira linha |
| `.json` (ex: manifest) | Comentário não aplicável | JSON não suporta comentários |

⸻

## Política de CHANGELOG

- Toda alteração significativa deve ser registrada no `CHANGELOG.md` com data e descrição clara.
- Use formato de versionamento semântico (SemVer) quando aplicável.
- Mantenha o changelog atualizado antes de commits importantes.

⸻

## Política de Documentação

- A documentação principal do projeto está no `README.md`.
- Documentação técnica específica pode ser adicionada em `docs/` quando necessário.
- **Arquivos permitidos na raiz:** `README.md`, `CHANGELOG.md`, `AGENTS.md`, `PENDING.md`, `.gitignore`, arquivos de configuração (`.eslintrc`, `tsconfig.json`, `package.json`, etc.) e arquivos de infraestrutura (`Makefile`, `capacitor.config.ts`, etc.).
- **Arquivos proibidos na raiz:** Não crie arquivos de documentação, relatórios, resumos, auditorias ou qualquer tipo de documento `.md` adicional na raiz sem justificativa explícita.

⸻

## Convenções de Configuração

- O projeto utiliza `package.json` para gerenciamento de dependências.
- TypeScript em modo `strict` (`tsconfig.json`).
- Vite como ferramenta padrão de bundling.
- Capacitor para builds nativos (iOS/Android).
- Cada arquivo de configuração deve seguir os padrões estabelecidos.

⸻

## Convenções de Código

- Nenhum valor fixo (hardcoded) deve ser utilizado diretamente no corpo de funções, métodos ou blocos de código.
  - Todos os valores literais como:
    - URLs de APIs e endpoints
    - Chaves de configuração
    - URLs, nomes de arquivos, extensões, tokens e parâmetros estáticos
    - Nomes de campos, propriedades ou estruturas fixas
    - Mensagens de erro ou sucesso
  - Devem obrigatoriamente ser extraídos para constantes no **topo do arquivo TypeScript/JavaScript**, em letras maiúsculas com underscores (ex: `const API_ENDPOINT = "http://localhost:3333"`), conforme boas práticas de Clean Code.
- Para este projeto TypeScript:
  - Constantes compartilhadas devem ser agrupadas em `src/constants/`.
  - Constantes de uso local (específicas de um módulo ou arquivo) podem ser declaradas no topo do arquivo correspondente.
  - Constantes de configuração devem estar em `src/constants/game.ts` ou arquivos similares.

⸻

## Proibição de Alterações Estéticas Não Solicitadas

- **É estritamente proibido** realizar alterações puramente estéticas em arquivos sem solicitação explícita. Alterações estéticas incluem:
  - Adicionar ou remover comentários explicativos que não sejam tecnicamente necessários
  - Adicionar ou remover espaços em branco, quebras de linha ou linhas vazias
  - Reformatar indentação ou alinhamento de código
  - Reorganizar imports ou declarações sem mudança funcional
  - Adicionar cabeçalhos de caminho em arquivos que não os possuem (exceto quando exigido por nova funcionalidade)
- **Formatação de código é responsabilidade de ferramentas** como Prettier, ESLint, e outros linters configurados no projeto.
- **Exceções permitidas:**
  - Quando a alteração estética é tecnicamente necessária para o funcionamento (ex: corrigir sintaxe)
  - Quando explicitamente solicitado no escopo da tarefa
  - Quando faz parte da configuração de uma nova ferramenta de linting/formatação
- **Para agentes de IA:** Foque exclusivamente nas mudanças funcionais requeridas. Não "melhore" a aparência do código ou adicione comentários "úteis" não solicitados. Deixe a formatação para as ferramentas apropriadas.

⸻

## Limpeza de Código e Remoção de Código Morto

- Após qualquer alteração no código (refatoração, substituição de lógica ou migração de funcionalidades), é obrigatória a remoção de todo o código morto. A verificação deve incluir:

  - **Código-fonte:**
    - Funções, métodos, classes e componentes (incluindo React) que não são mais utilizados.
    - Variáveis, constantes, atributos, hooks customizados e utilitários não referenciados.
    - Tipos, interfaces e enums (TypeScript) que se tornaram obsoletos.
    - Imports não utilizados em todos os arquivos do projeto.

  - **Configuração:**
    - Variáveis de ambiente não utilizadas em arquivos como `vite.config.ts`, `Makefile`.

  - **Dependências:**
    - Dependências de pacotes não utilizadas no `package.json`.

  Essa regra se baseia nos princípios de código limpo (Clean Code) e manutenção sustentável. A presença de código morto compromete:
    - Legibilidade e clareza;
    - Facilidade de manutenção;
    - Precisão de testes e cobertura;
    - Segurança em deploys automatizados.

  A verificação deve ser feita recursivamente em todo o projeto, garantindo que nenhuma referência seja esquecida antes da exclusão.

⸻

## Convenções de Importação para TypeScript/JavaScript

- Todas as instruções `import` (ES6) ou `require` (CommonJS) devem estar localizadas no topo do arquivo, antes de qualquer execução de código.
- É proibido envolver importações em blocos `try/catch` para contornar erros de carregamento.
- Priorize importações estáticas no topo do arquivo. Importações dinâmicas (com `import()`) devem ser usadas apenas em cenários de carregamento sob demanda (code-splitting) onde o benefício de performance é claro e intencional.
- Em aplicações React/TypeScript, priorize sempre as importações no padrão ES6.
- Qualquer módulo externo referenciado deve estar listado no `package.json` e instalado previamente.
- Organize os imports em três grupos principais, separados por uma linha em branco: bibliotecas externas, módulos internos da aplicação e, por último, importações de tipos (`import type`).

⸻

## Princípios de Reutilização (DRY)

- Siga rigorosamente o princípio DRY (*Don't Repeat Yourself*) em todo o projeto.
- Antes de criar novas funções, classes, componentes ou qualquer implementação, verifique se já existe algo com o mesmo objetivo.
- Reutilize funções ou lógicas equivalentes já existentes. Se o reaproveitamento causar loop de importação, mova a implementação para um módulo comum, como `src/utils/` (para lógica interna) ou `src/constants/` (para valores compartilhados).
- Nunca duplique código por conveniência ou para manter isolamento artificial entre arquivos.
- Parametrize pequenas variações de lógica em funções reutilizáveis.
- Para código React/TypeScript, componentes similares devem ser parametrizados via props, hooks customizados devem concentrar lógica compartilhada, utilitários devem ser centralizados em `src/utils/`, tipos e interfaces em arquivos de tipos apropriados e constantes em `src/constants/`.

⸻

## Regras Específicas do Projeto de Jogo

### Sistema de Logging

- O sistema de logging utiliza **IndexedDB** para armazenamento persistente.
- Todos os eventos do jogo devem ser registrados através do `gameLogger` em `src/storage/gameLogger.ts`.
- Eventos registrados incluem: início/fim de jogo, atualizações de pontuação, bolas perdidas, blocos destruídos, colisões, movimento da raquete, mudanças de estado.
- Cada evento deve conter informações completas sobre o estado do jogo no momento do evento.

### Game Engine

- O motor do jogo (`GameEngine.ts`) gerencia toda a lógica do jogo.
- Física de colisão deve ser precisa e consistente.
- O jogo deve ser responsivo e adaptar-se a diferentes tamanhos de tela.
- Dimensões dinâmicas são calculadas com base no tamanho do canvas disponível.

### Armazenamento Persistente

- Pontuação e estatísticas são armazenadas em IndexedDB.
- O sistema deve funcionar completamente offline.
- Dados devem ser exportáveis em formato JSON para análise externa.

### Builds Nativos

- O projeto utiliza Capacitor para builds iOS e Android.
- Builds nativos requerem: `make build-pwa` seguido de `make prepare-capacitor`.
- Configurações específicas de plataforma estão em `capacitor.config.ts`.

⸻

## Regras de UX e Design para Jogos

### Regra de Cores 60-30-10 (603010)

#### Escopo
- Aplicável a qualquer entrega de interface do jogo (telas, menus, HUD, componentes).

#### Definição
- **60% — Cor Primária (Base):** fundo predominante e grandes áreas estruturais.
- **30% — Cor Secundária (Suporte):** blocos, cartões, barras, áreas funcionais.
- **10% — Cor de Destaque (Accent):** CTAs, links, estados ativos, badges, alertas.

#### Diretrizes
1. **Paleta mínima:** defina explicitamente primária, secundária e accent (uma de cada).
2. **Tolerância:** aceite variação de ±5% por grupo (55–65 / 25–35 / 5–15) para acomodar conteúdo dinâmico.
3. **Acessibilidade:** contraste mínimo WCAG AA para texto e ícones sobre as três cores.
4. **Hierarquia:** o usuário deve identificar CTAs e estados em <3s ao primeiro olhar.
5. **Consistência:** a cor accent não pode ser reutilizada como fundo dominante.
6. **Estados e feedback:** foco/hover/ativo usam derivações da cor original (mesma família).

⸻

### Regra Tipográfica 4x2 — Hierarquia e Consistência de Texto

#### Escopo
Aplicável a qualquer entrega que contenha texto visível ao usuário: interfaces do jogo, menus, HUD, mensagens, etc.

#### Definição da Regra
4x2 representa o limite máximo de 4 tamanhos tipográficos e 2 pesos de fonte em um mesmo sistema visual.

| Função | Tamanho | Peso | Exemplo de uso |
| --- | --- | --- | --- |
| Headline (Título principal) | 1º maior | Semibold ou Bold | títulos de páginas, seções, cabeçalhos principais |
| Subtitle (Subtítulo) | 2º maior | Regular ou Semibold | subtítulos, blocos informativos secundários |
| Body (Corpo de texto) | 3º maior | Regular | conteúdo, descrições, textos explicativos |
| Caption (Texto auxiliar) | 4º maior | Regular | rótulos, tooltips, notas de rodapé |

**Pesos permitidos:**
- Regular
- Semibold (ou Bold, conforme a fonte-base)

⸻

### Regra de Espaçamento 8pt Grid System — Consistência Espacial e Modularidade

#### Escopo
- Aplicável a todas as interfaces do jogo: telas, menus, HUD, componentes reutilizáveis.

#### Definição da Regra
O 8pt Grid System define que todos os espaçamentos, tamanhos e proporções de uma interface devem ser múltiplos de 8 px ou divisíveis por 4 px.

| Tipo de Espaço | Valores válidos (px) | Exemplos de uso |
| --- | --- | --- |
| Mínimo | 4 | separação entre ícones, labels pequenos |
| Pequeno | 8 | paddings internos, gap entre botões |
| Médio | 16 | espaçamento entre seções pequenas |
| Grande | 24 | separação entre blocos ou cards |
| Extra | 32+ | áreas principais, seções, containers |

#### Fórmula geral
- Use apenas valores divisíveis por 8 ou 4.
- Se o valor não for divisível por 8 ou 4 → não use.

⸻

### Regra de UX Writing e Simplificação de Texto

#### Escopo
- Aplica-se a toda interface textual: menus, HUD, mensagens de erro, tooltips, instruções.

#### Definição da Regra
- A escrita em interfaces deve seguir os princípios de UX Writing e Content Design, priorizando clareza, concisão e contexto.
- Cada texto deve servir a uma ação do usuário e não descrever a interface.

#### Princípios fundamentais
1. **Clareza:** o texto deve ser compreendido imediatamente, sem explicações adicionais.
2. **Concisão:** use o mínimo de palavras para expressar o máximo de sentido.
3. **Consistência:** mantenha o mesmo estilo e tom em todas as telas.
4. **Contexto:** o texto deve responder à pergunta "o que o usuário precisa fazer agora?".
5. **Ação:** frases orientadas a verbo — sempre priorizar "fazer" em vez de "explicar".

⸻

### Regra de Simplicidade Visual — "Simplicity Over Flashiness"

#### Escopo
Aplica-se a todas as interfaces gráficas e elementos visuais criados ou revisados pelos agentes, incluindo telas do jogo, menus, HUD, componentes.

#### Definição da Regra
A interface deve adotar o princípio de simplicidade funcional — todo elemento visual deve existir por um motivo funcional, não estético.

#### Diretrizes Gerais
- **Clareza acima da estética:** Prefira contraste, espaçamento e tipografia equilibrada em vez de brilhos e sombras.
- **Propósito sobre aparência:** Efeitos visuais só são válidos se reforçarem informação ou interação.
- **Economia visual:** Reduza ruído, mantenha apenas o essencial.
- **Consistência:** Um único estilo visual por sistema.
- **Leitura imediata:** A mensagem deve ser compreendida em até 3 segundos.
- **Hierarquia de foco:** Apenas um ponto principal de atenção por tela.

⸻

## Acessibilidade e Feedback Inclusivo

### Conformidade WCAG 2.1 AA

#### Contraste e Legibilidade
- **Texto normal:** contraste mínimo 4.5:1 sobre qualquer fundo
- **Texto grande (≥18px):** contraste mínimo 3:1 sobre qualquer fundo
- **Elementos gráficos:** contraste mínimo 3:1 para ícones e controles
- **Estados de foco:** contraste mínimo 3:1 para indicadores visuais

#### Navegação por Teclado
- **Tab sequence:** ordem lógica seguindo fluxo visual
- **Indicadores de foco:** outline de 2px com cor contrastante
- **Sem armadilhas:** saída disponível para qualquer elemento focável
- **Atalhos:** teclas de acesso documentadas e consistentes

#### Mensagens e Feedback Inclusivos
- Evitar linguagem técnica ("Clique em...")
- Priorizar verbos de ação ("Selecione", "Confirme", "Revise")
- Incluir contexto temporal quando relevante
- Oferecer alternativas quando aplicável

⸻

## Convenções de Branches e Governança

### Convenções de Nomenclatura

#### Padrões Obrigatórios
- **Feature:** `feature/nome-descritivo` (novas funcionalidades)
- **Fix:** `fix/nome-do-problema` (correções de bugs)
- **Hotfix:** `hotfix/correcao-critica` (correções emergenciais)
- **Release:** `release/vX.Y.Z` (preparação de versões)
- **Docs:** `docs/atualizacao-especifica` (documentação)

#### Exemplos Válidos
```
feature/multiplayer-support
fix/ball-physics-collision
hotfix/memory-leak-game-engine
release/v1.3.0
docs/update-readme-installation
```

### Fluxo de Desenvolvimento

#### 1. Criação de Branch
```bash
# Sempre partir da main atualizada
git checkout main
git pull origin main

# Criar branch seguindo convenção
git checkout -b feature/nova-funcionalidade
```

#### 2. Desenvolvimento e Commits
- Commits atômicos com mensagens descritivas
- Seguir padrão: `tipo: descrição clara em português`
- Referenciar issues quando aplicável: `fix: corrigir colisão (#123)`

#### 3. Pull Request
- **Título:** seguir padrão da branch (`feature: adicionar suporte multiplayer`)
- **Descrição:** contexto, alterações, testes realizados
- **Reviewers:** mínimo 1 aprovação técnica
- **Checks:** pipeline automatizado deve passar (lint, build, testes)

⸻

## Ferramentas QA e Formato de Relatórios

### Ferramentas Automatizadas

#### Vite (Build Tool)
- **Função:** bundling e desenvolvimento
- **Comando dev:** `npm run dev`
- **Comando build:** `npm run build`

#### TypeScript (Type Checking)
- **Modo strict:** obrigatório (`"strict": true`)
- **Comando:** `tsc --noEmit` para validação sem build
- **Integração:** IDE + pipeline automatizado

#### ESLint (Linting)
- **Configuração:** regras TypeScript/React
- **Regras obrigatórias:** sem warnings em código de produção
- **Integração:** pré-commit hooks + pipeline CI

### Formato Padronizado de Relatórios

#### Estrutura Obrigatória
```markdown
# Relatório QA - [Título da Entrega]

## Informações Básicas
- **Data/Hora UTC:** YYYY-MM-DD HH:mm:ss
- **Branch:** feature/nome-da-branch
- **Commit:** SHA completo
- **Responsável:** Nome do desenvolvedor

## Resultados dos Testes
- **Build:** ✅/❌ Status
- **Lint:** ✅/❌ Status (0 warnings aceitos)
- **TypeScript:** ✅/❌ Status (0 erros aceitos)
- **Testes:** ✅/❌ Status

## Observações e Bloqueios
- [Lista de problemas encontrados]
- [Ações corretivas necessárias]
- [Aprovação final: ✅/❌]
```

⸻

## Padrões Éticos e de Segurança

- Todos os agentes devem obedecer simultaneamente às seguintes diretrizes:
  - LGPD (Lei 13.709/2018): é proibido o uso, armazenamento ou persistência de dados pessoais em execuções automatizadas.
  - Políticas de uso dos provedores de IA aprovados: conteúdos sensíveis, discriminatórios ou fora dos termos de serviço são proibidos.
- Nenhum agente pode modificar ou acessar dados de produção; todas as execuções ocorrem em ambientes isolados (local ou CI) e monitorados.

⸻

## Validação Obrigatória Antes de Execução

- **CRÍTICO**: Antes de iniciar qualquer tarefa, execute `make help` para validar infraestrutura básica
- **CRÍTICO**: Verifique se todos os arquivos possuem cabeçalhos de caminho apropriados
- **OBRIGATÓRIO**: Confirme que mudanças estruturais estão documentadas em changelog antes de prosseguir
- **OBRIGATÓRIO**: Valide que o projeto compila sem erros (`npm run build`)

### Checklist de Validação Pré-Execução
- [ ] `Makefile` existe na raiz e possui targets obrigatórios (`build`, `dev`, `clean`)
- [ ] Todos os arquivos `.md` possuem cabeçalhos de caminho (`<!-- path/file.md -->`)
- [ ] Estrutura de diretórios do projeto está correta (`src/components/`, `src/logic/`, etc.)
- [ ] `package.json` está atualizado e sincronizado
- [ ] Service worker (`sw.js`) está configurado corretamente
- [ ] Manifest (`manifest.webmanifest`) está configurado corretamente

### Ações Corretivas Automáticas
Se algum item do checklist falhar:
1. **Interrompa a execução imediatamente**
2. **Registre a falha no changelog com timestamp**
3. **Corrija a não-conformidade antes de prosseguir**
4. **Documente a correção e sua justificativa**
5. **Re-execute o checklist completo**

⸻

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Game.tsx
│   ├── GameLogViewer.tsx
│   └── CollisionStats.tsx
├── logic/              # Lógica do jogo
│   └── GameEngine.ts
├── objects/            # Objetos do jogo
│   ├── Ball.ts
│   ├── Bricks.ts
│   └── Paddle.ts
├── storage/            # Armazenamento (IndexedDB)
│   ├── gameLogger.ts
│   └── score.ts
├── utils/              # Utilitários
│   ├── collisionTracker.ts
│   └── assetLoader.ts
├── constants/          # Constantes
│   ├── game.ts
│   └── assets.ts
├── hooks/              # Hooks customizados
├── styles/             # Estilos CSS
└── main.tsx            # Entry point
```

⸻

## Referências

- **Documento:** `AGENTS.md` (versão adaptada para projeto de jogo)
- **Regras adicionais:** `.cursor/rules/all.mdc`
- **Status:** Ativo e sob revisão contínua
