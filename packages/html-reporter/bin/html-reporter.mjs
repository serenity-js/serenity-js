#!/usr/bin/env node

/**
 * CLI for the Serenity/JS HTML Reporter.
 *
 * Commands:
 *   aggregate   Aggregate test run data into an HTML report
 *   serve       Serve the generated report locally
 *
 * Usage:
 *   html-reporter aggregate --input "path/to/test-runs/*" --output ./reports --title "My Report"
 *   html-reporter serve --dir ./reports/serenity-js --port 8080
 */

import { createServer } from 'node:http';
import { exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import fg from 'fast-glob';

import { DataSnapshotAggregator } from '../esm/cli/DataSnapshotAggregator.js';
import { ReportTemplateWriter } from '../esm/cli/ReportTemplateWriter.js';
import { getNetworkAddress, handleRequest } from './staticFileServer.mjs';

// --- Arg parsing ---

function parseArgs(argv, startIndex) {
    const args = {};
    for (let i = startIndex; i < argv.length; i++) {
        if (argv[i].startsWith('--')) {
            const key = argv[i].slice(2);
            const next = argv[i + 1];
            if (next && !next.startsWith('--')) {
                args[key] = next;
                i++;
            } else {
                args[key] = '';
            }
        }
    }
    return args;
}

function printUsage() {
    console.log(`Usage: html-reporter <command> [options]

Commands:
  aggregate   Aggregate test run data into an HTML report
  serve       Serve the generated report locally

Run 'html-reporter <command> --help' for command-specific options.`);
}

// --- Helpers ---

function resolveDbJsonPaths(inputPatterns) {
    const dbJsonPaths = [];

    for (const pattern of inputPatterns) {
        // Match both db.json (single worker) and db-*.json (parallel workers)
        if (pattern.endsWith('db.json') || pattern.includes('db-')) {
            const matches = fg.sync(pattern, { absolute: true });
            dbJsonPaths.push(...matches);
        } else {
            // Look for both patterns: db.json and db-{workerId}.json
            const dbPattern = pattern + '/**/db.json';
            const workerDbPattern = pattern + '/**/db-*.json';
            const dbMatches = fg.sync(dbPattern, { absolute: true });
            const workerMatches = fg.sync(workerDbPattern, { absolute: true });
            dbJsonPaths.push(...dbMatches, ...workerMatches);
        }
    }

    return dbJsonPaths;
}

function commonRoot(outputDir, paths) {
    // Strip both db.json and db-{workerId}.json from paths
    const allPaths = [outputDir, ...paths.map(p => p.replace(/\/db(-[^/]+)?\.json$/, ''))];
    const segments = allPaths.map(p => p.split('/'));
    const common = [];
    for (let i = 0; i < segments[0].length; i++) {
        const segment = segments[0][i];
        if (segments.every(s => s[i] === segment)) {
            common.push(segment);
        } else {
            break;
        }
    }
    return common.join('/') || '/';
}

function createAggregator(outputDir, dbJsonPaths, args) {
    const root = commonRoot(outputDir, dbJsonPaths);
    const sourceFileSystem = new FileSystem(Path.from(root));
    const outputFileSystem = new FileSystem(Path.from(outputDir));
    const projectFileSystem = new FileSystem(Path.from(process.cwd()));

    const requirementsHierarchy = args.specRoot
        ? new RequirementsHierarchy(projectFileSystem, Path.from(args.specRoot))
        : new RequirementsHierarchy(projectFileSystem);

    return new DataSnapshotAggregator(outputFileSystem, {
        consistencyWindow: args.consistencyWindow ? parseInt(args.consistencyWindow, 10) : 5,
        maxHistory: args.maxHistory ? parseInt(args.maxHistory, 10) : undefined,
        title: args.title,
        buildCapabilities: !!args.specRoot,
    }, requirementsHierarchy, projectFileSystem, sourceFileSystem);
}

// --- Commands ---

function aggregate(argv, startIndex) {
    const args = parseArgs(argv, startIndex);

    if (args.help !== undefined) {
        console.log(`Usage: html-reporter aggregate [options]

Aggregate test run data from multiple sources into a single HTML report.

Options:
  --input              Glob pattern(s) for directories containing db.json files (required, comma-separated)
  --output             Output directory for the generated report (default: ./reports/serenity-js)
  --title              Report title
  --specRoot           Root directory for requirements hierarchy (enables capabilities view)
  --maxHistory         Maximum number of test runs to keep (older runs are pruned)
  --consistencyWindow  Number of recent runs used to identify flaky tests (default: 5)

Examples:
  html-reporter aggregate --input "reports/*/test-runs/*" --output ./reports --title "My Project"
  html-reporter aggregate --input "ci-data/**/test-runs/*,local/test-runs/*" --output ./out --maxHistory 20`);
        process.exit(0);
    }

    if (!args.input) {
        console.error('Error: --input is required\n');
        console.error('Usage: html-reporter aggregate --input <glob> [--output <dir>] [--title <title>] [--specRoot <dir>]');
        process.exit(1);
    }

    const outputDir = resolve(args.output || './reports/serenity-js');
    const inputPatterns = args.input.split(',').map(p => p.trim());
    const dbJsonPaths = resolveDbJsonPaths(inputPatterns);

    if (dbJsonPaths.length === 0) {
        console.error(`No test run data found matching: ${args.input}`);
        process.exit(1);
    }

    console.log(`Found ${dbJsonPaths.length} test runs`);

    const aggregator = createAggregator(outputDir, dbJsonPaths, args);
    aggregator.aggregate(dbJsonPaths);

    const outputFileSystem = new FileSystem(Path.from(outputDir));
    const templateWriter = new ReportTemplateWriter(outputFileSystem);
    templateWriter.write();

    console.log(`Report generated at ${outputDir}/index.html`);
}

function serve(argv, startIndex) {
    const args = parseArgs(argv, startIndex);

    if (args.help !== undefined) {
        console.log(`Usage: html-reporter serve [options]

Serve the generated HTML report on a local HTTP server.

Options:
  --dir        Directory containing the report (default: ./reports/serenity-js)
  --port       Port to listen on (default: 8080)
  --host       Host to bind to (default: 0.0.0.0)
  --open       Open the report in the default browser

Examples:
  html-reporter serve
  html-reporter serve --dir ./target/html-report --port 3000
  html-reporter serve --dir ./reports/serenity-js --open`);
        process.exit(0);
    }

    const dir = resolve(args.dir || './reports/serenity-js');
    const port = parseInt(args.port || '8080', 10);
    const host = args.host || '0.0.0.0';
    const shouldOpen = args.open !== undefined;

    if (!existsSync(dir)) {
        console.error(`Error: directory not found: ${dir}`);
        console.error('Run "html-reporter aggregate" first to generate the report.');
        process.exit(1);
    }

    if (!existsSync(join(dir, 'index.html'))) {
        console.error(`Error: no index.html found in ${dir}`);
        console.error('Run "html-reporter aggregate" first to generate the report.');
        process.exit(1);
    }

    const server = createServer((req, res) => {
        handleRequest(req, res, dir, host, port);
    });

    server.listen(port, host, () => {
        const localUrl = `http://localhost:${port}`;
        console.log(`Serenity/JS report server running:`);
        console.log(`  Local:   ${localUrl}`);

        if (host === '0.0.0.0' || host === '::') {
            const networkIp = getNetworkAddress();
            if (networkIp) {
                console.log(`  Network: http://${networkIp}:${port}`);
            }
        }

        console.log(`\nServing from: ${dir}`);
        console.log('Press Ctrl+C to stop.\n');

        if (shouldOpen) {
            const openCmd = process.platform === 'darwin' ? 'open'
                : process.platform === 'win32' ? 'start'
                : 'xdg-open';
            exec(`${openCmd} ${localUrl}`);
        }
    });

    process.on('SIGINT', () => {
        console.log('\nShutting down...');
        server.close();
        process.exit(0);
    });
}

// --- Main ---

const rawCommand = process.argv[2];
const command = rawCommand === '--' ? process.argv[3] : rawCommand;
const commandArgStart = rawCommand === '--' ? 4 : 3;

switch (command) {
    case 'aggregate':
        aggregate(process.argv, commandArgStart);
        break;
    case 'serve':
        serve(process.argv, commandArgStart);
        break;
    case '--help':
    case '-h':
    case undefined:
        printUsage();
        process.exit(command ? 0 : 1);
        break;
    default:
        console.error(`Unknown command: ${command}\n`);
        printUsage();
        process.exit(1);
}
