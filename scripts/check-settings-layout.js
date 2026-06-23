const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const styles = fs.readFileSync(path.join(rootDir, "src", "renderer", "styles.css"), "utf8");

assert(styles.includes(".catalog-visibility-toggle {\n  font-size: 12px;"), "catalog visibility toggle should match field label size");
assert(styles.includes(".settings-table-row-shift {\n  grid-template-columns: repeat(6, minmax(0, 1fr));"), "shift settings columns should be evenly distributed");
assert(styles.includes(".settings-table-row-leave {\n  grid-template-columns: repeat(7, minmax(0, 1fr));"), "leave settings columns should be evenly distributed");
assert(styles.includes(".settings-table-row-overtime {\n  grid-template-columns: repeat(7, minmax(0, 1fr));"), "overtime settings columns should be evenly distributed");
assert(styles.includes(".settings-table-row-shift > div,\n.settings-table-row-leave > div,\n.settings-table-row-overtime > div {"), "all settings cells should share centered alignment");
assert(styles.includes(".settings-table-actions-head {\n  justify-content: center;\n  text-align: center;"), "actions header should be centered");
assert(styles.includes(".settings-table-actions {\n  display: flex;\n  justify-content: center;"), "actions cells should be centered");

console.log("settings layout checks passed");
