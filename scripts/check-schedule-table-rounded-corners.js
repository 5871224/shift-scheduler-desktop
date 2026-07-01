const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const styles = fs.readFileSync(path.join(rootDir, "src", "renderer", "styles.css"), "utf8");

assert(styles.includes("overflow-x: visible;"), "schedule table should keep page-level horizontal scrolling");
assert(styles.includes("--schedule-radius: 18px;"), "schedule table radius should be a single shared token");
assert(styles.includes("border-radius: var(--schedule-radius) var(--schedule-radius) 0 0;"), "sticky header should own rounded top corners");
assert(styles.includes("clip-path: inset(0 round var(--schedule-radius) var(--schedule-radius) 0 0);"), "sticky header grid should be clipped to rounded top corners");
assert(styles.includes("border-radius: 0 0 var(--schedule-radius) var(--schedule-radius);"), "schedule table wrapper should own rounded bottom corners");
assert(styles.includes("clip-path: inset(0 round 0 0 var(--schedule-radius) var(--schedule-radius));"), "schedule table bottom grid should be clipped to rounded bottom corners");
assert(styles.includes(".table-sticky-cell-day:last-child"), "sticky header should not draw an extra outer right grid line");
assert(styles.includes("#mainTable tr > :last-child"), "schedule body should not draw an extra outer right grid line");
assert(styles.includes("#mainTable tbody tr:last-child > *"), "schedule body should not draw an extra bottom grid line");

console.log("schedule table rounded corners check ok");
