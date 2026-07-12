// scripts/parse-version-doc.test.mjs
import assert from "node:assert/strict";

import { parseVersionDoc } from "./parse-version-doc.mjs";

const parsed = parseVersionDoc(`---
tag: v147
title: Brikaya v147
prerelease: false
---

Corpo da tag.
`);

assert.equal(parsed.frontmatter.tag, "v147");
assert.equal(parsed.frontmatter.title, "Brikaya v147");
assert.equal(parsed.frontmatter.prerelease, false);
assert.equal(parsed.body, "Corpo da tag.");

assert.throws(() => parseVersionDoc("sem frontmatter"), /Frontmatter YAML ausente/);

console.log("parse-version-doc unit ok");
