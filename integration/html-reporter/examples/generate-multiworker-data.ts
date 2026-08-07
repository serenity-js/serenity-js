/**
 * Generates synthetic multi-worker test data for integration testing.
 * Simulates WebdriverIO parallel workers that produce multiple db-{workerId}.json files
 * with the SAME moduleId. These should be aggregated into a single module entry.
 *
 * Creates under test-runs/50/:
 * - webdriverio-web-1/db-0-0.json (worker 0: 3 scenarios)
 * - webdriverio-web-1/db-0-1.json (worker 1: 4 scenarios)
 * - webdriverio-web-1/db-0-2.json (worker 2: 3 scenarios, 1 failed)
 * - mocha-1/db.json (single-process module: 2 scenarios)
 *
 * Expected aggregated result:
 * - webdriverio-web: 10 scenarios (9 passed, 1 failed) — ONE module entry
 * - mocha: 2 scenarios (2 passed) — ONE module entry
 */
import { resolve } from 'node:path';

import {
    addMilliseconds,
    aggregateReport,
    createModule,
    createSystemContext,
    writeModuleFile,
} from './test-data-generators';

const reportsDirectory = resolve(__dirname, 'reports', 'multi-worker');
const testRunsDirectory = resolve(reportsDirectory, 'test-runs', '50');
const baseTimestamp = '2026-07-28T10:00:00.000Z';
const systemContext = createSystemContext('50', {
    runtime: { provider: 'GitHub Actions', buildNumber: '50', branch: 'main', commit: 'def456' },
});

// Worker 0: 3 passing scenarios
const worker0 = createModule({
    testRunId: '50',
    moduleId: 'webdriverio-web',
    startedAt: baseTimestamp,
    finishedAt: addMilliseconds(baseTimestamp, 30_000),
    testRunner: { name: 'WebdriverIO', version: '9.2.0' },
    systemContext,
    scenes: [
        { name: 'Navigation should load the homepage', category: 'Navigation', source: { path: 'webdriverio-web/navigation.spec.ts', line: 10 }, features: ['Navigation'], duration: 1200 },
        { name: 'Navigation should follow internal links', category: 'Navigation', source: { path: 'webdriverio-web/navigation.spec.ts', line: 20 }, features: ['Navigation'], duration: 800 },
        { name: 'Navigation should handle browser back button', category: 'Navigation', source: { path: 'webdriverio-web/navigation.spec.ts', line: 30 }, features: ['Navigation'], duration: 900 },
    ],
});

// Worker 1: 4 passing scenarios
const worker1 = createModule({
    testRunId: '50',
    moduleId: 'webdriverio-web',
    startedAt: addMilliseconds(baseTimestamp, 1_000),
    finishedAt: addMilliseconds(baseTimestamp, 45_000), // Latest finish time
    testRunner: { name: 'WebdriverIO', version: '9.2.0' },
    systemContext,
    scenes: [
        { name: 'Forms should submit valid data', category: 'Forms', source: { path: 'webdriverio-web/forms.spec.ts', line: 10 }, features: ['Forms'], duration: 1500 },
        { name: 'Forms should validate required fields', category: 'Forms', source: { path: 'webdriverio-web/forms.spec.ts', line: 25 }, features: ['Forms'], duration: 1100 },
        { name: 'Forms should show inline errors', category: 'Forms', source: { path: 'webdriverio-web/forms.spec.ts', line: 40 }, features: ['Forms'], duration: 900 },
        { name: 'Forms should clear on reset', category: 'Forms', source: { path: 'webdriverio-web/forms.spec.ts', line: 55 }, features: ['Forms'], duration: 700 },
    ],
});

// Worker 2: 3 scenarios (2 passing, 1 failed)
const worker2 = createModule({
    testRunId: '50',
    moduleId: 'webdriverio-web',
    startedAt: addMilliseconds(baseTimestamp, 2_000),
    finishedAt: addMilliseconds(baseTimestamp, 40_000),
    testRunner: { name: 'WebdriverIO', version: '9.2.0' },
    systemContext,
    scenes: [
        { name: 'Tables should display data correctly', category: 'Tables', source: { path: 'webdriverio-web/tables.spec.ts', line: 10 }, features: ['Tables'], duration: 1000 },
        { name: 'Tables should sort by column', category: 'Tables', source: { path: 'webdriverio-web/tables.spec.ts', line: 25 }, features: ['Tables'], duration: 1200 },
        { name: 'Tables should paginate large datasets', category: 'Tables', source: { path: 'webdriverio-web/tables.spec.ts', line: 40 }, features: ['Tables'], duration: 2000, passed: false, error: { name: 'AssertionError', message: 'Expected 10 rows per page, got 5', stack: 'AssertionError: Expected 10 rows per page, got 5\n    at tables.spec.ts:45:10' } },
    ],
});

// Single-process Mocha module (for comparison — uses db.json, not db-{workerId}.json)
const mochaModule = createModule({
    testRunId: '50',
    moduleId: 'mocha',
    startedAt: addMilliseconds(baseTimestamp, 5_000),
    finishedAt: addMilliseconds(baseTimestamp, 15_000),
    testRunner: { name: 'Mocha', version: '11.0.0' },
    systemContext,
    scenes: [
        { name: 'Unit test should validate input', category: 'Unit Tests', source: { path: 'mocha/validation.spec.ts', line: 5 }, features: ['Validation'], duration: 50 },
        { name: 'Unit test should transform output', category: 'Unit Tests', source: { path: 'mocha/transform.spec.ts', line: 8 }, features: ['Transform'], duration: 30 },
    ],
});

// Write worker files (simulating WebdriverIO parallel workers)
const wdioDirectory = resolve(testRunsDirectory, 'webdriverio-web-1');
writeModuleFile(wdioDirectory, 'db-0-0.json', worker0);
writeModuleFile(wdioDirectory, 'db-0-1.json', worker1);
writeModuleFile(wdioDirectory, 'db-0-2.json', worker2);

// Write single-process module
writeModuleFile(resolve(testRunsDirectory, 'mocha-1'), 'db.json', mochaModule);

console.log('✓ Generated multi-worker test data');
console.log('  - webdriverio-web (3 workers):');
console.log('    - db-0-0.json: 3 scenarios (3 passed)');
console.log('    - db-0-1.json: 4 scenarios (4 passed)');
console.log('    - db-0-2.json: 3 scenarios (2 passed, 1 failed)');
console.log('  - mocha (single process): 2 scenarios (2 passed)');
console.log('Total: 12 scenarios from 2 modules (3 worker files + 1 db.json)\n');

// Aggregate the report
console.log('Aggregating multi-worker report...');
aggregateReport(reportsDirectory, 'Multi-Worker Test Project', __dirname);

console.log('✓ Multi-worker report ready at examples/reports/multi-worker/index.html');
console.log('\nExpected result after aggregation:');
console.log('  - webdriverio-web: 10 scenarios (9 passed, 1 failed) — ONE module entry');
console.log('  - mocha: 2 scenarios (2 passed) — ONE module entry');
