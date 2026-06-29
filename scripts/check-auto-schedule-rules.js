const assert = require("node:assert/strict");

function holidayTarget(activeDays) {
  return Math.round((activeDays / 56) * 16);
}

function memberCanWorkShift(memberDeptIds, shiftDeptIds) {
  return !shiftDeptIds.length || shiftDeptIds.some((deptId) => memberDeptIds.includes(deptId));
}

function chooseDailyAssignments(slots) {
  let best = { score: Number.POSITIVE_INFINITY, assignments: [] };
  const search = (index, used, assignments, score) => {
    if (score >= best.score) return;
    if (index >= slots.length) {
      best = { score, assignments: [...assignments] };
      return;
    }
    const slot = slots[index];
    slot.candidates.filter((candidate) => !used.has(candidate.id)).forEach((candidate) => {
      used.add(candidate.id);
      assignments.push({ shift: slot.shift, member: candidate.id });
      search(index + 1, used, assignments, score + candidate.score);
      assignments.pop();
      used.delete(candidate.id);
    });
    search(index + 1, used, assignments, score + 1000000);
  };
  search(0, new Set(), [], 0);
  return best.assignments;
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

console.log("auto schedule rules check ok");
