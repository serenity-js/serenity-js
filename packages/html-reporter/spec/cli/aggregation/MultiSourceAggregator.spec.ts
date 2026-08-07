import type * as fs from 'node:fs';

import { expect, test } from '@playwright/test';
import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import { createFsFromVolume, Volume } from 'memfs';

import { MultiSourceAggregator } from '../../../src/cli/aggregation/MultiSourceAggregator.js';
import { SingleSourceAggregator } from '../../../src/cli/aggregation/SingleSourceAggregator.js';
import type { ReportData } from '../../../src/cli/reporting/ReportData.js';

test.describe('MultiSourceAggregator', () => {

    const outputDirectory = Path.from('/reports/serenity-js');

    function createMemFs(tree: Record<string, unknown>, root = '/'): typeof fs {
         
        return createFsFromVolume(Volume.fromNestedJSON(tree as any, root)) as unknown as typeof fs;
    }

    function createAggregator(tree: Record<string, unknown>, config: { maxHistory?: number; consistencyWindow?: number; title?: string } = {}, requirementsHierarchy?: RequirementsHierarchy, projectFileSystem?: FileSystem): { aggregator: SingleSourceAggregator; filesystem: typeof fs } {
        const filesystem = createMemFs({ [outputDirectory.value]: tree });

        const fileSystem = new FileSystem(outputDirectory, filesystem);
        const defaultProjectFs = projectFileSystem || new FileSystem(Path.from('/'), filesystem);
        const hierarchy = requirementsHierarchy || new RequirementsHierarchy(defaultProjectFs);
        const aggregator = new SingleSourceAggregator(fileSystem, {
            consistencyWindow: config.consistencyWindow ?? 5,
            maxHistory: config.maxHistory,
            title: config.title,
            buildCapabilities: !!requirementsHierarchy,
        }, hierarchy, () => undefined);

        return { aggregator, filesystem };
    }

    function createMultiSourceAggregator(tree: Record<string, unknown>, config: { maxHistory?: number; consistencyWindow?: number; title?: string } = {}, requirementsHierarchy?: RequirementsHierarchy, projectFileSystem?: FileSystem): { aggregator: MultiSourceAggregator; filesystem: typeof fs } {
        const filesystem = createMemFs({ [outputDirectory.value]: tree });

        const fileSystem = new FileSystem(outputDirectory, filesystem);
        const sourceFileSystem = new FileSystem(Path.from('/'), filesystem);
        const defaultProjectFs = projectFileSystem || new FileSystem(Path.from('/'), filesystem);
        const hierarchy = requirementsHierarchy || new RequirementsHierarchy(defaultProjectFs);
        const aggregator = new MultiSourceAggregator(fileSystem, {
            consistencyWindow: config.consistencyWindow ?? 5,
            maxHistory: config.maxHistory,
            title: config.title,
            buildCapabilities: !!requirementsHierarchy,
        }, hierarchy, sourceFileSystem, () => undefined);

        return { aggregator, filesystem };
    }

    function readDataJs(filesystem: typeof fs): ReportData {
        const content = filesystem.readFileSync('/reports/serenity-js/data.js', 'utf8') as string;
        // Strip the "window.__SERENITY_REPORT_DATA__ = " prefix and trailing ";"
        const json = content.replace(/^window\.__SERENITY_REPORT_DATA__\s*=\s*/, '').replace(/;\s*$/, '');
        return JSON.parse(json) as ReportData;
    }

    // Default system context for test fixtures
    const defaultSystemContext = {
        nodeVersion: 'v22.0.0',
        os: { name: 'linux', version: '6.0.0', arch: 'x64' },
        serenityVersion: '3.44.0',
        runtime: { provider: 'node', version: 'v22.0.0' },
    };

    /**
     * Creates a valid db.json string with sensible defaults.
     * All fields can be overridden by passing them in the data parameter.
     */
    function runData(data: Record<string, unknown>): string {
        return JSON.stringify({
            schemaVersion: 1,
            systemContext: defaultSystemContext,
            ...data,
        });
    }

    test.describe('external run aggregation', () => {

        test('merges db.json files with the same testRunId directory name', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            // Write two db.json files simulating different modules with same testRunId
            const testRunDirectory1 = '/source/module-a/test-runs/42';
            const testRunDirectory2 = '/source/module-b/test-runs/42';
            filesystem.mkdirSync(testRunDirectory1, { recursive: true });
            filesystem.mkdirSync(testRunDirectory2, { recursive: true });

            filesystem.writeFileSync(testRunDirectory1 + '/db.json', runData({
                testRunId: '42',
                startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.500Z',
                outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test A', category: 'Mocha', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [{ type: 'tag', name: 'mocha' }], activities: [] },
                    { name: 'Test B', category: 'Mocha', outcome: { code: 64 }, duration: 300, startedAt: '2024-06-15T14:30:00.200Z', source: { path: 'a.spec.ts', line: 5 }, tags: [{ type: 'tag', name: 'mocha' }], activities: [] },
                ],
                tags: [{ type: 'tag', name: 'mocha' }], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(testRunDirectory2 + '/db.json', runData({
                testRunId: '42',
                startedAt: '2024-06-15T14:30:01.000Z', finishedAt: '2024-06-15T14:30:01.400Z',
                outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test C', category: 'Jasmine', outcome: { code: 64 }, duration: 150, startedAt: '2024-06-15T14:30:01.000Z', source: { path: 'c.spec.ts', line: 1 }, tags: [{ type: 'tag', name: 'jasmine' }], activities: [] },
                    { name: 'Test D', category: 'Jasmine', outcome: { code: 4 }, duration: 250, startedAt: '2024-06-15T14:30:01.150Z', source: { path: 'c.spec.ts', line: 5 }, tags: [{ type: 'tag', name: 'jasmine' }], activities: [] },
                ],
                tags: [{ type: 'tag', name: 'jasmine' }], testRunner: { name: 'Jasmine', version: '5.0.0' },
            }));

            aggregator.aggregate([testRunDirectory1 + '/db.json', testRunDirectory2 + '/db.json']);

            expect(filesystem.existsSync('/reports/serenity-js/data.js')).toBe(true);
            const data = readDataJs(filesystem);

            // Merged: 4 scenarios from both modules
            expect(data.scenarios).toHaveLength(4);
            expect(data.summary.totalScenarios).toBe(4);
            expect(data.summary.outcomes.passed).toBe(3);
            expect(data.summary.outcomes.failed).toBe(1);

            // Only 1 history entry (merged into one run)
            expect(data.history).toHaveLength(1);
        });

        test('records differing outcomes as retry attempts when the same scene appears in both a pre-merged run and raw module artifacts', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            // Simulate gh-pages pre-merged run (from a prior aggregate of attempt 1)
            // where Test A failed
            const ghPagesRunDirectory = '/source/gh-pages/test-runs/42';
            filesystem.mkdirSync(ghPagesRunDirectory, { recursive: true });
            filesystem.writeFileSync(ghPagesRunDirectory + '/db.json', runData({
                testRunId: '42',
                attempt: 1,
                startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.500Z',
                outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test A', category: 'Suite', outcome: { code: 4 }, duration: 200, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [{ type: 'Interaction', name: 'step 1', outcome: { code: 4 }, duration: 200, children: [] }], error: { name: 'AssertionError', message: 'Expected true to be false', stack: '' } },
                    { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 300, startedAt: '2024-06-15T14:30:00.200Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [{ type: 'Interaction', name: 'step 2', outcome: { code: 64 }, duration: 300, children: [] }] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            // Simulate fresh module artifacts from attempt 3 (re-run) where Test A now passes
            const freshArtifactDirectory = '/source/module-a/test-runs/42';
            filesystem.mkdirSync(freshArtifactDirectory, { recursive: true });
            filesystem.writeFileSync(freshArtifactDirectory + '/db.json', runData({
                testRunId: '42',
                attempt: 1,
                startedAt: '2024-06-15T14:31:00.000Z', finishedAt: '2024-06-15T14:31:00.500Z',
                outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 150, startedAt: '2024-06-15T14:31:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [{ type: 'Interaction', name: 'step 1 retry', outcome: { code: 64 }, duration: 150, children: [] }] },
                    { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 280, startedAt: '2024-06-15T14:31:00.150Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [{ type: 'Interaction', name: 'step 2', outcome: { code: 64 }, duration: 280, children: [] }] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            aggregator.aggregate([ghPagesRunDirectory + '/db.json', freshArtifactDirectory + '/db.json']);

            const data = readDataJs(filesystem);

            // Should have 2 scenarios (not 4 from naive concatenation)
            expect(data.scenarios).toHaveLength(2);
            expect(data.summary.totalScenarios).toBe(2);

            // Test A should show as passed (final outcome) with 1 retry attempt
            const testA = data.scenarios.find(s => s.name === 'Test A');
            expect(testA.outcome).toBe('SUCCESS');
            expect(testA.retries).toBe(1);
            expect(testA.attempts).toHaveLength(2);
            expect(testA.attempts[0].outcome).toBe('FAILURE');
            expect(testA.attempts[0].activities[0].name).toBe('step 1');
            expect(testA.attempts[1].outcome).toBe('SUCCESS');
            expect(testA.attempts[1].activities[0].name).toBe('step 1 retry');

            // Test B should show as passed with no retries (same outcome in both sources = duplicate data)
            const testB = data.scenarios.find(s => s.name === 'Test B');
            expect(testB.outcome).toBe('SUCCESS');
            expect(testB.retries).toBeUndefined();
            expect(testB.attempts).toBeUndefined();

            // Total duration spans from earliest startedAt to latest finishedAt across all attempts
            expect(data.summary.startedAt).toBe('2024-06-15T14:30:00.000Z');
            expect(data.summary.finishedAt).toBe('2024-06-15T14:31:00.500Z');
            expect(data.summary.duration).toBe(60_500);
        });

        test('skips duplicate scenes with identical outcomes from overlapping data sources', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            // Same test appears in both gh-pages pre-merged and raw artifacts, both passing
            const ghPagesRunDirectory = '/source/gh-pages/test-runs/42';
            filesystem.mkdirSync(ghPagesRunDirectory, { recursive: true });
            filesystem.writeFileSync(ghPagesRunDirectory + '/db.json', runData({
                testRunId: '42',
                attempt: 1,
                startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.500Z',
                outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [{ type: 'Interaction', name: 'step A v1', outcome: { code: 64 }, duration: 200, children: [] }] },
                    { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 300, startedAt: '2024-06-15T14:30:00.200Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [{ type: 'Interaction', name: 'step B v1', outcome: { code: 64 }, duration: 300, children: [] }] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            const freshArtifactDirectory = '/source/module-a/test-runs/42';
            filesystem.mkdirSync(freshArtifactDirectory, { recursive: true });
            filesystem.writeFileSync(freshArtifactDirectory + '/db.json', runData({
                testRunId: '42',
                attempt: 1,
                startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.500Z',
                outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 180, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [{ type: 'Interaction', name: 'step A v2', outcome: { code: 64 }, duration: 180, children: [] }] },
                    { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 290, startedAt: '2024-06-15T14:30:00.200Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [{ type: 'Interaction', name: 'step B v2', outcome: { code: 64 }, duration: 290, children: [] }] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            aggregator.aggregate([ghPagesRunDirectory + '/db.json', freshArtifactDirectory + '/db.json']);

            const data = readDataJs(filesystem);

            // Should have 2 scenarios (not 4)
            expect(data.scenarios).toHaveLength(2);
            expect(data.summary.totalScenarios).toBe(2);
            expect(data.summary.outcomes.passed).toBe(2);

            // Neither should have retry attempts — same outcome means duplicate data, not a retry
            for (const scenario of data.scenarios) {
                expect(scenario.retries).toBeUndefined();
                expect(scenario.attempts).toBeUndefined();
            }
        });

        test('excludes stale run-level pre-merged db.json when fresh module-level db.json files exist for the same testRunId', () => {
            // This is the "zombie module data" bug scenario:
            // - gh-pages has a pre-merged test-runs/42/db.json from a previous CI run where webdriverio succeeded
            // - The current CI run produces fresh module-level db.json files (e.g., test-runs/42/cucumber-1/db.json)
            // - webdriverio crashed in the current run and didn't produce a db.json
            // - Without the fix, the pre-merged run-level file contributes stale webdriverio data
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            // Pre-merged run-level db.json from gh-pages (stale — from a previous successful run)
            // This has data from both cucumber and webdriverio modules merged together
            const ghPagesRunDirectory = '/source/gh-pages/test-runs/42';
            filesystem.mkdirSync(ghPagesRunDirectory, { recursive: true });
            filesystem.writeFileSync(ghPagesRunDirectory + '/db.json', runData({
                testRunId: '42',
                moduleId: 'cucumber-1',  // The merged file has the moduleId of the first module
                startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:10.000Z',
                outcomes: { passed: 5, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    // Contains scenes from both modules — this is stale merged data
                    { name: 'Cucumber Test A', category: 'Cucumber', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'cucumber.spec.ts', line: 1 }, tags: [], activities: [] },
                    { name: 'Cucumber Test B', category: 'Cucumber', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:01.000Z', source: { path: 'cucumber.spec.ts', line: 5 }, tags: [], activities: [] },
                    { name: 'WebdriverIO Test A', category: 'WebdriverIO', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:02.000Z', source: { path: 'wdio.spec.ts', line: 1 }, tags: [], activities: [] },
                    { name: 'WebdriverIO Test B', category: 'WebdriverIO', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:03.000Z', source: { path: 'wdio.spec.ts', line: 5 }, tags: [], activities: [] },
                    { name: 'WebdriverIO Test C', category: 'WebdriverIO', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:04.000Z', source: { path: 'wdio.spec.ts', line: 9 }, tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            // Fresh module-level db.json from current CI run (cucumber succeeded)
            const freshCucumberDirectory = '/source/artifacts/test-runs/42/cucumber-1';
            filesystem.mkdirSync(freshCucumberDirectory, { recursive: true });
            filesystem.writeFileSync(freshCucumberDirectory + '/db.json', runData({
                testRunId: '42',
                moduleId: 'cucumber-1',
                startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:02.000Z',
                outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Cucumber Test A', category: 'Cucumber', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'cucumber.spec.ts', line: 1 }, tags: [], activities: [] },
                    { name: 'Cucumber Test B', category: 'Cucumber', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:01.000Z', source: { path: 'cucumber.spec.ts', line: 5 }, tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                systemContext: { nodeVersion: 'v22', os: { name: 'linux', version: '6', arch: 'x64' }, serenityVersion: '3.44.0', runtime: { provider: 'node', version: 'v22' }, projectName: 'cucumber' },
            }));

            // Note: NO webdriverio db.json exists — it crashed before producing results

            aggregator.aggregate([
                ghPagesRunDirectory + '/db.json',
                freshCucumberDirectory + '/db.json',
            ]);

            const data = readDataJs(filesystem);

            // Should ONLY have the 2 cucumber scenarios from the fresh module-level file
            // The stale webdriverio data from the pre-merged run-level file should NOT appear
            expect(data.scenarios).toHaveLength(2);
            expect(data.summary.totalScenarios).toBe(2);
            expect(data.summary.outcomes.passed).toBe(2);

            // Verify all scenarios are from cucumber (no zombie webdriverio data)
            const scenarioNames = data.scenarios.map(s => s.name).sort();
            expect(scenarioNames).toEqual(['Cucumber Test A', 'Cucumber Test B']);

            // Modules array should only have the fresh cucumber module
            expect(data.history[0].modules).toHaveLength(1);
            expect(data.history[0].modules[0].moduleId).toBe('cucumber-1');
        });

        test('uses run-level db.json when no module-level files exist (backwards compatibility)', () => {
            // When there are only run-level db.json files (old format), they should still work
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const runDirectory = '/source/test-runs/42';
            filesystem.mkdirSync(runDirectory, { recursive: true });
            filesystem.writeFileSync(runDirectory + '/db.json', runData({
                testRunId: '42',
                startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:05.000Z',
                outcomes: { passed: 3, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                    { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:01.000Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [] },
                    { name: 'Test C', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:02.000Z', source: { path: 'b.spec.ts', line: 1 }, tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            aggregator.aggregate([runDirectory + '/db.json']);

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(3);
            expect(data.summary.totalScenarios).toBe(3);
        });
    });

    test.describe('maxHistory pruning', () => {

        test('retains only the most recent N test run directories when maxHistory is configured', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-13T10:00:00.000Z': { 'db.json': runData({ startedAt: '2024-06-13T10:00:00.000Z', finishedAt: '2024-06-13T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-13T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }), 'screenshot.png': 'old-data' },
                    '2024-06-14T10:00:00.000Z': { 'db.json': runData({ startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    '2024-06-15T10:00:00.000Z': { 'db.json': runData({ startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                },
            }, { maxHistory: 2 });

            aggregator.aggregate();

            // Oldest run should be removed
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/2024-06-13T10:00:00.000Z')).toBe(false);
            // Two most recent retained
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/2024-06-14T10:00:00.000Z')).toBe(true);
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/2024-06-15T10:00:00.000Z')).toBe(true);

            const data = readDataJs(filesystem);
            expect(data.history).toHaveLength(2);
        });

        test('does not prune historical runs from the output directory before reading them as external runs', () => {
            // Regression test: when --input glob includes test-runs/* from the output directory
            // (e.g. gh-pages historical data), maxHistory pruning must not delete those files
            // before loadExternalRuns reads them.
            const { aggregator, filesystem } = createAggregator({
                // Simulate 4 historical runs already on gh-pages (output dir)
                'test-runs': {
                    'run-1': { 'db.json': runData({ testRunId: 'run-1', startedAt: '2024-06-12T10:00:00.000Z', finishedAt: '2024-06-12T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-12T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    'run-2': { 'db.json': runData({ testRunId: 'run-2', startedAt: '2024-06-13T10:00:00.000Z', finishedAt: '2024-06-13T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-13T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    'run-3': { 'db.json': runData({ testRunId: 'run-3', startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    'run-4': { 'db.json': runData({ testRunId: 'run-4', startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                },
            }, { maxHistory: 3 });

            // External input paths include the historical runs from the output dir (like --input "output/test-runs/*")
            const paths = [
                '/reports/serenity-js/test-runs/run-1/db.json',
                '/reports/serenity-js/test-runs/run-2/db.json',
                '/reports/serenity-js/test-runs/run-3/db.json',
                '/reports/serenity-js/test-runs/run-4/db.json',
            ];

            // Should not throw ENOENT from pruning before reading
            aggregator.aggregate(paths);

            const data = readDataJs(filesystem);
            // maxHistory=3 means the oldest (run-1) is pruned, keeping run-2, run-3, run-4
            expect(data.history).toHaveLength(3);
        });
    });

    test.describe('external aggregation — artifact copying', () => {

        test('copies artifact files from source test-run directories to the output test-runs directory', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({
                'test-runs': {},
            });

            // Create source directories with db.json + artifacts using the memfs
            const sourceDirectory = '/source/project-a/test-runs/2024-06-15T14:30:00.000Z';
            filesystem.mkdirSync(sourceDirectory, { recursive: true });
            filesystem.writeFileSync(`${sourceDirectory}/db.json`, runData({
                startedAt: '2024-06-15T14:30:00.000Z',
                finishedAt: '2024-06-15T14:30:01.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    {
                        name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100,
                        startedAt: '2024-06-15T14:30:00.000Z',
                        source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [],
                        video: 'test-runs/2024-06-15T14:30:00.000Z/video-recording-abc123.webm',
                        artifacts: [{ path: 'test-runs/2024-06-15T14:30:00.000Z/screenshot-test-a-001.png', type: 'screenshot' }],
                    },
                ],
                tags: [],
                testRunner: { name: 'Playwright', version: '1.50.0' },
            }));
            filesystem.writeFileSync(`${sourceDirectory}/screenshot-test-a-001.png`, 'PNG_DATA_HERE');
            filesystem.writeFileSync(`${sourceDirectory}/video-recording-abc123.webm`, 'VIDEO_DATA_HERE');

            aggregator.aggregate([`${sourceDirectory}/db.json`]);

            // Artifacts should be copied to output/test-runs/<safe-timestamp>/
            const outputRunDirectory = '/reports/serenity-js/test-runs/2024-06-15T14-30-00.000Z';
            expect(filesystem.existsSync(`${outputRunDirectory}/screenshot-test-a-001.png`)).toBe(true);
            expect(filesystem.existsSync(`${outputRunDirectory}/video-recording-abc123.webm`)).toBe(true);
            expect(filesystem.existsSync(`${outputRunDirectory}/db.json`)).toBe(true);
            expect(filesystem.readFileSync(`${outputRunDirectory}/screenshot-test-a-001.png`, 'utf8')).toBe('PNG_DATA_HERE');
        });

        test('does not overwrite artifacts that already exist in the output directory', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({
                'test-runs': {
                    '2024-06-15T14-30-00.000Z': {
                        'db.json': runData({
                            startedAt: '2024-06-15T14:30:00.000Z',
                            finishedAt: '2024-06-15T14:30:01.000Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [],
                            testRunner: { name: 'Playwright', version: '1.50.0' },
                        }),
                        'screenshot-existing.png': 'ORIGINAL_DATA',
                    },
                },
            });

            // Source has a file with the same name
            const sourceDirectory = '/source/project-a/test-runs/2024-06-15T14:30:00.000Z';
            filesystem.mkdirSync(sourceDirectory, { recursive: true });
            filesystem.writeFileSync(`${sourceDirectory}/db.json`, runData({
                startedAt: '2024-06-15T14:30:00.000Z',
                finishedAt: '2024-06-15T14:30:01.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [],
                testRunner: { name: 'Playwright', version: '1.50.0' },
            }));
            filesystem.writeFileSync(`${sourceDirectory}/screenshot-existing.png`, 'NEW_DATA');
            filesystem.writeFileSync(`${sourceDirectory}/screenshot-new.png`, 'BRAND_NEW');

            aggregator.aggregate([`${sourceDirectory}/db.json`]);

            // Existing file should NOT be overwritten
            expect(filesystem.readFileSync('/reports/serenity-js/test-runs/2024-06-15T14-30-00.000Z/screenshot-existing.png', 'utf8')).toBe('ORIGINAL_DATA');
            // New file should be copied
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/2024-06-15T14-30-00.000Z/screenshot-new.png')).toBe(true);
        });

        test('copies artifacts from multiple source directories', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({
                'test-runs': {},
            });

            // Source A
            const sourceDirectoryA = '/source/project-a/test-runs/2024-06-15T14:30:00.000Z';
            filesystem.mkdirSync(sourceDirectoryA, { recursive: true });
            filesystem.writeFileSync(`${sourceDirectoryA}/db.json`, runData({
                startedAt: '2024-06-15T14:30:00.000Z',
                finishedAt: '2024-06-15T14:30:01.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [],
                testRunner: { name: 'Playwright', version: '1.50.0' },
            }));
            filesystem.writeFileSync(`${sourceDirectoryA}/screenshot-a.png`, 'A_DATA');

            // Source B (different timestamp)
            const sourceDirectoryB = '/source/project-b/test-runs/2024-06-16T10:00:00.000Z';
            filesystem.mkdirSync(sourceDirectoryB, { recursive: true });
            filesystem.writeFileSync(`${sourceDirectoryB}/db.json`, runData({
                startedAt: '2024-06-16T10:00:00.000Z',
                finishedAt: '2024-06-16T10:00:02.000Z',
                outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-16T10:00:00.000Z', source: { path: 'b.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [],
                testRunner: { name: 'Playwright', version: '1.50.0' },
            }));
            filesystem.writeFileSync(`${sourceDirectoryB}/screenshot-b.png`, 'B_DATA');

            aggregator.aggregate([`${sourceDirectoryA}/db.json`, `${sourceDirectoryB}/db.json`]);

            expect(filesystem.existsSync('/reports/serenity-js/test-runs/2024-06-15T14-30-00.000Z/screenshot-a.png')).toBe(true);
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/2024-06-16T10-00-00.000Z/screenshot-b.png')).toBe(true);
        });
    });

    test.describe('CI-level retry aggregation — additive merge (cross-module)', () => {

        test('merges scenes additively when two db.json files share the same testRunId and attempt', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const directoryA = '/source/module-a/test-runs/run-42-module-a-attempt-1';
            const directoryB = '/source/module-b/test-runs/run-42-module-b-attempt-1';
            filesystem.mkdirSync(directoryA, { recursive: true });
            filesystem.mkdirSync(directoryB, { recursive: true });

            filesystem.writeFileSync(`${directoryA}/db.json`, runData({
                testRunId: 'run-42', attempt: 1,
                startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:01.000Z',
                outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                    { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:00.100Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directoryB}/db.json`, runData({
                testRunId: 'run-42', attempt: 1,
                startedAt: '2024-06-15T14:30:00.500Z', finishedAt: '2024-06-15T14:30:02.000Z',
                outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test C', category: 'Suite', outcome: { code: 4 }, duration: 300, startedAt: '2024-06-15T14:30:00.500Z', source: { path: 'b.spec.ts', line: 1 }, tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            aggregator.aggregate([`${directoryA}/db.json`, `${directoryB}/db.json`]);

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(3);
            expect(data.summary.outcomes.passed).toBe(2);
            expect(data.summary.outcomes.failed).toBe(1);
        });

        test('sums outcome counts when merging cross-module runs with the same testRunId and attempt', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const directoryA = '/source/module-a/test-runs/run-99-module-a-attempt-1';
            const directoryB = '/source/module-b/test-runs/run-99-module-b-attempt-1';
            filesystem.mkdirSync(directoryA, { recursive: true });
            filesystem.mkdirSync(directoryB, { recursive: true });

            filesystem.writeFileSync(`${directoryA}/db.json`, runData({
                testRunId: 'run-99', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:01.000Z',
                outcomes: { passed: 3, failed: 1, pending: 1, skipped: 0, compromised: 0, error: 0 },
                scenes: [], tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directoryB}/db.json`, runData({
                testRunId: 'run-99', attempt: 1,
                startedAt: '2024-06-15T10:00:00.200Z', finishedAt: '2024-06-15T10:00:02.000Z',
                outcomes: { passed: 2, failed: 0, pending: 0, skipped: 1, compromised: 0, error: 0 },
                scenes: [], tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            aggregator.aggregate([`${directoryA}/db.json`, `${directoryB}/db.json`]);

            const data = readDataJs(filesystem);
            expect(data.summary.outcomes.passed).toBe(5);
            expect(data.summary.outcomes.failed).toBe(1);
            expect(data.summary.outcomes.pending).toBe(1);
            expect(data.summary.outcomes.skipped).toBe(1);
        });

        test('deduplicates tags when merging cross-module runs with the same testRunId and attempt', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const directoryA = '/source/module-a/test-runs/run-7-module-a-attempt-1';
            const directoryB = '/source/module-b/test-runs/run-7-module-b-attempt-1';
            filesystem.mkdirSync(directoryA, { recursive: true });
            filesystem.mkdirSync(directoryB, { recursive: true });

            filesystem.writeFileSync(`${directoryA}/db.json`, runData({
                testRunId: 'run-7', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:01.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'A', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [{ type: 'feature', name: 'login' }], activities: [] }],
                tags: [{ type: 'feature', name: 'login' }], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directoryB}/db.json`, runData({
                testRunId: 'run-7', attempt: 1,
                startedAt: '2024-06-15T10:00:00.100Z', finishedAt: '2024-06-15T10:00:01.100Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'B', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.100Z', source: { path: 'b.ts', line: 1 }, tags: [{ type: 'feature', name: 'login' }, { type: 'feature', name: 'checkout' }], activities: [] }],
                tags: [{ type: 'feature', name: 'login' }, { type: 'feature', name: 'checkout' }], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            aggregator.aggregate([`${directoryA}/db.json`, `${directoryB}/db.json`]);

            const data = readDataJs(filesystem);
            const loginTags = data.tags.filter(t => t.name === 'login');
            expect(loginTags).toHaveLength(1);
        });

        test('uses earliest startedAt and latest finishedAt when merging cross-module runs', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const directoryA = '/source/module-a/test-runs/run-5-module-a-attempt-1';
            const directoryB = '/source/module-b/test-runs/run-5-module-b-attempt-1';
            filesystem.mkdirSync(directoryA, { recursive: true });
            filesystem.mkdirSync(directoryB, { recursive: true });

            filesystem.writeFileSync(`${directoryA}/db.json`, runData({
                testRunId: 'run-5', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [], tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directoryB}/db.json`, runData({
                testRunId: 'run-5', attempt: 1,
                startedAt: '2024-06-15T10:00:02.000Z', finishedAt: '2024-06-15T10:00:08.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [], tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            aggregator.aggregate([`${directoryA}/db.json`, `${directoryB}/db.json`]);

            const data = readDataJs(filesystem);
            expect(data.summary.startedAt).toBe('2024-06-15T10:00:00.000Z');
            expect(data.summary.finishedAt).toBe('2024-06-15T10:00:08.000Z');
        });
    });

    test.describe('CI-level retry aggregation — retry merge (cross-attempt)', () => {

        test('promotes attempt-1 scene to attempts[] and uses attempt-2 result as final outcome', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const directory1 = '/source/module/test-runs/run-10-attempt-1';
            const directory2 = '/source/module/test-runs/run-10-attempt-2';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            filesystem.writeFileSync(`${directory1}/db.json`, runData({
                testRunId: 'run-10', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Retried test', category: 'Suite', outcome: { code: 4 }, duration: 300,
                        startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                        tags: [], activities: [{ type: 'Task', name: 'step', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', children: [] }],
                        error: { name: 'Error', message: 'attempt 1 failed', stack: '' } },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directory2}/db.json`, runData({
                testRunId: 'run-10', attempt: 2,
                startedAt: '2024-06-15T10:01:00.000Z', finishedAt: '2024-06-15T10:01:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Retried test', category: 'Suite', outcome: { code: 64 }, duration: 250,
                        startedAt: '2024-06-15T10:01:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                        tags: [], activities: [{ type: 'Task', name: 'step', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:01:00.000Z', children: [] }] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            aggregator.aggregate([`${directory1}/db.json`, `${directory2}/db.json`]);

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(1);
            const scene = data.scenarios[0];
            expect(scene.outcome).toBe('SUCCESS');
            expect(scene.attempts).toHaveLength(2);
            expect(scene.attempts[0].outcome).toBe('FAILURE');
            expect(scene.attempts[0].error.message).toBe('attempt 1 failed');
            expect(scene.attempts[1].outcome).toBe('SUCCESS');
            expect(scene.retries).toBe(1);
        });

        test('keeps scenes that only appear in attempt 1 (not retried) with their original outcome', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const directory1 = '/source/module/test-runs/run-11-attempt-1';
            const directory2 = '/source/module/test-runs/run-11-attempt-2';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            filesystem.writeFileSync(`${directory1}/db.json`, runData({
                testRunId: 'run-11', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Stable test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                    { name: 'Failing test', category: 'Suite', outcome: { code: 4 }, duration: 200, startedAt: '2024-06-15T10:00:01.000Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directory2}/db.json`, runData({
                testRunId: 'run-11', attempt: 2,
                startedAt: '2024-06-15T10:01:00.000Z', finishedAt: '2024-06-15T10:01:05.000Z',
                outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Failing test', category: 'Suite', outcome: { code: 4 }, duration: 210, startedAt: '2024-06-15T10:01:00.000Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            aggregator.aggregate([`${directory1}/db.json`, `${directory2}/db.json`]);

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(2);
            const stable = data.scenarios.find(s => s.name === 'Stable test');
            expect(stable.outcome).toBe('SUCCESS');
            expect(stable.attempts).toBeUndefined();
        });

        test('keeps scenes that only appear in attempt 2 (new in retry) as-is', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const directory1 = '/source/module/test-runs/run-12-attempt-1';
            const directory2 = '/source/module/test-runs/run-12-attempt-2';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            filesystem.writeFileSync(`${directory1}/db.json`, runData({
                testRunId: 'run-12', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Existing test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directory2}/db.json`, runData({
                testRunId: 'run-12', attempt: 2,
                startedAt: '2024-06-15T10:01:00.000Z', finishedAt: '2024-06-15T10:01:05.000Z',
                outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Existing test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:01:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                    { name: 'Brand new test', category: 'Suite', outcome: { code: 64 }, duration: 150, startedAt: '2024-06-15T10:01:01.000Z', source: { path: 'b.spec.ts', line: 1 }, tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            aggregator.aggregate([`${directory1}/db.json`, `${directory2}/db.json`]);

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(2);
            const newTest = data.scenarios.find(s => s.name === 'Brand new test');
            expect(newTest).toBeDefined();
            expect(newTest.attempts).toBeUndefined();
        });

        test('processes attempts in attempt-number order regardless of filesystem discovery order', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            // Supply attempt-2 before attempt-1 to verify ordering by attempt field
            const directory2 = '/source/module/test-runs/run-13-attempt-2';
            const directory1 = '/source/module/test-runs/run-13-attempt-1';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            filesystem.writeFileSync(`${directory1}/db.json`, runData({
                testRunId: 'run-13', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test', category: 'Suite', outcome: { code: 4 }, duration: 300, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [],
                        error: { name: 'Error', message: 'first attempt error', stack: '' } },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directory2}/db.json`, runData({
                testRunId: 'run-13', attempt: 2,
                startedAt: '2024-06-15T10:01:00.000Z', finishedAt: '2024-06-15T10:01:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T10:01:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            // Pass attempt-2 path first to verify ordering is by attempt field
            aggregator.aggregate([`${directory2}/db.json`, `${directory1}/db.json`]);

            const data = readDataJs(filesystem);
            const scene = data.scenarios[0];
            expect(scene.outcome).toBe('SUCCESS');
            expect(scene.attempts[0].outcome).toBe('FAILURE');
            expect(scene.attempts[0].error.message).toBe('first attempt error');
        });
    });

    test.describe('CI-level retry aggregation — backwards compatibility', () => {

        test('treats db.json without attempt field as attempt 1', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const directory1 = '/source/module/test-runs/run-20-attempt-1';
            const directory2 = '/source/module/test-runs/run-20-legacy';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            // Legacy db.json: has testRunId but no attempt field
            filesystem.writeFileSync(`${directory2}/db.json`, runData({
                testRunId: 'run-20',
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Legacy test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            // Modern db.json: same testRunId, attempt 1
            filesystem.writeFileSync(`${directory1}/db.json`, runData({
                testRunId: 'run-20', attempt: 1,
                startedAt: '2024-06-15T10:00:01.000Z', finishedAt: '2024-06-15T10:00:06.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Modern test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:01.000Z', source: { path: 'b.spec.ts', line: 1 }, tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            // Both have same testRunId and both default to attempt 1 → additive merge
            aggregator.aggregate([`${directory1}/db.json`, `${directory2}/db.json`]);

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(2);
        });

        test('uses startedAt as grouping key when testRunId is absent', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const directoryA = '/source/module-a/test-runs/2024-06-15T10:00:00.000Z';
            const directoryB = '/source/module-b/test-runs/2024-06-15T10:00:00.000Z';
            filesystem.mkdirSync(directoryA, { recursive: true });
            filesystem.mkdirSync(directoryB, { recursive: true });

            filesystem.writeFileSync(`${directoryA}/db.json`, runData({
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'A', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directoryB}/db.json`, runData({
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:06.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'B', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'b.ts', line: 1 }, tags: [], activities: [] }],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            aggregator.aggregate([`${directoryA}/db.json`, `${directoryB}/db.json`]);

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(2);
            expect(data.history).toHaveLength(1);
        });
    });

    test.describe('CI-level retry aggregation — combined (multi-module × multi-attempt)', () => {

        test('performs additive merge within attempt then retry merge across attempts', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const directories = {
                a1: '/source/module-a/test-runs/run-30-module-a-attempt-1',
                b1: '/source/module-b/test-runs/run-30-module-b-attempt-1',
                a2: '/source/module-a/test-runs/run-30-module-a-attempt-2',
                b2: '/source/module-b/test-runs/run-30-module-b-attempt-2',
            };
            for (const directory of Object.values(directories)) {
                filesystem.mkdirSync(directory, { recursive: true });
            }

            // Attempt 1: module-a passes, module-b fails
            filesystem.writeFileSync(`${directories.a1}/db.json`, runData({
                testRunId: 'run-30', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'A', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directories.b1}/db.json`, runData({
                testRunId: 'run-30', attempt: 1,
                startedAt: '2024-06-15T10:00:01.000Z', finishedAt: '2024-06-15T10:00:06.000Z',
                outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'B', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T10:00:01.000Z', source: { path: 'b.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            // Attempt 2: both pass
            filesystem.writeFileSync(`${directories.a2}/db.json`, runData({
                testRunId: 'run-30', attempt: 2,
                startedAt: '2024-06-15T10:01:00.000Z', finishedAt: '2024-06-15T10:01:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'A', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:01:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directories.b2}/db.json`, runData({
                testRunId: 'run-30', attempt: 2,
                startedAt: '2024-06-15T10:01:01.000Z', finishedAt: '2024-06-15T10:01:06.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'B', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:01:01.000Z', source: { path: 'b.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            aggregator.aggregate(Object.values(directories).map(d => `${d}/db.json`));

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(2);
            // B was failing in attempt 1, passing in attempt 2 → should have attempts[]
            const sceneB = data.scenarios.find(s => s.name === 'B');
            expect(sceneB.outcome).toBe('SUCCESS');
            expect(sceneB.attempts).toHaveLength(2);
            expect(sceneB.attempts[0].outcome).toBe('FAILURE');
            // Only 1 history entry (all 4 db.json files belong to run-30)
            expect(data.history).toHaveLength(1);
        });
    });

    test.describe('CI-level retry aggregation — passing tests should not be marked as retried', () => {

        test('does not create retry attempts for scenes that passed in both CI attempts', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const directory1 = '/source/module/test-runs/run-50-attempt-1';
            const directory2 = '/source/module/test-runs/run-50-attempt-2';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            // Attempt 1: Test A passes, Test B fails
            filesystem.writeFileSync(`${directory1}/db.json`, runData({
                testRunId: 'run-50', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Always-passing test', category: 'Suite', outcome: { code: 64 }, duration: 100,
                        startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                        tags: [], activities: [{ type: 'Task', name: 'stable step', outcome: { code: 64 }, duration: 100, children: [] }] },
                    { name: 'Flaky test', category: 'Suite', outcome: { code: 4 }, duration: 200,
                        startedAt: '2024-06-15T10:00:01.000Z', source: { path: 'b.spec.ts', line: 1 },
                        tags: [], activities: [{ type: 'Task', name: 'unstable step', outcome: { code: 4 }, duration: 200, children: [] }],
                        error: { name: 'Error', message: 'flaky failure', stack: '' } },
                ],
                tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
            }));

            // Attempt 2: both pass (CI job was retried)
            filesystem.writeFileSync(`${directory2}/db.json`, runData({
                testRunId: 'run-50', attempt: 2,
                startedAt: '2024-06-15T10:01:00.000Z', finishedAt: '2024-06-15T10:01:05.000Z',
                outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Always-passing test', category: 'Suite', outcome: { code: 64 }, duration: 110,
                        startedAt: '2024-06-15T10:01:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                        tags: [], activities: [{ type: 'Task', name: 'stable step', outcome: { code: 64 }, duration: 110, children: [] }] },
                    { name: 'Flaky test', category: 'Suite', outcome: { code: 64 }, duration: 180,
                        startedAt: '2024-06-15T10:01:01.000Z', source: { path: 'b.spec.ts', line: 1 },
                        tags: [], activities: [{ type: 'Task', name: 'unstable step', outcome: { code: 64 }, duration: 180, children: [] }] },
                ],
                tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
            }));

            aggregator.aggregate([`${directory1}/db.json`, `${directory2}/db.json`]);

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(2);

            // Always-passing test: should NOT have retry attempts (it passed both times)
            const stableTest = data.scenarios.find(s => s.name === 'Always-passing test');
            expect(stableTest.outcome).toBe('SUCCESS');
            expect(stableTest.attempts).toBeUndefined();
            expect(stableTest.retries).toBeUndefined();

            // Flaky test: SHOULD have retry attempts (failed then passed)
            const flakyTest = data.scenarios.find(s => s.name === 'Flaky test');
            expect(flakyTest.outcome).toBe('SUCCESS');
            expect(flakyTest.attempts).toHaveLength(2);
            expect(flakyTest.attempts[0].outcome).toBe('FAILURE');
            expect(flakyTest.attempts[0].error.message).toBe('flaky failure');
            expect(flakyTest.attempts[1].outcome).toBe('SUCCESS');
            expect(flakyTest.retries).toBe(1);
        });

        test('does not set retriedAndPassed in execution history for tests that passed in both CI attempts', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({
                // Historical run where the test passes cleanly
                'test-runs': {
                    'run-49': {
                        'db.json': runData({
                            testRunId: 'run-49',
                            startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:05.000Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'Always-passing test', category: 'Suite', outcome: { code: 64 }, duration: 100,
                                    startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                                    tags: [], activities: [] },
                            ],
                            tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
                        }),
                    },
                },
            });

            const directory1 = '/source/module/test-runs/run-50-attempt-1';
            const directory2 = '/source/module/test-runs/run-50-attempt-2';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            // Both attempts pass
            filesystem.writeFileSync(`${directory1}/db.json`, runData({
                testRunId: 'run-50', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Always-passing test', category: 'Suite', outcome: { code: 64 }, duration: 100,
                        startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                        tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
            }));

            filesystem.writeFileSync(`${directory2}/db.json`, runData({
                testRunId: 'run-50', attempt: 2,
                startedAt: '2024-06-15T10:01:00.000Z', finishedAt: '2024-06-15T10:01:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Always-passing test', category: 'Suite', outcome: { code: 64 }, duration: 110,
                        startedAt: '2024-06-15T10:01:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                        tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
            }));

            aggregator.aggregate([`${directory1}/db.json`, `${directory2}/db.json`]);

            const data = readDataJs(filesystem);
            const scenario = data.scenarios[0];

            // Execution history for run-50 should NOT have retriedAndPassed
            const run50 = scenario.executionHistory.find(h => h.run === 'run-50');
            expect(run50.outcome).toBe('SUCCESS');
            expect(run50.retriedAndPassed).toBeUndefined();
            expect(run50.attempts).toBeUndefined();
            expect(run50.retries).toBeUndefined();
        });

        test('preserves retry attempts when the earlier scene had Playwright Test retries (passed via retry)', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const directory1 = '/source/module/test-runs/run-51-attempt-1';
            const directory2 = '/source/module/test-runs/run-51-attempt-2';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            // Attempt 1: test passed via Playwright Test retry (failed first, passed second)
            filesystem.writeFileSync(`${directory1}/db.json`, runData({
                testRunId: 'run-51', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Flaky test', category: 'Suite', outcome: { code: 64 }, duration: 500,
                        startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                        tags: [], activities: [{ type: 'Task', name: 'step pass', outcome: { code: 64 }, duration: 200, children: [] }],
                        retries: 1, attempts: [
                            { attemptNumber: 1, outcome: { code: 4 }, duration: 200, activities: [{ type: 'Task', name: 'step fail', outcome: { code: 4 }, duration: 200, children: [] }], error: { name: 'Error', message: 'PWT retry fail', stack: '' } },
                            { attemptNumber: 2, outcome: { code: 64 }, duration: 200, activities: [{ type: 'Task', name: 'step pass', outcome: { code: 64 }, duration: 200, children: [] }] },
                        ] },
                ],
                tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
            }));

            // Attempt 2: test passes cleanly (CI retry re-ran the job)
            filesystem.writeFileSync(`${directory2}/db.json`, runData({
                testRunId: 'run-51', attempt: 2,
                startedAt: '2024-06-15T10:01:00.000Z', finishedAt: '2024-06-15T10:01:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Flaky test', category: 'Suite', outcome: { code: 64 }, duration: 180,
                        startedAt: '2024-06-15T10:01:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                        tags: [], activities: [{ type: 'Task', name: 'step pass clean', outcome: { code: 64 }, duration: 180, children: [] }] },
                ],
                tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
            }));

            aggregator.aggregate([`${directory1}/db.json`, `${directory2}/db.json`]);

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(1);
            const scene = data.scenarios[0];

            // The earlier scene had retries (PWT retries), so the merge should still happen
            expect(scene.outcome).toBe('SUCCESS');
            expect(scene.attempts).toBeDefined();
            expect(scene.attempts.length).toBeGreaterThanOrEqual(2);
            // The PWT retry failure should be preserved somewhere in the attempts
            expect(scene.attempts[0].outcome).toBe('FAILURE');
        });

        test('uses later duration and activities for superseded passing scene', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const directory1 = '/source/module/test-runs/run-52-attempt-1';
            const directory2 = '/source/module/test-runs/run-52-attempt-2';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            filesystem.writeFileSync(`${directory1}/db.json`, runData({
                testRunId: 'run-52', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test', category: 'Suite', outcome: { code: 64 }, duration: 100,
                        startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                        tags: [], activities: [{ type: 'Task', name: 'step v1', outcome: { code: 64 }, duration: 100, children: [] }] },
                ],
                tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
            }));

            filesystem.writeFileSync(`${directory2}/db.json`, runData({
                testRunId: 'run-52', attempt: 2,
                startedAt: '2024-06-15T10:01:00.000Z', finishedAt: '2024-06-15T10:01:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test', category: 'Suite', outcome: { code: 64 }, duration: 200,
                        startedAt: '2024-06-15T10:01:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                        tags: [], activities: [{ type: 'Task', name: 'step v2', outcome: { code: 64 }, duration: 200, children: [] }] },
                ],
                tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
            }));

            aggregator.aggregate([`${directory1}/db.json`, `${directory2}/db.json`]);

            const data = readDataJs(filesystem);
            const scene = data.scenarios[0];

            // Should use the later attempt's data (no retry merging, just supersede)
            expect(scene.duration).toBe(200);
            expect(scene.activities[0].name).toBe('step v2');
        });
    });

    test.describe('CI-level retry aggregation — self-healing write-back', () => {

        test('writes merged db.json to test-runs/{runId}/db.json in the output directory', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const directory1 = '/source/module/test-runs/run-40-attempt-1';
            const directory2 = '/source/module/test-runs/run-40-attempt-2';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            filesystem.writeFileSync(`${directory1}/db.json`, runData({
                testRunId: 'run-40', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'T', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directory2}/db.json`, runData({
                testRunId: 'run-40', attempt: 2,
                startedAt: '2024-06-15T10:01:00.000Z', finishedAt: '2024-06-15T10:01:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:01:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            aggregator.aggregate([`${directory1}/db.json`, `${directory2}/db.json`]);

            const mergedPath = '/reports/serenity-js/test-runs/run-40/db.json';
            expect(filesystem.existsSync(mergedPath)).toBe(true);
            const merged = JSON.parse(filesystem.readFileSync(mergedPath, 'utf8') as string);
            expect(merged.scenes).toHaveLength(1);
            expect(merged.scenes[0].outcome.code).toBe(64);
            expect(merged.scenes[0].attempts).toHaveLength(2);
        });
    });

    test.describe('nested CI directory structure: test-runs/{buildId}/{jobName}-{attempt}', () => {

        test('finds the merged db.json at test-runs/{buildId}/db.json, not in per-job subdirectories', () => {
            // Simulates the output directory after aggregation wrote merged db.json to
            // test-runs/{buildId}/db.json while per-job artifact dirs live at
            // test-runs/{buildId}/{jobName}-{attempt}/
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '42': {
                        'db.json': runData({
                            testRunId: '42',
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:05.000Z',
                            outcomes: { passed: 3, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'T1', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'T2', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:01.000Z', source: { path: 'b.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'T3', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:02.000Z', source: { path: 'c.ts', line: 1 }, tags: [], activities: [] },
                            ],
                            tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
                        }),
                        // Per-job artifact directories — these must NOT be counted as run directories
                        'playwright-test-1': {
                            'screenshot-foo.png': 'PNG_DATA',
                        },
                        'html-reporter-1': {
                            'screenshot-bar.png': 'PNG_DATA',
                        },
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            // Only 1 history entry — the build-level directory, not the per-job subdirs
            expect(data.history).toHaveLength(1);
            expect(data.summary.totalScenarios).toBe(3);
        });

        test('prunes the oldest top-level build directories, preserving per-job artifact subdirectories of retained builds', () => {
            // 3 build directories; maxHistory=2 must remove build "40" but keep "41" and "42"
            // including their per-job artifact subdirectories
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '40': {
                        'db.json': runData({
                            testRunId: '40',
                            startedAt: '2024-06-13T10:00:00.000Z', finishedAt: '2024-06-13T10:00:05.000Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-13T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'M', version: '1.0.0' },
                        }),
                        'playwright-test-1': { 'screenshot.png': 'OLD' },
                    },
                    '41': {
                        'db.json': runData({
                            testRunId: '41',
                            startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:05.000Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'M', version: '1.0.0' },
                        }),
                        'playwright-test-1': { 'screenshot.png': 'MID' },
                    },
                    '42': {
                        'db.json': runData({
                            testRunId: '42',
                            startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'M', version: '1.0.0' },
                        }),
                        'playwright-test-1': { 'screenshot.png': 'NEW' },
                    },
                },
            }, { maxHistory: 2 });

            aggregator.aggregate();

            // Oldest build directory and all its contents removed
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/40')).toBe(false);

            // Retained build directories still have their per-job artifact subdirs
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/41')).toBe(true);
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/41/playwright-test-1/screenshot.png')).toBe(true);
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/42')).toBe(true);
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/42/playwright-test-1/screenshot.png')).toBe(true);

            const data = readDataJs(filesystem);
            expect(data.history).toHaveLength(2);
        });

        test('copies artifacts into test-runs/{buildId}/{jobName}-{attempt}/ without copying db.json', () => {
            // Source uses the new nested naming: test-runs/{buildId}/{jobName}-{attempt}
            const { aggregator, filesystem } = createMultiSourceAggregator({ 'test-runs': {} });

            const sourceDirectory = '/source/integration/test-runs/42/playwright-test-1';
            filesystem.mkdirSync(sourceDirectory, { recursive: true });
            filesystem.writeFileSync(`${sourceDirectory}/db.json`, runData({
                testRunId: '42', attempt: 1,
                startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
            }));
            filesystem.writeFileSync(`${sourceDirectory}/screenshot-foo.png`, 'PNG_DATA');

            aggregator.aggregate([`${sourceDirectory}/db.json`]);

            // Screenshot must be copied to the corresponding nested output path
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/42/playwright-test-1/screenshot-foo.png')).toBe(true);

            // db.json must NOT be copied into the per-job artifact dir
            // (the merged db.json lives at test-runs/42/db.json, not test-runs/42/playwright-test-1/db.json)
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/42/playwright-test-1/db.json')).toBe(false);

            // The merged db.json must exist at the top-level build path
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/42/db.json')).toBe(true);
        });

        test('pruning in external mode does not treat per-job artifact subdirectories as run directories', () => {
            // After aggregation, the output has:
            //   test-runs/40/db.json          ← build directory (run dir)
            //   test-runs/40/mocha-1/          ← artifact subdir (not a run dir)
            //   test-runs/41/db.json           ← build directory (run dir)
            //   test-runs/41/playwright-test-1/ ← artifact subdir (not a run dir)
            // With maxHistory=1, only run 41 should survive; run 40 entirely deleted.
            const { aggregator, filesystem } = createMultiSourceAggregator({
                'test-runs': {
                    '40': {
                        'db.json': runData({
                            testRunId: '40',
                            startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:05.000Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'M', version: '1.0.0' },
                        }),
                        'mocha-1': { 'screenshot.png': 'OLD_SCREENSHOT' },
                    },
                    '41': {
                        'db.json': runData({
                            testRunId: '41',
                            startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'M', version: '1.0.0' },
                        }),
                        'playwright-test-1': { 'screenshot.png': 'NEW_SCREENSHOT' },
                    },
                },
            }, { maxHistory: 1 });

            // External input: new data for run 41 (already in output) + run 41 has screenshots
            const sourceDirectory = '/source/integration/test-runs/41/playwright-test-1';
            filesystem.mkdirSync(sourceDirectory, { recursive: true });
            filesystem.writeFileSync(`${sourceDirectory}/db.json`, runData({
                testRunId: '41', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                tags: [], testRunner: { name: 'M', version: '1.0.0' },
            }));

            aggregator.aggregate([`${sourceDirectory}/db.json`]);

            // Run 40 must be gone entirely (including its artifact subdir)
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/40')).toBe(false);

            // Run 41 must survive with its screenshot
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/41')).toBe(true);
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/41/playwright-test-1/screenshot.png')).toBe(true);

            const data = readDataJs(filesystem);
            expect(data.history).toHaveLength(1);
        });
    });

    test.describe('validation and error handling', () => {

        test('skips a corrupt db.json in loadRuns and processes remaining valid files', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': {
                        'db.json': 'this is not valid JSON at all',
                    },
                    '2024-06-15T10:00:00.000Z': {
                        'db.json': runData({
                            startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.500Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(1);
            expect(data.scenarios[0].name).toBe('Test A');
        });

        test('skips a db.json with future schema version and processes remaining valid files', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 999,
                            startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.500Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Future Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                    '2024-06-15T10:00:00.000Z': {
                        'db.json': runData({
                            startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.500Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Valid Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(1);
            expect(data.scenarios[0].name).toBe('Valid Test');
        });

        test('skips a db.json with invalid structure and processes remaining valid files', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': {
                        'db.json': runData({ startedAt: '2024-06-14T10:00:00.000Z' }),
                    },
                    '2024-06-15T10:00:00.000Z': {
                        'db.json': runData({
                            startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.500Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Valid Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(1);
            expect(data.scenarios[0].name).toBe('Valid Test');
        });

        test('produces no output when all db.json files are invalid', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': {
                        'db.json': 'not JSON',
                    },
                    '2024-06-15T10:00:00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 999, startedAt: '2024-06-15T10:00:00.000Z' }),
                    },
                },
            });

            aggregator.aggregate();

            expect(filesystem.existsSync('/reports/serenity-js/data.js')).toBe(false);
        });

        test('skips corrupt files in external runs mode (loadExternalRuns)', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const directory1 = '/source/test-runs/run-a';
            const directory2 = '/source/test-runs/run-b';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            filesystem.writeFileSync(`${directory1}/db.json`, 'totally broken JSON');
            filesystem.writeFileSync(`${directory2}/db.json`, runData({
                testRunId: 'run-b',
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.500Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'Good Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            aggregator.aggregate([`${directory1}/db.json`, `${directory2}/db.json`]);

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(1);
            expect(data.scenarios[0].name).toBe('Good Test');
        });

        test('produces no output when all external run files are invalid', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const directory1 = '/source/test-runs/run-a';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.writeFileSync(`${directory1}/db.json`, 'not JSON');

            aggregator.aggregate([`${directory1}/db.json`]);

            expect(filesystem.existsSync('/reports/serenity-js/data.js')).toBe(false);
        });
    });

    test.describe('parallel worker file aggregation (WebdriverIO)', () => {

        test('merges multiple db-{workerId}.json files from the same module directory', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            // Set up worker files in a source directory
            const moduleDirectory = '/source/test-runs/42/webdriverio-1';
            filesystem.mkdirSync(moduleDirectory, { recursive: true });

            filesystem.writeFileSync(moduleDirectory + '/db-0-0.json', runData({
                testRunId: '42',
                moduleId: 'webdriverio',
                startedAt: '2024-06-15T14:30:00.000Z',
                finishedAt: '2024-06-15T14:30:01.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                ],
                tags: [],
                testRunner: { name: 'WebdriverIO', version: '8.0.0' },
            }));

            filesystem.writeFileSync(moduleDirectory + '/db-0-1.json', runData({
                testRunId: '42',
                moduleId: 'webdriverio',
                startedAt: '2024-06-15T14:30:00.000Z',
                finishedAt: '2024-06-15T14:30:02.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:01.000Z', source: { path: 'b.spec.ts', line: 1 }, tags: [], activities: [] },
                ],
                tags: [],
                testRunner: { name: 'WebdriverIO', version: '8.0.0' },
            }));

            aggregator.aggregate([
                moduleDirectory + '/db-0-0.json',
                moduleDirectory + '/db-0-1.json',
            ]);

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(2);
            expect(data.scenarios.map(s => s.name).sort()).toEqual(['Test A', 'Test B']);
        });

        test('aggregates outcomes from all worker files', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const moduleDirectory = '/source/test-runs/42/webdriverio-1';
            filesystem.mkdirSync(moduleDirectory, { recursive: true });

            filesystem.writeFileSync(moduleDirectory + '/db-0-0.json', runData({
                testRunId: '42',
                startedAt: '2024-06-15T14:30:00.000Z',
                finishedAt: '2024-06-15T14:30:01.000Z',
                outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                    { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.100Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [] },
                ],
                tags: [],
                testRunner: { name: 'WebdriverIO', version: '8.0.0' },
            }));

            filesystem.writeFileSync(moduleDirectory + '/db-0-1.json', runData({
                testRunId: '42',
                startedAt: '2024-06-15T14:30:00.000Z',
                finishedAt: '2024-06-15T14:30:02.000Z',
                outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test C', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:01.000Z', source: { path: 'b.spec.ts', line: 1 }, tags: [], activities: [] },
                    { name: 'Test D', category: 'Suite', outcome: { code: 4 }, duration: 200, startedAt: '2024-06-15T14:30:01.200Z', source: { path: 'b.spec.ts', line: 5 }, tags: [], activities: [] },
                ],
                tags: [],
                testRunner: { name: 'WebdriverIO', version: '8.0.0' },
            }));

            aggregator.aggregate([
                moduleDirectory + '/db-0-0.json',
                moduleDirectory + '/db-0-1.json',
            ]);

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(4);
            expect(data.summary.outcomes.passed).toBe(3);
            expect(data.summary.outcomes.failed).toBe(1);
        });

        test('handles mixed db.json and db-{workerId}.json files in the same run', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            // Single-process module uses db.json
            const mochaDirectory = '/source/test-runs/42/mocha-1';
            filesystem.mkdirSync(mochaDirectory, { recursive: true });
            filesystem.writeFileSync(mochaDirectory + '/db.json', runData({
                testRunId: '42',
                moduleId: 'mocha',
                startedAt: '2024-06-15T14:30:00.000Z',
                finishedAt: '2024-06-15T14:30:01.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Mocha Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'mocha.spec.ts', line: 1 }, tags: [], activities: [] },
                ],
                tags: [],
                testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            // Parallel module uses worker files
            const wdioDirectory = '/source/test-runs/42/webdriverio-1';
            filesystem.mkdirSync(wdioDirectory, { recursive: true });
            filesystem.writeFileSync(wdioDirectory + '/db-0-0.json', runData({
                testRunId: '42',
                moduleId: 'webdriverio',
                startedAt: '2024-06-15T14:30:00.000Z',
                finishedAt: '2024-06-15T14:30:02.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'WDIO Test A', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:01.000Z', source: { path: 'wdio-a.spec.ts', line: 1 }, tags: [], activities: [] },
                ],
                tags: [],
                testRunner: { name: 'WebdriverIO', version: '8.0.0' },
            }));
            filesystem.writeFileSync(wdioDirectory + '/db-0-1.json', runData({
                testRunId: '42',
                moduleId: 'webdriverio',
                startedAt: '2024-06-15T14:30:00.000Z',
                finishedAt: '2024-06-15T14:30:03.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'WDIO Test B', category: 'Suite', outcome: { code: 64 }, duration: 300, startedAt: '2024-06-15T14:30:02.000Z', source: { path: 'wdio-b.spec.ts', line: 1 }, tags: [], activities: [] },
                ],
                tags: [],
                testRunner: { name: 'WebdriverIO', version: '8.0.0' },
            }));

            aggregator.aggregate([
                mochaDirectory + '/db.json',
                wdioDirectory + '/db-0-0.json',
                wdioDirectory + '/db-0-1.json',
            ]);

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(3);
            expect(data.scenarios.map(s => s.name).sort()).toEqual(['Mocha Test', 'WDIO Test A', 'WDIO Test B']);
        });

        test('copies artifacts but skips all db*.json files when aggregating worker files', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const moduleDirectory = '/source/test-runs/42/webdriverio-1';
            filesystem.mkdirSync(moduleDirectory, { recursive: true });

            filesystem.writeFileSync(moduleDirectory + '/db-0-0.json', runData({
                testRunId: '42',
                startedAt: '2024-06-15T14:30:00.000Z',
                finishedAt: '2024-06-15T14:30:01.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [],
                testRunner: { name: 'WebdriverIO', version: '8.0.0' },
            }));

            filesystem.writeFileSync(moduleDirectory + '/db-0-1.json', runData({
                testRunId: '42',
                startedAt: '2024-06-15T14:30:00.000Z',
                finishedAt: '2024-06-15T14:30:02.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:01.000Z', source: { path: 'b.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [],
                testRunner: { name: 'WebdriverIO', version: '8.0.0' },
            }));

            filesystem.writeFileSync(moduleDirectory + '/screenshot-1.png', 'PNG_DATA_1');
            filesystem.writeFileSync(moduleDirectory + '/screenshot-2.png', 'PNG_DATA_2');

            aggregator.aggregate([
                moduleDirectory + '/db-0-0.json',
                moduleDirectory + '/db-0-1.json',
            ]);

            // Artifacts should be copied
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/42/webdriverio-1/screenshot-1.png')).toBe(true);
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/42/webdriverio-1/screenshot-2.png')).toBe(true);

            // Worker db files should NOT be copied (merged db.json is written at build level)
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/42/webdriverio-1/db-0-0.json')).toBe(false);
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/42/webdriverio-1/db-0-1.json')).toBe(false);
        });

        test('uses the latest finishedAt timestamp when merging worker files', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const moduleDirectory = '/source/test-runs/42/webdriverio-1';
            filesystem.mkdirSync(moduleDirectory, { recursive: true });

            filesystem.writeFileSync(moduleDirectory + '/db-0-0.json', runData({
                testRunId: '42',
                startedAt: '2024-06-15T14:30:00.000Z',
                finishedAt: '2024-06-15T14:30:01.000Z',  // Worker 0 finishes first
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [],
                testRunner: { name: 'WebdriverIO', version: '8.0.0' },
            }));

            filesystem.writeFileSync(moduleDirectory + '/db-0-1.json', runData({
                testRunId: '42',
                startedAt: '2024-06-15T14:30:00.000Z',
                finishedAt: '2024-06-15T14:35:00.000Z',  // Worker 1 finishes last
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:01.000Z', source: { path: 'b.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [],
                testRunner: { name: 'WebdriverIO', version: '8.0.0' },
            }));

            aggregator.aggregate([
                moduleDirectory + '/db-0-0.json',
                moduleDirectory + '/db-0-1.json',
            ]);

            const data = readDataJs(filesystem);
            // The merged run should use the latest finishedAt from all workers
            expect(data.summary.finishedAt).toBe('2024-06-15T14:35:00.000Z');
        });

        test('aggregates worker files with the same moduleId into a single module entry in history', () => {
            const { aggregator, filesystem } = createMultiSourceAggregator({});

            const moduleDirectory = '/source/test-runs/42/webdriverio-1';
            filesystem.mkdirSync(moduleDirectory, { recursive: true });

            // Two worker files with the SAME moduleId (simulating WebdriverIO parallel workers)
            filesystem.writeFileSync(moduleDirectory + '/db-0-0.json', runData({
                testRunId: '42',
                moduleId: 'webdriverio-web',
                startedAt: '2024-06-15T14:30:00.000Z',
                finishedAt: '2024-06-15T14:30:01.000Z',
                outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                    { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.100Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [] },
                ],
                tags: [],
                testRunner: { name: 'WebdriverIO', version: '9.0.0' },
            }));

            filesystem.writeFileSync(moduleDirectory + '/db-0-1.json', runData({
                testRunId: '42',
                moduleId: 'webdriverio-web',
                startedAt: '2024-06-15T14:30:00.000Z',
                finishedAt: '2024-06-15T14:30:02.000Z',
                outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test C', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:01.000Z', source: { path: 'b.spec.ts', line: 1 }, tags: [], activities: [] },
                    { name: 'Test D', category: 'Suite', outcome: { code: 4 }, duration: 200, startedAt: '2024-06-15T14:30:01.200Z', source: { path: 'b.spec.ts', line: 5 }, tags: [], activities: [] },
                ],
                tags: [],
                testRunner: { name: 'WebdriverIO', version: '9.0.0' },
            }));

            aggregator.aggregate([
                moduleDirectory + '/db-0-0.json',
                moduleDirectory + '/db-0-1.json',
            ]);

            const data = readDataJs(filesystem);

            // Key assertion: should have ONE module entry, not two
            expect(data.history[0].modules).toHaveLength(1);
            expect(data.history[0].modules[0].moduleId).toBe('webdriverio-web');

            // Outcomes should be aggregated from both workers
            expect(data.history[0].modules[0].outcomes.passed).toBe(3);
            expect(data.history[0].modules[0].outcomes.failed).toBe(1);

            // Module outcome should reflect the aggregated result (failed because there's 1 failure)
            expect(data.history[0].modules[0].outcome).toBe('failed');

            // Timestamps: earliest startedAt, latest finishedAt
            expect(data.history[0].modules[0].startedAt).toBe('2024-06-15T14:30:00.000Z');
            expect(data.history[0].modules[0].finishedAt).toBe('2024-06-15T14:30:02.000Z');
        });
    });
});
