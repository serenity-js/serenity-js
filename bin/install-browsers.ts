/**
 * Browser installation script for Protractor and WebdriverIO tests.
 *
 * Uses @puppeteer/browsers CLI to download Chrome and ChromeDriver binaries.
 *
 * @puppeteer/browsers@3 uses the system `unzip` command for zip extraction,
 * which is available on macOS, Ubuntu 24.04, and GitHub Actions runners.
 * On Windows, it uses PowerShell's Expand-Archive.
 *
 * See https://github.com/puppeteer/puppeteer/pull/14960 for context on why
 * @puppeteer/browsers switched from the `extract-zip` library to CLI-based extraction.
 */
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import * as process from 'node:process';

const browsers = process.argv.slice(2);

for (const browser of browsers) {
    execSync(`npx @puppeteer/browsers install ${ browser } --path "${ resolve(__dirname, '../browsers') }"`, { stdio: 'inherit' });
}
