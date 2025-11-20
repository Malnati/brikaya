// scripts/white-label/replace-brand.js
// Script Node.js para substituições controladas de termos de marca

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "../..");

// Mapeamento de substituições
const REPLACEMENTS = [
  {
    pattern: /\bresíduo\b/gi,
    replacement: "produto",
    description: "resíduo → produto",
  },
  {
    pattern: /\bresiduo\b/gi,
    replacement: "produto",
    description: "residuo → produto",
  },
  {
    pattern: /\bresíduos\b/gi,
    replacement: "produtos",
    description: "resíduos → produtos",
  },
  {
    pattern: /\bresiduos\b/gi,
    replacement: "produtos",
    description: "residuos → produtos",
  },
  {
    pattern: /\bmarketplace de resíduos\b/gi,
    replacement: "marketplace de produtos",
    description: "marketplace de resíduos → marketplace de produtos",
  },
  {
    pattern: /\bmarketplace de residuos\b/gi,
    replacement: "marketplace de produtos",
    description: "marketplace de residuos → marketplace de produtos",
  },
  {
    pattern: /\bcrédito de carbono\b/gi,
    replacement: "crédito ambiental",
    description: "crédito de carbono → crédito ambiental",
  },
  {
    pattern: /\bcredito de carbono\b/gi,
    replacement: "credito ambiental",
    description: "credito de carbono → credito ambiental",
  },
  {
    pattern: /\bcréditos de carbono\b/gi,
    replacement: "créditos ambientais",
    description: "créditos de carbono → créditos ambientais",
  },
  {
    pattern: /\bcreditos de carbono\b/gi,
    replacement: "creditos ambientais",
    description: "creditos de carbono → creditos ambientais",
  },
  {
    pattern: /\bConectando resíduos recicláveis\b/gi,
    replacement: "Conectando produtos e serviços",
    description:
      "Conectando resíduos recicláveis → Conectando produtos e serviços",
  },
];

// Arquivos a serem processados (extensões permitidas)
const ALLOWED_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".md",
  ".sql",
  ".yml",
  ".yaml",
  ".json",
];
const EXCLUDED_DIRS = ["node_modules", ".git", "dist", "build", ".next"];

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return false;
  }

  for (const dir of EXCLUDED_DIRS) {
    if (filePath.includes(dir)) {
      return false;
    }
  }

  return true;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  let modified = content;
  let changed = false;

  for (const { pattern, replacement, description } of REPLACEMENTS) {
    if (pattern.test(content)) {
      modified = modified.replace(pattern, replacement);
      changed = true;
      console.log(`  ✓ ${description}`);
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, modified, "utf8");
    return true;
  }

  return false;
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(file)) {
        walkDir(filePath, callback);
      }
    } else if (stat.isFile()) {
      if (shouldProcessFile(filePath)) {
        callback(filePath);
      }
    }
  }
}

// Executar substituições
console.log("Iniciando substituições de termos de marca...\n");

let processedCount = 0;
let changedCount = 0;

walkDir(PROJECT_ROOT, (filePath) => {
  processedCount++;
  const relPath = path.relative(PROJECT_ROOT, filePath);

  if (processFile(filePath)) {
    changedCount++;
    console.log(`Processado: ${relPath}`);
  }
});

console.log(`\n✅ Processamento concluído:`);
console.log(`  - Arquivos processados: ${processedCount}`);
console.log(`  - Arquivos modificados: ${changedCount}`);
