const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const styles = fs.readFileSync(path.join(rootDir, "src", "renderer", "styles.css"), "utf8");

assert(styles.includes(".table-wrap {\n  overflow-x: visible;"), "schedule table should keep page-level horizontal scrolling");
assert(styles.includes("border-radius: 0 0 18px 18px;"), "schedule table wrapper should keep rounded bottom corners");
assert(styles.includes("clip-path: inset(0 round 0 0 18px 18px);"), "schedule table bottom grid should be clipped to rounded corners");

console.log("schedule table rounded corners check ok");
