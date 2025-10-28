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
    const overrides = pkg.overrides || {};
    add("Override axios 1.7.9", overrides.axios === "1.7.9", 'Adicione "overrides": { "axios": "1.7.9" }');
    const scripts = pkg.scripts || {};
    add("Script qa:smoke", typeof scripts["qa:smoke"] === "string", 'Adicione "qa:smoke": "bash scripts/qa-smoke.sh"');
  } catch (error) {
    add("package.json parseável", false, error.message);
  }
}

// .env.production sample
const envProd = read(join(".env.production"));
add(".env.production define VITE_API_URL", /VITE_API_URL\s*=/.test(envProd), "Defina VITE_API_URL=/api");

// PM2 ecosystem
add(
  "apps/api/ecosystem.config.js existe",
  exists(join("apps", "api", "ecosystem.config.js")),
  "Crie o arquivo de configuração do PM2"
);

// Health controller
const healthController = read(join("apps", "api", "src", "health", "health.controller.ts"));
add("Health controller expõe /health", /@Get\(\[\'health\'/.test(healthController), "Garanta rota GET /health");

// QA smoke script executável
try {
  const stat = fs.statSync(join("scripts", "qa-smoke.sh"));
  add("scripts/qa-smoke.sh executável", !!(stat.mode & 0o111), "Use chmod +x scripts/qa-smoke.sh");
} catch {
  add("scripts/qa-smoke.sh presente", false, "Crie o script de smoke test");
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
