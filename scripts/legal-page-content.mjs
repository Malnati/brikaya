// scripts/legal-page-content.mjs
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EDITORIAL_PATHS } from './editorial-page-content.mjs';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const TRANSLATIONS_PATH = join(MODULE_DIR, 'legal-page-translations.json');

export const LEGAL_DEFAULT_LOCALE = 'en-US';
export const LEGAL_LASTMOD = '2026-07-07';
export const LEGAL_PATHS = [
  '/about/',
  '/legal/',
  '/privacy/',
  '/terms/',
  '/user-agreement/',
  '/license/',
  '/data-deletion/',
  '/cookies/',
  '/support/',
];

export const LEGAL_TEXT = {
  'nav.play': 'Play',
  'nav.about': 'About',
  'nav.legal': 'Legal',
  'nav.privacy': 'Privacy',
  'nav.terms': 'Terms',
  'nav.dataDeletion': 'Data deletion',
  'nav.support': 'Support',
  'nav.howToPlay': 'How to play',
  'nav.faq': 'FAQ',
  'nav.updates': 'Updates',
  'nav.backToGame': 'Back to the game',
  'common.updated': 'Last updated',
  'common.contactHeading': 'Official contact',
  'common.contactBody': 'Use contato@brikaya.com for privacy, support, rights, data deletion, and use questions.',
  'common.platformReadyHeading': 'Platform readiness',
  'common.platformReadyBody': 'These pages give players, search engines, and review teams stable public links for Brikaya.',
  'common.legalReviewBody': 'They are operational product pages and do not replace advice from a qualified legal professional.',
  'link.privacy.title': 'Privacy',
  'link.privacy.body': 'Game data, consent, ads, and controls.',
  'link.terms.title': 'Terms',
  'link.terms.body': 'Free use, game rules, and availability.',
  'link.userAgreement.title': 'User agreement',
  'link.userAgreement.body': 'Clear agreement for using Brikaya.',
  'link.license.title': 'License',
  'link.license.body': 'Reserved rights and permitted use.',
  'link.dataDeletion.title': 'Data deletion',
  'link.dataDeletion.body': 'How to erase local data and ask for help.',
  'link.cookies.title': 'Cookies and ads',
  'link.cookies.body': 'How the browser and ads may save choices.',
  'link.support.title': 'Support',
  'link.support.body': 'Contact for help, privacy, and safety.',
  'link.about.title': 'About',
  'link.about.body': 'Game summary and commitment to free access.',
  'link.howToPlay.title': 'How to play',
  'link.howToPlay.body': 'Controls, scoring, and offline play guide.',
  'link.faq.title': 'FAQ',
  'link.faq.body': 'Free play, privacy, install, and support answers.',
  'link.updates.title': 'Updates',
  'link.updates.body': 'Design notes and product update log.',
  'about.title': 'About Brikaya',
  'about.description': 'About Brikaya, a free offline-first arcade game published at brikaya.com.',
  'about.h1': 'About Brikaya',
  'about.lead': 'Brikaya is a free arcade game made for quick play, offline access, and simple privacy choices.',
  'about.s1.heading': 'What the game is',
  'about.s1.body1': 'Brikaya is a free circuit component arcade game in your browser. It runs as a web app and can work offline after the first load.',
  'about.s1.body2': 'The game does not require a player account. Scores, preferences, and progress stay on the device unless a future version clearly says otherwise.',
  'about.s2.heading': 'Free access',
  'about.s2.body1': 'Brikaya is offered for free. Optional ads may appear only when they are available and allowed, and they must not block gameplay progress.',
  'about.s2.body2': 'Any future store, payment, or account feature must be described before it is used.',
  'about.s3.heading': 'Publisher',
  'about.s3.body1': 'Brikaya is published by Ricardo Malnati. The official site is https://brikaya.com/.',
  'about.s4.heading': 'Player guides',
  'about.s4.body1': 'Read How to play for controls and scoring, the FAQ for free play and privacy answers, and Updates for design notes. Those guides are available in English and Brazilian Portuguese.',

  'legal.title': 'Legal — Brikaya',
  'legal.description': 'Brikaya legal center with privacy, terms, user agreement, license, support, cookies, and data deletion.',
  'legal.h1': 'Legal and trust',
  'legal.lead': 'Official links for rules, privacy, support, and rights for Brikaya.',
  'legal.s1.heading': 'Use of these pages',
  'legal.s1.body1': 'These pages were prepared so players, search engines, and platforms can find public information about Brikaya at stable addresses.',
  'legal.s1.body2': 'When a material game feature changes, these pages should be reviewed and updated.',

  'privacy.title': 'Privacy policy — Brikaya',
  'privacy.description': 'Brikaya privacy policy: game data stays on the device, approximate region is optional, and ads may depend on consent.',
  'privacy.h1': 'Privacy policy',
  'privacy.lead': 'This page explains what information Brikaya uses, why it is used, and how you control it.',
  'privacy.s1.heading': 'No player account',
  'privacy.s1.body1': 'This version of Brikaya does not require a player account, sign-in, or profile to play.',
  'privacy.s1.body2': 'Scores, preferences, language choices, consent choices, and local game records are stored on your device.',
  'privacy.s2.heading': 'Approximate region and language',
  'privacy.s2.body1': 'Brikaya may suggest language or region settings from browser information or a broad time zone. This is used to make the game easier to start.',
  'privacy.s2.body2': 'You can change the language and review region consent in the game menu.',
  'privacy.s3.heading': 'Ads and consent',
  'privacy.s3.body1': 'If ads are available, they may use consent choices and browser signals required by advertising rules.',
  'privacy.s3.body2': 'Ads must be optional for the game experience and must not remove access to play.',
  'privacy.s4.heading': 'Contact and rights',
  'privacy.s4.body1': 'For privacy questions or requests, contact contato@brikaya.com. Include the page or device context needed to understand the request.',

  'terms.title': 'Terms of use — Brikaya',
  'terms.description': 'Brikaya terms of use for free play, fair use, availability, support, and legal limits.',
  'terms.h1': 'Terms of use',
  'terms.lead': 'By using Brikaya, you agree to use the game fairly and follow these terms.',
  'terms.s1.heading': 'Use of the game',
  'terms.s1.body1': 'You may play Brikaya for personal entertainment. Do not misuse the game, interfere with access, or attempt to harm other users or the service.',
  'terms.s1.body2': 'Do not copy, sell, repackage, or publish the game or its assets without written permission.',
  'terms.s2.heading': 'Free access and ads',
  'terms.s2.body1': 'The game is free to access. Optional ads may appear if they are approved and available.',
  'terms.s2.body2': 'No ad or promotional feature should require payment from the player to keep playing this version.',
  'terms.s3.heading': 'Availability',
  'terms.s3.body1': 'Brikaya is provided as available. The game may change, pause, or remove features to improve safety, compatibility, or compliance.',
  'terms.s4.heading': 'Support',
  'terms.s4.body1': 'For support, contact contato@brikaya.com with a clear description of the issue.',

  'userAgreement.title': 'User agreement — Brikaya',
  'userAgreement.description': 'Brikaya user agreement covering acceptance, player conduct, local data, and updates.',
  'userAgreement.h1': 'User agreement',
  'userAgreement.lead': 'This agreement explains the basic rules for using Brikaya.',
  'userAgreement.s1.heading': 'Acceptance',
  'userAgreement.s1.body1': 'You accept this agreement when you access, install, or play Brikaya.',
  'userAgreement.s1.body2': 'If you do not agree, stop using the game and remove any saved copy from your device.',
  'userAgreement.s2.heading': 'Player conduct',
  'userAgreement.s2.body1': 'Use Brikaya in a way that is lawful, respectful, and does not disrupt the game or public site.',
  'userAgreement.s3.heading': 'Local data',
  'userAgreement.s3.body1': 'The game may save scores, settings, and consent choices locally on your device. You can clear this data from the game menu or browser settings.',
  'userAgreement.s4.heading': 'Updates',
  'userAgreement.s4.body1': 'The agreement may be updated when the game changes. The latest version appears on this page.',

  'license.title': 'License — Brikaya',
  'license.description': 'Brikaya license notice: proprietary game, reserved rights, and permitted personal play.',
  'license.h1': 'License',
  'license.lead': 'This page explains what you may do with Brikaya and what remains reserved.',
  'license.s1.heading': 'Personal play license',
  'license.s1.body1': 'You may access and play Brikaya for personal entertainment through the official site.',
  'license.s1.body2': 'This permission does not transfer ownership of the game, brand, code, artwork, audio, or other content.',
  'license.s2.heading': 'Reserved rights',
  'license.s2.body1': 'Brikaya and its assets are proprietary. All rights not expressly allowed are reserved by Ricardo Malnati.',
  'license.s3.heading': 'No redistribution',
  'license.s3.body1': 'Do not copy, modify, sell, sublicense, upload, or redistribute Brikaya or its assets without written permission.',
  'license.s4.heading': 'Open web access',
  'license.s4.body1': 'Links to https://brikaya.com/ are welcome when they point to the official game and do not imply endorsement.',

  'dataDeletion.title': 'Data deletion — Brikaya',
  'dataDeletion.description': 'How to delete Brikaya local data and request help with privacy or data deletion.',
  'dataDeletion.h1': 'Data deletion',
  'dataDeletion.lead': 'Brikaya does not use player accounts in this version. Most game data is stored locally on your device.',
  'dataDeletion.s1.heading': 'Delete local game data',
  'dataDeletion.s1.body1': 'Open the game menu and use the restore defaults option to clear local scores, records, history, and preferences on that device.',
  'dataDeletion.s1.body2': 'You can also clear site data for brikaya.com in your browser settings.',
  'dataDeletion.s2.heading': 'Request help',
  'dataDeletion.s2.body1': 'If you need help with a privacy or deletion request, contact contato@brikaya.com.',
  'dataDeletion.s2.body2': 'Because the game does not create an online account, include only the information needed to understand the request.',
  'dataDeletion.s3.heading': 'Future account features',
  'dataDeletion.s3.body1': 'If Brikaya adds account features in the future, this page will be updated with the account deletion path before that feature is used.',

  'cookies.title': 'Cookies and ads — Brikaya',
  'cookies.description': 'Brikaya cookies and ads notice explaining local storage, consent choices, and optional advertising.',
  'cookies.h1': 'Cookies and ads',
  'cookies.lead': 'This page explains how the browser may save Brikaya choices and how ads may work.',
  'cookies.s1.heading': 'Local storage',
  'cookies.s1.body1': 'Brikaya may use browser storage to remember scores, settings, language, consent choices, and offline game files.',
  'cookies.s1.body2': 'This helps the game load faster and work offline after the first load.',
  'cookies.s2.heading': 'Cookies',
  'cookies.s2.body1': 'The core game does not require a player account cookie. Browser or platform features may still use storage needed for security, consent, or ads.',
  'cookies.s3.heading': 'Advertising',
  'cookies.s3.body1': 'If ads are active, they may rely on consent and browser choices. You can review privacy choices in the game menu or browser settings.',
  'cookies.s4.heading': 'Clear choices',
  'cookies.s4.body1': 'Use restore defaults in the game or clear site data for brikaya.com in your browser settings to reset local choices.',

  'support.title': 'Support — Brikaya',
  'support.description': 'Official Brikaya support contact for help, privacy, safety, data deletion, and rights questions.',
  'support.h1': 'Support',
  'support.lead': 'Use this page to contact Brikaya about help, privacy, safety, rights, and data requests.',
  'support.s1.heading': 'Contact',
  'support.s1.body1': 'Email contato@brikaya.com with a clear subject and a short description of the issue.',
  'support.s1.body2': 'Do not send passwords, payment data, or unnecessary personal documents.',
  'support.s2.heading': 'What to include',
  'support.s2.body1': 'Include the page, device type, browser, and steps that led to the issue when that helps explain the request.',
  'support.s3.heading': 'Safety and rights',
  'support.s3.body1': 'Use the same contact for privacy questions, data deletion help, rights questions, or safety concerns.',
};

