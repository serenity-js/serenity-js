import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import * as process from 'node:process';

const browsers = process.argv.slice(2);
const browsersPath = resolve(__dirname, '../browsers');

for (const browser of browsers) {
    // Use @puppeteer/browsers to download and install
    execSync(`npx @puppeteer/browsers install ${ browser } --path "${ browsersPath }"`, { stdio: 'inherit' });
}

// Workaround: @puppeteer/browsers' extract-zip may silently fail to extract binaries on some platforms (Node 24 / ubuntu-24.04).
// If zip files remain after install, re-extract them using the system unzip command.
for (const browser of browsers) {
    const [name] = browser.split('@');
    const browserDir = resolve(browsersPath, name);
    if (!existsSync(browserDir)) continue;

    const entries = readdirSync(browserDir);
    const zipFiles = entries.filter(f => f.endsWith('.zip'));

    for (const zipFile of zipFiles) {
        const zipPath = resolve(browserDir, zipFile);
        // Derive target dir: "129.0.6668.100-chromedriver-linux64.zip" → find "linux-129.0.6668.100" dir
        const buildId = zipFile.split('-')[0]; // e.g. "129.0.6668.100"
        const targetDir = entries.find(d => d.includes(buildId) && !d.endsWith('.zip'));

        if (targetDir) {
            const targetPath = resolve(browserDir, targetDir);
            console.log(`[install-browsers] Zip still present after install, re-extracting: ${ zipFile } → ${ targetDir }`);
            execSync(`unzip -o "${ zipPath }" -d "${ targetPath }"`, { stdio: 'inherit' });
            unlinkSync(zipPath);
        }
    }
}
