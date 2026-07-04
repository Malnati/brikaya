// tests/unit/cloudflarePagesPublicIndex.test.ts
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const OUTPUT_DIR_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_OUTPUT_DIR';
const CUSTOM_DOMAIN_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_CUSTOM_DOMAIN';
const TEST_OUTPUT_DIR = 'dist';
const TEST_TITLE = 'Brikaya — arcade de quebrar blocos';
const TEST_SCRIPT = 'assets/index-BWyDg29g.js';
const TEST_STYLE = 'assets/index-DTNZft6S.css';
const TEST_CUSTOM_DOMAIN = 'brikaya.com';
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_STALE = 503;
const PUBLIC_INDEX_CHECK_PARAM = 'qaPublicIndexCheck';

function runCloudflarePagesExpression<T>(
  expression: string,
  cwd = process.cwd(),
): T {
  const moduleUrl = pathToFileURL(
    resolve(process.cwd(), 'scripts/cloudflare-pages.js'),
  ).href;
  const code = `
    const { __testables } = await import(${JSON.stringify(moduleUrl)});
    const result = ${expression};
    console.log(JSON.stringify(result));
  `;
  const stdout = execFileSync(process.execPath, ['--input-type=module', '-e', code], {
    cwd,
    encoding: 'utf8',
  });

  return JSON.parse(stdout) as T;
}

function writeIndexHtml(rootPath: string, body: string) {
  const distPath = join(rootPath, TEST_OUTPUT_DIR);
  mkdirSync(distPath, { recursive: true });
  writeFileSync(join(distPath, 'index.html'), body);
}

describe('cloudflare-pages public index verification', () => {
  const originalCwd = process.cwd();
  let tempRoot: string;

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), 'brikaya-public-index-'));
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('extrai título e bundles locais esperados do index.html gerado', async () => {
    writeIndexHtml(
      tempRoot,
      `<!doctype html><html><head><title>${TEST_TITLE}</title><script type="module" src="/${TEST_SCRIPT}"></script><link rel="stylesheet" href="/${TEST_STYLE}"></head></html>`,
    );
    expect(
      runCloudflarePagesExpression(
        `__testables.readLocalPublicIndexExpectation(${JSON.stringify({
          [OUTPUT_DIR_KEY]: TEST_OUTPUT_DIR,
        })})`,
        tempRoot,
      ),
    ).toEqual({
      title: TEST_TITLE,
      script: TEST_SCRIPT,
      style: TEST_STYLE,
    });
  });

  it('compara o index publicado com título, script, estilo e status esperados', async () => {
    const expectedIndex = {
      title: TEST_TITLE,
      script: TEST_SCRIPT,
      style: TEST_STYLE,
    };

    expect(
      runCloudflarePagesExpression(
        `__testables.isPublicIndexCurrent(${JSON.stringify(expectedIndex)}, ${JSON.stringify({
          status: HTTP_STATUS_OK,
          ...expectedIndex,
        })})`,
      ),
    ).toBe(true);
    expect(
      runCloudflarePagesExpression(
        `__testables.isPublicIndexCurrent(${JSON.stringify(expectedIndex)}, ${JSON.stringify({
          status: HTTP_STATUS_STALE,
          ...expectedIndex,
        })})`,
      ),
    ).toBe(false);
    expect(
      runCloudflarePagesExpression(
        `__testables.isPublicIndexCurrent(${JSON.stringify(expectedIndex)}, ${JSON.stringify({
          status: HTTP_STATUS_OK,
          title: TEST_TITLE,
          script: 'assets/index-old.js',
          style: TEST_STYLE,
        })})`,
      ),
    ).toBe(false);
  });

  it('gera URL canônica cache-busted e mensagem de mismatch sem mascarar o bundle esperado', () => {
    const expectedIndex = {
      title: TEST_TITLE,
      script: TEST_SCRIPT,
      style: TEST_STYLE,
    };
    const publicIndex = {
      status: HTTP_STATUS_OK,
      title: TEST_TITLE,
      script: 'assets/index-old.js',
      style: 'assets/index-old.css',
    };
    const checkUrl = new URL(
      runCloudflarePagesExpression<string>(
        `__testables.buildPublicIndexCheckUrl(${JSON.stringify({
          [CUSTOM_DOMAIN_KEY]: TEST_CUSTOM_DOMAIN,
        })}).toString()`,
      ),
    );
    const mismatchMessage = runCloudflarePagesExpression<string>(
      `__testables.buildPublicIndexMismatchMessage(${JSON.stringify(expectedIndex)}, ${JSON.stringify(publicIndex)})`,
    );

    expect(checkUrl.origin).toBe(`https://${TEST_CUSTOM_DOMAIN}`);
    expect(checkUrl.searchParams.has(PUBLIC_INDEX_CHECK_PARAM)).toBe(true);
    expect(mismatchMessage).toContain(
      `script=${publicIndex.script} expected=${expectedIndex.script}`,
    );
  });
});
