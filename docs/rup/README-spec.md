<!-- docs/rup/README.md -->
# Brikaya - Jogo Offline PWA

> Base: [./README.md](./README.md)

**Fase: Documentação RUP Adaptada**

Bem-vindo à documentação oficial do **Brikaya**, um jogo clássico implementado como Progressive Web App (PWA) com funcionamento 100% offline. O diretório `docs/rup/` organiza as fases do projeto conforme o **Rational Unified Process (RUP)** adaptado para desenvolvimento de jogos, garantindo rastreabilidade, qualidade e governança técnica contínua.

---

## Introdução Geral

O Brikaya é uma implementação moderna de um arcade clássico de quebrar blocos, desenvolvido com React + TypeScript e Vite. O projeto oferece experiência completa de jogo offline com física realista, sistema de pontuação persistente via IndexedDB, e builds nativos para iOS e Android através do Capacitor.

Os componentes centrais abrangem motor de física de colisão, sistema de logging completo, armazenamento offline de dados, service worker para cache, e interface responsiva adaptável a diferentes tamanhos de tela. Esta documentação serve como guia completo — da concepção à manutenção evolutiva — e está alinhada às diretrizes definidas em `AGENTS.md`.

---

## Estrutura das Fases RUP Adaptadas

| Fase | Diretório | Descrição |
| --- | --- | --- |
| 03 – Implementação | [./03-implementacao/README-spec.md](./03-implementacao/README-spec.md) | Build, automação, estrutura de projeto e padrões de código. |
| 04 – Qualidade e Testes | [./04-qualidade-testes/README-spec.md](./04-qualidade-testes/README-spec.md) | Critérios de aceite, métricas de qualidade e plano de testes. |
| 07 – Contribuição | [./07-contribuicao/README-spec.md](./07-contribuicao/README-spec.md) | Padrões de contribuição, commits e pull requests. |
| 99 – Anexos | [./99-anexos/README-spec.md](./99-anexos/README-spec.md) | Checklists, referências técnicas e materiais de apoio. |

---

## Índice detalhado da documentação

### Fases RUP Adaptadas
- [03-Implementação](03-implementacao/README-spec.md): build, automação, estrutura e padrões de código.
- [04-Qualidade e Testes](04-qualidade-testes/README-spec.md): critérios de aceite, métricas e plano de testes.
- [07-Contribuição](07-contribuicao/README-spec.md): padrões de colaboração e governança de commits.
- [99-Anexos](99-anexos/README-spec.md): checklists, referências técnicas e materiais de apoio.

### Materiais complementares
- [Checklists de qualidade](99-anexos/checklists/README-spec.md): validação de implementação e governança.
- [Referências técnicas](99-anexos/reference/): bibliotecas e documentação de apoio.

---

## 📍 Fases do Ciclo RUP para Jogos

1. **Iniciação (Visão)** — Define conceito do jogo, mecânicas principais e público-alvo.
2. **Elaboração (Arquitetura)** — Estrutura técnica do motor de jogo, física e sistemas de armazenamento.
3. **Construção (Implementação)** — Desenvolvimento dos componentes do jogo, interface e sistemas.
4. **Transição (Testes)** — Validação de gameplay, performance e experiência do usuário.
5. **Implantação (Release)** — Empacotamento PWA, builds nativos e distribuição.
6. **Governança (Manutenção)** — Monitoramento, atualizações e evolução contínua.

---

## Automação e Qualidade

O projeto utiliza agentes inteligentes definidos em `AGENTS.md` e ferramentas automatizadas:

- **Code Generation** – Geração assistida de componentes e utilitários.
- **Code Review** – Revisão técnica e detecção de inconsistências.
- **Quality Assurance** – Validação de padrões e boas práticas.
- **Testing Agent** – Apoio à criação e execução de testes automatizados.
- **Audit Agent** – Consolidação de evidências de conformidade.

Todos os agentes operam com controle humano obrigatório, mantendo logs versionados e seguindo as diretrizes do projeto.

---

## Conformidade e Segurança

- Funcionamento 100% offline após primeiro carregamento.
- Dados do jogo armazenados localmente via IndexedDB com criptografia.
- Service worker para cache-first strategy e resiliência.
- Interface acessível seguindo diretrizes WCAG 2.1 AA.
- Código limpo, modular e bem documentado.

---

## 🎮 Responsabilidade Técnica

**Projeto:** Brikaya - Jogo Offline PWA
**Responsável:** Ricardo Malnati — Engenheiro de Software
**Tecnologias:** React + TypeScript + Vite + Capacitor
**Licença:** Código aberto (ver LICENSE)
**Última atualização:** [gerada conforme ciclo de desenvolvimento]

---

[Voltar ao topo](#brickbreaker---jogo-offline-pwa)
