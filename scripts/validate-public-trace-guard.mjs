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
const EMPTY_STRING = '';
const NULL_SEPARATOR = '\0';
const WALK_OPTIONS = { withFileTypes: true };
const FAILURE_LIMIT = 80;
const FAILURE_COUNT_OFFSET = 1;

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

function formatFinding(finding) {
  return `${finding.filePath}:${finding.line} [${finding.id}] ${finding.match}`;
}

function main(argv) {
  const shouldIncludeDist = argv.includes(INCLUDE_DIST_FLAG);
  const trackedFiles = runGitLsFiles();
  const generatedFiles = shouldIncludeDist
    ? GENERATED_SCAN_DIRECTORIES.flatMap(walkDirectory)
    : [];
  const findings = scanFiles([...trackedFiles, ...generatedFiles]);

  if (findings.length > 0) {
    const visibleFindings = findings.slice(0, FAILURE_LIMIT).map(formatFinding);
    const hiddenFindingCount = findings.length - visibleFindings.length;
    const suffix = hiddenFindingCount > 0
      ? `\n... ${hiddenFindingCount} findings omitted`
      : EMPTY_STRING;
    throw new Error(`Forbidden public traces found:\n${visibleFindings.join('\n')}${suffix}`);
  }

  console.log(
    `public-trace-guard ok: tracked=${trackedFiles.length} generated=${generatedFiles.length}`
  );
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exit(FAILURE_COUNT_OFFSET);
}
