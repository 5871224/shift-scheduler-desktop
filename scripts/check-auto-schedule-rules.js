const assert = require("node:assert/strict");

function holidayTarget(activeDays) {
  return Math.round((activeDays / 56) * 16);
}

function memberCanWorkShift(memberDeptIds, shiftDeptIds) {
  return !shiftDeptIds.length || shiftDeptIds.some((deptId) => memberDeptIds.includes(deptId));
}

function findMaximumFlowAssignments(options) {
  const members = [];
  const memberIndexById = new Map();
  options.forEach((option) => {
    option.candidates.forEach((member) => {
      if (!memberIndexById.has(member.id)) {
        memberIndexById.set(member.id, members.length);
        members.push(member);
      }
    });
  });
  const source = 0;
  const shiftStart = 1;
  const memberStart = shiftStart + options.length;
  const sink = memberStart + members.length;
  const graph = Array.from({ length: sink + 1 }, () => []);
  const assignmentEdges = [];
  const addEdge = (from, to, capacity) => {
    const forward = { to, rev: graph[to].length, capacity };
    const backward = { to: from, rev: graph[from].length, capacity: 0 };
    graph[from].push(forward);
    graph[to].push(backward);
    return forward;
  };
  options.forEach((option, optionIndex) => {
    const shiftNode = shiftStart + optionIndex;
    addEdge(source, shiftNode, option.remaining);
    option.candidates.forEach((member) => {
      const memberNode = memberStart + memberIndexById.get(member.id);
      const edge = addEdge(shiftNode, memberNode, 1);
      assignmentEdges.push({ edge, shift: option.shift, member });
    });
  });
  members.forEach((member, memberIndex) => {
    addEdge(memberStart + memberIndex, sink, 1);
  });
  const level = Array(graph.length).fill(-1);
  const bfs = () => {
    level.fill(-1);
    level[source] = 0;
    const queue = [source];
    for (let index = 0; index < queue.length; index += 1) {
      const node = queue[index];
      graph[node].forEach((edge) => {
        if (edge.capacity > 0 && level[edge.to] < 0) {
          level[edge.to] = level[node] + 1;
          queue.push(edge.to);
        }
      });
    }
    return level[sink] >= 0;
  };
  const pointer = Array(graph.length).fill(0);
  const dfs = (node, pushed) => {
    if (node === sink) return pushed;
    for (; pointer[node] < graph[node].length; pointer[node] += 1) {
      const edge = graph[node][pointer[node]];
      if (edge.capacity <= 0 || level[edge.to] !== level[node] + 1) continue;
      const flow = dfs(edge.to, Math.min(pushed, edge.capacity));
      if (!flow) continue;
      edge.capacity -= flow;
      graph[edge.to][edge.rev].capacity += flow;
      return flow;
    }
    return 0;
  };
  // ponytail: mirrors renderer.js daily max-flow without browser state.
  while (bfs()) {
    pointer.fill(0);
    while (dfs(source, Number.MAX_SAFE_INTEGER)) {}
  }
  return assignmentEdges
    .filter(({ edge }) => edge.capacity === 0)
    .map(({ shift, member }) => ({ shift, member: member.id }));
}

function chooseDailyAssignments(rawOptions) {
  const options = rawOptions
    .map((option) => ({
      ...option,
      candidates: option.candidates
        .map((candidate) => ({ ...candidate }))
        .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id))
    }))
    .sort((a, b) => (
      a.candidates.length - b.candidates.length
      || b.remaining - a.remaining
      || a.shift.localeCompare(b.shift)
    ));
  return findMaximumFlowAssignments(options);
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
  { shift: "critical_two", remaining: 2, candidates: [{ id: "a", priority: 1 }, { id: "b", priority: 2 }] },
  { shift: "open", remaining: 1, candidates: [{ id: "a", priority: 1 }, { id: "b", priority: 2 }, { id: "c", priority: 3 }] }
]), [
  { shift: "critical_two", member: "a" },
  { shift: "critical_two", member: "b" },
  { shift: "open", member: "c" }
]);
assert.deepEqual(chooseDailyAssignments([
  { shift: "impossible", remaining: 1, candidates: [] },
  { shift: "fillable", remaining: 1, candidates: [{ id: "home_member", priority: 0 }] }
]), [
  { shift: "fillable", member: "home_member" }
]);

console.log("auto schedule rules check ok");
