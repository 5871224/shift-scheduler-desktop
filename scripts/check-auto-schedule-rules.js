const assert = require("node:assert/strict");

function holidayTarget(activeDays) {
  return Math.round((activeDays / 56) * 16);
}

function firstPhaseRestNeed(restTarget, existingRestDays) {
  return Math.max(0, Math.round(restTarget / 2) - existingRestDays);
}

function memberCanWorkShift(memberDeptIds, shiftDeptIds) {
  return !shiftDeptIds.length || shiftDeptIds.some((deptId) => memberDeptIds.includes(deptId));
}

assert.equal(holidayTarget(56), 16);
assert.equal(holidayTarget(28), 8);
assert.equal(firstPhaseRestNeed(8, 0), 4);
assert.equal(firstPhaseRestNeed(8, 2), 2);
assert.equal(firstPhaseRestNeed(8, 4), 0);
assert.equal(memberCanWorkShift(["d2"], ["d1", "d2"]), true);
assert.equal(memberCanWorkShift(["d3"], ["d1", "d2"]), false);
assert.equal(memberCanWorkShift(["d3"], []), true);

console.log("auto schedule rules check ok");
