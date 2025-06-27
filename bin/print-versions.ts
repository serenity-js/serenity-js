import { readFileSync } from 'node:fs';
import * as path from 'node:path';

import { sync as glob } from 'fast-glob';

const input = [
    path.join(path.resolve(__dirname, `../packages/`),  `*/package.json`),
];

const paths = glob(input, { onlyFiles: false, globstar: true, absolute: true });

console.log('| module | version |')
console.log('|--------|---------|')

for (const pathToPackageJSON of paths) {
    const serenityPackage = JSON.parse(readFileSync(pathToPackageJSON).toString('utf8'));
    console.log(`| ${serenityPackage.name} | ${ serenityPackage.version } |`);
}
