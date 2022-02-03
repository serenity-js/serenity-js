#!/usr/bin/env ts-node

import { sync as glob } from 'fast-glob';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import * as path from 'path';
import { createCoverageMap } from 'istanbul-lib-coverage';

const coverageMap = createCoverageMap({ });

const input = [
    path.join(path.resolve(__dirname, `../target/coverage/`),  `**/coverage-final.json`),
];

console.log('Reading coverage reports from', input);

const paths = glob(input, { onlyFiles: false, globstar: false, absolute: true });

for (const pathToCoverageFile of paths) {
    const contents = readFileSync(pathToCoverageFile).toString('utf-8');

    console.log(`Parsing ${ pathToCoverageFile } (${ contents.length }B)`);

    const parsed   = JSON.parse(contents);
    const coverage = Object.keys(parsed).reduce((acc, currentPath) => {
        acc[currentPath] = parsed[currentPath].data
            ? parsed[currentPath].data
            : parsed[currentPath];

        return acc;
    }, {});

    coverageMap.merge(coverage);
}

const output = JSON.stringify(coverageMap.toJSON(), null, 0);

const outputDir = path.resolve(__dirname, '../target/coverage');

mkdirSync(outputDir, { recursive: true });

console.log(`Writing ${ output.length }B coverage data to ${ outputDir }/coverage-final.json`)

writeFileSync(`${ outputDir }/coverage-final.json`, JSON.stringify(coverageMap.toJSON(), null, 0));

console.log(`Done`)
