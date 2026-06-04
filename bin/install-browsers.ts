/**
 * Browser installation script for Protractor and WebdriverIO tests.
 *
 * Uses @puppeteer/browsers CLI to download Chrome and ChromeDriver binaries.
 *
 * ## Workaround: extract-zip silent failure
 *
 * @puppeteer/browsers@2.x uses `extract-zip` (which depends on `yauzl`) to extract downloaded zip archives.
 * On Node 24 + ubuntu-24.04 (GitHub Actions runners), this extraction silently fails for large binary files
 * (chromedriver ~17MB, chrome ~250MB) while small text files (LICENSE, THIRD_PARTY_NOTICES) extract fine.
 * The zip archive remains on disk (normally it would be deleted after successful extraction).
 *
 * This issue motivated the Puppeteer team to switch to CLI-based extraction in @puppeteer/browsers@3
 * (see https://github.com/puppeteer/puppeteer/pull/14960 and https://github.com/puppeteer/puppeteer/issues/15080).
 *
 * As a workaround, after running @puppeteer/browsers install, this script checks for leftover zip files
 * (indicating incomplete extraction) and re-extracts them using the system `unzip` command.
 *
 * This workaround can be removed when either:
 * - @puppeteer/browsers@2 fixes the extraction issue
 * - This project upgrades to @puppeteer/browsers@3 (which requires system `unzip` to be installed)
 * - The root cause in extract-zip/yauzl/Node.js is identified and fixed
 */
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, unlinkSync } from 'node:fs';
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
