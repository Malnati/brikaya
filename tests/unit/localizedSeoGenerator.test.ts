// tests/unit/localizedSeoGenerator.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GENERATOR_PATH = 'scripts/generate-localized-seo.mjs';
const RELATIVE_MANIFEST_PATTERN = 'href="./manifest.webmanifest"';
const ABSOLUTE_MANIFEST_PATTERN = 'href="/manifest.webmanifest"';
const RELATIVE_ASSET_HREF_PATTERN = 'href="./assets/';
const ABSOLUTE_ASSET_HREF_PATTERN = 'href="/assets/';
const RELATIVE_ASSET_SRC_PATTERN = 'src="./assets/';
const ABSOLUTE_ASSET_SRC_PATTERN = 'src="/assets/';

function readProjectFile(filePath: string): string {
  return readFileSync(resolve(process.cwd(), filePath), 'utf8');
}

describe('gerador SEO localizado', () => {
  it('converte assets relativos do Vite em paths absolutos para rotas aninhadas', () => {
    const generator = readProjectFile(GENERATOR_PATH);

    expect(generator).toContain(RELATIVE_MANIFEST_PATTERN);
    expect(generator).toContain(ABSOLUTE_MANIFEST_PATTERN);
    expect(generator).toContain(RELATIVE_ASSET_HREF_PATTERN);
    expect(generator).toContain(ABSOLUTE_ASSET_HREF_PATTERN);
    expect(generator).toContain(RELATIVE_ASSET_SRC_PATTERN);
    expect(generator).toContain(ABSOLUTE_ASSET_SRC_PATTERN);
  });
});
