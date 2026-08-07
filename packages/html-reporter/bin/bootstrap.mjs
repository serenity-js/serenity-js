/**
 * Bootstraps the Serenity/JS HTML Reporter CLI.
 *
 * Separated from the bin entry point so that the CLI can be unit-tested
 * by passing argv directly and intercepting the output.
 *
 * @param {string[]} argv - Command-line arguments (without node and script path)
 * @param {function} [interceptor] - Optional callback for testing: (error, parsed, output) => void
 */

import { createServer } from 'node:http';
import { exec } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import fg from 'fast-glob';
import yargs from 'yargs';

import { DataSnapshotAggregator } from '../esm/cli/DataSnapshotAggregator.js';
import { ReportTemplateWriter } from '../esm/cli/ReportTemplateWriter.js';
import { getNetworkAddress, handleRequest } from './staticFileServer.mjs';

const pkg = JSON.parse(readFileSync(resolve(fileURLToPath(import.meta.url), '../../package.json'), 'utf8'));

// --- Helpers ---

function resolveDbJsonPaths(inputPatterns) {
    const dbJsonPaths = [];

    for (const pattern of inputPatterns) {
        if (pattern.endsWith('db.json') || pattern.includes('db-')) {
            const matches = fg.sync(pattern, { absolute: true });
            dbJsonPaths.push(...matches);
        } else {
            const dbPattern = pattern + '/**/db.json';
            const workerDbPattern = pattern + '/**/db-*.json';
            const dbMatches = fg.sync(dbPattern, { absolute: true });
            const workerMatches = fg.sync(workerDbPattern, { absolute: true });
            dbJsonPaths.push(...dbMatches, ...workerMatches);
        }
    }

    return dbJsonPaths;
}

function commonRoot(outputDirectory, paths) {
    const allPaths = [outputDirectory, ...paths.map(p => p.replace(/\/db(-[^/]+)?\.json$/, ''))];
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

function createAggregator(outputDirectory, dbJsonPaths, options) {
    const root = commonRoot(outputDirectory, dbJsonPaths);
    const sourceFileSystem = new FileSystem(Path.from(root));
    const outputFileSystem = new FileSystem(Path.from(outputDirectory));
    const projectFileSystem = new FileSystem(Path.from(process.cwd()));

    const requirementsHierarchy = options.specRoot
        ? new RequirementsHierarchy(projectFileSystem, Path.from(options.specRoot))
        : new RequirementsHierarchy(projectFileSystem);

    return new DataSnapshotAggregator(outputFileSystem, {
        consistencyWindow: options.consistencyWindow,
        maxHistory: options.maxHistory,
        title: options.title,
        buildCapabilities: !!options.specRoot,
    }, requirementsHierarchy, projectFileSystem, sourceFileSystem);
}

// --- Commands ---

function aggregateHandler(argv) {
    const outputDirectory = resolve(argv.output);
    const inputPatterns = argv.input.split(',').map(p => p.trim());
    const dbJsonPaths = resolveDbJsonPaths(inputPatterns);

    if (dbJsonPaths.length === 0) {
        console.error(`No test run data found matching: ${argv.input}`);
        process.exit(1);
    }

    console.log(`Found ${dbJsonPaths.length} test runs`);

    const aggregator = createAggregator(outputDirectory, dbJsonPaths, argv);
    aggregator.aggregate(dbJsonPaths);

    const outputFileSystem = new FileSystem(Path.from(outputDirectory));
    const templateWriter = new ReportTemplateWriter(outputFileSystem);
    templateWriter.write();

    console.log(`Report generated at ${outputDirectory}/index.html`);
}

function serveHandler(argv) {
    const directory = resolve(argv.dir);
    const { port, host } = argv;

    if (!existsSync(directory)) {
        console.error(`Error: directory not found: ${directory}`);
        console.error('Run "html-reporter aggregate" first to generate the report.');
        process.exit(1);
    }

    if (!existsSync(join(directory, 'index.html'))) {
        console.error(`Error: no index.html found in ${directory}`);
        console.error('Run "html-reporter aggregate" first to generate the report.');
        process.exit(1);
    }

    const server = createServer((req, res) => {
        handleRequest(req, res, directory, host, port);
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

        console.log(`\nServing from: ${directory}`);
        console.log('Press Ctrl+C to stop.\n');

        if (argv.open) {
            const openCommand = process.platform === 'darwin' ? 'open'
                : process.platform === 'win32' ? 'start'
                : 'xdg-open';
            exec(`${openCommand} ${localUrl}`);
        }
    });

    process.on('SIGINT', () => {
        console.log('\nShutting down...');
        server.close();
        process.exit(0);
    });
}

// --- CLI Definition ---

export function bootstrap(argv, interceptor) {
    yargs()
        .scriptName('html-reporter')
        .version(pkg.version)
        .usage('Usage: $0 <command> [options]')
        .command('aggregate', 'Aggregate test run data into an HTML report', (builder) => {
            builder
                .option('input', {
                    type: 'string',
                    demandOption: true,
                    describe: 'Glob pattern(s) for directories containing db.json files (comma-separated)',
                })
                .option('output', {
                    type: 'string',
                    default: './reports/serenity-js',
                    describe: 'Output directory for the generated report',
                })
                .option('title', {
                    type: 'string',
                    describe: 'Report title displayed in the header',
                })
                .option('specRoot', {
                    type: 'string',
                    describe: 'Root directory for requirements hierarchy (enables capabilities view)',
                })
                .option('maxHistory', {
                    type: 'number',
                    describe: 'Maximum number of test runs to keep (older runs are pruned)',
                })
                .option('consistencyWindow', {
                    type: 'number',
                    default: 5,
                    describe: 'Number of recent runs used to detect consistency issues',
                })
                .example('$0 aggregate --input "reports/*/test-runs/*" --output ./reports --title "My Project"', '')
                .example('$0 aggregate --input "ci-data/**/test-runs/*,local/test-runs/*" --output ./out --maxHistory 20', '');
        }, aggregateHandler)
        .command('serve', 'Serve the generated HTML report on a local HTTP server', (builder) => {
            builder
                .option('dir', {
                    type: 'string',
                    default: './reports/serenity-js',
                    describe: 'Directory containing the report',
                })
                .option('port', {
                    type: 'number',
                    default: 8080,
                    describe: 'Port to listen on',
                })
                .option('host', {
                    type: 'string',
                    default: '0.0.0.0',
                    describe: 'Host to bind to',
                })
                .option('open', {
                    type: 'boolean',
                    default: false,
                    describe: 'Open the report in the default browser',
                })
                .example('$0 serve', '')
                .example('$0 serve --dir ./target/html-report --port 3000', '')
                .example('$0 serve --dir ./reports/serenity-js --open', '');
        }, serveHandler)
        .demand(1, 'Please specify a command: aggregate or serve')
        .alias('h', 'help')
        .alias('v', 'version')
        .strict()
        .parse(argv, {}, interceptor);
}
