// scripts/generate-localized-seo.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const DIST_DIR = 'dist';
const INDEX_FILE = 'index.html';
const SITEMAP_FILE = 'sitemap.xml';
const ROBOTS_FILE = 'robots.txt';
const CANONICAL_ORIGIN = 'https://brikaya.com';
const DEFAULT_LOCALE = 'pt-BR';
const LASTMOD = '2026-07-04';
const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const STATIC_PUBLIC_PATHS = ['/privacy/', '/terms/'];
const LOCALES = [
  'pt-BR',
  'en',
  'es-419',
  'en-IN',
  'hi-IN',
  'de',
  'fr',
  'it',
  'ja',
  'ko',
  'id',
  'vi',
  'fil',
  'th',
  'zh-CN',
];
const SEO = {
  'pt-BR': {
    title: 'Brikaya — arcade de quebrar blocos',
    description: 'Jogue Brikaya, um arcade gratuito de quebrar blocos no navegador, com progresso salvo no seu aparelho e partida disponível mesmo sem conexão depois do primeiro acesso.',
    ogDescription: 'Destrua blocos, avance fases e jogue no navegador com progresso salvo no seu aparelho.',
  },
  en: {
    title: 'Brikaya — block breaker arcade',
    description: 'Play Brikaya, a free block breaker arcade in your browser, with progress saved on your device and offline play after the first visit.',
    ogDescription: 'Break blocks, advance levels, and play in your browser with progress saved on your device.',
  },
  'es-419': {
    title: 'Brikaya — arcade de romper bloques',
    description: 'Juega Brikaya, un arcade gratuito de romper bloques en el navegador, con progreso guardado en tu dispositivo y juego sin conexión después del primer acceso.',
    ogDescription: 'Rompe bloques, avanza niveles y juega en el navegador con progreso guardado en tu dispositivo.',
  },
  'en-IN': {
    title: 'Brikaya — block breaker arcade for India',
    description: 'Play Brikaya in your browser, a free block breaker arcade with device-saved progress and offline play after the first visit.',
    ogDescription: 'Break blocks, clear levels, and keep playing in your browser with progress saved on your device.',
  },
  'hi-IN': {
    title: 'Brikaya — ब्लॉक ब्रेकर आर्केड',
    description: 'ब्राउज़र में Brikaya खेलें: मुफ्त ब्लॉक ब्रेकर आर्केड, प्रगति आपके डिवाइस पर सेव और पहले उपयोग के बाद ऑफ़लाइन खेल।',
    ogDescription: 'ब्लॉक तोड़ें, लेवल बढ़ाएँ और ब्राउज़र में खेलें, प्रगति आपके डिवाइस पर सेव रहती है।',
  },
  de: {
    title: 'Brikaya — Blockbreaker-Arcade',
    description: 'Spiele Brikaya, ein kostenloses Blockbreaker-Arcade im Browser, mit lokal gespeichertem Fortschritt und Offline-Spiel nach dem ersten Besuch.',
    ogDescription: 'Zerstöre Blöcke, steige Level auf und spiele im Browser mit lokal gespeichertem Fortschritt.',
  },
  fr: {
    title: 'Brikaya — arcade casse-briques',
    description: 'Jouez à Brikaya, un arcade casse-briques gratuit dans le navigateur, avec progression enregistrée sur votre appareil et jeu hors connexion après la première visite.',
    ogDescription: "Cassez des blocs, progressez dans les niveaux et jouez dans le navigateur avec votre progression enregistrée sur l'appareil.",
  },
  it: {
    title: 'Brikaya — arcade rompi blocchi',
    description: 'Gioca a Brikaya, un arcade gratuito rompi blocchi nel browser, con progressi salvati sul dispositivo e gioco offline dopo il primo accesso.',
    ogDescription: 'Rompi blocchi, supera livelli e gioca nel browser con progressi salvati sul dispositivo.',
  },
  ja: {
    title: 'Brikaya — ブロック崩しアーケード',
    description: 'ブラウザで無料のブロック崩しアーケード Brikaya をプレイ。進行状況は端末に保存され、初回アクセス後はオフラインでも遊べます。',
    ogDescription: 'ブロックを壊し、レベルを進め、進行状況を端末に保存してブラウザで遊べます。',
  },
  ko: {
    title: 'Brikaya — 블록 브레이커 아케이드',
    description: '브라우저에서 무료 블록 브레이커 아케이드 Brikaya를 플레이하세요. 진행 상황은 기기에 저장되고 첫 방문 후 오프라인으로도 플레이할 수 있습니다.',
    ogDescription: '블록을 깨고 레벨을 진행하며 기기에 저장된 진행 상황으로 브라우저에서 플레이하세요.',
  },
  id: {
    title: 'Brikaya — arkade pemecah blok',
    description: 'Mainkan Brikaya, arkade pemecah blok gratis di browser, dengan progres tersimpan di perangkat dan permainan offline setelah kunjungan pertama.',
    ogDescription: 'Pecahkan blok, naik level, dan main di browser dengan progres tersimpan di perangkat.',
  },
  vi: {
    title: 'Brikaya — arcade phá khối',
    description: 'Chơi Brikaya, trò arcade phá khối miễn phí trên trình duyệt, lưu tiến trình trên thiết bị và chơi ngoại tuyến sau lần truy cập đầu tiên.',
    ogDescription: 'Phá khối, vượt màn và chơi trong trình duyệt với tiến trình lưu trên thiết bị.',
  },
  fil: {
    title: 'Brikaya — block breaker arcade',
    description: 'Maglaro ng Brikaya, libreng block breaker arcade sa browser, may progreso na naka-save sa device at puwedeng laruin offline pagkatapos ng unang bisita.',
    ogDescription: 'Basagin ang blocks, umakyat ng antas, at maglaro sa browser habang naka-save ang progreso sa device.',
  },
  th: {
    title: 'Brikaya — อาร์เคดทำลายบล็อก',
    description: 'เล่น Brikaya เกมอาร์เคดทำลายบล็อกฟรีบนเบราว์เซอร์ บันทึกความคืบหน้าในอุปกรณ์และเล่นออฟไลน์ได้หลังเข้าใช้งานครั้งแรก',
    ogDescription: 'ทำลายบล็อก ผ่านด่าน และเล่นในเบราว์เซอร์พร้อมบันทึกความคืบหน้าไว้ในอุปกรณ์',
  },
  'zh-CN': {
    title: 'Brikaya — 打砖块街机',
    description: '在浏览器中游玩免费的打砖块街机 Brikaya，进度保存在你的设备上，首次访问后可离线游玩。',
    ogDescription: '击碎砖块、推进关卡，并在浏览器中保存进度继续游玩。',
  },
};

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function localePath(locale) {
  return locale === DEFAULT_LOCALE ? '/' : `/${locale}/`;
}

