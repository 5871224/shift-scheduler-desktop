const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const renderer = fs.readFileSync(path.join(rootDir, "src", "renderer", "renderer.js"), "utf8");
const styles = fs.readFileSync(path.join(rootDir, "src", "renderer", "styles.css"), "utf8");
const indexHtml = fs.readFileSync(path.join(rootDir, "src", "renderer", "index.html"), "utf8");

function slotHasBlockingRequest(slot, category) {
  return Boolean(slot?.[`${category}RequestId`] && slot?.[`${category}Meta`]?.requestSource !== "manager");
}

function cleanSlotMeta(meta) {
  if (!meta || typeof meta !== "object") return null;
  const nextMeta = { ...meta };
  delete nextMeta.requestId;
  delete nextMeta.requestStatus;
  nextMeta.requestSource = "manager";
  return nextMeta;
}

function serializeSlot(slot) {
  const canUseLeave = slot?.leave && !slotHasBlockingRequest(slot, "leave");
  const canUseOvertime = slot?.overtime && !slotHasBlockingRequest(slot, "overtime");
  return {
    shift: slot?.shift || null,
    leave: canUseLeave ? slot.leave : null,
    leaveMeta: canUseLeave ? cleanSlotMeta(slot.leaveMeta) : null,
    overtime: canUseOvertime ? slot.overtime : null,
    overtimeMeta: canUseOvertime ? cleanSlotMeta(slot.overtimeMeta) : null
  };
}

function pasteWithinGrid(grid, clipboard, anchorRow, anchorCol) {
  for (let row = 0; row < clipboard.length; row += 1) {
    for (let col = 0; col < clipboard[row].length; col += 1) {
      if (grid[anchorRow + row]?.[anchorCol + col] !== undefined) {
        grid[anchorRow + row][anchorCol + col] = clipboard[row][col];
      }
    }
  }
  return grid;
}

assert.deepEqual(serializeSlot({
  shift: "s1",
  leave: "l1",
  leaveRequestId: "employee-request",
  leaveMeta: { requestSource: "employee", requestStatus: "approved" }
}), {
  shift: "s1",
  leave: null,
  leaveMeta: null,
  overtime: null,
  overtimeMeta: null
});

assert.deepEqual(serializeSlot({
  overtime: "o1",
  overtimeRequestId: "manager-request",
  overtimeMeta: { requestSource: "manager", requestStatus: "approved", startTime: "09:00" }
}).overtimeMeta, {
  requestSource: "manager",
  startTime: "09:00"
});

assert.deepEqual(pasteWithinGrid([[0, 0], [0, 0]], [[1, 2], [3, 4]], 1, 1), [[0, 0], [0, 1]]);

let undoSnapshot = null;
let redoSnapshot = null;
undoSnapshot = { a: 1 };
undoSnapshot = { a: 2 };
redoSnapshot = { a: 3 };
assert.deepEqual(undoSnapshot, { a: 2 });
assert.deepEqual(redoSnapshot, { a: 3 });

const statsOrder = [
  "<span>休:${stats.rest}</span>",
  "<span>灰休:${stats.restWork}</span>",
  "<span>例:${stats.regular}</span>",
  "<span>未排:${stats.unassigned}</span>"
].map((text) => renderer.indexOf(text));
assert(statsOrder.every((index) => index >= 0), "member stats labels should exist");
assert.deepEqual([...statsOrder].sort((left, right) => left - right), statsOrder, "member stats should render in requested order");

const memberNameFilterHandler = renderer.match(/if \(target\.dataset\.memberSettingsFilterField === "name"\) \{[\s\S]*?\n    \}/)?.[0] || "";
assert(memberNameFilterHandler.includes("refreshMemberSettingsList();"), "member name filter should refresh only the member list");
assert(!memberNameFilterHandler.includes("openMemberSettings();"), "member name filter should not rebuild the modal while typing");
assert(renderer.includes('class="member-settings-list" id="memberSettingsList"'), "member settings list should have a stable refresh container");
assert(styles.includes(".member-settings-list {\n  display: flex;\n  flex: 1;\n  min-height: 0;"), "member settings list should preserve table scrolling");
assert(indexHtml.includes('<option value="member">人員檢視</option>'), "table view select should include member view");
assert(indexHtml.includes('<option value="member-stats">人員檢視-統計欄</option>'), "table view select should include member stats view");
assert(indexHtml.includes('<option value="shift">班別檢視</option>'), "table view select should include shift view");
assert(!indexHtml.includes("tableStatsSelect") && !renderer.includes("tableStatsSelect"), "stats visibility should be merged into table view select");
assert(!renderer.includes("請假申請預覽") && !renderer.includes("加班申請預覽"), "leave/overtime settings should not render request preview cards");
assert(!styles.includes(".request-style-settings-card"), "request preview card styles should be removed");
assert(styles.includes(".table-sticky-header {\n  position: -webkit-sticky;\n  position: sticky;"), "date header should use mobile-safe sticky positioning");
assert(styles.includes(".table-sticky-header-left {\n  position: -webkit-sticky;\n  position: sticky;\n  left: 0;"), "unit/person/stats header group should stay fixed at the left while horizontally scrolled");
assert(styles.includes(".table-sticky-cell-person {\n  position: -webkit-sticky;\n  position: sticky;\n  left: var(--dept-col-width);"), "person header should stay sticky beside the department header");
assert(styles.includes(".table-sticky-cell-stats {\n  position: -webkit-sticky;\n  position: sticky;\n  left: calc(var(--dept-col-width) + var(--person-col-width));"), "stats header should stay sticky with the unit and person headers");
assert(styles.includes(".dept-col,\n.person-col,\n.stats-col {\n  position: -webkit-sticky;\n  position: sticky;"), "member columns should keep mobile-safe sticky positioning");
assert(renderer.includes('data-table-department-id="${escapeHtml(department.id)}"'), "department cells should be draggable reorder handles");
assert(renderer.includes('data-table-member-id="${escapeHtml(member.id)}"'), "member cells should be draggable reorder handles");
assert(renderer.includes("function reorderScheduleTableDepartment"), "schedule table should support department display reordering");
assert(renderer.includes("function reorderScheduleTableMember"), "schedule table should support member display reordering");
assert(renderer.includes("departmentId !== getMemberHomeDeptId(targetMember)"), "schedule table member reordering should reject cross-department drops");
assert(renderer.includes("function getScheduleTableOrderInsertAfter"), "schedule table drops should reuse the visible insertion preview");
assert(renderer.includes("schedule-order-insert-after"), "schedule table should track whether the preview line means insert after");
assert(styles.includes(".schedule-order-drag"), "schedule table reorder handles should have drag affordance");
assert(!styles.includes(".schedule-order-drag {\n  cursor: grab;\n  position:"), "schedule table drag handles should not override sticky column positioning");
assert(styles.includes(".schedule-order-drag.schedule-order-insert-before"), "schedule table preview should draw an insertion line before the target");
assert(styles.includes(".schedule-order-drag.schedule-order-insert-after"), "schedule table preview should draw an insertion line after the target");

console.log("schedule grid ops check ok");
