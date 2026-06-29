const assert = require("node:assert/strict");

function holidayTarget(activeDays) {
  return Math.round((activeDays / 56) * 16);
}

function memberCanWorkShift(memberDeptIds, shiftDeptIds) {
  return !shiftDeptIds.length || shiftDeptIds.some((deptId) => memberDeptIds.includes(deptId));
}

function chooseDailyAssignments(rawOptions) {
  const options = rawOptions.map((option) => ({
    ...option,
    candidates: option.candidates.map((candidate) => ({ ...candidate }))
  }));
  const assigned = new Set();
  const assignments = [];
  let guard = 0;
  // ponytail: mirrors renderer.js without DOM/state setup; upgrade by importing pure scheduler logic if it grows.
  while (guard < 20) {
    guard += 1;
    const available = options
      .map((option) => ({
        ...option,
        candidates: option.candidates.filter((candidate) => !assigned.has(candidate.id))
      }))
      .filter((option) => option.remaining > 0 && option.candidates.length > 0);
    if (!available.length) break;
    const critical = available.filter((option) => option.candidates.length <= option.remaining);
    const pool = critical.length ? critical : available;
    pool.sort((a, b) => (
      a.candidates.length - b.candidates.length
      || b.remaining - a.remaining
      || a.shift.localeCompare(b.shift)
    ));
    const target = pool[0];
    const member = [...target.candidates].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id))[0];
    assigned.add(member.id);
    options.find((option) => option.shift === target.shift).remaining -= 1;
    assignments.push({ shift: target.shift, member: member.id });
  }
  return assignments;
}

assert.equal(holidayTarget(56), 16);
assert.equal(holidayTarget(28), 8);
assert.equal(Math.max(0, holidayTarget(56) - 8), 8);
assert.equal(Math.max(0, holidayTarget(28) - 4), 4);
assert.equal(memberCanWorkShift(["d2"], ["d1", "d2"]), true);
assert.equal(memberCanWorkShift(["d3"], ["d1", "d2"]), false);
assert.equal(memberCanWorkShift(["d3"], []), true);
assert.deepEqual(chooseDailyAssignments([
  { shift: "critical", remaining: 1, candidates: [{ id: "only", priority: 5 }] },
  { shift: "open", remaining: 1, candidates: [{ id: "only", priority: 5 }, { id: "flex", priority: 1 }] }
]), [
  { shift: "critical", member: "only" },
  { shift: "open", member: "flex" }
]);
assert.deepEqual(chooseDailyAssignments([
  { shift: "unit", remaining: 1, candidates: [{ id: "many_units", priority: 10 }, { id: "few_units", priority: 1 }] }
]), [
  { shift: "unit", member: "few_units" }
]);
assert.deepEqual(chooseDailyAssignments([
  { shift: "first", remaining: 1, candidates: [{ id: "a", priority: 1 }] },
  { shift: "second", remaining: 1, candidates: [{ id: "a", priority: 1 }, { id: "b", priority: 2 }] }
]), [
  { shift: "first", member: "a" },
  { shift: "second", member: "b" }
]);
assert.deepEqual(chooseDailyAssignments([
  { shift: "impossible", remaining: 1, candidates: [] },
  { shift: "fillable", remaining: 1, candidates: [{ id: "home_member", priority: 0 }] }
]), [
  { shift: "fillable", member: "home_member" }
]);

console.log("auto schedule rules check ok");
