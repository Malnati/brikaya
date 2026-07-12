// scripts/validate-public-trace-guard.mjs
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

import {
  GENERATED_SCAN_DIRECTORIES,
  findForbiddenTraces,
  isBinaryBuffer,
  shouldSkipPath
} from './trace-guard-rules.mjs';

const UTF8_ENCODING = 'utf8';
const GIT_COMMAND = 'git';
const GIT_LS_FILES_ARGS = ['ls-files', '-z'];
const INCLUDE_DIST_FLAG = '--include-dist';
const PUBLIC_URL_FLAG = '--public-url';
const DEFAULT_PUBLIC_URL = 'https://brikaya.com/';
const EMPTY_STRING = '';
const NULL_SEPARATOR = '\0';
const WALK_OPTIONS = { withFileTypes: true };
const FAILURE_LIMIT = 80;
const FAILURE_COUNT_OFFSET = 1;
const HTTP_STATUS_OK = 200;
const FETCH_TIMEOUT_MS = 20000;
const PUBLIC_FETCH_MAX_POLLS = 24;
const PUBLIC_FETCH_POLL_DELAY_MS = 5000;
const INITIAL_PUBLIC_PATHS = [
  '/',
  '/index.html',
  '/sw.js',
  '/manifest.webmanifest',
  '/asset-cache-manifest.json',
  '/robots.txt',
  '/sitemap.xml'
];
const TEXT_PUBLIC_EXTENSIONS = [
  '.css',
  '.html',
  '.js',
  '.json',
  '.svg',
  '.txt',
  '.webmanifest',
  '.xml'
];
const PUBLIC_REFERENCE_PATTERN = /\b(?:href|src)=["']([^"']+)["']/gi;
const PUBLIC_ASSET_PATH_PATTERN = /"([^"]+\.(?:css|html|js|json|svg|txt|webmanifest|xml))"/gi;
const PUBLIC_URL_TEXT_PATTERN = /https?:\/\/[^\s<>"']+/gi;

function runGitLsFiles() {
  const result = spawnSync(GIT_COMMAND, GIT_LS_FILES_ARGS, {
    encoding: UTF8_ENCODING
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr || 'git ls-files failed');
  }

  return result.stdout
    .split(NULL_SEPARATOR)
    .filter((filePath) => filePath !== EMPTY_STRING)
    .filter((filePath) => existsSync(filePath))
    .filter((filePath) => !shouldSkipPath(filePath));
}

function walkDirectory(directoryPath) {
  if (!existsSync(directoryPath)) return [];

  return readdirSync(directoryPath, WALK_OPTIONS).flatMap((entry) => {
    const childPath = join(directoryPath, entry.name);
    if (entry.isDirectory()) return walkDirectory(childPath);
    if (entry.isFile()) return [childPath];
    return [];
  });
}

function readTextFile(filePath) {
  const buffer = readFileSync(filePath);
  if (isBinaryBuffer(buffer)) return null;
  return buffer.toString(UTF8_ENCODING);
}

function scanFiles(filePaths) {
  return filePaths.flatMap((filePath) => {
    const text = readTextFile(filePath);
    if (text === null) return [];
    return findForbiddenTraces(text, filePath);
  });
}

function parseOptionValue(argv, optionName) {
  const optionPrefix = `${optionName}=`;
  const inlineValue = argv.find((argument) => argument.startsWith(optionPrefix));
  if (inlineValue) return inlineValue.slice(optionPrefix.length);

  const optionIndex = argv.indexOf(optionName);
  if (optionIndex === -1) return null;

  return argv[optionIndex + 1] || DEFAULT_PUBLIC_URL;
}

function normalizePublicUrl(publicUrl) {
  return new URL(publicUrl || DEFAULT_PUBLIC_URL);
}

function normalizePublicPath(rawPath, baseUrl) {
  if (!rawPath || rawPath.startsWith('#')) return null;

  const url = new URL(rawPath, baseUrl);
  if (url.origin !== baseUrl.origin) return null;

  return url.pathname;
}

function hasTextPublicExtension(pathname) {
  return TEXT_PUBLIC_EXTENSIONS.some((extension) => pathname.endsWith(extension));
}

function isPublicTextPath(pathname) {
  return pathname === '/' || pathname.endsWith('/') || hasTextPublicExtension(pathname);
}

function collectPathMatches(text, pattern, baseUrl) {
  const paths = [];
  pattern.lastIndex = 0;
  let match = pattern.exec(text);

  while (match) {
    const normalizedPath = normalizePublicPath(match[1], baseUrl);
    if (normalizedPath && isPublicTextPath(normalizedPath)) {
      paths.push(normalizedPath);
    }
    match = pattern.exec(text);
  }

  return paths;
}

function collectReferencedPublicPaths(text, baseUrl) {
  return [
    ...collectPathMatches(text, PUBLIC_REFERENCE_PATTERN, baseUrl),
    ...collectPathMatches(text, PUBLIC_ASSET_PATH_PATTERN, baseUrl),
    ...collectPathMatches(text, PUBLIC_URL_TEXT_PATTERN, baseUrl)
  ];
}

function buildPublicScanUrl(baseUrl, pathname) {
  const publicScanUrl = new URL(pathname, baseUrl);
  publicScanUrl.searchParams.set('traceGuard', Date.now().toString());
  return publicScanUrl;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPublicText(baseUrl, pathname) {
  let lastError = null;

  for (let attempt = 1; attempt <= PUBLIC_FETCH_MAX_POLLS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const publicScanUrl = buildPublicScanUrl(baseUrl, pathname);
      const response = await fetch(publicScanUrl, {
        cache: 'no-store',
        signal: controller.signal
      });

      if (response.status === HTTP_STATUS_OK) {
        return response.text();
      }

      lastError = new Error(
        `public fetch failed ${publicScanUrl.toString()} status=${response.status}`
      );

      if (response.status !== 404 || attempt === PUBLIC_FETCH_MAX_POLLS) {
        throw lastError;
      }

      console.log(
        `WARN public fetch tentativa=${attempt}/${PUBLIC_FETCH_MAX_POLLS}: ` +
          `${pathname} status=${response.status}`
      );
      await sleep(PUBLIC_FETCH_POLL_DELAY_MS);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

async function scanPublicUrl(publicUrl) {
  const baseUrl = normalizePublicUrl(publicUrl);
  const queuedPaths = [...INITIAL_PUBLIC_PATHS];
  const scannedPaths = new Set();
  const findings = [];

  while (queuedPaths.length > 0) {
    const pathname = queuedPaths.shift();
    if (!pathname || scannedPaths.has(pathname) || !isPublicTextPath(pathname)) {
      continue;
    }

    scannedPaths.add(pathname);
    const text = await fetchPublicText(baseUrl, pathname);
    findings.push(...findForbiddenTraces(text, `public:${new URL(pathname, baseUrl).toString()}`));
    collectReferencedPublicPaths(text, baseUrl).forEach((referencedPath) => {
      if (!scannedPaths.has(referencedPath)) queuedPaths.push(referencedPath);
    });
  }

  return { findings, count: scannedPaths.size };
}

function formatFinding(finding) {
  return `${finding.filePath}:${finding.line} [${finding.id}] ${finding.match}`;
}

async function main(argv) {
  const shouldIncludeDist = argv.includes(INCLUDE_DIST_FLAG);
  const publicUrl = parseOptionValue(argv, PUBLIC_URL_FLAG);
  const trackedFiles = runGitLsFiles();
  const generatedFiles = shouldIncludeDist
    ? GENERATED_SCAN_DIRECTORIES.flatMap(walkDirectory)
    : [];
  const publicScan = publicUrl
    ? await scanPublicUrl(publicUrl)
    : { findings: [], count: 0 };
  const findings = [
    ...scanFiles([...trackedFiles, ...generatedFiles]),
    ...publicScan.findings
  ];

  if (findings.length > 0) {
    const visibleFindings = findings.slice(0, FAILURE_LIMIT).map(formatFinding);
    const hiddenFindingCount = findings.length - visibleFindings.length;
    const suffix = hiddenFindingCount > 0
      ? `\n... ${hiddenFindingCount} findings omitted`
      : EMPTY_STRING;
    throw new Error(`Forbidden public traces found:\n${visibleFindings.join('\n')}${suffix}`);
  }

  console.log(
    `public-trace-guard ok: tracked=${trackedFiles.length} generated=${generatedFiles.length} public=${publicScan.count}`
  );
}

try {
  await main(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exit(FAILURE_COUNT_OFFSET);
}
