const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const rendererPath = path.join(rootDir, "src", "renderer", "renderer.js");
const stylesPath = path.join(rootDir, "src", "renderer", "styles.css");

const renderer = fs.readFileSync(rendererPath, "utf8");
const styles = fs.readFileSync(stylesPath, "utf8");

assert(renderer.includes('class="settings-table-wrap"'), "settings list should render table wrap");
assert(renderer.includes('data-sort-category="${category}"'), "settings list should keep drag category on rows");
assert(renderer.includes('需填時間'), "leave settings should expose required-time column");
assert(renderer.includes('需填原因'), "leave settings should expose required-reason column");
assert(renderer.includes("function renderActionIconButton"), "action icon helper should exist");
assert(renderer.includes('renderActionIconButton("edit"'), "edit actions should use the shared icon helper");
assert(renderer.includes('renderActionIconButton("delete"'), "delete actions should use the shared icon helper");
assert(!renderer.includes(">修改</button>"), "edit actions should no longer use text buttons");
assert(!renderer.includes(">刪除</button>"), "delete actions should no longer use text buttons");
assert(renderer.includes('if (category === "shift") {\n    state.shifts = currentList;'), "shift reorder should persist to state.shifts");
assert(renderer.includes('if (category === "leave") {\n    state.leaves = currentList;'), "leave reorder should persist to state.leaves");

assert(styles.includes(".catalog-settings-modal"), "catalog settings modal styles should exist");
assert(styles.includes(".settings-table-row-shift"), "shift table row styles should exist");
assert(styles.includes(".settings-table-row-leave"), "leave table row styles should exist");
assert(styles.includes(".settings-icon-btn"), "settings icon button styles should exist");
assert(styles.includes(".member-main {\n  font-size: inherit;"), "member name size should match the department text size");

console.log("settings list checks passed");
