// tests/unit/seoMetadata.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const INDEX_HTML_PATH = 'index.html';
const ROBOTS_TXT_PATH = 'public/robots.txt';
const SITEMAP_XML_PATH = 'public/sitemap.xml';
const CANONICAL_URL = 'https://brikaya.com/';
const SITEMAP_URL = 'https://brikaya.com/sitemap.xml';
const PORTUGUESE_LOCALE = 'pt-BR';
const DESCRIPTION_META_NAME = 'name="description"';
const CANONICAL_REL = 'rel="canonical"';
const SITEMAP_DIRECTIVE = `Sitemap: ${SITEMAP_URL}`;
const LOC_TAG = `<loc>${CANONICAL_URL}</loc>`;
const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';

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
    expect(sitemap).not.toContain('.pages.dev');
  });
});
