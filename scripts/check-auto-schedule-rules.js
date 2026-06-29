const assert = require("node:assert/strict");

function holidayTarget(activeDays) {
  return Math.round((activeDays / 56) * 16);
}

function memberCanWorkShift(memberDeptIds, shiftDeptIds) {
  return !shiftDeptIds.length || shiftDeptIds.some((deptId) => memberDeptIds.includes(deptId));
}

function chooseDailyAssignments(slots) {
  let complete = null;
  let bestPartial = [];
  const search = (index, used, assignments) => {
    if (complete) return;
    if (assignments.length > bestPartial.length) bestPartial = [...assignments];
    if (index >= slots.length) {
      if (assignments.length === slots.length) complete = [...assignments];
      return;
    }
    const slot = slots[index];
    slot.candidates.filter((candidate) => !used.has(candidate.id)).forEach((candidate) => {
      used.add(candidate.id);
      assignments.push({ shift: slot.shift, member: candidate.id });
      search(index + 1, used, assignments);
      assignments.pop();
      used.delete(candidate.id);
    });
    search(index + 1, used, assignments);
  };
  search(0, new Set(), []);
  return complete || bestPartial;
}

assert.equal(holidayTarget(56), 16);
assert.equal(holidayTarget(28), 8);
assert.equal(Math.max(0, holidayTarget(56) - 8), 8);
assert.equal(Math.max(0, holidayTarget(28) - 4), 4);
assert.equal(memberCanWorkShift(["d2"], ["d1", "d2"]), true);
assert.equal(memberCanWorkShift(["d3"], ["d1", "d2"]), false);
assert.equal(memberCanWorkShift(["d3"], []), true);
assert.deepEqual(chooseDailyAssignments([
  { shift: "scarce", candidates: [{ id: "must_work", score: -10000 }] },
  { shift: "open", candidates: [{ id: "must_work", score: -10000 }, { id: "flex", score: 10 }] }
]), [
  { shift: "scarce", member: "must_work" },
  { shift: "open", member: "flex" }
]);
assert.deepEqual(chooseDailyAssignments([
  { shift: "first", candidates: [{ id: "a", score: 99 }, { id: "b", score: 1 }] },
  { shift: "second", candidates: [{ id: "b", score: 1 }, { id: "a", score: 99 }] }
]), [
  { shift: "first", member: "a" },
  { shift: "second", member: "b" }
]);
assert.deepEqual(chooseDailyAssignments([
  { shift: "impossible", candidates: [] },
  { shift: "fillable", candidates: [{ id: "home_member", score: 0 }] }
]), [
  { shift: "fillable", member: "home_member" }
]);

console.log("auto schedule rules check ok");
