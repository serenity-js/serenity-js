/**
 * Ensures the Electron binary is properly installed.
 *
 * On Node 24 + Linux, Electron's postinstall uses `extract-zip` (yauzl) which
 * silently fails to extract large binaries. This script detects if the Electron
 * binary is missing and re-extracts it using the system `unzip` command.
 *
 * See https://github.com/puppeteer/puppeteer/issues/15080 for the underlying issue.
 * Can be removed when Electron upgrades its extraction mechanism.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { platform, arch, homedir } from 'node:os';

// Find the electron package directory
const electronPaths = [
    'node_modules/.pnpm/electron@42.3.2/node_modules/electron',
    'integration/playwright-electron/node_modules/electron',
    'integration/electron-app/node_modules/electron',
];

let electronDir;
for (const p of electronPaths) {
    const full = resolve(p);
    if (existsSync(join(full, 'package.json'))) {
        electronDir = full;
        break;
    }
}

if (!electronDir) {
    console.log('[ensure-electron] Electron package not found, skipping');
    process.exit(0);
}

const pathFile = join(electronDir, 'path.txt');
const distDir = join(electronDir, 'dist');

// Determine the expected platform path
function getPlatformPath() {
    switch (platform()) {
        case 'darwin': return 'Electron.app/Contents/MacOS/Electron';
        case 'linux': return 'electron';
        case 'win32': return 'electron.exe';
        default: return 'electron';
    }
}

const platformPath = getPlatformPath();
const electronBinary = join(distDir, platformPath);

// Check if electron is already installed
if (existsSync(pathFile) && existsSync(electronBinary)) {
    console.log('[ensure-electron] Electron binary already present at', electronBinary);
    process.exit(0);
}

console.log('[ensure-electron] Electron binary missing, attempting to install...');

// Read electron version from package.json
const { version } = JSON.parse(readFileSync(join(electronDir, 'package.json'), 'utf8'));

// Determine download URL
const os = platform();
const cpuArch = arch();
let electronPlatform, electronArch;

switch (os) {
    case 'darwin': electronPlatform = 'darwin'; break;
    case 'linux': electronPlatform = 'linux'; break;
    case 'win32': electronPlatform = 'win32'; break;
    default: electronPlatform = os;
}

switch (cpuArch) {
    case 'x64': electronArch = 'x64'; break;
    case 'arm64': electronArch = 'arm64'; break;
    case 'ia32': electronArch = 'ia32'; break;
    default: electronArch = cpuArch;
}

const filename = `electron-v${version}-${electronPlatform}-${electronArch}.zip`;
const url = `https://github.com/electron/electron/releases/download/v${version}/${filename}`;
const cacheDir = process.env.electron_config_cache || join(homedir(), '.cache', 'electron');
const cachedZip = join(cacheDir, filename);

// Download if not cached
if (!existsSync(cachedZip)) {
    console.log(`[ensure-electron] Downloading ${url}...`);
    mkdirSync(cacheDir, { recursive: true });
    execSync(`curl -L -o "${cachedZip}" "${url}"`, { stdio: 'inherit' });
}

// Extract using system unzip
console.log(`[ensure-electron] Extracting ${cachedZip} to ${distDir}...`);
mkdirSync(distDir, { recursive: true });

if (os === 'win32') {
    execSync(`powershell -Command "Expand-Archive -Force '${cachedZip}' '${distDir}'"`, { stdio: 'inherit' });
} else {
    execSync(`unzip -o -q "${cachedZip}" -d "${distDir}"`, { stdio: 'inherit' });
}

// Write path.txt
writeFileSync(pathFile, platformPath);
console.log(`[ensure-electron] Electron installed successfully at ${electronBinary}`);
