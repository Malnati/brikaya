// scripts/validate-seo-brand-copy.mjs
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CASE_INSENSITIVE = 'i';
const SCANNED_PATHS = [
  'index.html',
  'play/index.html',
  'public/about',
  'scripts/legal-page-content.mjs',
  'scripts/editorial-page-content.mjs',
  'scripts/landing-page-content.mjs',
  'scripts/legal-page-translations.json',
  'scripts/generated/i18n-home-seo.json',
  'src/i18n/messages.ts',
];

const FORBIDDEN_SEO_PATTERNS = [
  {
    id: 'seo-legacy-brick-breaking',
    pattern: new RegExp(
      ['br', 'ick', '-', 'bre', 'aking'].join(''),
      CASE_INSENSITIVE,
    ),
  },
  {
    id: 'seo-legacy-block-breaker-phrase',
    pattern: new RegExp(
      `\\b${['bl', 'ock'].join('')}\\s+${['bre', 'aker'].join('')}\\b`,
      CASE_INSENSITIVE,
    ),
  },
  {
    id: 'seo-legacy-block-breaker-hyphen',
    pattern: new RegExp(
      ['bl', 'ock', '-', 'bre', 'aker'].join(''),
      CASE_INSENSITIVE,
    ),
  },
];

function walkFiles(directoryPath) {
  if (!existsSync(directoryPath)) return [];
  return readdirSync(directoryPath, { withFileTypes: true }).flatMap((entry) => {
    const childPath = join(directoryPath, entry.name);
    if (entry.isDirectory()) return walkFiles(childPath);
    if (entry.isFile()) return [childPath];
    return [];
  });
}

function collectFiles() {
  const files = [];
  for (const scannedPath of SCANNED_PATHS) {
    if (!existsSync(scannedPath)) {
      throw new Error(`missing scanned path: ${scannedPath}`);
    }
    if (statSync(scannedPath).isFile()) {
      files.push(scannedPath);
      continue;
    }
    files.push(...walkFiles(scannedPath));
  }
  return [...new Set(files)].sort();
}

function scanFile(filePath) {
  const text = readFileSync(filePath, 'utf8');
  const findings = [];
  const lines = text.split(/\r?\n/);

  lines.forEach((line, lineIndex) => {
    FORBIDDEN_SEO_PATTERNS.forEach(({ id, pattern }) => {
      const match = line.match(pattern);
      if (!match) return;
      findings.push({
        id,
        filePath,
        line: lineIndex + 1,
        excerpt: line.trim().slice(0, 160),
      });
    });
  });

  return findings;
}

function run() {
  const findings = collectFiles().flatMap(scanFile);
  if (findings.length === 0) {
    console.log('validate-seo-brand-copy ok');
    return;
  }

  console.error('validate-seo-brand-copy failed');
  findings.slice(0, 40).forEach((finding) => {
    console.error(
      `${finding.filePath}:${finding.line} [${finding.id}] ${finding.excerpt}`,
    );
  });
  if (findings.length > 40) {
    console.error(`... and ${findings.length - 40} more`);
  }
  process.exit(1);
}

run();
