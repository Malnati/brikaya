// scripts/validate-version-doc-results.mjs
//
// Garante que a documentação de versão da build atual (`.tags/vN.md` e
// `.releases/vN.md`) contenha os RESULTADOS reais alcançados — não os
// placeholders do scaffold. É a barreira que assegura que a descrição da tag e
// as notas da release publicadas no deploy sejam significativas.
//
// Uso: `npm run verify:version-docs-results` (também chamado por brikaya:ship).
import { existsSync, readFileSync } from "node:fs";

import { buildVersionFromGit } from "./build-version.mjs";
import { parseVersionDoc } from "./parse-version-doc.mjs";
import { versionDocPaths } from "./version-doc-paths.mjs";

const BUILD_VERSION_ENV_KEY = "BRIKAYA_BUILD_VERSION";

// Sentinelas de placeholder herdados de scaffold-version-docs.mjs.
const TAG_PLACEHOLDER = "Descreva em uma linha o que esta versão entrega";
const REQUIRED_RELEASE_SECTIONS = ["## Destaque", "## Mudanças"];
const EMPTY_BULLET_PATTERN = /^-\s*$/;
const FILLED_BULLET_PATTERN = /^-\s+\S+/;

function resolveBuildVersion() {
  const configured = process.env[BUILD_VERSION_ENV_KEY]?.trim();
  return configured || buildVersionFromGit(process.cwd());
}

function readDoc(filePath, relativePath) {
  if (!existsSync(filePath)) {
    throw new Error(
      `Documentação de versão ausente: ${relativePath}. Rode brikaya:scaffold-version-docs e preencha os resultados.`,
    );
  }
  return parseVersionDoc(readFileSync(filePath, "utf8"));
}

export function findTagIssues(body) {
  const text = (body || "").trim();
  if (!text) {
    return ["a descrição da tag está vazia"];
  }
  if (text.includes(TAG_PLACEHOLDER)) {
    return ["a descrição da tag ainda tem o texto placeholder do scaffold"];
  }
  return [];
}

function sectionLines(bodyLines, heading) {
  const start = bodyLines.findIndex((line) => line.trim() === heading);
  if (start === -1) {
    return null;
  }
  const rest = bodyLines.slice(start + 1);
  const nextHeading = rest.findIndex((line) => line.trim().startsWith("## "));
  return nextHeading === -1 ? rest : rest.slice(0, nextHeading);
}

export function findReleaseIssues(body) {
  const issues = [];
  const bodyLines = (body || "").split(/\r?\n/);

  for (const heading of REQUIRED_RELEASE_SECTIONS) {
    const lines = sectionLines(bodyLines, heading);
    if (lines === null) {
      issues.push(`seção "${heading}" ausente na release`);
      continue;
    }
    const trimmed = lines.map((line) => line.trim());
    if (trimmed.some((line) => EMPTY_BULLET_PATTERN.test(line))) {
      issues.push(`seção "${heading}" tem bullet vazio (placeholder)`);
    }
    if (!trimmed.some((line) => FILLED_BULLET_PATTERN.test(line))) {
      issues.push(`seção "${heading}" não tem nenhum bullet preenchido`);
    }
  }

  return issues;
}

export function validateVersionDocResults(versionLabel, cwd = process.cwd()) {
  const { tagDocPath, releaseDocPath, tagDocRelativePath, releaseDocRelativePath } =
    versionDocPaths(versionLabel, cwd);

  const tagDoc = readDoc(tagDocPath, tagDocRelativePath);
  const releaseDoc = readDoc(releaseDocPath, releaseDocRelativePath);

  const issues = [
    ...findTagIssues(tagDoc.body).map((issue) => `${tagDocRelativePath}: ${issue}`),
    ...findReleaseIssues(releaseDoc.body).map(
      (issue) => `${releaseDocRelativePath}: ${issue}`,
    ),
  ];

  return issues;
}

function run() {
  const versionLabel = resolveBuildVersion();
  const issues = validateVersionDocResults(versionLabel);

  if (issues.length > 0) {
    throw new Error(
      [
        `Resultados de versão não preenchidos para ${versionLabel}:`,
        ...issues.map((issue) => `- ${issue}`),
        "",
        `Preencha a descrição da tag (.tags/${versionLabel}.md) e as notas da release (.releases/${versionLabel}.md) com os resultados alcançados pelo prompt antes do ship.`,
      ].join("\n"),
    );
  }

  console.log(`Version doc results ok: ${versionLabel}.`);
}

const isMainModule =
  process.argv[1] && process.argv[1].endsWith("validate-version-doc-results.mjs");

if (isMainModule) {
  run();
}
