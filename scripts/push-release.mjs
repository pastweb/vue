import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function read(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: false,
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }

  return result.stdout.trim();
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function ensurePnpmReleasePolicy(packageJson) {
  const toolsSpecifier = packageJson.devDependencies?.['@pastweb/tools'];
  const toolsVersion = toolsSpecifier?.match(/\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/)?.[0];

  if (!toolsVersion) return;

  const workspaceFile = 'pnpm-workspace.yaml';
  const entry = `  - '@pastweb/tools@${toolsVersion}'`;
  let content = existsSync(workspaceFile) ? readFileSync(workspaceFile, 'utf8') : '';

  if (!content.includes('minimumReleaseAgeExclude:')) {
    content = `${content.trimEnd()}\nminimumReleaseAgeExclude:\n${entry}\n`;
  } else if (!content.includes(`@pastweb/tools@${toolsVersion}`)) {
    content = `${content.trimEnd()}\n${entry}\n`;
  }

  writeFileSync(workspaceFile, content);
}

function updatePackageVersion(version) {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  packageJson.version = version;
  writeJson('package.json', packageJson);

  if (!existsSync('package-lock.json')) return;

  const packageLock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  packageLock.version = version;

  if (packageLock.packages?.['']) {
    packageLock.packages[''].version = version;
  }

  writeJson('package-lock.json', packageLock);
}

const rl = createInterface({ input, output });
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
ensurePnpmReleasePolicy(packageJson);

const currentVersion = packageJson.version;
const rawVersion = await rl.question(`Release version (current ${currentVersion}): `);
rl.close();

const version = rawVersion.trim().replace(/^v/, '');

if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  console.error(`Invalid release version: "${rawVersion}"`);
  process.exit(1);
}

const tagName = `v${version}`;
const existingTags = read('git', ['tag', '--list', tagName]);

if (existingTags) {
  console.error(`Tag ${tagName} already exists.`);
  process.exit(1);
}

updatePackageVersion(version);
run('npm', ['run', 'build']);
run('git', ['status']);
run('git', ['add', '.']);

const hasStagedChanges = spawnSync('git', ['diff', '--cached', '--quiet'], {
  cwd: process.cwd(),
  shell: false,
}).status !== 0;

if (hasStagedChanges) {
  run('git', ['commit', '-m', `feat: release version ${version}`]);
} else {
  console.log('No staged changes to commit; tagging current HEAD.');
}

run('git', ['tag', tagName]);
run('git', ['push']);
run('git', ['push', 'origin', tagName]);
console.log('Publishing to npm. Just run "npm publish".');
