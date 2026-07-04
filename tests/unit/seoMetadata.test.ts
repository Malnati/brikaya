// tests/unit/seoMetadata.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const INDEX_HTML_PATH = 'index.html';
const ROBOTS_TXT_PATH = 'public/robots.txt';
const SITEMAP_XML_PATH = 'public/sitemap.xml';
const CANONICAL_URL = 'https://brikaya.com/';
const SITEMAP_URL = 'https://brikaya.com/sitemap.xml';
const SOCIAL_IMAGE_URL = 'https://brikaya.com/assets/visual/ui/ui-pwa-app-icon.svg';
const PORTUGUESE_LOCALE = 'pt-BR';
const DESCRIPTION_META_NAME = 'name="description"';
const CANONICAL_REL = 'rel="canonical"';
const OG_IMAGE_PROPERTY = 'property="og:image"';
const TWITTER_IMAGE_NAME = 'name="twitter:image"';
const SITEMAP_DIRECTIVE = `Sitemap: ${SITEMAP_URL}`;
const LOC_TAG = `<loc>${CANONICAL_URL}</loc>`;
const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';
const LOCALIZED_LOCALES = [
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
] as const;

function readProjectFile(filePath: string): string {
  return readFileSync(resolve(process.cwd(), filePath), 'utf8');
}

describe('metadados públicos de descoberta do Brikaya', () => {
  it('declara idioma, descrição e URL canônica no HTML principal', () => {
    const html = readProjectFile(INDEX_HTML_PATH);

    expect(html).toContain(`<html lang="${PORTUGUESE_LOCALE}">`);
    expect(html).toContain(DESCRIPTION_META_NAME);
    expect(html).toContain(CANONICAL_REL);
    expect(html).toContain(CANONICAL_URL);
    expect(html).toContain(OG_IMAGE_PROPERTY);
    expect(html).toContain(TWITTER_IMAGE_NAME);
    expect(html).toContain(SOCIAL_IMAGE_URL);
    for (const locale of LOCALIZED_LOCALES) {
      expect(html).toContain(`hreflang="${locale}"`);
    }
    expect(html).toContain('hreflang="x-default"');
  });

  it('publica robots.txt apontando para sitemap canônico', () => {
    const robots = readProjectFile(ROBOTS_TXT_PATH);

    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain(SITEMAP_DIRECTIVE);
  });

  it('publica sitemap XML mínimo com a URL canônica', () => {
    const sitemap = readProjectFile(SITEMAP_XML_PATH);

    expect(sitemap.startsWith(XML_DECLARATION)).toBe(true);
    expect(sitemap).toContain('http://www.sitemaps.org/schemas/sitemap/0.9');
    expect(sitemap).toContain(LOC_TAG);
    for (const locale of LOCALIZED_LOCALES) {
      const localizedUrl =
        locale === PORTUGUESE_LOCALE
          ? CANONICAL_URL
          : `https://brikaya.com/${locale}/`;
      expect(sitemap).toContain(`<loc>${localizedUrl}</loc>`);
    }
    expect(sitemap).not.toContain('.pages.dev');
  });
});
