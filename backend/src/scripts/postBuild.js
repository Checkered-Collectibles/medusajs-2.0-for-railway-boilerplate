// src/scripts/postBuild.js
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const ROOT = process.cwd();
const MEDUSA_SERVER_PATH = path.join(ROOT, ".medusa", "server");

// Ensure .medusa/server exists
if (!fs.existsSync(MEDUSA_SERVER_PATH)) {
  throw new Error(
    ".medusa/server directory not found. This indicates the Medusa build process failed. Please check for build errors.",
  );
}

// Copy pnpm-lock.yaml if it exists
const lockPath = path.join(ROOT, "pnpm-lock.yaml");
if (fs.existsSync(lockPath)) {
  fs.copyFileSync(lockPath, path.join(MEDUSA_SERVER_PATH, "pnpm-lock.yaml"));
}

// Copy .env if it exists (for local/simple setups; in production prefer platform env vars)
const envPath = path.join(ROOT, ".env");
if (fs.existsSync(envPath)) {
  fs.copyFileSync(envPath, path.join(MEDUSA_SERVER_PATH, ".env"));
}

// Ensure src/modules is copied into the build output so custom modules are available
const srcModulesPath = path.join(ROOT, "src", "modules");
if (fs.existsSync(srcModulesPath)) {
  const targetModulesPath = path.join(MEDUSA_SERVER_PATH, "src", "modules");
  // Create target directory if needed
  fs.mkdirSync(path.dirname(targetModulesPath), { recursive: true });

  console.log("Copying src/modules to .medusa/server/src/modules...");
  execSync(cp - r, "${srcModulesPath}", "${targetModulesPath}", {
    stdio: "inherit",
  });
} else {
  console.warn("src/modules directory not found, skipping modules copy.");
}

// Install production dependencies in .medusa/server
console.log("Installing dependencies in .medusa/server...");
execSync("pnpm i --prod --frozen-lockfile", {
  cwd: MEDUSA_SERVER_PATH,
  stdio: "inherit",
});
