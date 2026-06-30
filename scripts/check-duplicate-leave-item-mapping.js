const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const renderer = fs.readFileSync(path.join(rootDir, "src", "renderer", "renderer.js"), "utf8");
const webApi = fs.readFileSync(path.join(rootDir, "src", "renderer", "web-api.js"), "utf8");
const sql = fs.readFileSync(path.join(rootDir, "supabase", "014_allow_duplicate_leave_codes.sql"), "utf8");

assert(
  renderer.includes("function getLeaveStyleForRecord(record)") &&
    renderer.includes("leaveItemId: leave.id") &&
    renderer.includes("leaveItemId: record.leaveItemId || publicLeaveMap.get(record.id)?.leaveItemId || \"\""),
  "renderer should preserve manager-selected leave item ids through request refreshes"
);

assert(
  renderer.includes("function getLeaveRequestCatalogId(code)") &&
    renderer.includes("function getLeaveRequestDisplayName(record)") &&
    renderer.includes("id: getLeaveRequestCatalogId(entry.code)") &&
    renderer.includes("getAllowedLeaveRequestItems().find((item) => item.id === leaveItemId)") &&
    renderer.includes("leaveItemId: leave.id") &&
    !renderer.includes("<option value=\"${item.code}\">${escapeHtml(`${item.code} ${item.name}`)}</option>"),
  "employee leave request form should use catalog leave item ids and catalog names, not code-based matching"
);

assert(
  webApi.includes("async function getLeaveTypeByReference(payload = {})") &&
    webApi.includes("scheduler_item_id: `eq.${leaveItemId}`") &&
    webApi.includes("leaveItemId: leaveTypeMap.get(item.leave_type_id)?.scheduler_item_id || \"\"") &&
    webApi.includes("const requestLeaveItems = (state.requestLeaveCatalog || [])") &&
    webApi.includes("const leaveType = await getLeaveTypeByReference(payload);"),
  "web api should resolve and return leave types by scheduler item id, including employee request catalog ids"
);

assert(
  sql.includes("add column if not exists scheduler_item_id text") &&
    sql.includes("drop constraint if exists leave_types_code_key") &&
    sql.includes("leave_item_id text"),
  "supabase migration should allow duplicate leave codes and expose leave_item_id publicly"
);

console.log("duplicate leave item mapping checks passed");
