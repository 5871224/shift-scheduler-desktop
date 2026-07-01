const fs = require("fs");
const path = require("path");

const roots = [
  path.join(__dirname, "..", "src"),
  path.join(__dirname, "..", "docs"),
  path.join(__dirname, "..", "supabase", "functions")
];

const bannedTables = [
  "manager_departments",
  "schedule_documents"
];

const exts = new Set([".js", ".ts", ".html"]);
const offenders = [];

function walk(targetPath) {
  const stats = fs.statSync(targetPath);
  if (stats.isDirectory()) {
    for (const entry of fs.readdirSync(targetPath)) {
      walk(path.join(targetPath, entry));
    }
    return;
  }
  if (!exts.has(path.extname(targetPath))) {
    return;
  }
  const content = fs.readFileSync(targetPath, "utf8");
  for (const tableName of bannedTables) {
    if (content.includes(tableName)) {
      offenders.push(`${path.relative(path.join(__dirname, ".."), targetPath)} -> ${tableName}`);
    }
  }
}

for (const root of roots) {
  walk(root);
}

console.assert(offenders.length === 0, `Unused Supabase tables are still referenced:\n${offenders.join("\n")}`);
console.log("Unused Supabase table check passed.");