export const LEGAL_PAGE_DEFINITIONS = {
  '/about/': {
    key: 'about',
    titleId: 'about.title',
    descriptionId: 'about.description',
    h1Id: 'about.h1',
    leadId: 'about.lead',
    sections: [
      ['about.s1.heading', ['about.s1.body1', 'about.s1.body2']],
      ['about.s2.heading', ['about.s2.body1', 'about.s2.body2']],
      ['about.s3.heading', ['about.s3.body1']],
      ['about.s4.heading', ['about.s4.body1']],
    ],
  },
  '/legal/': {
    key: 'legal',
    titleId: 'legal.title',
    descriptionId: 'legal.description',
    h1Id: 'legal.h1',
    leadId: 'legal.lead',
    showLinkGrid: true,
    sections: [
      ['legal.s1.heading', ['legal.s1.body1', 'legal.s1.body2']],
      ['common.contactHeading', ['common.contactBody']],
    ],
  },
  '/privacy/': {
    key: 'privacy',
    titleId: 'privacy.title',
    descriptionId: 'privacy.description',
    h1Id: 'privacy.h1',
    leadId: 'privacy.lead',
    sections: [
      ['privacy.s1.heading', ['privacy.s1.body1', 'privacy.s1.body2']],
      ['privacy.s2.heading', ['privacy.s2.body1', 'privacy.s2.body2']],
      ['privacy.s3.heading', ['privacy.s3.body1', 'privacy.s3.body2']],
      ['privacy.s4.heading', ['privacy.s4.body1']],
    ],
  },
  '/terms/': {
    key: 'terms',
    titleId: 'terms.title',
    descriptionId: 'terms.description',
    h1Id: 'terms.h1',
    leadId: 'terms.lead',
    sections: [
      ['terms.s1.heading', ['terms.s1.body1', 'terms.s1.body2']],
      ['terms.s2.heading', ['terms.s2.body1', 'terms.s2.body2']],
      ['terms.s3.heading', ['terms.s3.body1']],
      ['terms.s4.heading', ['terms.s4.body1']],
    ],
  },
  '/user-agreement/': {
    key: 'userAgreement',
    titleId: 'userAgreement.title',
    descriptionId: 'userAgreement.description',
    h1Id: 'userAgreement.h1',
    leadId: 'userAgreement.lead',
    sections: [
      ['userAgreement.s1.heading', ['userAgreement.s1.body1', 'userAgreement.s1.body2']],
      ['userAgreement.s2.heading', ['userAgreement.s2.body1']],
      ['userAgreement.s3.heading', ['userAgreement.s3.body1']],
      ['userAgreement.s4.heading', ['userAgreement.s4.body1']],
    ],
  },
  '/license/': {
    key: 'license',
    titleId: 'license.title',
    descriptionId: 'license.description',
    h1Id: 'license.h1',
    leadId: 'license.lead',
    sections: [
      ['license.s1.heading', ['license.s1.body1', 'license.s1.body2']],
      ['license.s2.heading', ['license.s2.body1']],
      ['license.s3.heading', ['license.s3.body1']],
      ['license.s4.heading', ['license.s4.body1']],
    ],
  },
  '/data-deletion/': {
    key: 'dataDeletion',
    titleId: 'dataDeletion.title',
    descriptionId: 'dataDeletion.description',
    h1Id: 'dataDeletion.h1',
    leadId: 'dataDeletion.lead',
    sections: [
      ['dataDeletion.s1.heading', ['dataDeletion.s1.body1', 'dataDeletion.s1.body2']],
      ['dataDeletion.s2.heading', ['dataDeletion.s2.body1', 'dataDeletion.s2.body2']],
      ['dataDeletion.s3.heading', ['dataDeletion.s3.body1']],
    ],
  },
  '/cookies/': {
    key: 'cookies',
    titleId: 'cookies.title',
    descriptionId: 'cookies.description',
    h1Id: 'cookies.h1',
    leadId: 'cookies.lead',
    sections: [
      ['cookies.s1.heading', ['cookies.s1.body1', 'cookies.s1.body2']],
      ['cookies.s2.heading', ['cookies.s2.body1']],
      ['cookies.s3.heading', ['cookies.s3.body1']],
      ['cookies.s4.heading', ['cookies.s4.body1']],
    ],
  },
  '/support/': {
    key: 'support',
    titleId: 'support.title',
    descriptionId: 'support.description',
    h1Id: 'support.h1',
    leadId: 'support.lead',
    sections: [
      ['support.s1.heading', ['support.s1.body1', 'support.s1.body2']],
      ['support.s2.heading', ['support.s2.body1']],
      ['support.s3.heading', ['support.s3.body1']],
    ],
  },
};

