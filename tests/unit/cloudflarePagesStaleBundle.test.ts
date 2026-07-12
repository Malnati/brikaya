// tests/unit/cloudflarePagesStaleBundle.test.ts
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const CUSTOM_DOMAIN_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_CUSTOM_DOMAIN';
const TEST_CUSTOM_DOMAIN = 'brikaya.com';
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_OK = 200;

function runCloudflarePagesExpression<T>(
  expression: string,
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
    encoding: 'utf8',
  });

  return JSON.parse(stdout) as T;
}

describe('cloudflare-pages stale bundle verification', () => {
  it('mantém public/404.html para desativar SPA fallback do Cloudflare Pages', () => {
    expect(existsSync(resolve(process.cwd(), 'public/404.html'))).toBe(true);
  });

  it('define not_found_handling=404 para produção e preview', () => {
    expect(
      runCloudflarePagesExpression(
        '__testables.buildNotFoundHandlingDeploymentConfigs()',
      ),
    ).toEqual({
      production: { not_found_handling: '404' },
      preview: { not_found_handling: '404' },
    });
  });

  it('detecta projeto Pages com not_found_handling=404', () => {
    expect(
      runCloudflarePagesExpression(
        `__testables.hasRequiredNotFoundHandling(${JSON.stringify({
          deployment_configs: {
            production: { not_found_handling: '404' },
            preview: { not_found_handling: '404' },
          },
        })})`,
      ),
    ).toBe(true);
    expect(
      runCloudflarePagesExpression(
        `__testables.hasRequiredNotFoundHandling(${JSON.stringify({
          deployment_configs: {
            production: { not_found_handling: 'single_page_application' },
            preview: { not_found_handling: '404' },
          },
        })})`,
      ),
    ).toBe(false);
  });

  it('valida probe stale bundle apenas com status 404', () => {
    expect(
      runCloudflarePagesExpression(
        `__testables.isStaleBundleProbeValid(${JSON.stringify({
          status: HTTP_STATUS_NOT_FOUND,
          contentType: 'text/html; charset=utf-8',
        })})`,
      ),
    ).toBe(true);
    expect(
      runCloudflarePagesExpression(
        `__testables.isStaleBundleProbeValid(${JSON.stringify({
          status: HTTP_STATUS_OK,
          contentType: 'text/html; charset=utf-8',
        })})`,
      ),
    ).toBe(false);
  });

  it('gera URL cache-busted para probe stale bundle', () => {
    const probeUrl = new URL(
      runCloudflarePagesExpression<string>(
        `__testables.buildStaleBundleProbeUrl(${JSON.stringify({
          [CUSTOM_DOMAIN_KEY]: TEST_CUSTOM_DOMAIN,
        })}).toString()`,
      ),
    );

    expect(probeUrl.pathname).toBe('/assets/index-__stale_probe__.js');
    expect(probeUrl.searchParams.has('qaStaleBundleCheck')).toBe(true);
  });

  it('valida MIME esperado para bundles publicados', () => {
    expect(
      runCloudflarePagesExpression(
        `__testables.isExpectedBundleContentType('application/javascript', 'javascript')`,
      ),
    ).toBe(true);
    expect(
      runCloudflarePagesExpression(
        `__testables.isExpectedBundleContentType('text/css; charset=utf-8', 'css')`,
      ),
    ).toBe(true);
    expect(
      runCloudflarePagesExpression(
        `__testables.isExpectedBundleContentType('text/html; charset=utf-8', 'javascript')`,
      ),
    ).toBe(false);
  });

  it('extrai paths de bundles do index publicado', () => {
    const indexHtml =
      '<!doctype html><html><head>' +
      '<script type="module" src="/assets/index-abc123.js"></script>' +
      '<link rel="stylesheet" href="/assets/index-def456.css">' +
      '</head></html>';

    expect(
      runCloudflarePagesExpression(
        `__testables.extractBundlePathsFromIndexHtml(${JSON.stringify(indexHtml)})`,
      ),
    ).toEqual({
      script: 'assets/index-abc123.js',
      style: 'assets/index-def456.css',
    });
  });
});
