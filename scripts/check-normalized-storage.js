const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const renderer = fs.readFileSync(path.join(rootDir, "src", "renderer", "renderer.js"), "utf8");
const webApi = fs.readFileSync(path.join(rootDir, "src", "renderer", "web-api.js"), "utf8");
const migration = fs.readFileSync(path.join(rootDir, "supabase", "017_normalized_scheduler_storage.sql"), "utf8");

assert(webApi.includes('restSelect("departments"'), "loadState should read departments table");
assert(webApi.includes('restSelect("profiles"'), "loadState should read profiles table");
assert(webApi.includes('restSelect("shift_types"'), "loadState should read shift_types table");
assert(webApi.includes('restSelect("leave_types"'), "loadState should read leave_types table");
assert(webApi.includes('restSelect("overtime_types"'), "loadState should read overtime_types table");
assert(webApi.includes('restSelect("schedule_entries"'), "loadState should read schedule_entries table");
assert(webApi.includes('restInsert("departments"'), "saveState should write departments table");
assert(webApi.includes('restInsert("schedule_entries"'), "saveState should write schedule_entries table");
assert(!webApi.includes('restDelete("schedule_entries", { id: "not.is.null" }'), "saveState should not delete every schedule entry globally");
assert(webApi.includes("schedule_month_id: buildInFilter(scheduleMonthIds)"), "saveState should limit schedule entry replacement to synced months");
assert(!webApi.includes('restInsert("schedule_documents"'), "saveState should not write schedule_documents JSON");
assert(!webApi.includes('restSelect("schedule_documents"'), "loadState should not read schedule_documents JSON");
assert(webApi.includes('parts.slice(0, -3).join("_")'), "schedule key parser should keep member ids containing underscores");
assert(webApi.includes('deleteRowsByForeignIds("leave_requests", "leave_type_id"'), "deleting leave settings should remove dependent manager leave rows");
assert(webApi.includes('deleteRowsByForeignIds("overtime_requests", "overtime_type_id"'), "deleting overtime settings should remove dependent manager overtime rows");
assert(webApi.includes('clearScheduleEntriesByForeignIds("leave_type_id"'), "deleting leave settings should clear schedule entry leave references before deleting leave types");
assert(webApi.includes('clearScheduleEntriesByForeignIds("overtime_type_id"'), "deleting overtime settings should clear schedule entry overtime references before deleting overtime types");
assert(webApi.includes("async function getOvertimeTypeByReference(payload = {})"), "manager overtime entries should resolve overtime_types by scheduler item id");
assert(webApi.includes("scheduler_item_id: `eq.${overtimeItemId}`"), "manager overtime entries should use overtime item ids instead of name-only lookup");
assert(!renderer.includes("merged.overtime = merged.overtime.length ? [merged.overtime[0]] : [];"), "overtime settings should keep every overtime type from storage");
assert(renderer.includes("state.overtime.find((item) => item.id === record.overtimeItemId)"), "manager overtime overlays should resolve the matching overtime item id");
assert(webApi.includes("overtimeItemId: overtimeTypeMap.get(item.overtime_type_id)?.scheduler_item_id"), "manager overtime list should include scheduler overtime item ids");
assert(!webApi.includes("requestLeaveCatalog"), "deleted leave settings should not be preserved by the removed request catalog");
assert(webApi.includes("function isLegacyRequestCatalogRow(row)") && webApi.includes("!isLegacyRequestCatalogRow(row)"), "legacy catalog leave rows should not load as active leave settings");
assert(webApi.includes("!String(id).startsWith(\"catalog:\")"), "legacy catalog leave ids should not be preserved during save");

assert(migration.includes("create table if not exists public.scheduler_settings"), "migration should create scheduler_settings");
assert(migration.includes("create table if not exists public.schedule_entries"), "migration should create schedule_entries");
assert(migration.includes("create table if not exists public.holidays"), "migration should create holidays");
assert(migration.includes("drop constraint if exists profiles_id_fkey"), "profiles should store scheduler members without requiring auth users");
assert(migration.includes("insert into public.profiles"), "migration should backfill legacy members into profiles");
assert(migration.includes("array_to_string(key_parts[1:part_count - 3], '_')"), "migration should keep scheduler member ids containing underscores");
assert(migration.includes("leave_requests_leave_type_id_fkey") && migration.includes("on delete cascade"), "leave request foreign key should not block deleting leave settings");
assert(migration.includes("overtime_requests_overtime_type_id_fkey") && migration.includes("on delete cascade"), "overtime request foreign key should not block deleting overtime settings");
assert(migration.includes("from public.schedule_documents"), "migration should backfill from legacy JSON once");

console.log("normalized storage checks passed");
