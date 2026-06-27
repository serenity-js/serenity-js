import type * as fs from 'node:fs';
import { mkdirSync, writeFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';
import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import { createFsFromVolume, Volume } from 'memfs';

import { DataSnapshotAggregator } from '../src/DataSnapshotAggregator.js';

test.describe('DataSnapshotAggregator', () => {

    const outputDirectory = Path.from('/reports/serenity-js');

    function createAggregator(tree: Record<string, any>, config: { maxHistory?: number; stabilityWindow?: number; title?: string } = {}, requirementsHierarchy?: RequirementsHierarchy, projectFileSystem?: FileSystem): { aggregator: DataSnapshotAggregator; filesystem: typeof fs } {
        const filesystem = createFsFromVolume(Volume.fromNestedJSON({
            [outputDirectory.value]: tree,
        }, '/')) as unknown as typeof fs;

        const fileSystem = new FileSystem(outputDirectory, filesystem);
        const aggregator = new DataSnapshotAggregator(fileSystem, {
            stabilityWindow: config.stabilityWindow ?? 5,
            maxHistory: config.maxHistory,
            title: config.title,
        }, requirementsHierarchy, projectFileSystem);

        return { aggregator, filesystem };
    }

    function readDataJs(filesystem: typeof fs): any {
        const content = filesystem.readFileSync('/reports/serenity-js/data.js', 'utf8') as string;
        // Strip the "window.__SERENITY_REPORT_DATA__ = " prefix and trailing ";"
        const json = content.replace(/^window\.__SERENITY_REPORT_DATA__\s*=\s*/, '').replace(/;\s*$/, '');
        return JSON.parse(json);
    }

    test.describe('aggregation', () => {

        test('produces data.js from a single test run', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-15T14:30:00.000Z',
                            finishedAt: '2024-06-15T14:30:01.000Z',
                            outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:00.100Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [] },
                                { name: 'Test C', category: 'Suite', outcome: { code: 64 }, duration: 300, startedAt: '2024-06-15T14:30:00.300Z', source: { path: 'b.spec.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'Test D', category: 'Suite', outcome: { code: 4 }, duration: 400, startedAt: '2024-06-15T14:30:00.600Z', source: { path: 'b.spec.ts', line: 5 }, tags: [], activities: [] },
                            ],
                            tags: [],
                            testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            });

            aggregator.aggregate();

            expect(filesystem.existsSync('/reports/serenity-js/data.js')).toBe(true);
            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(4);
            expect(data.summary.totalScenarios).toBe(4);
            expect(data.summary.outcomes.passed).toBe(3);
            expect(data.summary.outcomes.failed).toBe(1);
            expect(data.summary.startedAt).toBe('2024-06-15T14:30:00.000Z');
            expect(data.summary.finishedAt).toBe('2024-06-15T14:30:01.000Z');
        });

        test('assigns data to window.__SERENITY_REPORT_DATA__', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.100Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const content = filesystem.readFileSync('/reports/serenity-js/data.js', 'utf8') as string;
            expect(content).toMatch(/^window\.__SERENITY_REPORT_DATA__\s*=/);
            expect(content).toMatch(/;\s*$/);
        });

        test('builds history array ordered chronologically from multiple runs', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.500Z',
                            outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 400, startedAt: '2024-06-14T10:00:00.100Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [] },
                            ],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:01.000Z',
                            outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'Test B', category: 'Suite', outcome: { code: 4 }, duration: 900, startedAt: '2024-06-15T14:30:00.100Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [] },
                            ],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.history).toHaveLength(2);
            expect(data.history[0].timestamp).toBe('2024-06-14T10:00:00.000Z');
            expect(data.history[1].timestamp).toBe('2024-06-15T14:30:00.000Z');
        });

        test('uses scenes from the latest run in the snapshot', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.500Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Old Test', category: 'Suite', outcome: { code: 64 }, duration: 500, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'old.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.200Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'New Test', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'new.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'Playwright', version: '1.45.0' },
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.scenarios).toHaveLength(1);
            expect(data.scenarios[0].name).toBe('New Test');
            expect(data.summary.testRunner).toBe('Playwright');
        });

        test('applies custom title from configuration', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.100Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            }, { title: 'My Project Report' });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.summary.title).toBe('My Project Report');
        });

        test('includes system context from the latest run in the data snapshot', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.100Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                            systemContext: {
                                nodeVersion: 'v22.0.0',
                                os: { name: 'darwin', version: '24.0.0', arch: 'arm64' },
                                serenityVersion: '3.44.0',
                                runtime: { provider: 'GitHub Actions', buildNumber: '42', branch: 'main', commit: 'abc123de', jobUrl: 'https://github.com/org/repo/actions/runs/1' },
                            },
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.systemContext).toEqual({
                nodeVersion: 'v22.0.0',
                os: { name: 'darwin', version: '24.0.0', arch: 'arm64' },
                serenityVersion: '3.44.0',
                testRunner: { name: 'Mocha', version: '11.0.0' },
                browsers: [],
                ci: { provider: 'GitHub Actions', buildNumber: '42', branch: 'main', commit: 'abc123de', jobUrl: 'https://github.com/org/repo/actions/runs/1' },
            });
        });
    });

    test.describe('requirements hierarchy', () => {

        test('builds a requirements tree from scenario source paths when specDirectory is configured', () => {
            const projectFs = createFsFromVolume(Volume.fromNestedJSON({
                '/project': { spec: { 'readme.md': '**bold** text', login: { 'basic.spec.ts': '' }, 'checkout.spec.ts': '' } }
            }, '/')) as unknown as typeof fs;
            const projectFileSystem = new FileSystem(Path.from('/project'), projectFs);
            const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('spec'));

            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.500Z',
                            outcomes: { passed: 2, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/login/basic.spec.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:00.100Z', source: { path: '/project/spec/login/basic.spec.ts', line: 5 }, tags: [], activities: [] },
                                { name: 'Test C', category: 'Suite', outcome: { code: 4 }, duration: 200, startedAt: '2024-06-15T14:30:00.300Z', source: { path: '/project/spec/checkout.spec.ts', line: 1 }, tags: [], activities: [] },
                            ],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            }, {}, hierarchy, projectFileSystem);

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.requirements).toBeDefined();
            expect(data.requirements.scenarioCount).toBe(3);
            expect(data.requirements.outcomes.passed).toBe(2);
            expect(data.requirements.outcomes.failed).toBe(1);
            expect(data.requirements.children).toHaveLength(2);

            const names = data.requirements.children.map((c: any) => c.name).sort();
            expect(names).toEqual(['checkout', 'login']);
            expect(data.requirements.readme).toContain('<strong>bold</strong>');
        });

        test('does not produce requirements when specDirectory is not configured', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.100Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.requirements).toBeUndefined();
        });
    });

    test.describe('maxHistory pruning', () => {

        test('retains only the most recent N test run directories when maxHistory is configured', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-13T10:00:00.000Z': { 'db.json': JSON.stringify({ startedAt: '2024-06-13T10:00:00.000Z', finishedAt: '2024-06-13T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-13T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }), 'screenshot.png': 'old-data' },
                    '2024-06-14T10:00:00.000Z': { 'db.json': JSON.stringify({ startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    '2024-06-15T10:00:00.000Z': { 'db.json': JSON.stringify({ startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
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
    });

    test.describe('unstable test identification', () => {

        test('identifies tests with mixed outcomes within the stability window as unstable', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-13T10:00:00.000Z': { 'db.json': JSON.stringify({ startedAt: '2024-06-13T10:00:00.000Z', finishedAt: '2024-06-13T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Unstable Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-13T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    '2024-06-14T10:00:00.000Z': { 'db.json': JSON.stringify({ startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Unstable Test', category: 'Suite', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    '2024-06-15T10:00:00.000Z': { 'db.json': JSON.stringify({ startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Unstable Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                },
            }, { stabilityWindow: 5 });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.unstableTests).toHaveLength(1);
            expect(data.unstableTests[0].name).toBe('Unstable Test');
        });

        test('does not flag a test as unstable if all outcomes within the stability window are the same', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-13T10:00:00.000Z': { 'db.json': JSON.stringify({ startedAt: '2024-06-13T10:00:00.000Z', finishedAt: '2024-06-13T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Stable Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-13T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    '2024-06-14T10:00:00.000Z': { 'db.json': JSON.stringify({ startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Stable Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                },
            }, { stabilityWindow: 5 });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.unstableTests).toHaveLength(0);
        });

        test('considers only the last N runs when determining stability', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    // Old failure (outside window of 2)
                    '2024-06-12T10:00:00.000Z': { 'db.json': JSON.stringify({ startedAt: '2024-06-12T10:00:00.000Z', finishedAt: '2024-06-12T10:00:00.100Z', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Test', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-12T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    // Recent passes (inside window of 2)
                    '2024-06-14T10:00:00.000Z': { 'db.json': JSON.stringify({ startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Test', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    '2024-06-15T10:00:00.000Z': { 'db.json': JSON.stringify({ startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Test', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                },
            }, { stabilityWindow: 2 });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            // Old failure is outside the window of 2, so test is stable
            expect(data.unstableTests).toHaveLength(0);
        });
    });

    test.describe('tag statistics', () => {

        test('computes scenarioCount and passed for each tag', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.500Z',
                            outcomes: { passed: 2, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'A', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [{ type: 'browser', name: 'chrome' }], activities: [] },
                                { name: 'B', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.100Z', source: { path: 'a.ts', line: 5 }, tags: [{ type: 'browser', name: 'chrome' }], activities: [] },
                                { name: 'C', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T14:30:00.200Z', source: { path: 'b.ts', line: 1 }, tags: [{ type: 'browser', name: 'chrome' }, { type: 'tag', name: 'slow' }], activities: [] },
                            ],
                            tags: [], testRunner: { name: 'M', version: '1.0.0' },
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            const chromeTag = data.tags.find((t: any) => t.name === 'chrome');
            expect(chromeTag.scenarioCount).toBe(3);
            expect(chromeTag.passed).toBe(2);
            const slowTag = data.tags.find((t: any) => t.name === 'slow');
            expect(slowTag.scenarioCount).toBe(1);
            expect(slowTag.passed).toBe(0);
        });
    });

    test.describe('execution history', () => {

        test('correlates scenarios across runs by source path and line', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'M', version: '1.0.0' },
                        }),
                    },
                    '2024-06-15T10:00:00.000Z': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.100Z',
                            outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'T', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'M', version: '1.0.0' },
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.scenarios[0].executionHistory).toHaveLength(2);
            expect(data.scenarios[0].executionHistory[0].outcome).toBe('SUCCESS');
            expect(data.scenarios[0].executionHistory[1].outcome).toBe('FAILURE');
        });
    });

    test.describe('history duration stats', () => {

        test('includes slowest and fastest test durations per run', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.500Z',
                            outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'Fast', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'Slow', category: 'S', outcome: { code: 64 }, duration: 400, startedAt: '2024-06-15T14:30:00.100Z', source: { path: 'a.ts', line: 5 }, tags: [], activities: [] },
                            ],
                            tags: [], testRunner: { name: 'M', version: '1.0.0' },
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.history[0].slowest).toBe(400);
            expect(data.history[0].fastest).toBe(100);
        });
    });

    test.describe('activity location and outcome mapping', () => {

        test('preserves activity location and maps outcome codes to display strings', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.100Z',
                            outcomes: { passed: 0, failed: 0, pending: 1, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{
                                name: 'A pending scenario', category: 'Suite', outcome: { code: 8 }, duration: 12,
                                startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'features/pending.feature', line: 7 }, tags: [],
                                activities: [
                                    { type: 'Task', name: 'Given a step that passes', outcome: { code: 64 }, duration: 0, startedAt: '2024-06-15T14:30:00.000Z', children: [], location: { path: 'features/pending.feature', line: 14 } },
                                    { type: 'Task', name: 'And a pending step', outcome: { code: 8 }, duration: 1, startedAt: '2024-06-15T14:30:00.001Z', children: [], location: { path: 'features/pending.feature', line: 15 } },
                                    { type: 'Task', name: 'And a skipped step', outcome: { code: 32 }, duration: 0, startedAt: '2024-06-15T14:30:00.002Z', children: [], location: { path: 'features/pending.feature', line: 16 } },
                                ],
                            }],
                            tags: [], testRunner: { name: 'Cucumber', version: '12.0.0' },
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            const activities = data.scenarios[0].activities;

            expect(activities).toHaveLength(3);
            expect(activities[0].outcome).toBe('SUCCESS');
            expect(activities[0].location).toEqual({ path: 'features/pending.feature', line: 14 });
            expect(activities[1].outcome).toBe('PENDING');
            expect(activities[1].location).toEqual({ path: 'features/pending.feature', line: 15 });
            expect(activities[2].outcome).toBe('SKIPPED');
            expect(activities[2].location).toEqual({ path: 'features/pending.feature', line: 16 });
        });
    });

    test.describe('external run aggregation', () => {

        test('merges db.json files with the same testRunId directory name', () => {
            const { aggregator, filesystem } = createAggregator({});

            // Write two db.json files simulating different modules with same testRunId
            const testRunDirectory1 = '/tmp/serenity-test-merge/module-a/test-runs/42';
            const testRunDirectory2 = '/tmp/serenity-test-merge/module-b/test-runs/42';
            mkdirSync(testRunDirectory1, { recursive: true });
            mkdirSync(testRunDirectory2, { recursive: true });

            writeFileSync(testRunDirectory1 + '/db.json', JSON.stringify({
                startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.500Z',
                outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test A', category: 'Mocha', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [{ type: 'tag', name: 'mocha' }], activities: [] },
                    { name: 'Test B', category: 'Mocha', outcome: { code: 64 }, duration: 300, startedAt: '2024-06-15T14:30:00.200Z', source: { path: 'a.spec.ts', line: 5 }, tags: [{ type: 'tag', name: 'mocha' }], activities: [] },
                ],
                tags: [{ type: 'tag', name: 'mocha' }], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            writeFileSync(testRunDirectory2 + '/db.json', JSON.stringify({
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
    });

    test.describe('markdown rendering', () => {

        test('parses scenario narrative as markdown', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    'run1': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:01.000Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{
                                name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100,
                                startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                                tags: [], activities: [],
                                narrative: 'As a **user**\nI want to test',
                            }],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            });

            aggregator.aggregate();
            const data = readDataJs(filesystem);

            expect(data.scenarios[0].narrative).toContain('<strong>user</strong>');
        });

        test('parses scenario description as markdown with links', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    'run1': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:01.000Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{
                                name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100,
                                startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                                tags: [], activities: [],
                                description: 'See [docs](https://example.com) for details',
                            }],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            });

            aggregator.aggregate();
            const data = readDataJs(filesystem);

            expect(data.scenarios[0].description).toContain('<a href="https://example.com">docs</a>');
        });

        test('parses scenario outline parameter set description as markdown', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    'run1': {
                        'db.json': JSON.stringify({
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:01.000Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{
                                name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100,
                                startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                                tags: [], activities: [],
                                scenarioOutline: {
                                    template: 'Given <x>',
                                    parameters: [{
                                        name: 'Examples', description: 'Uses a [data table](https://example.com)',
                                        values: { x: '1' }, outcome: { code: 64 }, duration: 50, activities: [],
                                    }],
                                },
                            }],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            });

            aggregator.aggregate();
            const data = readDataJs(filesystem);

            expect(data.scenarios[0].scenarioOutline.parameters[0].description).toContain('<a href="https://example.com">data table</a>');
        });

        test('includes feature narrative on requirement file nodes', () => {
            const vol = Volume.fromNestedJSON({
                '/project/spec': {
                    'example': {
                        'test.feature': 'Feature: Test',
                    },
                },
                [outputDirectory.value]: {
                    'test-runs': {
                        'run1': {
                            'db.json': JSON.stringify({
                                startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:01.000Z',
                                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                                scenes: [{
                                    name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100,
                                    startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/example/test.feature', line: 1 },
                                    tags: [], activities: [],
                                    narrative: 'As a user\nI want something',
                                }],
                                tags: [], testRunner: { name: 'Cucumber', version: '12.0.0' },
                            }),
                        },
                    },
                },
            }, '/');
            const filesystem = createFsFromVolume(vol) as unknown as typeof fs;
            const fileSystem = new FileSystem(outputDirectory, filesystem);
            const projectFs = new FileSystem(Path.from('/project'), filesystem);
            const hierarchy = new RequirementsHierarchy(projectFs, Path.from('/project/spec'));
            const aggregator = new DataSnapshotAggregator(fileSystem, { stabilityWindow: 5 }, hierarchy);

            aggregator.aggregate();
            const data = readDataJs(filesystem);

            expect(data.requirements.children[0].children[0].narrative).toBe('As a user\nI want something');
        });
    });
});
