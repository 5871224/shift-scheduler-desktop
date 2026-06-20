const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadPublicConfig() {
  const filePath = path.resolve(__dirname, "..", "src", "renderer", "app-config.js");
  const code = fs.readFileSync(filePath, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox);
  return sandbox.window.SCHEDULER_CONFIG || {};
}

async function main() {
  const config = loadPublicConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error("app-config.js 缺少 supabaseUrl 或 supabaseAnonKey");
  }

  const response = await fetch(
    `${String(config.supabaseUrl).replace(/\/+$/, "")}/auth/v1/settings`,
    {
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(await response.text() || `HTTP ${response.status}`);
  }

  console.log("supabase auth config ok");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
