const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const rendererPath = path.join(rootDir, "src", "renderer", "renderer.js");
const stylesPath = path.join(rootDir, "src", "renderer", "styles.css");

const renderer = fs.readFileSync(rendererPath, "utf8");
const styles = fs.readFileSync(stylesPath, "utf8");

assert(renderer.includes('class="settings-table-wrap"'), "settings list should render table wrap");
assert(renderer.includes('data-sort-category="${category}"'), "settings list should keep drag category on rows");
assert(renderer.includes("假別代碼"), "leave settings should expose a leave-code column");
assert(renderer.includes("需填時間"), "leave settings should expose required-time column");
assert(renderer.includes("需填原因"), "leave settings should expose required-reason column");
assert(renderer.includes("function renderActionIconButton"), "action icon helper should exist");
assert(renderer.includes('renderActionIconButton("edit"'), "edit actions should use the shared icon helper");
assert(renderer.includes('renderActionIconButton("delete"'), "delete actions should use the shared icon helper");
assert(!renderer.includes(">修改</button>"), "edit actions should no longer use text buttons");
assert(!renderer.includes(">刪除</button>"), "delete actions should no longer use text buttons");
assert(renderer.includes('data-sort-category="department"'), "department settings should support drag sorting");
assert(renderer.includes('data-drop-member="${member.id}"'), "department settings should support dropping onto members for reordering");
assert(renderer.includes('<span>${escapeHtml(member.name)}</span>'), "department settings should show member names without employee codes");
assert(renderer.includes('showInfoMessage("這個單位還有人員，請先將人員移轉到其他單位後再刪除。");'), "department deletion should be blocked while members remain");
assert(renderer.includes('openListSettings("shift");'), "saving shifts should return to shift settings");
assert(renderer.includes('openDepartmentSettings();'), "saving departments should return to department settings");
assert(renderer.includes('openMemberSettings();'), "saving members should return to member settings");
assert(renderer.includes('openListSettings(category);'), "saving named settings should return to their settings list");
assert(renderer.includes('if (category === "shift") {\n    state.shifts = currentList;'), "shift reorder should persist to state.shifts");
assert(renderer.includes('if (category === "leave") {\n    state.leaves = currentList;'), "leave reorder should persist to state.leaves");
assert(renderer.includes('if (category === "department") {\n    state.departments = currentList;'), "department reorder should persist to state.departments");

assert(styles.includes(".catalog-settings-modal"), "catalog settings modal styles should exist");
assert(styles.includes(".department-settings-modal"), "department settings modal styles should exist");
assert(styles.includes(".settings-table-row-shift"), "shift table row styles should exist");
assert(styles.includes(".settings-table-row-leave"), "leave table row styles should exist");
assert(styles.includes(".settings-table-code"), "leave settings code column styles should exist");
assert(styles.includes(".settings-icon-btn"), "settings icon button styles should exist");
assert(styles.includes(".member-main {\n  font-size: inherit;"), "member name size should match the department text size");
assert(styles.includes(".member-inline-list"), "department row should render inline member list");

console.log("settings list checks passed");
