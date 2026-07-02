const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const renderer = fs.readFileSync(path.join(rootDir, "src", "renderer", "renderer.js"), "utf8");
const webApi = fs.readFileSync(path.join(rootDir, "src", "renderer", "web-api.js"), "utf8");
const exporter = fs.readFileSync(path.join(rootDir, "src", "renderer", "browser-exporter.js"), "utf8");
const initialSql = fs.readFileSync(path.join(rootDir, "supabase", "001_initial_schema.sql"), "utf8");
const cleanupSql = fs.readFileSync(path.join(rootDir, "supabase", "016_manager_schedule_entries_cleanup.sql"), "utf8");
const unusedSql = fs.readFileSync(path.join(rootDir, "supabase", "018_drop_unused_tables.sql"), "utf8");

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
  !renderer.includes("getRequestStatusLabel") &&
    !renderer.includes("function isManagerRequestSource") &&
    !renderer.includes("function isEffectiveRequestStatus") &&
    !renderer.includes("const onlyManagerRecords") &&
    !renderer.includes("record.source") &&
    !renderer.includes("record.status"),
  "renderer should not depend on request approval/source fields"
);
assert(
  renderer.includes("void refreshScheduleRequestsAfterInitialRender();") &&
    renderer.includes("async function refreshScheduleRequestsAfterInitialRender()") &&
    renderer.includes("syncManagerEntriesToSchedule();") &&
    !renderer.includes("syncApprovedRequestsToSchedule"),
  "schedule should render before slower request sync runs"
);
assert(
  renderer.includes("const canEditScheduleOrder = canEditSchedule();") &&
    renderer.includes('data-table-member-id="${escapeHtml(member.id)}"') &&
    renderer.includes('if (!canEditSchedule()) return;') &&
    renderer.includes("const canDragScheduleOrder = canEditSchedule() && state.tableView !== \"shift\";"),
  "schedule table drag and double-click edit paths should require manager edit permission"
);
assert(
  !webApi.includes("async function createLeaveRequest") &&
    !webApi.includes("async function createOvertimeRequest") &&
    !webApi.includes("async function updateLeaveRequest") &&
    !webApi.includes("async function updateOvertimeRequest(payload)") &&
    !webApi.includes("async function deleteLeaveRequest") &&
    !webApi.includes("async function deleteOvertimeRequest") &&
    !webApi.includes("status: \"approved\"") &&
    !webApi.includes("source: \"manager\"") &&
    !webApi.includes("manager_note") &&
    !webApi.includes("approved_by") &&
    !webApi.includes("approved_at"),
  "web api should not expose employee request, approval, or source helpers"
);
assert(
  webApi.includes("async function createManagerLeaveRequest(payload)") &&
    webApi.includes("async function updateManagerLeaveRequest(payload)") &&
    webApi.includes("async function deleteManagerLeaveRequest(requestId)") &&
    webApi.includes("async function createManagerOvertimeRequest(payload)") &&
    webApi.includes("async function updateManagerOvertimeRequest(payload)") &&
    webApi.includes("async function deleteManagerOvertimeRequest(requestId)") &&
    webApi.includes("const overtimeType = await getOvertimeTypeByReference(payload);") &&
    renderer.includes("overtimeItemId: overtime.id"),
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
  renderer.includes("function migrateLegacyScheduleRequests()") &&
    renderer.includes("function buildPersistedState()"),
  "renderer should keep migrating legacy schedule leave/overtime into manager tables"
);
assert(
  renderer.includes("async function clearManagerEntriesFromSlot(slot") &&
    renderer.includes('await deleteManagerScheduleEntry("leave", slot.leaveRequestId);') &&
    renderer.includes('await deleteManagerScheduleEntry("overtime", slot.overtimeRequestId);') &&
    renderer.includes("async function clearSelectedScheduleCells()") &&
    renderer.includes("async function pasteScheduleClipboard()"),
  "keyboard delete and paste should remove manager leave/overtime rows before clearing cells"
);
assert(
  !renderer.includes("request-leave-") &&
    !renderer.includes("getAllowedLeaveRequestItems") &&
    !renderer.includes("getLeaveRequestCatalogId") &&
    !renderer.includes("getLeaveRequestDisplayName") &&
    !renderer.includes("requestStyles") &&
    !renderer.includes("請假申請") &&
    !renderer.includes("加班申請"),
  "renderer should not keep removed employee request catalog or wording"
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
  !exporter.includes("請假申請預覽") &&
    !exporter.includes("加班申請預覽") &&
    !exporter.includes("requestStyles") &&
    !exporter.includes("requestStyle"),
  "settings workbooks should not keep removed request preview sheets"
);
assert(
  !initialSql.includes("request_status") &&
    !initialSql.includes("request_type") &&
    !initialSql.includes("approved_by") &&
    !initialSql.includes("approved_at") &&
    !initialSql.includes("manager_note") &&
    !initialSql.includes("employees_can_insert_own_leave_requests") &&
    !initialSql.includes("employees_can_insert_own_overtime_requests") &&
    initialSql.includes("create table public.clock_locations") &&
    initialSql.includes("create table public.attendance_logs"),
  "initial schema should not recreate removed employee request approval fields"
);
assert(
  cleanupSql.includes("delete from public.leave_requests") &&
    cleanupSql.includes("delete from public.overtime_requests") &&
    cleanupSql.includes('drop policy if exists "employees_can_insert_own_leave_requests"') &&
    cleanupSql.includes('drop policy if exists "employees_can_update_own_leave_requests"') &&
    cleanupSql.includes('drop policy if exists "employees_can_delete_own_pending_leave_requests"') &&
    cleanupSql.includes('drop policy if exists "employees_can_insert_own_overtime_requests"') &&
    cleanupSql.includes('drop policy if exists "employees_can_update_own_overtime_requests"') &&
    cleanupSql.includes('drop policy if exists "employees_can_delete_own_pending_overtime_requests"') &&
    cleanupSql.includes("drop column if exists source cascade") &&
    cleanupSql.includes("drop column if exists status cascade") &&
    cleanupSql.includes("drop column if exists approved_by cascade") &&
    cleanupSql.includes("drop column if exists approved_at cascade") &&
    cleanupSql.includes("drop column if exists manager_note cascade") &&
    cleanupSql.includes("drop table if exists public.manager_departments") &&
    cleanupSql.includes("drop type if exists public.request_type") &&
    !cleanupSql.includes("drop table if exists public.attendance_logs") &&
    !cleanupSql.includes("drop table if exists public.clock_locations") &&
    !cleanupSql.includes("drop table if exists public.schedule_entries") &&
    !cleanupSql.includes("drop table if exists public.schedule_months") &&
    !cleanupSql.includes("drop table if exists public.shift_types") &&
    !cleanupSql.includes("drop table if exists public.member_departments"),
  "supabase migration should remove employee request and approval columns"
);
assert(
  unusedSql.includes("drop table if exists public.manager_departments") &&
    unusedSql.includes("drop table if exists public.schedule_documents") &&
    unusedSql.includes("drop type if exists public.request_type") &&
    !unusedSql.includes("drop table if exists public.attendance_logs") &&
    !unusedSql.includes("drop table if exists public.clock_locations"),
  "unused-table cleanup should keep attendance tables for the next feature"
);
assert(
  cleanupSql.includes("create or replace function public.enforce_single_effective_leave_request()") &&
    cleanupSql.includes("create or replace function public.enforce_single_effective_overtime_request()") &&
    !cleanupSql.includes("r.status in") &&
    !cleanupSql.includes("returns table (\n  kind text,\n  request_id uuid,\n  member_code text,\n  member_name text,\n  leave_item_id text,\n  leave_code text,\n  leave_name text,\n  overtime_name text,\n  start_date date,\n  end_date date,\n  work_date date,\n  is_all_day boolean,\n  start_time time,\n  end_time time,\n  use_rest_1 boolean,\n  rest_1_start_time time,\n  rest_1_end_time time,\n  use_rest_2 boolean,\n  rest_2_start_time time,\n  rest_2_end_time time,\n  source text"),
  "supabase duplicate guards and public RPC should not depend on approval status/source"
);

console.log("manager schedule entry cleanup and settings import/export checks passed");
