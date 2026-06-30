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
  renderer.includes('const publicRequests = await window.schedulerApi.listPublicScheduleRequests();'),
  "refreshRequestData should supplement manager requests from the public overlay feed"
);
assert(
  renderer.includes("function isValidDateTimeRange(startDate, startTime, endDate, endTime)") &&
    renderer.includes("!isAllDay && !isValidDateTimeRange(startDate, startTime, endDate, endTime)"),
  "leave request validation should compare combined start/end date-times"
);
assert(
  renderer.includes("const today = getTodayDateString();") &&
    renderer.includes('<input id="leaveRequestStartDate" type="date" value="${today}">') &&
    renderer.includes('<input id="leaveRequestEndDate" type="date" value="${today}">'),
  "leave request start and end dates should default to today"
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
  webApi.includes("async function createManagerLeaveRequest(payload)") &&
    webApi.includes("async function updateManagerLeaveRequest(payload)") &&
    webApi.includes("async function deleteManagerLeaveRequest(requestId)") &&
    webApi.includes("async function createManagerOvertimeRequest(payload)") &&
    webApi.includes("async function updateManagerOvertimeRequest(payload)") &&
    webApi.includes("async function deleteManagerOvertimeRequest(requestId)"),
  "web api should expose manager-side leave and overtime request helpers"
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
assert(
  exporter.includes('["工號", "姓名", "所屬單位", "排班單位", "權限", "到職日", "離職日", "計薪方式", "例假星期"]') &&
    exporter.includes("scheduleDepartmentNames") &&
    renderer.includes("hasUnknownScheduleDepartment"),
  "member import/export should include schedule departments and skip rows with unknown schedule departments"
);
assert(
  exporter.includes('["班別", "適用單位", "需求人數", "上班時間", "下班時間", "底色", "字色", "自動字色", "不顯示"]') &&
    exporter.includes("requiredStaffCountColumn") &&
    renderer.includes("requiredStaffCount: Math.max(0, Number(row.requiredStaffCount) || 0)"),
  "shift import/export should include required staff count"
);
assert(
  renderer.includes("const EFFECTIVE_REQUEST_STATUSES = new Set([\"pending\", \"approved\"]);") &&
    renderer.includes("function findEffectiveLeaveRequestConflict(") &&
    renderer.includes("function findEffectiveOvertimeRequestConflict("),
  "renderer should define effective-request conflict helpers"
);
assert(
  renderer.includes("function isManagerRequestSource(source)") &&
    renderer.includes("function migrateLegacyScheduleRequests()") &&
    renderer.includes("requestSource: record.source || \"employee\"") &&
    renderer.includes("function buildPersistedState()"),
  "renderer should distinguish manager entries and migrate legacy schedule leave/overtime into request tables"
);
assert(
  renderer.includes("同一天只能有一筆請假（待審核或已核準）") &&
    renderer.includes("同一天只能有一筆加班（待審核或已核準）"),
  "renderer should block duplicate effective leave and overtime entries in the UI"
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

console.log("request overlay and settings import/export checks passed");
