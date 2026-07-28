// tests/unit/cloudflarePagesPublicIndex.test.ts
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const OUTPUT_DIR_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_OUTPUT_DIR';
const CUSTOM_DOMAIN_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_CUSTOM_DOMAIN';
const PROJECT_NAME_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_PROJECT_NAME';
const BRANCH_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_BRANCH';
const ACCOUNT_ID_KEY = 'CLOUDFLARE_ACCOUNT_ID';
const API_TOKEN_KEY = 'CLOUDFLARE_API_TOKEN';
const TEST_OUTPUT_DIR = 'dist';
const TEST_TITLE = 'Brikaya — arcade de circuitos eletrônicos';
const TEST_SCRIPT = 'assets/index-BWyDg29g.js';
const TEST_STYLE = 'assets/index-DTNZft6S.css';
const TEST_CUSTOM_DOMAIN = 'brikaya.com';
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_STALE = 503;
const PUBLIC_INDEX_CHECK_PARAM = 'qaPublicIndexCheck';
const PUBLIC_INDEX_MAX_POLLS = 24;

function runCloudflarePagesExpression<T>(
  expression: string,
  cwd = process.cwd(),
): T {
  const moduleUrl = pathToFileURL(
    resolve(process.cwd(), 'scripts/cloudflare-pages.js'),
  ).href;
  const code = `
    const { __testables } = await import(${JSON.stringify(moduleUrl)});
    const result = await (${expression});
    console.log(JSON.stringify(result));
  `;
  const stdout = execFileSync(process.execPath, ['--input-type=module', '-e', code], {
    cwd,
    encoding: 'utf8',
  });

  return JSON.parse(stdout.trim().split('\n').at(-1) || 'null') as T;
}

function writeIndexHtml(rootPath: string, body: string) {
  const distPath = join(rootPath, TEST_OUTPUT_DIR, 'play');
  mkdirSync(distPath, { recursive: true });
  writeFileSync(join(distPath, 'index.html'), body);
}

function buildVerificationExpression(fetchBody: string) {
  return `(async () => {
    const originalFetch = globalThis.fetch;
    const originalSetTimeout = globalThis.setTimeout;
    let attempts = 0;
    globalThis.fetch = async () => {
      attempts += 1;
      ${fetchBody}
    };
    globalThis.setTimeout = ((callback, delay) => {
      if (delay === 5000) {
        queueMicrotask(callback);
      }
      return 0;
    });

    try {
      await __testables.verifyPublicIndex(${JSON.stringify({
        [OUTPUT_DIR_KEY]: TEST_OUTPUT_DIR,
        [CUSTOM_DOMAIN_KEY]: TEST_CUSTOM_DOMAIN,
        [PROJECT_NAME_KEY]: 'brikaya-live',
        [BRANCH_KEY]: 'main',
        [ACCOUNT_ID_KEY]: 'test-account',
        [API_TOKEN_KEY]: 'test-token',
      })});
      return { attempts, error: null };
    } catch (error) {
      return {
        attempts,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      globalThis.fetch = originalFetch;
      globalThis.setTimeout = originalSetTimeout;
    }
  })()`;
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

  it('mantém o título público inicial alinhado ao título runtime pt-BR', () => {
    const indexHtml = readFileSync(resolve(process.cwd(), 'play/index.html'), 'utf8');

    expect(indexHtml).toContain(`<title>${TEST_TITLE}</title>`);
    expect(indexHtml).toContain(`property="og:title" content="${TEST_TITLE}"`);
    expect(indexHtml).toContain(`name="twitter:title" content="${TEST_TITLE}"`);
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
    expect(checkUrl.pathname).toBe('/play/');
    expect(checkUrl.searchParams.has(PUBLIC_INDEX_CHECK_PARAM)).toBe(true);
    expect(mismatchMessage).toContain(
      `script=${publicIndex.script} expected=${expectedIndex.script}`,
    );
  });

  it('repete falha transitória de fetch e aceita o índice quando a tentativa seguinte responde', () => {
    writeIndexHtml(
      tempRoot,
      `<!doctype html><html><head><title>${TEST_TITLE}</title><script type="module" src="/${TEST_SCRIPT}"></script><link rel="stylesheet" href="/${TEST_STYLE}"></head></html>`,
    );
    const result = runCloudflarePagesExpression<{
      attempts: number;
      error: string | null;
    }>(
      buildVerificationExpression(`
        if (attempts === 1) {
          throw new TypeError('fetch failed');
        }
        return {
          status: ${HTTP_STATUS_OK},
          text: async () => ${JSON.stringify(
            `<title>${TEST_TITLE}</title><script src="/${TEST_SCRIPT}"></script><link href="/${TEST_STYLE}">`,
          )},
        };
      `),
      tempRoot,
    );

    expect(result).toEqual({ attempts: 2, error: null });
  });

  it('limita falhas transitórias ao número existente de polls', () => {
    writeIndexHtml(
      tempRoot,
      `<!doctype html><html><head><title>${TEST_TITLE}</title><script type="module" src="/${TEST_SCRIPT}"></script><link rel="stylesheet" href="/${TEST_STYLE}"></head></html>`,
    );
    const result = runCloudflarePagesExpression<{
      attempts: number;
      error: string | null;
    }>(
      buildVerificationExpression(`throw new TypeError('fetch failed');`),
      tempRoot,
    );

    expect(result).toEqual({
      attempts: PUBLIC_INDEX_MAX_POLLS,
      error: 'fetch failed',
    });
  });

  it('interrompe imediatamente quando a falha de fetch não é transitória', () => {
    writeIndexHtml(
      tempRoot,
      `<!doctype html><html><head><title>${TEST_TITLE}</title><script type="module" src="/${TEST_SCRIPT}"></script><link rel="stylesheet" href="/${TEST_STYLE}"></head></html>`,
    );
    const result = runCloudflarePagesExpression<{
      attempts: number;
      error: string | null;
    }>(
      buildVerificationExpression(`throw new Error('invalid public index contract');`),
      tempRoot,
    );

    expect(result).toEqual({
      attempts: 1,
      error: 'invalid public index contract',
    });
  });
});
