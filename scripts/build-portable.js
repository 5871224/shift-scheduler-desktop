const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');
const releaseDir = path.join(rootDir, 'release');
const builderCli = require.resolve('electron-builder/out/cli/cli.js');

function isDisposableArtifact(name) {
  return name === 'win-unpacked'
    || name.endsWith('.zip')
    || name.endsWith('.blockmap')
    || name.endsWith('.yml');
}

function cleanReleaseDir() {
  if (!fs.existsSync(releaseDir)) return;

  for (const name of fs.readdirSync(releaseDir)) {
    if (!isDisposableArtifact(name)) continue;

    const target = path.join(releaseDir, name);
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function buildPortable() {
  const result = spawnSync(process.execPath, [builderCli, '--win', 'portable'], {
    cwd: rootDir,
    stdio: 'inherit'
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function selfCheck() {
  assert.equal(isDisposableArtifact('win-unpacked'), true);
  assert.equal(isDisposableArtifact('排班工具-1.0.0-x64.zip'), true);
  assert.equal(isDisposableArtifact('latest.yml'), true);
  assert.equal(isDisposableArtifact('排班工具-1.0.0-portable.exe'), false);
  console.log('build-portable self-check passed');
}

if (process.argv.includes('--self-check')) {
  selfCheck();
  process.exit(0);
}

// ponytail: only remove known disposable build artifacts inside release; if packaging needs more cleanup later, extend isDisposableArtifact here.
cleanReleaseDir();
buildPortable();
cleanReleaseDir();
