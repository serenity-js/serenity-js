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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
// Find the electron package directory using Node's module resolution
import { createRequire } from 'node:module';
import { arch, homedir, platform } from 'node:os';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
let electronDirectory: string | undefined;

try {
    const electronMain = require.resolve('electron');
    electronDirectory = join(electronMain, '..');
} catch {
    console.log('[ensure-electron] Electron package not found, skipping');
    process.exit(0);
}

const pathFile = join(electronDirectory, 'path.txt');
const distributionDirectory = join(electronDirectory, 'dist');

// Determine the expected platform path
function getPlatformPath(): string {
    switch (platform()) {
        case 'darwin': return 'Electron.app/Contents/MacOS/Electron';
        case 'linux': return 'electron';
        case 'win32': return 'electron.exe';
        default: return 'electron';
    }
}

const platformPath = getPlatformPath();
const electronBinary = join(distributionDirectory, platformPath);

// Check if electron is already installed
if (existsSync(pathFile) && existsSync(electronBinary)) {
    console.log('[ensure-electron] Electron binary already present at', electronBinary);
    process.exit(0);
}

console.log('[ensure-electron] Electron binary missing, attempting to install...');

// Read electron version from package.json
const { version } = JSON.parse(readFileSync(join(electronDirectory, 'package.json'), 'utf8'));

// Determine download parameters
const os = platform();
const cpuArch = arch();

let electronPlatform: string;
switch (os) {
    case 'darwin': electronPlatform = 'darwin'; break;
    case 'linux': electronPlatform = 'linux'; break;
    case 'win32': electronPlatform = 'win32'; break;
    default: electronPlatform = os;
}

let electronArch: string;
switch (cpuArch) {
    case 'x64': electronArch = 'x64'; break;
    case 'arm64': electronArch = 'arm64'; break;
    case 'ia32': electronArch = 'ia32'; break;
    default: electronArch = cpuArch;
}

const filename = `electron-v${ version }-${ electronPlatform }-${ electronArch }.zip`;
const url = `https://github.com/electron/electron/releases/download/v${ version }/${ filename }`;
const cacheDirectory = process.env.electron_config_cache || join(homedir(), '.cache', 'electron');
const cachedZip = join(cacheDirectory, filename);

// Download if not cached
if (!existsSync(cachedZip)) {
    console.log(`[ensure-electron] Downloading ${ url }...`);
    mkdirSync(cacheDirectory, { recursive: true });
    execSync(`curl -L -o "${ cachedZip }" "${ url }"`, { stdio: 'inherit' });
}

// Extract using system unzip
console.log(`[ensure-electron] Extracting ${ cachedZip } to ${ distributionDirectory }...`);
mkdirSync(distributionDirectory, { recursive: true });

if (os === 'win32') {
    execSync(`powershell -Command "Expand-Archive -Force '${ cachedZip }' '${ distributionDirectory }'"`, { stdio: 'inherit' });
} else {
    execSync(`unzip -o -q "${ cachedZip }" -d "${ distributionDirectory }"`, { stdio: 'inherit' });
}

// Write path.txt
writeFileSync(pathFile, platformPath);
console.log(`[ensure-electron] Electron installed successfully at ${ electronBinary }`);
