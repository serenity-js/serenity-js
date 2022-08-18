#!/usr/bin/env ts-node

import { sync as glob } from 'fast-glob';
import { readFileSync } from 'fs';
import * as path from 'path';

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
