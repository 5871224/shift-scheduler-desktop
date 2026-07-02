const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const renderer = fs.readFileSync(path.join(rootDir, "src", "renderer", "renderer.js"), "utf8");
const index = fs.readFileSync(path.join(rootDir, "src", "renderer", "index.html"), "utf8");
const webApi = fs.readFileSync(path.join(rootDir, "src", "renderer", "web-api.js"), "utf8");
const migration = fs.readFileSync(path.join(rootDir, "supabase", "015_auto_schedule_settings.sql"), "utf8");
const normalizedMigration = fs.readFileSync(path.join(rootDir, "supabase", "017_normalized_scheduler_storage.sql"), "utf8");

assert(index.includes("weekStartSettingsButton"), "floating function menu should show month/week settings");
assert(renderer.includes("monthStartDay: 1") && renderer.includes("monthStartSetting"), "renderer should persist month start day");
assert(renderer.includes("shiftRequiredStaffCount") && renderer.includes("requiredStaffCount"), "shift settings should include required staff count");
assert(renderer.includes("memberScheduleDeptList") && renderer.includes("scheduleDeptIds"), "member settings should include ordered schedule departments");
assert(renderer.includes("monthlyRestDays"), "member settings should include monthly rest days");
assert(renderer.includes('data-set-department-view="department"') && renderer.includes('data-set-department-view="member"'), "department settings should support both views");
assert(webApi.includes("scheduleDepartmentIds") && webApi.includes("required_staff_count"), "web api should sync auto schedule settings");
assert(
  migration.includes("schedule_department_ids") &&
    migration.includes("monthly_rest_days") &&
    migration.includes("required_staff_count") &&
    migration.includes("month_start_day"),
  "migration should add database fields for auto schedule settings"
);
assert(
    normalizedMigration.includes("fixed_rest_weekday") &&
    normalizedMigration.includes("public.member_departments") &&
    normalizedMigration.includes("public.shift_types") &&
    normalizedMigration.includes("month_start_day") &&
    !normalizedMigration.includes("create table if not exists public.schedule_months"),
  "normalized migration should preserve auto schedule settings tables"
);

console.log("auto schedule settings checks passed");
