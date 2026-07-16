// scripts/editorial-page-content.mjs
/** Crawlable editorial pages for AdSense readiness — EN + PT only (no thin locale fan-out). */

export const EDITORIAL_DEFAULT_LOCALE = 'en-US';
export const EDITORIAL_LOCALES = ['en-US', 'pt-BR'];
export const EDITORIAL_LASTMOD = '2026-07-16';
export const EDITORIAL_PATHS = ['/how-to-play/', '/faq/', '/updates/'];

export const MIN_EDITORIAL_MAIN_WORDS = 350;

const SHARED_CSS = `
      :root {
        color-scheme: dark;
        --bg: #080816;
        --panel: #11142a;
        --text: #f8f7ff;
        --muted: #c8c8dc;
        --accent: #7cf4ff;
        --accent-strong: #ffe66d;
        --border: rgba(124, 244, 255, 0.22);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(124, 244, 255, 0.14), transparent 32rem),
          radial-gradient(circle at bottom right, rgba(255, 230, 109, 0.1), transparent 28rem),
          var(--bg);
      }
      main {
        width: min(840px, calc(100% - 32px));
        margin: 0 auto;
        padding: 48px 0 64px;
      }
      .top-link { margin: 0 0 32px; }
      .top-link a,
      a { color: var(--accent); }
      header {
        padding: 32px;
        border: 1px solid var(--border);
        border-radius: 28px;
        background: rgba(17, 20, 42, 0.72);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.26);
      }
      h1, h2 { line-height: 1.15; }
      h1 {
        margin: 0;
        font-size: clamp(2.2rem, 6vw, 4rem);
        letter-spacing: -0.05em;
      }
      h2 {
        margin-top: 0;
        font-size: clamp(1.35rem, 3vw, 1.85rem);
      }
      p, li { color: var(--muted); line-height: 1.7; }
      ul { padding-left: 1.25rem; }
      .lead {
        margin: 18px 0 0;
        font-size: 1.1rem;
      }
      .updated {
        margin: 14px 0 0;
        color: var(--accent-strong);
        font-size: 0.92rem;
      }
      nav {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 18px;
        margin-top: 22px;
      }
      section {
        margin-top: 24px;
        padding: 28px;
        border: 1px solid var(--border);
        border-radius: 24px;
        background: rgba(17, 20, 42, 0.62);
      }
`;

const NAV = {
  'en-US': [
    ['/play/', 'Play'],
    ['/how-to-play/', 'How to play'],
    ['/faq/', 'FAQ'],
    ['/updates/', 'Updates'],
    ['/about/', 'About'],
    ['/support/', 'Support'],
  ],
  'pt-BR': [
    ['/play/', 'Jogar'],
    ['/how-to-play/', 'Como jogar'],
    ['/faq/', 'FAQ'],
    ['/updates/', 'Atualizações'],
    ['/about/', 'Sobre'],
    ['/support/', 'Suporte'],
  ],
};

