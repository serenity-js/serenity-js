#!/usr/bin/env ts-node

import { sync as glob } from 'fast-glob';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { createCoverageMap } from 'istanbul-lib-coverage';

const coverageMap = createCoverageMap({ });

const input = [
    `${ __dirname }/../target/coverage/*/coverage-final.json`
];
const outputDir = `${ __dirname }/../target/coverage`

mkdirSync(outputDir, { recursive: true });

const paths = glob(input, { onlyFiles: false, globstar: false, absolute: true });

for (const pathToCoverageFile of paths) {
    const contents = readFileSync(pathToCoverageFile).toString('utf-8');
    const parsed   = JSON.parse(contents);
    const coverage = Object.keys(parsed).reduce((acc, currentPath) => {
        acc[currentPath] = parsed[currentPath].data
            ? parsed[currentPath].data
            : parsed[currentPath];

        return acc;
    }, {});

    coverageMap.merge(coverage);
}

writeFileSync(`${ outputDir }/coverage-final.json`, JSON.stringify(coverageMap.toJSON(), null, 0));
