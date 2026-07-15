// scripts/landing-page-content.mjs
/** Crawlable marketing landing for `/` — game lives at `/play/`. */

export const LANDING_LASTMOD = '2026-07-15';
export const PLAY_ROUTE_PATH = '/play/';
export const MIN_LANDING_MAIN_WORDS = 280;

const LANDING_CSS = `
      :root {
        color-scheme: dark;
        --bg: #080816;
        --text: #f8f7ff;
        --muted: #c8c8dc;
        --accent: #7cf4ff;
        --accent-strong: #ffe66d;
        --border: rgba(124, 244, 255, 0.22);
        --panel: rgba(17, 20, 42, 0.72);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(124, 244, 255, 0.16), transparent 34rem),
          radial-gradient(circle at bottom right, rgba(255, 230, 109, 0.12), transparent 28rem),
          var(--bg);
      }
      main {
        width: min(920px, calc(100% - 32px));
        margin: 0 auto;
        padding: 48px 0 72px;
      }
      a { color: var(--accent); }
      .hero {
        padding: 40px 32px;
        border: 1px solid var(--border);
        border-radius: 28px;
        background: var(--panel);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
      }
      .brand {
        margin: 0;
        font-size: clamp(2.6rem, 8vw, 5rem);
        letter-spacing: -0.06em;
        line-height: 0.95;
      }
      .headline {
        margin: 18px 0 0;
        font-size: clamp(1.35rem, 3.2vw, 2rem);
        line-height: 1.2;
      }
      .lead {
        margin: 16px 0 0;
        color: var(--muted);
        font-size: 1.08rem;
        line-height: 1.65;
        max-width: 42rem;
      }
      .cta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 28px;
      }
      .cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        padding: 0 22px;
        border-radius: 999px;
        text-decoration: none;
        font-weight: 650;
      }
      .cta-primary {
        background: var(--accent);
        color: #061018;
      }
      .cta-secondary {
        border: 1px solid var(--border);
        color: var(--text);
        background: rgba(8, 8, 22, 0.35);
      }
      nav.site-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 18px;
        margin-top: 28px;
      }
      section {
        margin-top: 24px;
        padding: 28px;
        border: 1px solid var(--border);
        border-radius: 24px;
        background: rgba(17, 20, 42, 0.62);
      }
      h2 {
        margin: 0 0 12px;
        font-size: clamp(1.35rem, 3vw, 1.85rem);
      }
      p, li { color: var(--muted); line-height: 1.7; }
      ul { padding-left: 1.2rem; }
      .updated {
        margin: 14px 0 0;
        color: var(--accent-strong);
        font-size: 0.92rem;
      }
`;

