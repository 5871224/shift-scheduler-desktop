const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
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
assert(!webApi.includes('restInsert("schedule_documents"'), "saveState should not write schedule_documents JSON");
assert(!webApi.includes('restSelect("schedule_documents"'), "loadState should not read schedule_documents JSON");
assert(webApi.includes('parts.slice(0, -3).join("_")'), "schedule key parser should keep member ids containing underscores");
assert(webApi.includes('deleteRowsByForeignIds("leave_requests", "leave_type_id"'), "deleting leave settings should remove dependent manager leave rows");
assert(webApi.includes('deleteRowsByForeignIds("overtime_requests", "overtime_type_id"'), "deleting overtime settings should remove dependent manager overtime rows");
assert(!webApi.includes("requestLeaveCatalog"), "deleted leave settings should not be preserved by the removed request catalog");

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
