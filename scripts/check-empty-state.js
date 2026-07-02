const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const rendererPath = path.join(rootDir, "src", "renderer", "renderer.js");
const webApiPath = path.join(rootDir, "src", "renderer", "web-api.js");
const browserExporterPath = path.join(rootDir, "src", "renderer", "browser-exporter.js");

const renderer = fs.readFileSync(rendererPath, "utf8");
const webApi = fs.readFileSync(webApiPath, "utf8");
const browserExporter = fs.readFileSync(browserExporterPath, "utf8");
const legacyMemberName = ["王", "小", "美"].join("");
const legacyShiftNameSnippet = ['name: "', "早", "班", '"'].join("");

assert(renderer.includes("function createEmptyState()"), "renderer should define createEmptyState");
assert(renderer.includes("let state = createEmptyState();"), "renderer should start from empty state");
assert(renderer.includes("return createEmptyState();"), "invalid payload should fall back to empty state");
assert(renderer.includes("state = createEmptyState();"), "load failure should fall back to empty state");
assert(!renderer.includes("merged.overtime = merged.overtime.length ? [merged.overtime[0]] : [{ ...DEFAULT_STATE.overtime[0] }];"), "empty overtime should no longer restore demo overtime");
const legacyEmployeeCode = ["A", "001"].join("");
assert(!renderer.includes(legacyMemberName) && !renderer.includes(legacyEmployeeCode) && !renderer.includes(legacyShiftNameSnippet), "renderer defaults should not contain demo departments, members, or shifts");
assert(renderer.includes("departments: [],") && renderer.includes("members: [],") && renderer.includes("shifts: [],") && renderer.includes("leaves: [],") && renderer.includes("overtime: [],"), "default state should not provide non-database catalog data");
assert(!browserExporter.includes(legacyMemberName) && !browserExporter.includes(legacyEmployeeCode), "browser exporter self-check should not contain demo member data");
assert(webApi.includes("正規化資料表"), "anon permission errors should show a clear message");

console.log("empty state checks passed");
