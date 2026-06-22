#!/usr/bin/env node

/**
 * CLI for generating an aggregated HTML report from test run data.
 *
 * Usage:
 *   npx serenity-js-html-reporter --input "path/to/test-runs/**" --output ./reports --title "My Report"
 *
 * Options:
 *   --input      Glob pattern(s) for test-run directories containing db.json files (required)
 *   --output     Output directory for the generated report (default: ./reports/serenity-js)
 *   --title      Report title
 *   --specRoot   Root directory for requirements hierarchy
 */

import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import { glob } from 'glob';

import { DataSnapshotAggregator } from '../esm/DataSnapshotAggregator.js';
import { ReportTemplateWriter } from '../esm/ReportTemplateWriter.js';

function parseArgs(argv) {
    const args = {};
    for (let i = 2; i < argv.length; i++) {
        if (argv[i].startsWith('--')) {
            const key = argv[i].slice(2);
            args[key] = argv[i + 1] || '';
            i++;
        }
    }
    return args;
}

const args = parseArgs(process.argv);

if (!args.input) {
    console.error('Usage: serenity-js-html-reporter --input <glob> [--output <dir>] [--title <title>] [--specRoot <dir>]');
    process.exit(1);
}

const outputDir = resolve(args.output || './reports/serenity-js');
const testRunsDir = resolve(outputDir, 'test-runs');
mkdirSync(testRunsDir, { recursive: true });

// Resolve input glob to find db.json files
const inputPatterns = args.input.split(',').map(p => p.trim());
let collected = 0;

for (const pattern of inputPatterns) {
    const matches = glob.sync(pattern.endsWith('/db.json') ? pattern : pattern + '/db.json', { absolute: true });

    for (const dbJsonPath of matches) {
        const runDir = resolve(dbJsonPath, '..');
        const runName = basename(resolve(runDir, '..')) + '--' + basename(runDir);
        const destDir = resolve(testRunsDir, runName);

        if (!existsSync(destDir)) {
            cpSync(runDir, destDir, { recursive: true });
            collected++;
        }
    }
}

if (collected === 0) {
    console.error(`No test run data found matching: ${args.input}`);
    process.exit(1);
}

console.log(`Collected ${collected} test runs`);

// Run aggregation
const outputFileSystem = new FileSystem(Path.from(outputDir));

const aggregatorOptions = {
    stabilityWindow: 5,
    title: args.title,
};

let requirementsHierarchy;
let projectFileSystem;

if (args.specRoot) {
    projectFileSystem = new FileSystem(Path.from(process.cwd()));
    requirementsHierarchy = new RequirementsHierarchy(projectFileSystem, Path.from(args.specRoot));
}

const aggregator = new DataSnapshotAggregator(outputFileSystem, aggregatorOptions, requirementsHierarchy, projectFileSystem);
aggregator.aggregate();

const templateWriter = new ReportTemplateWriter(outputFileSystem);
templateWriter.write();

console.log(`Report generated at ${outputDir}/index.html`);
