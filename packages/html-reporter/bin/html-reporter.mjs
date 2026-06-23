#!/usr/bin/env node

/**
 * CLI for generating an aggregated HTML report from test run data.
 *
 * Usage:
 *   npx @serenity-js/html-reporter --input "path/to/test-runs/*" --output ./reports --title "My Report"
 *
 * Options:
 *   --input      Glob pattern(s) for directories containing db.json files (required)
 *   --output     Output directory for the generated report (default: ./reports/serenity-js)
 *   --title      Report title
 *   --specRoot   Root directory for requirements hierarchy
 */

import { resolve } from 'node:path';

import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import fg from 'fast-glob';

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
    console.error('Usage: npx @serenity-js/html-reporter --input <glob> [--output <dir>] [--title <title>] [--specRoot <dir>]');
    process.exit(1);
}

const outputDir = resolve(args.output || './reports/serenity-js');

// Resolve input glob to find db.json files
const inputPatterns = args.input.split(',').map(p => p.trim());
const dbJsonPaths = [];

for (const pattern of inputPatterns) {
    const dbPattern = pattern.endsWith('db.json') ? pattern : pattern + '/db.json';
    const matches = fg.sync(dbPattern, { absolute: true });
    dbJsonPaths.push(...matches);
}

if (dbJsonPaths.length === 0) {
    console.error(`No test run data found matching: ${args.input}`);
    process.exit(1);
}

console.log(`Found ${dbJsonPaths.length} test runs`);

// Run aggregation — reads db.json files in-place, no copying
const outputFileSystem = new FileSystem(Path.from(outputDir));

let requirementsHierarchy;
let projectFileSystem;

if (args.specRoot) {
    projectFileSystem = new FileSystem(Path.from(process.cwd()));
    requirementsHierarchy = new RequirementsHierarchy(projectFileSystem, Path.from(args.specRoot));
}

const aggregator = new DataSnapshotAggregator(outputFileSystem, {
    stabilityWindow: 5,
    title: args.title,
}, requirementsHierarchy, projectFileSystem);

aggregator.aggregate(dbJsonPaths);

const templateWriter = new ReportTemplateWriter(outputFileSystem);
templateWriter.write();

console.log(`Report generated at ${outputDir}/index.html`);
