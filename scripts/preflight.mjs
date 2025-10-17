import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const r = (p) => { try { return fs.readFileSync(p, "utf8"); } catch { return ""; } };
const ex = (p) => fs.existsSync(p);
const P = (...xs) => path.join(process.cwd(), ...xs);
const checks = [];
const add = (name, ok, details) => checks.push({ name, ok, details: details || "" });

// 1) package.json overrides + build script
const pkgStr = r(P("package.json"));
if (!pkgStr) add("package.json present", false, "Missing file");
else {
  let pkg; try { pkg = JSON.parse(pkgStr); } catch { pkg = {}; }
  const o = pkg.overrides || {};
  const wasm = (o.rollup === "npm:@rollup/wasm-node") ||
               (o?.vite?.rollup === "npm:@rollup/wasm-node");
  add("Rollup forced to WASM via overrides", wasm, 'Add { "overrides": { "rollup": "npm:@rollup/wasm-node", "vite": { "rollup": "npm:@rollup/wasm-node" } } }');
  add("npm script: build exists", !!(pkg.scripts && pkg.scripts.build), "Missing scripts.build");
  add("npm script: preflight exists", !!(pkg.scripts && pkg.scripts.preflight), 'Add "preflight": "node scripts/preflight.mjs"');
}

// 2) Dockerfile.web flags + install fallback
const df = r(P("Dockerfile.web"));
if (!df) add("Dockerfile.web present", false, "Missing file");
else {
  add("Base image node:20-bookworm-slim", /FROM\s+node:20.*bookworm-slim/i.test(df), "Use node:20-bookworm-slim");
  add("ENV ROLLUP_SKIP_NODEJS_NATIVE=true", /ROLLUP_SKIP_NODEJS_NATIVE\s*=\s*(true|1|"true")/i.test(df), "Set ROLLUP_SKIP_NODEJS_NATIVE=true");
  add("ENV npm_config_optional=false", /npm_config_optional\s*=\s*(false|"false")/i.test(df), "Set npm_config_optional=false");
  add("Install fallback (npm ci → npm install)", /(npm ci[^\n]+falling back|legacy-peer-deps)/i.test(df), "Add fallback to npm install --legacy-peer-deps");
}

// 3) .dockerignore basics
const di = r(P(".dockerignore"));
add(".dockerignore has node_modules + dist", !!di && /node_modules/.test(di) && /dist/.test(di), "Add node_modules and dist");

// 4) docker compose config (best-effort)
if (ex(P("docker", "compose.prod.yml"))) {
  const sp = spawnSync("docker", ["compose", "-f", "docker/compose.prod.yml", "config"], { stdio: "pipe" });
  const ok = sp.status === 0 || sp.error?.code === "ENOENT";
  const details = (sp.stderr?.toString() || sp.stdout?.toString() || sp.error?.message || "").trim();
  add("docker compose config (syntax check)", ok, ok ? details : details || "docker compose config failed");
} else add("docker/compose.prod.yml present", false, "Missing file");

// 5) index.html env usage + preload
const idx = r(P("index.html"));
add("index.html uses %VITE_NOAH_FAVICON%", /VITE_NOAH_FAVICON/.test(idx), "Add %VITE_NOAH_FAVICON%");
add("index.html uses %VITE_NOAH_APPLE_TOUCH%", /VITE_NOAH_APPLE_TOUCH/.test(idx), "Add %VITE_NOAH_APPLE_TOUCH%");
add("index.html preloads %VITE_LOGIN_BG%", /preload[^>]+VITE_LOGIN_BG/.test(idx), 'Add <link rel="preload" as="image" href="%VITE_LOGIN_BG%">');

// 6) /public/brand assets
const need = [
  "favicon.ico",
  "apple-touch.png",
  "login-eclipse-desktop.png",
  "login-eclipse@2x.png",
  "login-eclipse-mobile.png",
];
const miss = need.filter(f => !ex(P("public","brand",f)));
add("Brand assets exist in /public/brand", miss.length === 0, miss.length ? `Missing: ${miss.join(", ")}` : "");

// 7) Login screen files
add("src/pages/Login.tsx exists", ex(P("src","pages","Login.tsx")), "Create/adjust login page");
add("src/pages/login.css exists", ex(P("src","pages","login.css")), "Create/adjust login CSS");

// ---- Report
const fails = checks.filter(c=>!c.ok);
const pass = checks.filter(c=>c.ok);
console.log("\nNoah-ERP — PRE-FLIGHT REPORT\n");
for (const c of checks){
  const dots = ".".repeat(Math.max(1, 64 - c.name.length));
  console.log(`${c.ok? "PASS":"FAIL"}  ${c.name} ${dots} ${c.ok? "": c.details}`);
}
console.log(`\nSummary: PASS ${pass.length}  FAIL ${fails.length}\n`);
if (fails.length){ process.exit(1); } else { console.log("Preflight OK. Ready to build/deploy."); process.exit(0); }
