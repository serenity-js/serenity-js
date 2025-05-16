import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import * as process from 'node:process';

const browsers = process.argv.slice(2);

for (const browser of browsers) {
    // for every browser, run the installation command: npx @puppeteer/browsers install ${ browser }
    execSync(`npx @puppeteer/browsers install ${ browser } --path "${ resolve(__dirname, '../browsers') }"`, { stdio: 'inherit' });
}
