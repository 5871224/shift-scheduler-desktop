const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const renderer = fs.readFileSync(path.join(rootDir, "src", "renderer", "renderer.js"), "utf8");
const webApi = fs.readFileSync(path.join(rootDir, "src", "renderer", "web-api.js"), "utf8");
const exporter = fs.readFileSync(path.join(rootDir, "src", "renderer", "browser-exporter.js"), "utf8");
const requestConstraintSql = fs.readFileSync(path.join(rootDir, "supabase", "010_request_single_effective_entry.sql"), "utf8");
const requestSourceSql = fs.readFileSync(path.join(rootDir, "supabase", "011_request_source_manager.sql"), "utf8");

assert(
  renderer.includes("const onlyManagerRecords = (records) => (records || []).filter((record) => isManagerRequestSource(record.source || \"\"));") &&
    renderer.includes("leaveRequestRecords = onlyManagerRecords(publicRequests.leaveRequests);") &&
    renderer.includes("overtimeRequestRecords = onlyManagerRecords(publicRequests.overtimeRequests);"),
  "request overlays should only include manager-side leave and overtime settings"
);
assert(
  !renderer.includes("lines.push(`狀態：${getRequestStatusLabel("),
  "manager leave and overtime tooltips should not show approval status"
);
assert(
  !renderer.includes('data-open-leave-request="true"') &&
    !renderer.includes('data-open-overtime-request="true"') &&
    !renderer.includes("openLeaveRequestModal") &&
    !renderer.includes("openOvertimeRequestModal") &&
    !renderer.includes("openLeaveApprovalModal") &&
    !renderer.includes("openOvertimeApprovalModal"),
  "employee request and review UI should be removed"
);
assert(
  !webApi.includes("createLeaveRequest,") &&
    !webApi.includes("createOvertimeRequest,") &&
    !webApi.includes("updateLeaveRequest,") &&
    !webApi.includes("updateOvertimeRequest,") &&
    !webApi.includes("deleteLeaveRequest,") &&
    !webApi.includes("deleteOvertimeRequest,"),
  "web api should not expose employee request or review helpers"
);
assert(
  webApi.includes("async function createManagerLeaveRequest(payload)") &&
    webApi.includes("async function updateManagerLeaveRequest(payload)") &&
    webApi.includes("async function deleteManagerLeaveRequest(requestId)") &&
    webApi.includes("async function createManagerOvertimeRequest(payload)") &&
    webApi.includes("async function updateManagerOvertimeRequest(payload)") &&
    webApi.includes("async function deleteManagerOvertimeRequest(requestId)"),
  "web api should expose manager-side leave and overtime helpers"
);
assert(
  renderer.includes("const member = state.members.find((item) => item.id === record.memberId)\r\n    || state.members.find((item) => item.code === record.memberCode);")
    || renderer.includes("const member = state.members.find((item) => item.id === record.memberId)\n    || state.members.find((item) => item.code === record.memberCode);"),
  "manager overlays should match members by memberId first and fall back to memberCode"
);
assert(
  renderer.includes("function findEffectiveLeaveRequestConflict(") &&
    renderer.includes("function findEffectiveOvertimeRequestConflict(") &&
    renderer.includes("function findDirectLeaveScheduleConflict(") &&
    renderer.includes("function hasDirectOvertimeScheduleConflict("),
  "renderer should keep duplicate manager leave and overtime guards"
);
assert(
  renderer.includes("function isManagerRequestSource(source)") &&
    renderer.includes("function migrateLegacyScheduleRequests()") &&
    renderer.includes("requestSource: record.source || \"employee\"") &&
    renderer.includes("function buildPersistedState()"),
  "renderer should distinguish manager entries and migrate legacy schedule leave/overtime into request tables"
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
  "web api should expose import and export helpers for all settings screens"
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
  "browser exporter should support workbook round-trips for settings screens"
);
assert(
  requestConstraintSql.includes("create or replace function public.enforce_single_effective_leave_request()") &&
    requestConstraintSql.includes("create or replace function public.enforce_single_effective_overtime_request()"),
  "supabase should enforce duplicate effective request rules for leave and overtime tables"
);
assert(
  requestSourceSql.includes("add column if not exists source text not null default 'employee'") &&
    requestSourceSql.includes("check (source in ('employee', 'manager'))"),
  "supabase should track whether a request comes from an employee or a manager"
);

console.log("manager request overlay and settings import/export checks passed");
