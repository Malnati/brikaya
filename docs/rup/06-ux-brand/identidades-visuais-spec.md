<!-- docs/rup/06-ux-brand/identidades-visuais.md -->
# Identidades Visuais

> Base: [./identidades-visuais.md](./identidades-visuais.md)


## Paleta e tokens
- Usar gradientes verde-azul para diferenciar operações financeiras, socioambientais e colaborativas (`REQ-006`, `REQ-009`).
- Manter escala 60-30-10 com tokens oficiais (`--color-primary-60`, `--color-secondary-30`, `--color-accent-10`) documentados em `AGENTS.md`.
- Garantir legibilidade em campo: tipografia Inter/Manrope com pesos 700/500/400 e tamanhos mapeados na Regra 4x2 (`REQ-016`).

## Sistemas de ícones
- Representar cada persona com ícones específicos: fornecedor (folha+ciclo), comprador (setas de troca), parceiro logístico (veículo sustentável), investidor (gráfico verde), administrador (escudo com nó).
- Incluir variações monocromáticas e alto contraste para aplicações em documentos fiscais e dashboards restritos (`REQ-024`, `REQ-040`).
- Anexar ícones e tokens em `/branding/assets/` com versão e hash para rastreabilidade (`REQ-029`).

## APP COIN
- Desenvolver símbolo circular com padrão de crescimento orgânico (biochar) e cor de destaque para destacar recompensas (`REQ-007`, `REQ-009`).
- Aplicar o ícone em cards de conquistas, extratos e relatórios de impacto com etiquetas objetivas (“Ganhou APP COIN”).
- Preservar versões reduzidas para botões mobile e notificações de recompensa.

## Logos da APP

### Política de Autorização
- **CRÍTICO:** Somente as logos que exibem exclusivamente a palavra **APP** estão autorizadas para uso no projeto.
- Qualquer arte com slogans, selos adicionais, microtextos ou elementos complementares **NÃO está autorizada** e deve permanecer fora do repositório até nova liberação formal do comitê de marca.

### Logos Autorizadas (apenas 2)

#### 1. Logo com Transparência - Versão Colorida
- **Arquivo:** `branding/assets/dominio-logo-transparencia-colors.png`
- **Formato:** PNG com transparência (alpha channel), otimizado (42KB)
- **Uso recomendado:** Fundos claros, neutros ou coloridos
- **Contextos específicos:**
  - Fundos brancos ou cores muito claras (`--color-neutral-05` a `--color-neutral-30`)
  - Superfícies limpas sem texturas ou padrões complexos
  - Sobreposição em imagens e fotografias com fundos claros
  - Materiais impressos em alta qualidade
  - Apresentações formais e documentos oficiais
  - Páginas web com fundo claro, branco ou colorido
  - Favicons, avatares e ícones de navegação em contextos claros
- **Requisitos técnicos:**
  - Área de respiro mínima: 16px em todos os lados
  - Contraste WCAG AA obrigatório
  - Redimensionamento proporcional apenas
  - Transparência preservada em todas as aplicações

#### 2. Logo com Transparência - Versão Preto e Branco
- **Arquivo:** `branding/assets/dominio-logo-transparencia-bw.png`
- **Formato:** PNG com transparência (alpha channel), otimizado (33KB)
- **Uso recomendado:** Fundos escuros ou contextos monocromáticos
- **Contextos específicos:**
  - Fundos escuros ou com gradientes
  - Interfaces com temas escuros (dark mode)
  - Aplicações web sobre backgrounds variados escuros
  - Hubs onde o espaço é restrito ou contexto visual é dinâmico
  - Contextos que exigem alto contraste monocromático
  - Impressões em preto e branco
  - Documentos técnicos e relatórios formais
- **Requisitos técnicos:**
  - Área de respiro mínima: 16px em todos os lados
  - Otimizada para manter legibilidade em fundos diversos
  - Contraste WCAG AA obrigatório
  - Redimensionamento proporcional apenas
  - Transparência preservada em todas as aplicações

### Diretrizes de Aplicação

#### Seleção da Logo Apropriada
1. **Avaliar o fundo:** 
   - Fundos claros/neutros/coloridos → Logo Colorida (`dominio-logo-transparencia-colors.png`)
   - Fundos escuros/monocromáticos → Logo P&B (`dominio-logo-transparencia-bw.png`)
2. **Verificar contraste:** Sempre garantir WCAG AA (contraste mínimo 4.5:1)
3. **Considerar o contexto:** 
   - Formal/colorido/impresso → Logo Colorida
   - Dark mode/técnico/minimalista → Logo P&B
4. **Testar legibilidade:** Validar visualmente em diferentes tamanhos e contextos

#### Restrições Obrigatórias
- **Proibido modificar:** cores, formas, proporções ou elementos das logos
- **Proibido adicionar:** efeitos, sombras, distorções, textos ou elementos gráficos
- **Proibido usar:** versões não listadas acima, mesmo que disponíveis externamente
- **Proibido comprometer:** legibilidade aplicando sobre fundos inadequados
- **Proibido remover:** canal de transparência (alpha channel) dos arquivos PNG

### Versionamento e Rastreabilidade
- Armazenar evoluções futuras em `/branding/assets/` seguindo versionamento incremental (`v2`, `v3`, etc.)
- Registrar hash SHA-256 de cada arquivo na planilha de rastreabilidade
- Documentar data de inclusão e responsável pela aprovação no comitê de marca
- Manter changelog de alterações em logos autorizadas


## Política de branding e terminologia
- **Terminologia oficial:** usar exclusivamente "APP" ou "plataforma APP" em toda interface do usuário (`REQ-405`).
- **Contextos de aplicação:** formulários LGPD, termos de uso, políticas de privacidade, páginas de cadastro, navegação e conteúdo frontend.
- **Reserva "App":** termo reservado exclusivamente para futura fase Fintech/Moeda.
- **Adaptação gramatical:** "do App" → "da APP", "o App" → "a APP".
- **Validação técnica:** frontend deve apresentar zero ocorrências de "App" em textos visíveis ao usuário final.
- **Documentação técnica:** termo "App" permitido apenas em contextos internos (scripts, comentários, documentação RUP).

## Uso em materiais restritos
- Marcas conjuntas com órgãos públicos e cooperativas devem seguir zona de proteção mínima de 16 px e contraste AA.
- Documentos fiscais, relatórios ESG e telas colaborativas devem incluir selo de auditoria com hash e data (`REQ-002`, `REQ-030`).
- Mockups oficiais permanecem armazenados em `/docs/assets/mockups/` e exigem aprovação prévia do comitê de marca.

[Voltar à UX & Brand](./README-spec.md)
