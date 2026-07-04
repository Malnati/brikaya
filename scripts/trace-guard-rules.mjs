// scripts/trace-guard-rules.mjs
const CASE_INSENSITIVE_FLAG = 'i';
const WORD_BOUNDARY = '\\b';
const SPACES = '\\s+';

function textPattern(parts) {
  return new RegExp(parts.join(''), CASE_INSENSITIVE_FLAG);
}

function phrasePattern(leftParts, rightParts) {
  return new RegExp(leftParts.join('') + SPACES + rightParts.join(''), CASE_INSENSITIVE_FLAG);
}

function boundedPattern(parts) {
  return new RegExp(WORD_BOUNDARY + parts.join('') + WORD_BOUNDARY, CASE_INSENSITIVE_FLAG);
}

function boundedPhrasePattern(leftParts, rightParts) {
  return new RegExp(
    WORD_BOUNDARY + leftParts.join('') + SPACES + rightParts.join('') + WORD_BOUNDARY,
    CASE_INSENSITIVE_FLAG
  );
}

export const FORBIDDEN_TRACE_PATTERNS = [
  { id: 'legacy-project-token', pattern: textPattern(['br', 'ick', 'bre', 'aker']) },
  { id: 'legacy-project-phrase', pattern: phrasePattern(['br', 'ick'], ['bre', 'aker']) },
  { id: 'legacy-game-title', pattern: textPattern(['bre', 'ak', 'out']) },
  { id: 'sensitive-comparison-a', pattern: textPattern(['ark', 'an', 'oid']) },
  { id: 'sensitive-comparison-b', pattern: textPattern(['at', 'ari']) },
  { id: 'sensitive-comparison-c', pattern: textPattern(['ta', 'ito']) },
  { id: 'sensitive-comparison-d', pattern: textPattern(['black', 'berry']) },
  { id: 'sensitive-comparison-e', pattern: boundedPattern(['v', 'aus']) },
  { id: 'sensitive-comparison-f', pattern: boundedPattern(['d', 'oh']) },
  { id: 'sensitive-comparison-g', pattern: boundedPattern(['r', 'im']) },
  { id: 'project-license-old-a', pattern: boundedPhrasePattern(['m', 'it'], ['lic', 'ense']) },
  { id: 'project-license-old-b', pattern: boundedPhrasePattern(['lic', 'ense'], ['m', 'it']) },
  { id: 'project-license-old-c', pattern: boundedPhrasePattern(['licen', '[çc]a'], ['m', 'it']) }
];

export const DEFAULT_TRACKED_SCAN_EXCLUSIONS = new Set([
  '.git',
  'node_modules',
  'dist',
  'coverage',
  'tmp',
  '.wrangler'
]);

export const GENERATED_SCAN_DIRECTORIES = ['dist'];

export function isBinaryBuffer(buffer) {
  return buffer.includes(0);
}

export function normalizePath(filePath) {
  return filePath.split('\\').join('/');
}

export function shouldSkipPath(filePath, exclusions = DEFAULT_TRACKED_SCAN_EXCLUSIONS) {
  const normalizedPath = normalizePath(filePath);
  return normalizedPath
    .split('/')
    .some((pathPart) => exclusions.has(pathPart));
}

export function findForbiddenTraces(text, filePath, patterns = FORBIDDEN_TRACE_PATTERNS) {
  const findings = [];
  const lines = text.split(/\r?\n/);

  lines.forEach((line, lineIndex) => {
    patterns.forEach(({ id, pattern }) => {
      const match = line.match(pattern);
      if (!match) return;

      findings.push({
        id,
        filePath,
        line: lineIndex + 1,
        match: match[0]
      });
    });
  });

  return findings;
}
