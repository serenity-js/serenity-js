#!/usr/bin/env tsx

import { sync as glob } from 'fast-glob';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { createCoverageMap } from 'istanbul-lib-coverage';
import * as path from 'path';

const coverageMap = createCoverageMap({ });

const coverageFiles = [
    path.join(path.resolve(__dirname, `../packages/`),  `*/target/**/coverage-final.json`),
    path.join(path.resolve(__dirname, `../integration/`),  `*/target/**/coverage-final.json`),
];

console.log('Reading coverage reports from', coverageFiles);

const paths = glob(coverageFiles, { onlyFiles: false, globstar: true, absolute: true });

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

// ---

const c8FilesOutputDirectory = path.resolve(__dirname, '../target/coverage/tmp');

mkdirSync(c8FilesOutputDirectory, { recursive: true });

const c8TemporaryFiles = [
    path.join(path.resolve(__dirname, `../packages/`),  `*/target/coverage/tmp/coverage-*.json`),
    path.join(path.resolve(__dirname, `../integration/`),  `*/target/coverage/tmp/coverage-*.json`),
    path.join(path.resolve(__dirname, `../integration/`),  `*/target/coverage/*/tmp/coverage-*.json`),
];

const pathsToC8Files = glob(c8TemporaryFiles, { onlyFiles: false, globstar: true, absolute: true });

console.log(`Copying ${ pathsToC8Files.length } C8 temporary files to ${ c8FilesOutputDirectory }`);

for (const pathToC8File of pathsToC8Files) {
    const destinationPath = path.join(c8FilesOutputDirectory, path.basename(pathToC8File));

    writeFileSync(destinationPath, readFileSync(pathToC8File))

    console.log(`Copying  ${ pathToC8File }`);
}

console.log(`Done`)