const LINK_GRID_ITEMS = [
  ['/how-to-play/', 'link.howToPlay.title', 'link.howToPlay.body'],
  ['/faq/', 'link.faq.title', 'link.faq.body'],
  ['/updates/', 'link.updates.title', 'link.updates.body'],
  ['/privacy/', 'link.privacy.title', 'link.privacy.body'],
  ['/terms/', 'link.terms.title', 'link.terms.body'],
  ['/user-agreement/', 'link.userAgreement.title', 'link.userAgreement.body'],
  ['/license/', 'link.license.title', 'link.license.body'],
  ['/data-deletion/', 'link.dataDeletion.title', 'link.dataDeletion.body'],
  ['/cookies/', 'link.cookies.title', 'link.cookies.body'],
  ['/support/', 'link.support.title', 'link.support.body'],
  ['/about/', 'link.about.title', 'link.about.body'],
];

const LEGAL_NAV_ITEMS = [
  ['/play/', 'nav.play'],
  ['/how-to-play/', 'nav.howToPlay'],
  ['/faq/', 'nav.faq'],
  ['/about/', 'nav.about'],
  ['/legal/', 'nav.legal'],
  ['/privacy/', 'nav.privacy'],
  ['/terms/', 'nav.terms'],
  ['/data-deletion/', 'nav.dataDeletion'],
  ['/support/', 'nav.support'],
];

