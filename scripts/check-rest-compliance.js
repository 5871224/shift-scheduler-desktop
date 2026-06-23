const assert = require("assert");
const path = require("path");

const compliance = require(path.join(__dirname, "..", "src", "renderer", "rest-compliance.js"));

const weeks = compliance.buildCalendarWeeks(2026, 5, compliance.DEFAULT_WEEK_START);
assert.strictEqual(weeks[0].startDate, "2026-05-31", "June 2026 should start checking from the prior Sunday");
assert.strictEqual(weeks[0].endDate, "2026-06-06", "each week should end on Saturday");

const result = compliance.checkRestCompliance({
  year: 2026,
  month: 5,
  weekStart: compliance.DEFAULT_WEEK_START,
  memberCalendars: [
    {
      memberId: "m1",
      memberName: "正常",
      memberCode: "A001",
      days: [
        { date: "2026-05-31", active: true, leaveCode: "0036", hasShift: false, hasOvertime: false },
        { date: "2026-06-01", active: true, leaveCode: "", hasShift: true, hasOvertime: false },
        { date: "2026-06-02", active: true, leaveCode: "", hasShift: true, hasOvertime: false },
        { date: "2026-06-03", active: true, leaveCode: "", hasShift: true, hasOvertime: false },
        { date: "2026-06-04", active: true, leaveCode: "", hasShift: true, hasOvertime: false },
        { date: "2026-06-05", active: true, leaveCode: "", hasShift: true, hasOvertime: false },
        { date: "2026-06-06", active: true, leaveCode: "0047", hasShift: false, hasOvertime: false }
      ]
    },
    {
      memberId: "m2",
      memberName: "缺例假",
      memberCode: "A002",
      days: [
        { date: "2026-05-31", active: true, leaveCode: "", hasShift: true, hasOvertime: false },
        { date: "2026-06-01", active: true, leaveCode: "", hasShift: true, hasOvertime: false },
        { date: "2026-06-02", active: true, leaveCode: "", hasShift: true, hasOvertime: false },
        { date: "2026-06-03", active: true, leaveCode: "", hasShift: true, hasOvertime: false },
        { date: "2026-06-04", active: true, leaveCode: "", hasShift: true, hasOvertime: false },
        { date: "2026-06-05", active: true, leaveCode: "", hasShift: true, hasOvertime: false },
        { date: "2026-06-06", active: true, leaveCode: "0047", hasShift: false, hasOvertime: false }
      ]
    },
    {
      memberId: "m3",
      memberName: "例假出勤",
      memberCode: "A003",
      days: [
        { date: "2026-05-31", active: true, leaveCode: "0036", hasShift: false, hasOvertime: true },
        { date: "2026-06-01", active: true, leaveCode: "", hasShift: true, hasOvertime: false },
        { date: "2026-06-02", active: true, leaveCode: "", hasShift: true, hasOvertime: false },
        { date: "2026-06-03", active: true, leaveCode: "", hasShift: true, hasOvertime: false },
        { date: "2026-06-04", active: true, leaveCode: "", hasShift: true, hasOvertime: false },
        { date: "2026-06-05", active: true, leaveCode: "", hasShift: true, hasOvertime: false },
        { date: "2026-06-06", active: true, leaveCode: "0047", hasShift: false, hasOvertime: false }
      ]
    }
  ]
});

assert(result.checkedWeeks >= 3, "sample calendars should produce checked weeks");
assert(result.issues.some((issue) => issue.type === "missing_regular_holiday" && issue.memberId === "m2"), "missing regular holiday should be flagged");
assert(result.issues.some((issue) => issue.type === "regular_holiday_work" && issue.memberId === "m3"), "work on a regular holiday should be flagged");
assert(!result.issues.some((issue) => issue.memberId === "m1"), "a compliant week should not generate issues");

console.log("rest compliance checks passed");
