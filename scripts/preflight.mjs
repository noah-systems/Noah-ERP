import fs from "fs";
import path from "path";

const read = (p) => {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
};

const exists = (p) => fs.existsSync(p);
const join = (...xs) => path.join(process.cwd(), ...xs);

const checks = [];
const add = (name, ok, details = "") => checks.push({ name, ok, details });

// package.json sanity
const pkgRaw = read(join("package.json"));
if (!pkgRaw) {
  add("package.json presente", false, "Arquivo ausente na raiz");
} else {
  try {
    const pkg = JSON.parse(pkgRaw);
    const dependencies = pkg.dependencies || {};
    add(
      'Dependência axios ^1.7.9',
      typeof dependencies.axios === 'string' && dependencies.axios.startsWith('^1.7.9'),
      'Defina "axios": "^1.7.9" em dependencies',
    );
    const scripts = pkg.scripts || {};
    add(
      'Script qa:smoke Node',
      scripts['qa:smoke'] === 'node scripts/qa-smoke.mjs',
      'Adicione "qa:smoke": "node scripts/qa-smoke.mjs"',
    );
    add('Script prepare é true', scripts.prepare === 'true', 'Configure "prepare": "true"');
  } catch (error) {
    add("package.json parseável", false, error.message);
  }
}

// .env.production sample
const envProd = read(join(".env.production"));
add(".env.production define VITE_API_URL", /VITE_API_URL\s*=/.test(envProd), "Defina VITE_API_URL=/api");

// PM2 ecosystem
add(
  "apps/api/ecosystem.config.cjs existe",
  exists(join("apps", "api", "ecosystem.config.cjs")),
  "Crie o arquivo de configuração do PM2"
);

// Health controller
const healthController = read(join("apps", "api", "src", "health", "health.controller.ts"));
add("Health controller expõe /health", /@Get\(\[\'health\'/.test(healthController), "Garanta rota GET /health");

// QA smoke script executável
try {
  const stat = fs.statSync(join("scripts", "qa-smoke.mjs"));
  add("scripts/qa-smoke.mjs executável", !!(stat.mode & 0o111), "Use chmod +x scripts/qa-smoke.mjs");
} catch {
  add("scripts/qa-smoke.mjs presente", false, "Crie o script de smoke test em Node/Playwright");
}

// Report
const fails = checks.filter((c) => !c.ok);
const pass = checks.filter((c) => c.ok);

console.log("\nNoah-ERP — PRE-FLIGHT REPORT\n");
for (const c of checks) {
  const dots = ".".repeat(Math.max(1, 64 - c.name.length));
  console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name} ${dots} ${c.ok ? "" : c.details}`);
}
console.log(`\nSummary: PASS ${pass.length}  FAIL ${fails.length}\n`);
if (fails.length) {
  process.exit(1);
} else {
  console.log("Preflight OK. Ready to build/deploy.");
  process.exit(0);
}
