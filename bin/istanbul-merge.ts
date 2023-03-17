#!/usr/bin/env ts-node

import { sync as glob } from 'fast-glob';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { createCoverageMap } from 'istanbul-lib-coverage';
import * as path from 'path';

const coverageMap = createCoverageMap({ });

const input = [
    path.join(path.resolve(__dirname, `../packages/`),  `*/target/**/coverage-final.json`),
    path.join(path.resolve(__dirname, `../integration/`),  `*/target/**/coverage-final.json`),
];

console.log('Reading coverage reports from', input);

const paths = glob(input, { onlyFiles: false, globstar: true, absolute: true });

for (const pathToCoverageFile of paths) {
    const contents = readFileSync(pathToCoverageFile).toString('utf8');

    console.log(`Parsing ${ pathToCoverageFile } (${ contents.length }B)`);

    const parsed   = JSON.parse(contents);
    const coverage = Object.keys(parsed).reduce((acc, currentPath) => {
        acc[currentPath] = (parsed as object)[currentPath].data
            ? parsed[currentPath].data
            : parsed[currentPath];

        return acc;
    }, {});

    coverageMap.merge(coverage);
}

const output = JSON.stringify(coverageMap.toJSON(), undefined, 0);

const outputDirectory = path.resolve(__dirname, '../target/coverage');

mkdirSync(outputDirectory, { recursive: true });

console.log(`Writing ${ output.length }B coverage data to ${ outputDirectory }/coverage-final.json`)

writeFileSync(`${ outputDirectory }/coverage-final.json`, JSON.stringify(coverageMap.toJSON(), undefined, 0));

console.log(`Done`)
