// scripts/parse-version-doc.mjs
const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === "true") {
    return true;
  }
  if (trimmed === "false") {
    return false;
  }
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseFrontmatterBlock(block) {
  const fields = {};

  for (const line of block.split(/\r?\n/)) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();
    fields[key] = parseScalar(value);
  }

  return fields;
}

export function parseVersionDoc(source) {
  const match = source.match(FRONTMATTER_PATTERN);
  if (!match) {
    throw new Error("Frontmatter YAML ausente (esperado bloco --- ... ---).");
  }

  return {
    frontmatter: parseFrontmatterBlock(match[1]),
    body: match[2].trim(),
  };
}
