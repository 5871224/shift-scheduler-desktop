const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const rootDir = path.resolve(__dirname, "..");
const exporterSource = fs.readFileSync(path.join(rootDir, "src", "renderer", "browser-exporter.js"), "utf8");

const context = {
  Blob,
  console,
  window: {}
};
vm.createContext(context);
vm.runInContext(exporterSource, context);

const exporter = context.window.schedulerBrowserExporter;

const baseState = {
  members: [{ id: "m1", name: "Member A", code: "A001", hireDate: "", leaveDate: "", payByDay: false }],
  leaves: [
    { id: "regular", code: "0036", name: "Custom Regular" },
    { id: "rest", code: "0047", name: "Custom Rest" },
    { id: "personal", code: "0010", name: "Personal" }
  ],
  overtime: [{ id: "ot1", startTime: "18:00:00", endTime: "20:30:00" }],
  departments: [],
  schedule: {}
};

const sapPayload = {
  year: 2026,
  month: 4,
  state: {
    ...baseState,
    schedule: {
      m1_2026_4_3: { leave: "regular" },
      m1_2026_4_4: { leave: "rest" }
    }
  }
};

assert.strictEqual(exporter.getSapLeaveExportRows(sapPayload).length, 2);
assert(exporter.buildSapLeaveCsvContent(sapPayload).includes("OFF"));
assert(exporter.buildSapLeaveCsvContent(sapPayload).includes("REST"));
assert.strictEqual(exporter.getSapLeaveExportRows({ year: 2026, month: 4, state: baseState }).length, 0);
assert.strictEqual(exporter.getLeaveExportRows({ year: 2026, month: 4, state: baseState }).length, 0);
assert.strictEqual(exporter.getOvertimeExportRows({ year: 2026, month: 4, state: baseState }).length, 0);

assert.strictEqual(
  exporter.getLeaveExportRows({
    year: 2026,
    month: 4,
    state: {
      ...baseState,
      schedule: {
        m1_2026_4_5: {
          leave: "personal",
          leaveMeta: { allDay: false, startTime: "08:30:00", endTime: "12:05:00" }
        }
      }
    }
  })[0].slice(3, 5).join(","),
  "0830,1205"
);
assert.strictEqual(
  exporter.getOvertimeExportRows({
    year: 2026,
    month: 4,
    state: {
      ...baseState,
      schedule: { m1_2026_4_6: { overtime: "ot1" } }
    }
  })[0].slice(2, 4).join(","),
  "1800,2030"
);

const rendererSource = fs.readFileSync(path.join(rootDir, "src", "renderer", "renderer.js"), "utf8");
assert(rendererSource.includes("for (let day = 1; day <= daysInMonth(state.year, state.month); day += 1)"));
for (const name of ["hasSapLeaveRows", "hasOvertimeRows", "hasLeaveRows"]) {
  const start = rendererSource.indexOf(`function ${name}()`);
  const next = rendererSource.indexOf("\nfunction ", start + 1);
  const body = rendererSource.slice(start, next);
  assert(!body.includes("getVisibleDates()"), `${name} should only check the exported month`);
}

console.log("export empty guards passed");