const PAGES = {
  '/how-to-play/': {
    'en-US': {
      title: 'How to play Brikaya',
      description:
        'Learn how to play Brikaya: move the elastic bed, bounce the ball, clear circuit components, and finish levels offline in your browser.',
      h1: 'How to play Brikaya',
      lead:
        'Brikaya is a free circuit-component arcade you play in the browser. This guide explains the goal, controls, scoring, and how to keep playing after the first visit.',
      sections: [
        {
          heading: 'What you are trying to do',
          paragraphs: [
            'Each level places circuit components above an elastic bed. Your job is to keep the ball in play, hit every clearable component, and finish the board without letting the ball fall away. When the board is clear, the level ends and the next one starts with a slightly tougher pace.',
            'Brikaya is meant for short sessions. You can pause through the menu, leave the tab, and return later. Scores, preferences, and progress stay on your device in this version, so you do not need a player account to continue.',
          ],
        },
        {
          heading: 'Controls on desktop and mobile',
          paragraphs: [
            'On desktop, move the elastic bed with the pointer or the keyboard controls shown in the onboarding tip. Keep the bed under the ball so the bounce sends it back into the component field. Timing matters more than raw speed: a centered bounce is usually safer than a late slide.',
            'On phones and tablets, drag across the playfield to shift the bed. Use landscape when your device asks for it, and avoid covering the board with your hand. If the first load finished while you were online, later sessions can continue even without a network connection.',
          ],
        },
        {
          heading: 'Components, ball, and the elastic bed',
          paragraphs: [
            'Components are the targets. Clear them by bouncing the ball into them. Some layouts leave gaps or denser clusters; read the board for a moment before the first hit so you plan a path instead of reacting only after a miss.',
            'The elastic bed is your recovery tool. It absorbs the ball and returns it upward. If the ball slips past the bed, the attempt ends for that life or round according to the current rules on screen. Restart from the menu whenever you want a clean board.',
          ],
        },
        {
          heading: 'Scoring and levels',
          paragraphs: [
            'Hitting components adds to the level score. Clearing a level contributes to your total and can update the local high-score list on that device. Harder levels introduce faster motion and denser arrangements, so early accuracy usually beats reckless swings.',
            'There is no payment wall on this version. Optional ads, when available and allowed, appear only between some completed levels and must not block your ability to keep playing. You can review consent and privacy choices from the game menu.',
          ],
        },
        {
          heading: 'Offline play after the first visit',
          paragraphs: [
            'After the first successful load, Brikaya can keep the main game available offline on that browser and device. Install from the browser when your device offers it if you want a home-screen shortcut. Clearing site data removes local scores and cached files, so export or note records before a reset if they matter to you.',
            'For install steps by platform, open the downloads page. For privacy, terms, and support contacts, use the legal pages linked in the navigation. If something breaks, email contato@brikaya.com with the device, browser, and what you were doing.',
          ],
        },
      ],
    },
    'pt-BR': {
      title: 'Como jogar Brikaya',
      description:
        'Aprenda a jogar Brikaya: mova a cama elástica, rebata a bola, limpe os componentes de circuito e complete fases no navegador, inclusive offline após o primeiro acesso.',
      h1: 'Como jogar Brikaya',
      lead:
        'Brikaya é um arcade gratuito de componentes de circuito no navegador. Este guia explica o objetivo, os controles, a pontuação e como continuar depois da primeira visita.',
      sections: [
        {
          heading: 'O que você precisa fazer',
          paragraphs: [
            'Cada fase coloca componentes de circuito acima de uma cama elástica. Seu objetivo é manter a bola em jogo, acertar os componentes que podem ser removidos e limpar o tabuleiro sem deixar a bola escapar. Quando o tabuleiro fica limpo, a fase termina e a seguinte começa com um ritmo um pouco mais exigente.',
            'Brikaya foi feito para sessões rápidas. Você pode pausar pelo menu, sair da aba e voltar depois. Nesta versão, pontuação, preferências e progresso ficam no aparelho, então não é preciso criar conta de jogador para continuar.',
          ],
        },
        {
          heading: 'Controles no computador e no celular',
          paragraphs: [
            'No computador, mova a cama elástica com o ponteiro ou com as teclas indicadas no tutorial inicial. Mantenha a cama sob a bola para que o rebote a devolva ao campo de componentes. Timing importa mais que velocidade bruta: um rebote centralizado costuma ser mais seguro do que um deslize atrasado.',
            'No celular ou tablet, arraste pelo campo de jogo para deslocar a cama. Use a orientação paisagem quando o aparelho pedir e evite cobrir o tabuleiro com a mão. Se o primeiro carregamento terminou com internet, sessões seguintes podem continuar mesmo sem rede.',
          ],
        },
        {
          heading: 'Componentes, bola e cama elástica',
          paragraphs: [
            'Os componentes são os alvos. Limpe-os rebatendo a bola neles. Alguns layouts deixam espaços ou grupos mais densos; observe o tabuleiro por um instante antes do primeiro impacto para planejar um caminho em vez de reagir só depois do erro.',
            'A cama elástica é sua ferramenta de recuperação. Ela recebe a bola e a devolve para cima. Se a bola passar pela cama, a tentativa termina conforme as regras da rodada na tela. Reinicie pelo menu quando quiser um tabuleiro limpo.',
          ],
        },
        {
          heading: 'Pontuação e fases',
          paragraphs: [
            'Acertar componentes aumenta a pontuação da fase. Completar uma fase soma ao total e pode atualizar a lista local de recordes naquele aparelho. Fases mais difíceis trazem movimento mais rápido e arranjos mais densos, então precisão no começo costuma valer mais do que movimentos impulsivos.',
            'Não há barreira de pagamento nesta versão. Anúncios opcionais, quando disponíveis e permitidos, aparecem só entre algumas fases concluídas e não devem impedir que você continue jogando. Revise consentimento e privacidade no menu do jogo.',
          ],
        },
        {
          heading: 'Jogo offline depois da primeira visita',
          paragraphs: [
            'Depois do primeiro carregamento bem-sucedido, Brikaya pode manter o jogo principal disponível offline naquele navegador e aparelho. Instale pelo navegador quando a opção existir se quiser um atalho na tela inicial. Limpar dados do site remove pontuações locais e arquivos em cache, então anote ou exporte o que importar antes de um reset.',
            'Para passos de instalação por plataforma, abra a página de downloads. Para privacidade, termos e suporte, use as páginas legais na navegação. Se algo falhar, escreva para contato@brikaya.com com aparelho, navegador e o que você estava fazendo.',
          ],
        },
      ],
    },
  },
  '/faq/': {
    'en-US': {
      title: 'Brikaya FAQ',
      description:
        'Frequently asked questions about Brikaya: free play, offline mode, privacy, scores, ads, install options, and support.',
      h1: 'Frequently asked questions',
      lead:
        'Short answers about how Brikaya works, what stays on your device, and how to get help without creating a player account.',
      sections: [
        {
          heading: 'Where do I play the game?',
          paragraphs: [
            'Open https://brikaya.com/play/ for the interactive arcade. The home page at https://brikaya.com/ is a readable landing with guides and trust links so you can learn about the product before you start. Both stay on the same domain.',
          ],
        },
        {
          heading: 'Is Brikaya free?',
          paragraphs: [
            'Yes. This version is free to open and play in the browser. There is no required purchase to clear levels or keep local progress. If optional ads appear later, they are meant to stay between levels and must not remove access to play.',
          ],
        },
        {
          heading: 'Do I need an account?',
          paragraphs: [
            'No. Brikaya does not ask for a player login in this version. Scores, language, consent choices, and preferences are stored locally on the device you use. If account features are added later, the public privacy and data-deletion pages will be updated before that change ships.',
          ],
        },
        {
          heading: 'Does it work offline?',
          paragraphs: [
            'After the first load completes while you are online, the main game can keep working offline on that browser. Offline play still depends on what your browser kept cached. Clearing site data or switching browsers starts a fresh local profile.',
          ],
        },
        {
          heading: 'Where are my scores saved?',
          paragraphs: [
            'On the same device and browser where you played. They are not uploaded to a Brikaya player account because that account does not exist here. Use restore defaults in the menu or clear site data in the browser if you want to wipe local records.',
          ],
        },
        {
          heading: 'How do ads and privacy choices work?',
          paragraphs: [
            'Ads are optional for the product experience and are disabled until the runtime allows them. In regions that require consent choices, review the prompts and the cookies page before personalized ads can run. You can revisit consent from the game menu. See the privacy policy for what stays local and how to contact us.',
          ],
        },
        {
          heading: 'Can I install Brikaya on my phone or computer?',
          paragraphs: [
            'Often yes, through the browser install or add-to-home-screen flow when your device offers it. The downloads page explains desktop, Android, and iOS paths in plain language. Installation does not create a store purchase or a Brikaya account.',
          ],
        },
        {
          heading: 'The ball feels too fast or I keep missing. What helps?',
          paragraphs: [
            'Center the bed earlier, watch the first bounce angle, and clear edge components when they give you a safer return path. Restarting a level from the menu is normal. If a control feels broken on a specific browser, include that detail when you write to support.',
          ],
        },
        {
          heading: 'How do I get support?',
          paragraphs: [
            'Email contato@brikaya.com with a short subject, the page or device you used, and the steps that led to the issue. Do not send passwords or unnecessary personal documents. The support page lists the same contact for privacy and data-deletion help.',
          ],
        },
      ],
    },
    'pt-BR': {
      title: 'FAQ do Brikaya',
      description:
        'Perguntas frequentes sobre Brikaya: jogo grátis, modo offline, privacidade, pontuação, anúncios, instalação e suporte.',
      h1: 'Perguntas frequentes',
      lead:
        'Respostas curtas sobre como o Brikaya funciona, o que fica no seu aparelho e como pedir ajuda sem criar conta de jogador.',
      sections: [
        {
          heading: 'Onde eu jogo?',
          paragraphs: [
            'Abra https://brikaya.com/play/ para o arcade interativo. A home em https://brikaya.com/ é uma landing legível com guias e links de confiança para você conhecer o produto antes de começar. As duas ficam no mesmo domínio.',
          ],
        },
        {
          heading: 'O Brikaya é gratuito?',
          paragraphs: [
            'Sim. Esta versão é gratuita para abrir e jogar no navegador. Não há compra obrigatória para limpar fases ou manter progresso local. Se anúncios opcionais aparecerem depois, eles devem ficar entre fases e não remover o acesso ao jogo.',
          ],
        },
        {
          heading: 'Preciso de uma conta?',
          paragraphs: [
            'Não. O Brikaya não pede login de jogador nesta versão. Pontuação, idioma, consentimento e preferências ficam salvos localmente no aparelho que você usa. Se recursos de conta forem adicionados no futuro, as páginas públicas de privacidade e exclusão de dados serão atualizadas antes dessa mudança.',
          ],
        },
        {
          heading: 'Funciona offline?',
          paragraphs: [
            'Depois que o primeiro carregamento termina com internet, o jogo principal pode continuar offline naquele navegador. O modo offline depende do que o navegador guardou em cache. Limpar dados do site ou trocar de navegador começa um perfil local novo.',
          ],
        },
        {
          heading: 'Onde ficam minhas pontuações?',
          paragraphs: [
            'No mesmo aparelho e navegador em que você jogou. Elas não sobem para uma conta Brikaya porque essa conta não existe aqui. Use restaurar padrão no menu ou limpe os dados do site no navegador se quiser apagar os recordes locais.',
          ],
        },
        {
          heading: 'Como funcionam anúncios e privacidade?',
          paragraphs: [
            'Anúncios são opcionais na experiência do produto e ficam desligados até o runtime permitir. Em regiões que exigem escolha de consentimento, revise os avisos e a página de cookies antes de anúncios personalizados. Você pode revisitar o consentimento no menu do jogo. Veja a política de privacidade para o que fica local e como falar conosco.',
          ],
        },
        {
          heading: 'Posso instalar o Brikaya no celular ou no computador?',
          paragraphs: [
            'Em muitos casos, sim, pelo fluxo de instalação do navegador ou “adicionar à tela inicial” quando o aparelho oferecer. A página de downloads explica os caminhos em desktop, Android e iOS em linguagem simples. A instalação não cria compra em loja nem conta Brikaya.',
          ],
        },
        {
          heading: 'A bola está rápida demais ou eu erro sempre. O que ajuda?',
          paragraphs: [
            'Centralize a cama mais cedo, observe o ângulo do primeiro rebote e limpe componentes das bordas quando isso der um retorno mais seguro. Reiniciar a fase pelo menu é normal. Se um controle parecer quebrado em um navegador específico, inclua esse detalhe ao escrever para o suporte.',
          ],
        },
        {
          heading: 'Como peço suporte?',
          paragraphs: [
            'Escreva para contato@brikaya.com com um assunto curto, a página ou o aparelho usado e os passos que levaram ao problema. Não envie senhas nem documentos pessoais desnecessários. A página de suporte lista o mesmo contato para privacidade e exclusão de dados.',
          ],
        },
      ],
    },
  },
  '/updates/': {
    'en-US': {
      title: 'Brikaya updates and design notes',
      description:
        'Product updates and design notes for Brikaya: offline-first arcade play, public trust pages, and editorial guides for players.',
      h1: 'Updates and design notes',
      lead:
        'A plain-language log of what Brikaya is building for players: free browser play, local progress, and clearer public information.',
      sections: [
        {
          heading: '2026-07-16 — Landing, /play/, and stale-cache recovery',
          paragraphs: [
            'The public home at https://brikaya.com/ is a crawlable landing with product prose, links to how-to-play, FAQ, updates, downloads, and trust pages. The interactive arcade runs at https://brikaya.com/play/ on the same origin so offline caching, ads.txt, and consent stay on one host.',
            'A service-worker update now prefers network responses for HTML documents and clears old shell caches on activate. The landing also asks existing workers to update and, for installed standalone PWAs that still open the apex, redirects to /play/. That recovers blank screens caused by cached game shells pointing at removed hashed bundles.',
          ],
        },
        {
          heading: '2026-07 — Player guides and site readiness',
          paragraphs: [
            'We published crawlable how-to-play, FAQ, and updates pages in English and Brazilian Portuguese. These pages explain gameplay, privacy expectations, and install options without requiring a login. They exist so visitors and reviewers can understand the product from stable URLs, not only from the interactive shell.',
            'Legal and trust pages (about, privacy, terms, support, and related notices) remain available as public references and were expanded in English with clearer detail about /play/, local storage, and contact paths. Editorial pages stay limited to en-US and pt-BR on purpose, so the sitemap does not multiply thin translated clones of the same guide.',
          ],
        },
        {
          heading: 'Design intent of the arcade',
          paragraphs: [
            'Brikaya treats circuit components as the visual language of a classic clear-the-board arcade. The elastic bed replaces a rigid paddle metaphor so motion feels springy and readable in short sessions. Levels should stay understandable at a glance: what to hit, where the ball is going, and how to recover after a bad bounce.',
            'The product stays offline-first after the first load. That choice keeps play available on flaky networks and avoids forcing an account for basic progress. Optional advertising, if ever enabled, is constrained to between-level moments so it does not fight the core control loop.',
          ],
        },
        {
          heading: 'What we optimize for',
          paragraphs: [
            'Clarity over spectacle: players should learn the loop in seconds. Privacy over profile: local storage beats mandatory signup for this version. Stable public pages over marketing noise: about, legal, support, and the guides should answer real questions without internal jargon.',
            'We will keep expanding player-facing notes here when features change. If you need help between updates, use contato@brikaya.com and include the browser and device you used.',
          ],
        },
        {
          heading: 'Earlier foundation',
          paragraphs: [
            'Before these guides, Brikaya shipped as a free PWA-style arcade at brikaya.com with localized home and downloads shells, legal pages for platform reviews, and local high scores. The game menu already exposed privacy, terms, about, and legal links so players could leave the canvas and read policies.',
            'Downloads explained browser install and offline continuation. That foundation still stands; the editorial pages and landing add depth that a single interactive screen cannot give search engines or first-time visitors who want to read before they play.',
          ],
        },
      ],
    },
    'pt-BR': {
      title: 'Atualizações e notas de design do Brikaya',
      description:
        'Atualizações e notas de design do Brikaya: arcade offline-first, páginas públicas de confiança e guias editoriais para jogadores.',
      h1: 'Atualizações e notas de design',
      lead:
        'Um registro em linguagem simples do que o Brikaya constrói para jogadores: jogo gratuito no navegador, progresso local e informação pública mais clara.',
      sections: [
        {
          heading: '2026-07-16 — Landing, /play/ e recuperação de cache antigo',
          paragraphs: [
            'A home pública em https://brikaya.com/ é uma landing crawlável com prosa do produto, links para como jogar, FAQ, atualizações, downloads e páginas de confiança. O arcade interativo fica em https://brikaya.com/play/ no mesmo origin para cache offline, ads.txt e consentimento permanecerem em um só host.',
            'A atualização do service worker passa a preferir a rede para documentos HTML e limpa caches de shell antigos na ativação. A landing também pede update dos workers existentes e, em PWA standalone que ainda abre o apex, redireciona para /play/. Isso recupera telas em branco causadas por shells de jogo em cache apontando para bundles hashed removidos.',
          ],
        },
        {
          heading: '2026-07 — Guias do jogador e prontidão do site',
          paragraphs: [
            'Publicamos páginas crawláveis de como jogar, FAQ e atualizações em inglês e português do Brasil. Elas explicam jogabilidade, expectativas de privacidade e opções de instalação sem exigir login. Existem para que visitantes e revisores entendam o produto por URLs estáveis, não só pela casca interativa.',
            'As páginas legais e de confiança (sobre, privacidade, termos, suporte e avisos relacionados) continuam como referências públicas e foram reforçadas em inglês com mais detalhe sobre /play/, armazenamento local e contato. As páginas editoriais ficam limitadas a en-US e pt-BR de propósito, para o sitemap não multiplicar clones traduzidos rasos do mesmo guia.',
          ],
        },
        {
          heading: 'Intenção de design do arcade',
          paragraphs: [
            'O Brikaya trata componentes de circuito como linguagem visual de um arcade clássico de limpar o tabuleiro. A cama elástica substitui a metáfora de raquete rígida para o movimento parecer elástico e legível em sessões curtas. As fases devem ser compreensíveis de relance: o que acertar, para onde a bola vai e como recuperar depois de um rebote ruim.',
            'O produto permanece offline-first depois do primeiro carregamento. Essa escolha mantém o jogo disponível em redes instáveis e evita forçar conta para progresso básico. Publicidade opcional, se algum dia for ativada, fica restrita a momentos entre fases para não disputar o controle principal.',
          ],
        },
        {
          heading: 'O que priorizamos',
          paragraphs: [
            'Clareza em vez de espetáculo: o jogador deve aprender o loop em segundos. Privacidade em vez de perfil: armazenamento local supera cadastro obrigatório nesta versão. Páginas públicas estáveis em vez de ruído de marketing: sobre, legal, suporte e os guias devem responder perguntas reais sem jargão interno.',
            'Vamos continuar expandindo notas para jogadores aqui quando os recursos mudarem. Se precisar de ajuda entre atualizações, use contato@brikaya.com e inclua o navegador e o aparelho usados.',
          ],
        },
        {
          heading: 'Base anterior',
          paragraphs: [
            'Antes destes guias, o Brikaya já existia como arcade gratuito estilo PWA em brikaya.com, com shells localizados de home e downloads, páginas legais para revisões de plataforma e recordes locais. O menu do jogo já expunha links de privacidade, termos, sobre e legal para o jogador sair da tela e ler políticas.',
            'Downloads explicava instalação pelo navegador e continuidade offline. Essa base permanece; as páginas editoriais e a landing acrescentam profundidade que uma única tela interativa não dá a buscadores nem a visitantes que querem ler antes de jogar.',
          ],
        },
      ],
    },
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeJsonForHtml(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

function linkifyContact(html) {
  return html.replaceAll(
    'contato@brikaya.com',
    '<a href="mailto:contato@brikaya.com">contato@brikaya.com</a>',
  );
}

export function editorialLocalePath(locale, routePath) {
  if (locale === EDITORIAL_DEFAULT_LOCALE) return routePath;
  return `/${locale}${routePath}`;
}

function navHref(locale, itemPath) {
  if (itemPath === '/') return '/';
  if (itemPath === '/play/') {
    return locale === EDITORIAL_DEFAULT_LOCALE || locale === 'pt-BR'
      ? '/play/'
      : `/${locale}/play/`;
  }
  if (EDITORIAL_PATHS.includes(itemPath)) return editorialLocalePath(locale, itemPath);
  return locale === EDITORIAL_DEFAULT_LOCALE ? itemPath : `/${locale}${itemPath}`;
}

export function countEditorialMainWords(locale, path) {
  const page = PAGES[path]?.[locale];
  if (!page) return 0;
  const parts = [page.h1, page.lead, ...page.sections.flatMap((section) => [section.heading, ...section.paragraphs])];
  return parts.join(' ').split(/\s+/).filter(Boolean).length;
}

export function renderEditorialPage({ locale, path, canonicalUrl, alternateLinks, dir }) {
  const page = PAGES[path]?.[locale];
  if (!page) throw new Error(`unknown editorial page: ${locale} ${path}`);

  const navItems = NAV[locale] ?? NAV['en-US'];
  const updatedLabel =
    locale === 'pt-BR' ? `Última atualização: ${EDITORIAL_LASTMOD}` : `Last updated: ${EDITORIAL_LASTMOD}`;
  const backLabel = locale === 'pt-BR' ? 'Voltar ao jogo' : 'Back to the game';

  const navHtml = navItems
    .map(([itemPath, label]) => {
      return `          <a href="${escapeHtml(navHref(locale, itemPath))}">${escapeHtml(label)}</a>`;
    })
    .join('\n');
  const sectionsHtml = page.sections
    .map((section, index) => {
      const paragraphs = section.paragraphs
        .map((paragraph) => `        <p>${linkifyContact(escapeHtml(paragraph))}</p>`)
        .join('\n');
      const className = index === 0 ? ' class="note"' : '';
      return `      <section${className}>\n        <h2>${escapeHtml(section.heading)}</h2>\n${paragraphs}\n      </section>`;
    })
    .join('\n\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: canonicalUrl,
    inLanguage: locale,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Brikaya',
      url: 'https://brikaya.com/',
    },
    publisher: {
      '@type': 'Person',
      name: 'Ricardo Malnati',
    },
    dateModified: EDITORIAL_LASTMOD,
  };

  return `<!-- generated by scripts/generate-localized-seo.mjs -->\n<!doctype html>\n<html lang="${escapeHtml(locale)}" dir="${escapeHtml(dir)}">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />\n    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />\n    <meta name="description" content="${escapeHtml(page.description)}" />\n    <meta property="og:type" content="website" />\n    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />\n    <meta property="og:title" content="${escapeHtml(page.title)}" />\n    <meta property="og:description" content="${escapeHtml(page.description)}" />\n    <meta name="twitter:card" content="summary" />\n    <meta name="twitter:title" content="${escapeHtml(page.title)}" />\n    <meta name="twitter:description" content="${escapeHtml(page.description)}" />\n    <meta name="robots" content="index,follow" />\n${alternateLinks}\n    <title>${escapeHtml(page.title)}</title>\n    <script type="application/ld+json">\n${escapeJsonForHtml(jsonLd)}\n    </script>\n    <style>${SHARED_CSS}\n    </style>\n  </head>\n  <body>\n    <main>\n      <p class="top-link"><a href="/play/">${escapeHtml(backLabel)}</a></p>\n      <header>\n        <h1>${escapeHtml(page.h1)}</h1>\n        <p class="lead">${escapeHtml(page.lead)}</p>\n        <p class="updated">${escapeHtml(updatedLabel)}</p>\n        <nav aria-label="Brikaya">\n${navHtml}\n        </nav>\n      </header>\n${sectionsHtml}\n    </main>\n  </body>\n</html>\n`;
}
