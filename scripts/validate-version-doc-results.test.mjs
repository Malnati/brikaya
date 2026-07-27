// scripts/validate-version-doc-results.test.mjs
import assert from "node:assert/strict";

import { findTagIssues, findReleaseIssues } from "./validate-version-doc-results.mjs";

// --- Tag ---

assert.deepEqual(
  findTagIssues("Corrige o travamento ao trocar de fase."),
  [],
  "descrição de tag preenchida deve passar",
);

assert.equal(
  findTagIssues("").length,
  1,
  "descrição de tag vazia deve falhar",
);

assert.equal(
  findTagIssues("Descreva em uma linha o que esta versão entrega.").length,
  1,
  "placeholder de tag deve falhar",
);

// --- Release ---

const filledRelease = [
  "## Destaque",
  "",
  "- Novo power-up de laser duplo",
  "",
  "## Mudanças",
  "",
  "- Corrige reset de pontuação após componente",
  "",
  "## Validação",
  "",
  "- Menu: Versão v161 / Version v161",
].join("\n");

assert.deepEqual(
  findReleaseIssues(filledRelease),
  [],
  "release com Destaque e Mudanças preenchidos deve passar",
);

const scaffoldRelease = [
  "## Destaque",
  "",
  "- ",
  "",
  "## Mudanças",
  "",
  "- ",
  "",
  "## Validação",
  "",
  "- Menu: Versão v161 / Version v161",
].join("\n");

assert.ok(
  findReleaseIssues(scaffoldRelease).length >= 2,
  "release com bullets vazios (scaffold) deve falhar em Destaque e Mudanças",
);

const missingSection = ["## Destaque", "", "- Algo real"].join("\n");
assert.ok(
  findReleaseIssues(missingSection).some((issue) => issue.includes("Mudanças")),
  "release sem seção Mudanças deve falhar",
);

console.log("validate-version-doc-results ok");