const LEGAL_TRANSLATION_FILE = existsSync(TRANSLATIONS_PATH)
  ? JSON.parse(readFileSync(TRANSLATIONS_PATH, 'utf8'))
  : { translations: {} };

const LEGAL_TRANSLATIONS = LEGAL_TRANSLATION_FILE.translations ?? LEGAL_TRANSLATION_FILE;

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

export function legalText(locale, id) {
  return LEGAL_TRANSLATIONS[locale]?.[id] ?? LEGAL_TEXT[id] ?? id;
}

export function legalTranslationLocales() {
  return Object.keys(LEGAL_TRANSLATIONS).sort();
}

export function legalTranslationMissingIds(locale, ids = Object.keys(LEGAL_TEXT)) {
  if (locale === LEGAL_DEFAULT_LOCALE) return [];
  const pack = LEGAL_TRANSLATIONS[locale] ?? {};
  return ids.filter((id) => !pack[id]);
}

export function legalPageIds() {
  return Object.keys(LEGAL_TEXT);
}

export function renderLegalPage({ locale, path, canonicalUrl, alternateLinks, dir, localizedPath }) {
  const page = LEGAL_PAGE_DEFINITIONS[path];
  if (!page) throw new Error(`unknown legal page path: ${path}`);

  const title = legalText(locale, page.titleId);
  const description = legalText(locale, page.descriptionId);
  const h1 = legalText(locale, page.h1Id);
  const lead = legalText(locale, page.leadId);
  const updatedLabel = `${legalText(locale, 'common.updated')}: ${LEGAL_LASTMOD}`;
  const backLabel = legalText(locale, 'nav.backToGame');

  const navHtml = LEGAL_NAV_ITEMS.map(([itemPath, labelId]) => {
    const href = itemPath === '/' ? '/' : resolvePublicNavHref(locale, itemPath, localizedPath);
    return `          <a href="${escapeHtml(href)}">${escapeHtml(legalText(locale, labelId))}</a>`;
  }).join('\n');

  const linkGridHtml = page.showLinkGrid
    ? `      <div class="link-grid">\n${LINK_GRID_ITEMS.map(([itemPath, titleId, bodyId]) => `        <a class="link-card" href="${escapeHtml(resolvePublicNavHref(locale, itemPath, localizedPath))}">\n          <strong>${escapeHtml(legalText(locale, titleId))}</strong>\n          <span>${escapeHtml(legalText(locale, bodyId))}</span>\n        </a>`).join('\n')}\n      </div>\n`
    : '';

  const sectionsHtml = page.sections.map(([headingId, paragraphIds], index) => {
    const paragraphs = paragraphIds
      .map((id) => `        <p>${linkifyContact(escapeHtml(legalText(locale, id)))}</p>`)
      .join('\n');
    const className = index === 0 ? ' class="note"' : '';
    return `      <section${className}>\n        <h2>${escapeHtml(legalText(locale, headingId))}</h2>\n${paragraphs}\n      </section>`;
  }).join('\n\n');

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
    dateModified: LEGAL_LASTMOD,
  };

  return `<!-- generated by scripts/generate-localized-seo.mjs -->\n<!doctype html>\n<html lang="${escapeHtml(locale)}" dir="${escapeHtml(dir)}">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />\n    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />\n    <meta name="description" content="${escapeHtml(description)}" />\n    <meta property="og:type" content="website" />\n    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />\n    <meta property="og:title" content="${escapeHtml(title)}" />\n    <meta property="og:description" content="${escapeHtml(description)}" />\n    <meta name="twitter:card" content="summary" />\n    <meta name="twitter:title" content="${escapeHtml(title)}" />\n    <meta name="twitter:description" content="${escapeHtml(description)}" />\n    <meta name="robots" content="index,follow" />\n${alternateLinks}\n    <title>${escapeHtml(title)}</title>\n    <script type="application/ld+json">\n${escapeJsonForHtml(jsonLd)}\n    </script>\n    <style>${LEGAL_PAGE_CSS}\n    </style>\n  </head>\n  <body>\n    <main>\n      <p class="top-link"><a href="/play/">${escapeHtml(backLabel)}</a></p>\n      <header>\n        <h1>${escapeHtml(h1)}</h1>\n        <p class="lead">${escapeHtml(lead)}</p>\n        <p class="updated">${escapeHtml(updatedLabel)}</p>\n        <nav aria-label="Brikaya">\n${navHtml}\n        </nav>\n      </header>\n${linkGridHtml}${sectionsHtml}\n    </main>\n  </body>\n</html>\n`;
}

