const assert = require("node:assert/strict");

function holidayTarget(activeDays) {
  return Math.round((activeDays / 56) * 16);
}

function memberCanWorkShift(memberDeptIds, shiftDeptIds) {
  return !shiftDeptIds.length || shiftDeptIds.some((deptId) => memberDeptIds.includes(deptId));
}

assert.equal(holidayTarget(56), 16);
assert.equal(holidayTarget(28), 8);
assert.equal(Math.max(0, holidayTarget(56) - 8), 8);
assert.equal(Math.max(0, holidayTarget(28) - 4), 4);
assert.equal(memberCanWorkShift(["d2"], ["d1", "d2"]), true);
assert.equal(memberCanWorkShift(["d3"], ["d1", "d2"]), false);
assert.equal(memberCanWorkShift(["d3"], []), true);

console.log("auto schedule rules check ok");