const COPY = {
  'pt-BR': {
    brand: 'Brikaya',
    headline: 'Arcade gratuito de circuitos no navegador',
    lead:
      'Remova componentes, avance fases e jogue no navegador com progresso salvo no seu aparelho. Depois do primeiro acesso, a partida principal pode continuar mesmo offline.',
    playCta: 'Jogar agora',
    howToCta: 'Como jogar',
    faqCta: 'FAQ',
    downloadsCta: 'Instalar / baixar',
    updated: `Atualizado em ${LANDING_LASTMOD}`,
    nav: [
      [PLAY_ROUTE_PATH, 'Jogar'],
      ['/how-to-play/', 'Como jogar'],
      ['/faq/', 'FAQ'],
      ['/updates/', 'Atualizações'],
      ['/downloads/', 'Downloads'],
      ['/about/', 'Sobre'],
      ['/support/', 'Suporte'],
    ],
    sections: [
      {
        heading: 'O que é o Brikaya',
        paragraphs: [
          'Brikaya é um arcade de componentes de circuito feito para sessões rápidas. Você controla uma cama elástica, rebate a bola e limpa o tabuleiro fase a fase sem criar conta de jogador.',
          'A pontuação, o idioma e as preferências ficam no aparelho nesta versão. Não há loja paga nem formulário de dados pessoais para começar a jogar.',
          'O objetivo é simples: limpar os componentes, sobreviver aos padrões mais densos e subir de fase sem perder o ritmo. Cada partida cabe em poucos minutos e funciona bem no celular ou no computador.',
        ],
      },
      {
        heading: 'Por que jogar aqui',
        paragraphs: [
          'Abra no navegador, use o tutorial curto e avance quando estiver pronto. Se o aparelho oferecer instalação pelo navegador, você pode manter um atalho na tela inicial.',
          'Guias públicos explicam controles, privacidade, anúncios opcionais e suporte. Use Como jogar, FAQ e Atualizações antes ou depois da partida.',
          'Depois do primeiro carregamento, a partida principal pode continuar offline. Isso reduz interrupções e mantém o foco no jogo, não em cadastro ou download de loja.',
        ],
      },
      {
        heading: 'Como começar',
        paragraphs: [
          'Toque em Jogar agora para abrir a partida em /play/. Aceite as telas de consentimento quando aparecerem, escolha o idioma no menu e siga a dica inicial.',
          'Se preferir ler antes, abra Como jogar para controles e fluxo de fases, ou o FAQ para perguntas sobre progresso, instalação e anúncios opcionais.',
        ],
      },
      {
        heading: 'Privacidade e contato',
        paragraphs: [
          'Anúncios, quando existirem e forem permitidos, ficam opcionais para a experiência e não devem bloquear o progresso do jogo. Revise consentimento no menu da partida e leia as páginas de privacidade e cookies.',
          'Dúvidas: contato@brikaya.com. Editora: Ricardo Malnati. Site oficial: https://brikaya.com/.',
        ],
      },
    ],
  },
  en: {
    brand: 'Brikaya',
    headline: 'Free circuit arcade in your browser',
    lead:
      'Clear circuit components, advance levels, and play in the browser with progress saved on your device. After the first visit, the main game can keep working offline.',
    playCta: 'Play now',
    howToCta: 'How to play',
    faqCta: 'FAQ',
    downloadsCta: 'Install / download',
    updated: `Updated ${LANDING_LASTMOD}`,
    nav: [
      [PLAY_ROUTE_PATH, 'Play'],
      ['/how-to-play/', 'How to play'],
      ['/faq/', 'FAQ'],
      ['/updates/', 'Updates'],
      ['/downloads/', 'Downloads'],
      ['/about/', 'About'],
      ['/support/', 'Support'],
    ],
    sections: [
      {
        heading: 'What Brikaya is',
        paragraphs: [
          'Brikaya is a circuit-component arcade built for short sessions. You move an elastic bed, bounce the ball, and clear the board level by level without creating a player account.',
          'Scores, language, and preferences stay on the device in this version. There is no paid store and no personal-data form required to start playing.',
          'The goal is simple: clear components, survive denser patterns, and climb levels without losing rhythm. Each run fits into a few minutes and works well on phone or desktop.',
        ],
      },
      {
        heading: 'Why play here',
        paragraphs: [
          'Open it in the browser, follow the short tip, and continue when you are ready. If your device offers a browser install, you can keep a home-screen shortcut.',
          'Public guides explain controls, privacy, optional ads, and support. Use How to play, FAQ, and Updates before or after a run.',
          'After the first load, the main game can keep working offline. That reduces interruption and keeps attention on play instead of accounts or store downloads.',
        ],
      },
      {
        heading: 'How to start',
        paragraphs: [
          'Tap Play now to open the game at /play/. Accept consent screens when they appear, pick a language in the menu, and follow the opening tip.',
          'If you want to read first, open How to play for controls and level flow, or the FAQ for questions about progress, install, and optional ads.',
        ],
      },
      {
        heading: 'Privacy and contact',
        paragraphs: [
          'Ads, when available and allowed, stay optional for the experience and must not block game progress. Review consent in the game menu and read the privacy and cookies pages.',
          'Questions: contato@brikaya.com. Publisher: Ricardo Malnati. Official site: https://brikaya.com/.',
        ],
      },
    ],
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

function copyForLocale(locale) {
  if (String(locale).toLowerCase().startsWith('pt')) return COPY['pt-BR'];
  return COPY.en;
}

function legalLocalePrefix(locale) {
  const normalized = String(locale);
  const lower = normalized.toLowerCase();
  if (lower.startsWith('pt')) return '/pt-BR';
  if (lower === 'en' || lower.startsWith('en-')) return '';
  if (lower.startsWith('es')) return '/es-419';
  if (lower.startsWith('hi')) return '/hi-IN';
  if (normalized === 'zh-CN' || normalized === 'zh-TW') return `/${normalized}`;
  if (normalized === 'zh-HK') return '/zh-TW';
  return `/${normalized.split('-')[0]}`;
}

function localizedNavHref(locale, path) {
  if (path === PLAY_ROUTE_PATH || path === '/downloads/') {
    if (locale === 'pt-BR') return path;
    return `/${locale}${path}`;
  }
  if (path === '/how-to-play/' || path === '/faq/' || path === '/updates/') {
    if (String(locale).toLowerCase().startsWith('pt')) return `/pt-BR${path}`;
    return path;
  }
  if (path === '/about/' || path === '/support/') {
    return `${legalLocalePrefix(locale)}${path}`;
  }
  return path;
}

export function countLandingMainWords(locale) {
  const copy = copyForLocale(locale);
  const parts = [
    copy.brand,
    copy.headline,
    copy.lead,
    ...copy.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
  ];
  return parts.join(' ').split(/\s+/).filter(Boolean).length;
}

export function renderLandingPage({
  locale,
  canonicalUrl,
  alternateLinks,
  dir,
  title,
  description,
}) {
  const copy = copyForLocale(locale);
  const playHref = locale === 'pt-BR' ? PLAY_ROUTE_PATH : `/${locale}${PLAY_ROUTE_PATH}`;
  const howToHref = localizedNavHref(locale, '/how-to-play/');
  const faqHref = localizedNavHref(locale, '/faq/');
  const downloadsHref = locale === 'pt-BR' ? '/downloads/' : `/${locale}/downloads/`;

  const navHtml = copy.nav
    .map(([path, label]) => {
      const href =
        path === PLAY_ROUTE_PATH
          ? playHref
          : path === '/downloads/'
            ? downloadsHref
            : localizedNavHref(locale, path);
      return `          <a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
    })
    .join('\n');

  const sectionsHtml = copy.sections
    .map((section) => {
      const paragraphs = section.paragraphs
        .map((paragraph) => `        <p>${linkifyContact(escapeHtml(paragraph))}</p>`)
        .join('\n');
      return `      <section>\n        <h2>${escapeHtml(section.heading)}</h2>\n${paragraphs}\n      </section>`;
    })
    .join('\n\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
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
    dateModified: LANDING_LASTMOD,
  };

  return `<!-- generated landing by scripts/generate-localized-seo.mjs -->\n<!doctype html>\n<html lang="${escapeHtml(locale)}" dir="${escapeHtml(dir)}">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />\n    <link rel="manifest" href="/manifest.webmanifest" />\n    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />\n    <meta name="description" content="${escapeHtml(description)}" />\n    <meta property="og:type" content="website" />\n    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />\n    <meta property="og:title" content="${escapeHtml(title)}" />\n    <meta property="og:description" content="${escapeHtml(description)}" />\n    <meta property="og:image" content="https://brikaya.com/assets/visual/ui/ui-pwa-app-icon.svg" />\n    <meta name="twitter:card" content="summary" />\n    <meta name="twitter:title" content="${escapeHtml(title)}" />\n    <meta name="twitter:description" content="${escapeHtml(description)}" />\n    <meta name="twitter:image" content="https://brikaya.com/assets/visual/ui/ui-pwa-app-icon.svg" />\n    <meta name="robots" content="index,follow" />\n${alternateLinks}\n    <title>${escapeHtml(title)}</title>\n    <script type="application/ld+json">\n${escapeJsonForHtml(jsonLd)}\n    </script>\n    <style>${LANDING_CSS}\n    </style>\n  </head>\n  <body>\n    <main>\n      <header class="hero">\n        <p class="brand">${escapeHtml(copy.brand)}</p>\n        <h1 class="headline">${escapeHtml(copy.headline)}</h1>\n        <p class="lead">${escapeHtml(copy.lead)}</p>\n        <p class="updated">${escapeHtml(copy.updated)}</p>\n        <div class="cta-row">\n          <a class="cta cta-primary" href="${escapeHtml(playHref)}">${escapeHtml(copy.playCta)}</a>\n          <a class="cta cta-secondary" href="${escapeHtml(howToHref)}">${escapeHtml(copy.howToCta)}</a>\n          <a class="cta cta-secondary" href="${escapeHtml(faqHref)}">${escapeHtml(copy.faqCta)}</a>\n          <a class="cta cta-secondary" href="${escapeHtml(downloadsHref)}">${escapeHtml(copy.downloadsCta)}</a>\n        </div>\n        <nav class="site-nav" aria-label="Brikaya">\n${navHtml}\n        </nav>\n      </header>\n${sectionsHtml}\n    </main>\n  </body>\n</html>\n`;
}
