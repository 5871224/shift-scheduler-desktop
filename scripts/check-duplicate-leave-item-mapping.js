const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const renderer = fs.readFileSync(path.join(rootDir, "src", "renderer", "renderer.js"), "utf8");
const webApi = fs.readFileSync(path.join(rootDir, "src", "renderer", "web-api.js"), "utf8");
const cleanupSql = fs.readFileSync(path.join(rootDir, "supabase", "016_manager_schedule_entries_cleanup.sql"), "utf8");
const normalizedSql = fs.readFileSync(path.join(rootDir, "supabase", "017_normalized_scheduler_storage.sql"), "utf8");

assert(
  renderer.includes("function getLeaveStyleForRecord(record)") &&
    renderer.includes("const leaveItemId = String(record?.leaveItemId || \"\").trim();") &&
    renderer.includes("const configured = state.leaves.find((item) => item.id === leaveItemId);") &&
    renderer.includes("leaveItemId: leave.id") &&
    renderer.includes("leaveItemId: entry.leave.id"),
  "renderer should preserve manager-selected leave item ids through request refreshes"
);

assert(
  renderer.includes("function getLeaveRequestCatalogId(code)") &&
    renderer.includes("function getLeaveRequestDisplayName(record)") &&
    renderer.includes("id: getLeaveRequestCatalogId(entry.code)") &&
    renderer.includes("leaveItemId: leave.id") &&
    !renderer.includes("<option value=\"${item.code}\">${escapeHtml(`${item.code} ${item.name}`)}</option>"),
  "manager leave setting flow should use catalog leave item ids and catalog names, not code-based matching"
);

assert(
  webApi.includes("async function getLeaveTypeByReference(payload = {})") &&
    webApi.includes("scheduler_item_id: `eq.${leaveItemId}`") &&
    webApi.includes("leaveItemId: leaveTypeMap.get(item.leave_type_id)?.scheduler_item_id || \"\"") &&
    webApi.includes("const leaveItems = (state.leaves || []).filter((item) => item?.id && item?.code);") &&
    !webApi.includes("requestLeaveCatalog") &&
    webApi.includes("const leaveType = await getLeaveTypeByReference(payload);"),
  "web api should resolve leave types by scheduler item id without preserving deleted request catalog rows"
);

assert(
  normalizedSql.includes("add column if not exists scheduler_item_id text") &&
    normalizedSql.includes("drop constraint if exists leave_types_code_key") &&
    cleanupSql.includes("leave_item_id text") &&
    cleanupSql.includes("t.scheduler_item_id as leave_item_id"),
  "current supabase migrations should allow duplicate leave codes and expose leave_item_id publicly"
);

console.log("duplicate leave item mapping checks passed");