function canonicalUrl(locale) {
  return `${CANONICAL_ORIGIN}${localePath(locale)}`;
}

function hreflangLinks() {
  return [
    ...LOCALES.map((locale) =>
      `    <link rel="alternate" hreflang="${locale}" href="${canonicalUrl(locale)}" />`,
    ),
    `    <link rel="alternate" hreflang="x-default" href="${canonicalUrl(DEFAULT_LOCALE)}" />`,
  ].join('\n');
}

function replaceOrInsertHead(html, locale) {
  const metadata = SEO[locale];
  const canonical = canonicalUrl(locale);
  return html
    .replaceAll('href="./manifest.webmanifest"', 'href="/manifest.webmanifest"')
    .replaceAll('href="./assets/', 'href="/assets/')
    .replaceAll('src="./assets/', 'src="/assets/')
    .replace(/<html lang="[^"]+">/, `<html lang="${locale}">`)
    .replace(/<link rel="canonical" href="[^"]+" \/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeXml(metadata.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeXml(metadata.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeXml(metadata.ogDescription)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeXml(metadata.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeXml(metadata.ogDescription)}" />`)
    .replace(/<title>.*<\/title>/, `<title>${escapeXml(metadata.title)}</title>`)
    .replace(/(?:\n    <link rel="alternate" hreflang="[^"]+" href="[^"]+" \/>)+/, '')
    .replace('    <meta name="theme-color"', `${hreflangLinks()}\n    <meta name="theme-color"`);
}

function buildSitemap() {
  const localizedUrls = LOCALES.map((locale) => [
    '  <url>',
    `    <loc>${canonicalUrl(locale)}</loc>`,
    `    <lastmod>${LASTMOD}</lastmod>`,
    '  </url>',
  ].join('\n')).join('\n');
  const staticUrls = STATIC_PUBLIC_PATHS.map((path) => [
    '  <url>',
    `    <loc>${CANONICAL_ORIGIN}${path}</loc>`,
    `    <lastmod>${LASTMOD}</lastmod>`,
    '  </url>',
  ].join('\n')).join('\n');
  const urls = `${localizedUrls}\n${staticUrls}`;
  return `${XML_HEADER}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function writeFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function run() {
  const distRoot = resolve(process.cwd(), DIST_DIR);
  const rootIndexPath = join(distRoot, INDEX_FILE);
  const baseHtml = readFileSync(rootIndexPath, 'utf8');

  for (const locale of LOCALES) {
    const localizedHtml = replaceOrInsertHead(baseHtml, locale);
    const outputPath = locale === DEFAULT_LOCALE
      ? rootIndexPath
      : join(distRoot, locale, INDEX_FILE);
    writeFile(outputPath, localizedHtml);
  }

  writeFile(join(distRoot, SITEMAP_FILE), buildSitemap());
  writeFile(join(distRoot, ROBOTS_FILE), `User-agent: *\nAllow: /\n\nSitemap: ${CANONICAL_ORIGIN}/sitemap.xml\n`);
  console.log(`localized-seo ok: locales=${LOCALES.length}`);
}

run();
