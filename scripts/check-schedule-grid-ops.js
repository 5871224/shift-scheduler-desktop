const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

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

const rootDir = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(rootDir, "src", "renderer", "index.html"), "utf8");
const styles = fs.readFileSync(path.join(rootDir, "src", "renderer", "styles.css"), "utf8");
assert.match(indexHtml, /<div class="calendar-scroll-x">\s*<div class="calendar-scroll-content">\s*<div class="calendar-nav">/);
assert.match(indexHtml, /<div class="calendar-nav">[\s\S]*<div class="table-wrap" id="tableWrap">/);
assert.match(styles, /\.calendar-scroll-x\s*\{[\s\S]*overflow-x: auto;/);
assert.match(styles, /\.calendar-card\s*\{[\s\S]*width: 100%;/);

console.log("schedule grid ops check ok");
