const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const renderer = fs.readFileSync(path.join(rootDir, "src", "renderer", "renderer.js"), "utf8");
const webApi = fs.readFileSync(path.join(rootDir, "src", "renderer", "web-api.js"), "utf8");
const exporter = fs.readFileSync(path.join(rootDir, "src", "renderer", "browser-exporter.js"), "utf8");

assert(
  renderer.includes('const publicRequests = await window.schedulerApi.listPublicScheduleRequests();'),
  "refreshRequestData should supplement manager requests from the public overlay feed"
);
assert(
  renderer.includes('memberCode: record.memberCode || publicLeaveMap.get(record.id)?.memberCode || ""'),
  "leave requests should backfill memberCode from public overlay data"
);
assert(
  renderer.includes('memberCode: record.memberCode || publicOvertimeMap.get(record.id)?.memberCode || ""'),
  "overtime requests should backfill memberCode from public overlay data"
);
assert(
  renderer.includes('const member = state.members.find((item) => item.id === record.memberId)\r\n    || state.members.find((item) => item.code === record.memberCode);')
    || renderer.includes('const member = state.members.find((item) => item.id === record.memberId)\n    || state.members.find((item) => item.code === record.memberCode);'),
  "request overlays should match members by memberId first and fall back to memberCode"
);
assert(
  renderer.includes('data-export-departments="true"') && renderer.includes('data-import-departments="true"'),
  "department settings should expose export and import actions"
);
assert(
  renderer.includes('data-export-settings="${category}"') && renderer.includes('data-import-settings="${category}"'),
  "catalog settings should expose export and import actions"
);
assert(
  webApi.includes("async function exportDepartments(payload)") &&
    webApi.includes("async function importDepartments()") &&
    webApi.includes("async function exportShifts(payload)") &&
    webApi.includes("async function importShifts()") &&
    webApi.includes("async function exportLeaveSettings(payload)") &&
    webApi.includes("async function importLeaveSettings()") &&
    webApi.includes("async function exportOvertimeSettings(payload)") &&
    webApi.includes("async function importOvertimeSettings()"),
  "web api should expose import and export helpers for all requested settings screens"
);
assert(
  exporter.includes("createDepartmentWorkbook") &&
    exporter.includes("parseDepartmentWorkbook") &&
    exporter.includes("createShiftWorkbook") &&
    exporter.includes("parseShiftWorkbook") &&
    exporter.includes("createLeaveSettingsWorkbook") &&
    exporter.includes("parseLeaveSettingsWorkbook") &&
    exporter.includes("createOvertimeSettingsWorkbook") &&
    exporter.includes("parseOvertimeSettingsWorkbook"),
  "browser exporter should support workbook round-trips for all requested settings screens"
);

console.log("request overlay and settings import/export checks passed");
