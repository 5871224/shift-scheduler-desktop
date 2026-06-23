const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const rendererPath = path.join(rootDir, "src", "renderer", "renderer.js");
const webApiPath = path.join(rootDir, "src", "renderer", "web-api.js");

const renderer = fs.readFileSync(rendererPath, "utf8");
const webApi = fs.readFileSync(webApiPath, "utf8");

assert(renderer.includes("function createEmptyState()"), "renderer should define createEmptyState");
assert(renderer.includes("let state = createEmptyState();"), "renderer should start from empty state");
assert(renderer.includes("return createEmptyState();"), "invalid payload should fall back to empty state");
assert(renderer.includes("state = createEmptyState();"), "load failure should fall back to empty state");
assert(!renderer.includes("merged.overtime = merged.overtime.length ? [merged.overtime[0]] : [{ ...DEFAULT_STATE.overtime[0] }];"), "empty overtime should no longer restore demo overtime");
assert(webApi.includes("未登入時無法讀取正式班表，請檢查 schedule_documents 的匿名讀取權限"), "anon permission errors should show a clear message");

console.log("empty state checks passed");
