// tests/unit/cloudflarePagesRedirect.test.ts
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const PROJECT_NAME_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_PROJECT_NAME';
const CUSTOM_DOMAIN_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_CUSTOM_DOMAIN';
const BRANCH_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_BRANCH';
const PREVIEW_PROJECT_NAME_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_PREVIEW_PROJECT_NAME';
const PREVIEW_DOMAIN_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_PREVIEW_DOMAIN';
const PREVIEW_BRANCH_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_PREVIEW_BRANCH';
const PUBLIC_INDEX_CHECK_PARAM = 'qaPublicIndexCheck';

const ENV_VALUES = {
  [PROJECT_NAME_KEY]: 'brikaya-live',
  [CUSTOM_DOMAIN_KEY]: 'brikaya.com',
  [BRANCH_KEY]: 'main',
  [PREVIEW_PROJECT_NAME_KEY]: 'brikaya-dev',
  [PREVIEW_DOMAIN_KEY]: 'dev.brikaya.com',
  [PREVIEW_BRANCH_KEY]: 'preview',
};

function runCloudflarePagesExpression<T>(expression: string): T {
  const moduleUrl = pathToFileURL(
    resolve(process.cwd(), 'scripts/cloudflare-pages.js'),
  ).href;
  const code = `
    const { __testables } = await import(${JSON.stringify(moduleUrl)});
    const result = ${expression};
    console.log(JSON.stringify(result));
  `;
  const stdout = execFileSync(process.execPath, ['--input-type=module', '-e', code], {
    encoding: 'utf8',
  });

  return JSON.parse(stdout) as T;
}

describe('cloudflare-pages preview redirect reconciliation', () => {
  it('mantém somente o redirect de produção quando o domínio preview não está disponível', () => {
    const redirectPairs = runCloudflarePagesExpression<Record<string, string>[]>(
      `__testables.buildRedirectEnvPairs?.(${JSON.stringify(ENV_VALUES)}, false) ?? null`,
    );

    expect(redirectPairs).toEqual([
      expect.objectContaining({
        [PROJECT_NAME_KEY]: 'brikaya-live',
        [CUSTOM_DOMAIN_KEY]: 'brikaya.com',
      }),
    ]);
  });

  it('inclui o redirect preview somente quando domínio, DNS e HTTPS estão prontos', () => {
    expect(
      runCloudflarePagesExpression(
        `__testables.isPreviewRedirectEligible?.(${JSON.stringify({
          domainActive: true,
          dnsResolves: true,
          httpsResponds: true,
        })}) ?? null`,
      ),
    ).toBe(true);
    expect(
      runCloudflarePagesExpression(
        `__testables.isPreviewRedirectEligible?.(${JSON.stringify({
          domainActive: false,
          dnsResolves: true,
          httpsResponds: true,
        })}) ?? null`,
      ),
    ).toBe(false);
    expect(
      runCloudflarePagesExpression(
        `__testables.isPreviewRedirectEligible?.(${JSON.stringify({
          domainActive: true,
          dnsResolves: false,
          httpsResponds: true,
        })}) ?? null`,
      ),
    ).toBe(false);
    expect(
      runCloudflarePagesExpression(
        `__testables.isPreviewRedirectEligible?.(${JSON.stringify({
          domainActive: true,
          dnsResolves: true,
          httpsResponds: false,
        })}) ?? null`,
      ),
    ).toBe(false);

    const redirectPairs = runCloudflarePagesExpression<Record<string, string>[]>(
      `__testables.buildRedirectEnvPairs?.(${JSON.stringify(ENV_VALUES)}, true) ?? null`,
    );
    expect(redirectPairs).toEqual([
      expect.objectContaining({
        [PROJECT_NAME_KEY]: 'brikaya-live',
        [CUSTOM_DOMAIN_KEY]: 'brikaya.com',
      }),
      expect.objectContaining({
        [PROJECT_NAME_KEY]: 'brikaya-dev',
        [CUSTOM_DOMAIN_KEY]: 'dev.brikaya.com',
      }),
    ]);
  });

  it('verifica /play/ no domínio customizado e no fallback pages.dev estável', () => {
    const urls = runCloudflarePagesExpression<string[]>(
      `(__testables.buildPreviewIndexCheckUrls?.(${JSON.stringify(ENV_VALUES)}) ?? []).map((url) => url.toString())`,
    ).map((url) => new URL(url));

    expect(urls).toHaveLength(2);
    expect(urls.map((url) => url.origin)).toEqual([
      'https://dev.brikaya.com',
      'https://brikaya-dev.pages.dev',
    ]);
    expect(urls.every((url) => url.pathname === '/play/')).toBe(true);
    expect(urls.every((url) => url.searchParams.has(PUBLIC_INDEX_CHECK_PARAM))).toBe(true);
  });
});
