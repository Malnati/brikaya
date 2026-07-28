import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const WORKFLOW_PATH = resolve(
  process.cwd(),
  '.github/workflows/deploy-preview.yml',
);
const GENERATOR_PATH = resolve(process.cwd(), 'scripts/generate-localized-seo.mjs');
const DIST_ROOT = resolve(process.cwd(), 'dist');
const ROBOTS_PATH = resolve(DIST_ROOT, 'robots.txt');
const HEADERS_PATH = resolve(DIST_ROOT, '_headers');

function buildStaticOutputStep(workflow: string): string {
  const start = workflow.indexOf('      - name: Build static output');
  const end = workflow.indexOf('\n      - name:', start + 1);
  return workflow.slice(start, end === -1 ? undefined : end);
}

describe('preview deployment crawl safety', () => {
  it('propagates the preview environment into the build that generates preview artifacts', () => {
    const workflow = readFileSync(WORKFLOW_PATH, 'utf8');
    const buildStep = buildStaticOutputStep(workflow);

    expect(buildStep).toContain('run: npm run build');
    expect(buildStep).toMatch(/\n        env:\n          BRIKAYA_DEPLOY_ENV: preview\n/);

    try {
      execFileSync(process.execPath, [GENERATOR_PATH], {
        cwd: process.cwd(),
        env: { ...process.env, BRIKAYA_DEPLOY_ENV: 'preview' },
        stdio: 'pipe',
      });

      expect(readFileSync(ROBOTS_PATH, 'utf8')).toBe('User-agent: *\nDisallow: /\n');
      expect(readFileSync(HEADERS_PATH, 'utf8')).toContain(
        '/*\n  X-Robots-Tag: noindex\n',
      );
    } finally {
      execFileSync(process.execPath, [GENERATOR_PATH], {
        cwd: process.cwd(),
        env: { ...process.env, BRIKAYA_DEPLOY_ENV: 'production' },
        stdio: 'pipe',
      });
    }
  });
});