function linkifyContact(html) {
  return html.replaceAll(
    'contato@brikaya.com',
    '<a href="mailto:contato@brikaya.com">contato@brikaya.com</a>',
  );
}

function resolvePublicNavHref(locale, itemPath, localizedPath) {
  if (itemPath === '/') return '/';
  if (itemPath === '/play/') {
    if (locale === LEGAL_DEFAULT_LOCALE || locale === 'pt-BR') return '/play/';
    return `/${locale}/play/`;
  }
  if (EDITORIAL_PATHS.includes(itemPath)) {
    const editorialLocale = String(locale).toLowerCase().startsWith('pt') ? 'pt-BR' : 'en-US';
    return editorialLocale === 'en-US' ? itemPath : `/${editorialLocale}${itemPath}`;
  }
  return localizedPath(locale, itemPath);
}

const LEGAL_PAGE_CSS = `
      :root {
        color-scheme: dark;
        --bg: #080816;
        --panel: #11142a;
        --panel-strong: #181c38;
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
      h1, h2, h3 { line-height: 1.1; }
      h1 {
        margin: 0;
        font-size: clamp(2.2rem, 6vw, 4.4rem);
        letter-spacing: -0.05em;
      }
      h2 {
        margin-top: 0;
        font-size: clamp(1.45rem, 3vw, 2rem);
      }
      h3 { margin-top: 28px; }
      p, li { color: var(--muted); line-height: 1.65; }
      strong { color: var(--text); }
      .lead {
        margin: 18px 0 0;
        font-size: 1.1rem;
      }
      .updated {
        margin: 14px 0 0;
        color: var(--accent-strong);
        font-size: 0.92rem;
      }
      section,
      .link-grid {
        margin-top: 24px;
        padding: 28px;
        border: 1px solid var(--border);
        border-radius: 24px;
        background: rgba(17, 20, 42, 0.62);
      }
      .link-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 14px;
        padding: 0;
        border: 0;
        background: transparent;
      }
      .link-card {
        display: block;
        padding: 20px;
        min-height: 120px;
        border: 1px solid var(--border);
        border-radius: 22px;
        text-decoration: none;
        background: rgba(24, 28, 56, 0.72);
      }
      .link-card strong { display: block; margin-bottom: 8px; }
      .link-card span { color: var(--muted); line-height: 1.45; }
      nav {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 28px;
      }
      nav a {
        padding: 10px 14px;
        border: 1px solid var(--border);
        border-radius: 999px;
        text-decoration: none;
        background: rgba(124, 244, 255, 0.08);
      }
      .note {
        border-left: 4px solid var(--accent);
      }
      @media (max-width: 640px) {
        main { padding-top: 28px; }
        header, section { padding: 22px; border-radius: 22px; }
        nav a { width: 100%; }
      }
`;
