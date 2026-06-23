const fs = require("fs/promises");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.join(rootDir, "src", "renderer");
const outputDir = path.join(rootDir, "docs");
const files = [
  "index.html",
  "styles.css",
  "renderer.js",
  "rest-compliance.js",
  "web-api.js",
  "browser-exporter.js",
  "app-config.js"
];

async function recreateDir(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true });
  await fs.mkdir(dirPath, { recursive: true });
}

async function copyFile(name) {
  await fs.copyFile(path.join(sourceDir, name), path.join(outputDir, name));
}

async function writeNoJekyll() {
  await fs.writeFile(path.join(outputDir, ".nojekyll"), "");
}

async function writeDeployReadme() {
  const content = [
    "Static deploy output for GitHub Pages or FTP.",
    "",
    "Upload all files in this folder to your web root."
  ].join("\n");
  await fs.writeFile(path.join(outputDir, "README.txt"), content, "utf8");
}

async function main() {
  await recreateDir(outputDir);
  await Promise.all(files.map(copyFile));
  await writeNoJekyll();
  await writeDeployReadme();
  console.log(`static web published to ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
