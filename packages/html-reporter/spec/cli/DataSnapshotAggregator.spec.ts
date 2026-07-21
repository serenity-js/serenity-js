import type * as fs from 'node:fs';

import { expect, test } from '@playwright/test';
import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import { createFsFromVolume, Volume } from 'memfs';

import { DataSnapshotAggregator } from '../../src/cli/DataSnapshotAggregator.js';
import type { ReportData } from '../../src/cli/ReportData.js';

test.describe('DataSnapshotAggregator', () => {

    const outputDirectory = Path.from('/reports/serenity-js');

    function createMemFs(tree: Record<string, unknown>, root = '/'): typeof fs {
         
        return createFsFromVolume(Volume.fromNestedJSON(tree as any, root)) as unknown as typeof fs;
    }

    function createAggregator(tree: Record<string, unknown>, config: { maxHistory?: number; consistencyWindow?: number; title?: string } = {}, requirementsHierarchy?: RequirementsHierarchy, projectFileSystem?: FileSystem): { aggregator: DataSnapshotAggregator; filesystem: typeof fs } {
        const filesystem = createMemFs({ [outputDirectory.value]: tree });

        const fileSystem = new FileSystem(outputDirectory, filesystem);
        const sourceFileSystem = new FileSystem(Path.from('/'), filesystem);
        const defaultProjectFs = projectFileSystem || new FileSystem(Path.from('/'), filesystem);
        const hierarchy = requirementsHierarchy || new RequirementsHierarchy(defaultProjectFs);
        const aggregator = new DataSnapshotAggregator(fileSystem, {
            consistencyWindow: config.consistencyWindow ?? 5,
            maxHistory: config.maxHistory,
            title: config.title,
            buildCapabilities: !!requirementsHierarchy,
        }, hierarchy, defaultProjectFs, sourceFileSystem);

        return { aggregator, filesystem };
    }

    function readDataJs(filesystem: typeof fs): ReportData {
        const content = filesystem.readFileSync('/reports/serenity-js/data.js', 'utf8') as string;
        // Strip the "window.__SERENITY_REPORT_DATA__ = " prefix and trailing ";"
        const json = content.replace(/^window\.__SERENITY_REPORT_DATA__\s*=\s*/, '').replace(/;\s*$/, '');
        return JSON.parse(json) as ReportData;
    }

    test.describe('aggregation', () => {

        test('produces data.js from a single test run', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
                        'db.json': JSON.stringify({ schemaVersion: 1,
                            startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.500Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Old Test', category: 'Suite', outcome: { code: 64 }, duration: 500, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'old.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
                        'db.json': JSON.stringify({ schemaVersion: 1,
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

    test.describe('capabilities hierarchy', () => {

        test('builds a capabilities tree from scenario source paths when specDirectory is configured', () => {
            const projectFs = createFsFromVolume(Volume.fromNestedJSON({
                '/project': { spec: { 'readme.md': '**bold** text', login: { 'basic.spec.ts': '' }, 'checkout.spec.ts': '' } }
            }, '/')) as unknown as typeof fs;
            const projectFileSystem = new FileSystem(Path.from('/project'), projectFs);
            const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('spec'));

            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
            expect(data.capabilities).toBeDefined();
            expect(data.capabilities.scenarioCount).toBe(3);
            expect(data.capabilities.outcomes.passed).toBe(2);
            expect(data.capabilities.outcomes.failed).toBe(1);
            expect(data.capabilities.children).toHaveLength(2);

            const names = data.capabilities.children.map(c => c.name).sort();
            expect(names).toEqual(['checkout', 'login']);
            expect(data.capabilities.readme).toContain('<strong>bold</strong>');
        });

        test('does not produce capabilities when specDirectory is not configured', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
            expect(data.capabilities).toBeUndefined();
        });
    });

    test.describe('capability confidence scores', () => {

        test('computes score for file nodes with passRate, completeness, and consistency', () => {
            const projectFs = createFsFromVolume(Volume.fromNestedJSON({
                '/project': { spec: { 'login.spec.ts': '' } }
            }, '/')) as unknown as typeof fs;
            const projectFileSystem = new FileSystem(Path.from('/project'), projectFs);
            const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('spec'));

            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.500Z',
                            outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/login.spec.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/login.spec.ts', line: 5 }, tags: [], activities: [] },
                                { name: 'Test C', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/login.spec.ts', line: 9 }, tags: [], activities: [] },
                                { name: 'Test D', category: 'Suite', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/login.spec.ts', line: 13 }, tags: [], activities: [] },
                            ],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            }, {}, hierarchy, projectFileSystem);

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            const fileNode = data.capabilities.children[0];
            expect(fileNode.score).toBeDefined();
            expect(fileNode.score.passRate).toBe(75);       // 3/4
            expect(fileNode.score.completeness).toBe(100);  // no pending/skipped
            expect(fileNode.score.consistency).toBe(100);     // single run = benefit of the doubt
            expect(fileNode.score.confidence).toBeGreaterThan(0);
        });

        test('includes executionHistory on file node scenarios for consistency computation', () => {
            const projectFs = createFsFromVolume(Volume.fromNestedJSON({
                '/project': { spec: { 'login.spec.ts': '' } }
            }, '/')) as unknown as typeof fs;
            const projectFileSystem = new FileSystem(Path.from('/project'), projectFs);
            const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('spec'));

            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
                            startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.500Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: '/project/spec/login.spec.ts', line: 1 }, tags: [], activities: [] },
                            ],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.500Z',
                            outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'Test A', category: 'Suite', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/login.spec.ts', line: 1 }, tags: [], activities: [] },
                            ],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            }, {}, hierarchy, projectFileSystem);

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            const fileNode = data.capabilities.children[0];
            expect(fileNode.scenarios[0].executionHistory).toEqual(['SUCCESS', 'FAILURE']);
            // Consistency should be 0% (1 flip out of 1 transition)
            expect(fileNode.score.consistency).toBe(0);
        });

        test('aggregates directory scores from children weighted by scenario count', () => {
            const projectFs = createFsFromVolume(Volume.fromNestedJSON({
                '/project': { spec: { 'a.spec.ts': '', 'b.spec.ts': '' } }
            }, '/')) as unknown as typeof fs;
            const projectFileSystem = new FileSystem(Path.from('/project'), projectFs);
            const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('spec'));

            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.500Z',
                            outcomes: { passed: 5, failed: 5, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                // a.spec.ts: 5 scenarios all passing → confidence high
                                { name: 'A1', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/a.spec.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'A2', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/a.spec.ts', line: 2 }, tags: [], activities: [] },
                                { name: 'A3', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/a.spec.ts', line: 3 }, tags: [], activities: [] },
                                { name: 'A4', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/a.spec.ts', line: 4 }, tags: [], activities: [] },
                                { name: 'A5', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/a.spec.ts', line: 5 }, tags: [], activities: [] },
                                // b.spec.ts: 5 scenarios all failing → confidence low
                                { name: 'B1', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/b.spec.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'B2', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/b.spec.ts', line: 2 }, tags: [], activities: [] },
                                { name: 'B3', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/b.spec.ts', line: 3 }, tags: [], activities: [] },
                                { name: 'B4', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/b.spec.ts', line: 4 }, tags: [], activities: [] },
                                { name: 'B5', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/b.spec.ts', line: 5 }, tags: [], activities: [] },
                            ],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            }, {}, hierarchy, projectFileSystem);

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            // Root directory should have a score that's the weighted average
            expect(data.capabilities.score).toBeDefined();
            expect(data.capabilities.score.confidence).toBeGreaterThan(0);
            // Both files have equal scenario counts, so root = average of the two
            const aNode = data.capabilities.children.find(c => c.name === 'a');
            const bNode = data.capabilities.children.find(c => c.name === 'b');
            expect(data.capabilities.score.confidence).toBe(
                Math.round((aNode.score.confidence * 5 + bNode.score.confidence * 5) / 10)
            );
        });
    });

    test.describe('maxHistory pruning', () => {

        test('retains only the most recent N test run directories when maxHistory is configured', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-13T10:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1, startedAt: '2024-06-13T10:00:00.000Z', finishedAt: '2024-06-13T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-13T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }), 'screenshot.png': 'old-data' },
                    '2024-06-14T10:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1, startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    '2024-06-15T10:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1, startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
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
                    'run-1': { 'db.json': JSON.stringify({ schemaVersion: 1, testRunId: 'run-1', startedAt: '2024-06-12T10:00:00.000Z', finishedAt: '2024-06-12T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-12T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    'run-2': { 'db.json': JSON.stringify({ schemaVersion: 1, testRunId: 'run-2', startedAt: '2024-06-13T10:00:00.000Z', finishedAt: '2024-06-13T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-13T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    'run-3': { 'db.json': JSON.stringify({ schemaVersion: 1, testRunId: 'run-3', startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    'run-4': { 'db.json': JSON.stringify({ schemaVersion: 1, testRunId: 'run-4', startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
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

    test.describe('inconsistent test identification', () => {

        test('identifies tests with mixed outcomes within the consistency window as inconsistent', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-13T10:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1, startedAt: '2024-06-13T10:00:00.000Z', finishedAt: '2024-06-13T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Unstable Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-13T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    '2024-06-14T10:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1, startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Unstable Test', category: 'Suite', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    '2024-06-15T10:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1, startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Unstable Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                },
            }, { consistencyWindow: 5 });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.inconsistentTests).toHaveLength(1);
            expect(data.inconsistentTests[0].name).toBe('Unstable Test');
        });

        test('does not flag a test as inconsistent if all outcomes within the consistency window are the same', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-13T10:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1, startedAt: '2024-06-13T10:00:00.000Z', finishedAt: '2024-06-13T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Stable Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-13T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    '2024-06-14T10:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1, startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Stable Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                },
            }, { consistencyWindow: 5 });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.inconsistentTests).toHaveLength(0);
        });

        test('considers only the last N runs when determining consistency', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    // Old failure (outside window of 2)
                    '2024-06-12T10:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1, startedAt: '2024-06-12T10:00:00.000Z', finishedAt: '2024-06-12T10:00:00.100Z', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Test', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-12T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    // Recent passes (inside window of 2)
                    '2024-06-14T10:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1, startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Test', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    '2024-06-15T10:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1, startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Test', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                },
            }, { consistencyWindow: 2 });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            // Old failure is outside the window of 2, so test is stable
            expect(data.inconsistentTests).toHaveLength(0);
        });

        test('does not classify tests as degraded when consistently pending across runs and source.line is undefined', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.500Z',
                        outcomes: { passed: 2, failed: 0, pending: 2, skipped: 0, compromised: 0, error: 0 },
                        scenes: [
                            { name: 'passing test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'pending.spec.ts' }, tags: [], activities: [] },
                            { name: 'passing test B', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.100Z', source: { path: 'pending.spec.ts' }, tags: [], activities: [] },
                            { name: 'pending test A', category: 'Suite', outcome: { code: 8 }, duration: 3, startedAt: '2024-06-14T10:00:00.200Z', source: { path: 'pending.spec.ts' }, tags: [], activities: [] },
                            { name: 'pending test B', category: 'Suite', outcome: { code: 8 }, duration: 2, startedAt: '2024-06-14T10:00:00.300Z', source: { path: 'pending.spec.ts' }, tags: [], activities: [] },
                        ],
                        tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                    }) },
                    '2024-06-15T10:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.500Z',
                        outcomes: { passed: 2, failed: 0, pending: 2, skipped: 0, compromised: 0, error: 0 },
                        scenes: [
                            { name: 'passing test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'pending.spec.ts' }, tags: [], activities: [] },
                            { name: 'passing test B', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.100Z', source: { path: 'pending.spec.ts' }, tags: [], activities: [] },
                            { name: 'pending test A', category: 'Suite', outcome: { code: 8 }, duration: 3, startedAt: '2024-06-15T10:00:00.200Z', source: { path: 'pending.spec.ts' }, tags: [], activities: [] },
                            { name: 'pending test B', category: 'Suite', outcome: { code: 8 }, duration: 2, startedAt: '2024-06-15T10:00:00.300Z', source: { path: 'pending.spec.ts' }, tags: [], activities: [] },
                        ],
                        tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                    }) },
                },
            }, { consistencyWindow: 5 });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            // Outcomes haven't changed between runs — no new failures or passes
            expect(data.newFailures).toHaveLength(0);
            expect(data.newPasses).toHaveLength(0);
        });

        test('separates inconsistent tests by project/browser tag', () => {
            // Same test in chromium (inconsistent) and firefox (stable) — should produce
            // one inconsistent entry for chromium only, not a merged entry.
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1, startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [
                        { name: 'Login test', category: 'Auth', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'login.spec.ts', line: 5 }, tags: [{ type: 'project', name: 'chromium' }], activities: [] },
                        { name: 'Login test', category: 'Auth', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'login.spec.ts', line: 5 }, tags: [{ type: 'project', name: 'firefox' }], activities: [] },
                    ], tags: [], testRunner: { name: 'PW', version: '1.0.0' } }) },
                    '2024-06-15T10:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1, startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.100Z', outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [
                        { name: 'Login test', category: 'Auth', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'login.spec.ts', line: 5 }, tags: [{ type: 'project', name: 'chromium' }], activities: [] },
                        { name: 'Login test', category: 'Auth', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'login.spec.ts', line: 5 }, tags: [{ type: 'project', name: 'firefox' }], activities: [] },
                    ], tags: [], testRunner: { name: 'PW', version: '1.0.0' } }) },
                },
            }, { consistencyWindow: 5 });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            // Only chromium is inconsistent (passed then failed). Firefox is stable (always passed).
            expect(data.inconsistentTests).toHaveLength(1);
            expect(data.inconsistentTests[0].name).toBe('Login test');
            expect(data.inconsistentTests[0].tags).toContainEqual({ type: 'project', name: 'chromium' });
        });
    });

    test.describe('tag statistics', () => {

        test('computes scenarioCount and passed for each tag', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
            const chromeTag = data.tags.find(t => t.name === 'chrome');
            expect(chromeTag.scenarioCount).toBe(3);
            expect(chromeTag.passed).toBe(2);
            const slowTag = data.tags.find(t => t.name === 'slow');
            expect(slowTag.scenarioCount).toBe(1);
            expect(slowTag.passed).toBe(0);
        });
    });

    test.describe('execution history', () => {

        test('correlates scenarios across runs by source path and line', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
                            startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'M', version: '1.0.0' },
                        }),
                    },
                    '2024-06-15T10:00:00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
            const testRunDirectory1 = '/source/module-a/test-runs/42';
            const testRunDirectory2 = '/source/module-b/test-runs/42';
            filesystem.mkdirSync(testRunDirectory1, { recursive: true });
            filesystem.mkdirSync(testRunDirectory2, { recursive: true });

            filesystem.writeFileSync(testRunDirectory1 + '/db.json', JSON.stringify({
                schemaVersion: 1,
                testRunId: '42',
                startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.500Z',
                outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test A', category: 'Mocha', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [{ type: 'tag', name: 'mocha' }], activities: [] },
                    { name: 'Test B', category: 'Mocha', outcome: { code: 64 }, duration: 300, startedAt: '2024-06-15T14:30:00.200Z', source: { path: 'a.spec.ts', line: 5 }, tags: [{ type: 'tag', name: 'mocha' }], activities: [] },
                ],
                tags: [{ type: 'tag', name: 'mocha' }], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(testRunDirectory2 + '/db.json', JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            // Simulate gh-pages pre-merged run (from a prior aggregate of attempt 1)
            // where Test A failed
            const ghPagesRunDirectory = '/source/gh-pages/test-runs/42';
            filesystem.mkdirSync(ghPagesRunDirectory, { recursive: true });
            filesystem.writeFileSync(ghPagesRunDirectory + '/db.json', JSON.stringify({
                schemaVersion: 1,
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
            filesystem.writeFileSync(freshArtifactDirectory + '/db.json', JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            // Same test appears in both gh-pages pre-merged and raw artifacts, both passing
            const ghPagesRunDirectory = '/source/gh-pages/test-runs/42';
            filesystem.mkdirSync(ghPagesRunDirectory, { recursive: true });
            filesystem.writeFileSync(ghPagesRunDirectory + '/db.json', JSON.stringify({
                schemaVersion: 1,
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
            filesystem.writeFileSync(freshArtifactDirectory + '/db.json', JSON.stringify({
                schemaVersion: 1,
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
    });

    test.describe('markdown rendering', () => {

        test('parses scenario narrative as markdown', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    'run1': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
                        'db.json': JSON.stringify({ schemaVersion: 1,
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

        test('includes feature narrative on capability file nodes', () => {
            const vol = Volume.fromNestedJSON({
                '/project/spec': {
                    'example': {
                        'test.feature': 'Feature: Test',
                    },
                },
                [outputDirectory.value]: {
                    'test-runs': {
                        'run1': {
                            'db.json': JSON.stringify({ schemaVersion: 1,
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
            const aggregator = new DataSnapshotAggregator(fileSystem, { consistencyWindow: 5, buildCapabilities: true }, hierarchy);

            aggregator.aggregate();
            const data = readDataJs(filesystem);

            expect(data.capabilities.children[0].children[0].narrative).toBe('As a user\nI want something');
        });
    });

    test.describe('retry support', () => {

        test('passes through retries count and attempts array in enriched scenarios', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-01-01T00:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-01-01T00:00:00.000Z',
                        finishedAt: '2024-01-01T00:00:01.000Z',
                        outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [{
                            name: 'should allow me to retry',
                            category: 'Retries',
                            outcome: { code: 64 },
                            duration: 500,
                            startedAt: '2024-01-01T00:00:00.000Z',
                            source: { path: 'spec/retries.spec.ts', line: 8 },
                            tags: [{ type: 'tag', name: 'retried' }],
                            activities: [{ type: 'Interaction', name: 'Tess ensures that 2 does equal 2', outcome: { code: 64 }, duration: 50, startedAt: '2024-01-01T00:00:00.000Z', children: [] }],
                            retries: 1,
                            attempts: [
                                { attemptNumber: 1, outcome: { code: 4 }, duration: 200, activities: [{ type: 'Interaction', name: 'Tess ensures that 0 does equal 2', outcome: { code: 4 }, duration: 50, startedAt: '2024-01-01T00:00:00.000Z', children: [] }], error: { name: 'AssertionError', message: 'Expected 0 to equal 2', stack: '' } },
                                { attemptNumber: 2, outcome: { code: 64 }, duration: 200, activities: [{ type: 'Interaction', name: 'Tess ensures that 2 does equal 2', outcome: { code: 64 }, duration: 50, startedAt: '2024-01-01T00:00:00.000Z', children: [] }] },
                            ],
                        }],
                        tags: [],
                        testRunner: { name: 'Playwright', version: '1.50.0' },
                    }) },
                },
            });

            aggregator.aggregate();
            const data = readDataJs(filesystem);

            expect(data.scenarios).toHaveLength(1);
            const scenario = data.scenarios[0];

            expect(scenario.outcome).toBe('SUCCESS');
            expect(scenario.retries).toBe(1);
            expect(scenario.attempts).toHaveLength(2);
            expect(scenario.attempts[0].outcome).toBe('FAILURE');
            expect(scenario.attempts[0].activities[0].name).toBe('Tess ensures that 0 does equal 2');
            expect(scenario.attempts[0].error.message).toBe('Expected 0 to equal 2');
            expect(scenario.attempts[1].outcome).toBe('SUCCESS');
            expect(scenario.attempts[1].activities[0].name).toBe('Tess ensures that 2 does equal 2');
        });

        test('includes per-run attempts in execution history only for runs that had retries', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-01-01T00:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-01-01T00:00:00.000Z',
                        finishedAt: '2024-01-01T00:00:01.000Z',
                        outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [{
                            name: 'retried test', category: 'Suite', outcome: { code: 4 }, duration: 200,
                            startedAt: '2024-01-01T00:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                            tags: [], activities: [{ type: 'Interaction', name: 'step A', outcome: { code: 4 }, duration: 200, children: [] }],
                            error: { name: 'Error', message: 'oops', stack: '' },
                        }],
                        tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
                    }) },
                    '2024-01-02T00:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-01-02T00:00:00.000Z',
                        finishedAt: '2024-01-02T00:00:01.000Z',
                        outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [{
                            name: 'retried test', category: 'Suite', outcome: { code: 64 }, duration: 500,
                            startedAt: '2024-01-02T00:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                            tags: [], activities: [{ type: 'Interaction', name: 'step B', outcome: { code: 64 }, duration: 150, children: [] }],
                            retries: 1, attempts: [
                                { attemptNumber: 1, outcome: { code: 4 }, duration: 250, activities: [{ type: 'Interaction', name: 'attempt 1 step', outcome: { code: 4 }, duration: 250, children: [] }], error: { name: 'Error', message: 'retry fail', stack: '' } },
                                { attemptNumber: 2, outcome: { code: 64 }, duration: 150, activities: [{ type: 'Interaction', name: 'attempt 2 step', outcome: { code: 64 }, duration: 150, children: [] }] },
                            ],
                        }],
                        tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
                    }) },
                },
            });

            aggregator.aggregate();
            const data = readDataJs(filesystem);
            const scenario = data.scenarios[0];

            // Execution history has 2 entries (one per run)
            expect(scenario.executionHistory).toHaveLength(2);

            // Run 1: not retried — no attempts field
            const run1 = scenario.executionHistory[0];
            expect(run1.outcome).toBe('FAILURE');
            expect(run1.duration).toBe(200);
            expect(run1.attempts).toBeUndefined();
            expect(run1.retries).toBeUndefined();

            // Run 2: retried — includes attempts
            const run2 = scenario.executionHistory[1];
            expect(run2.outcome).toBe('SUCCESS');
            expect(run2.duration).toBe(500);
            expect(run2.retries).toBe(1);
            expect(run2.attempts).toHaveLength(2);
            expect(run2.attempts[0].outcome).toBe('FAILURE');
            expect(run2.attempts[0].activities[0].name).toBe('attempt 1 step');
            expect(run2.attempts[1].outcome).toBe('SUCCESS');
            expect(run2.attempts[1].activities[0].name).toBe('attempt 2 step');
        });

        test('does not inflate scenario count for retried tests', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-01-01T00:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-01-01T00:00:00.000Z',
                        finishedAt: '2024-01-01T00:00:01.000Z',
                        outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [
                            { name: 'passes first time', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-01-01T00:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                            { name: 'retried test', category: 'Suite', outcome: { code: 64 }, duration: 300, startedAt: '2024-01-01T00:00:00.000Z', source: { path: 'a.spec.ts', line: 5 }, tags: [{ type: 'tag', name: 'retried' }], activities: [], retries: 1, attempts: [{ attemptNumber: 1, outcome: { code: 4 }, duration: 100, activities: [] }, { attemptNumber: 2, outcome: { code: 64 }, duration: 100, activities: [] }] },
                        ],
                        tags: [],
                        testRunner: { name: 'Playwright', version: '1.50.0' },
                    }) },
                },
            });

            aggregator.aggregate();
            const data = readDataJs(filesystem);

            expect(data.scenarios).toHaveLength(2);
            expect(data.summary.totalScenarios).toBe(2);
            expect(data.summary.outcomes.passed).toBe(2);
            expect(data.summary.outcomes.failed).toBe(0);
        });
    });

    test.describe('retried success classification', () => {

        test('sets retriedAndPassed on execution history entries where outcome is SUCCESS but required retry', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-01-01T00:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-01-01T00:00:00.000Z', finishedAt: '2024-01-01T00:00:01.000Z',
                        outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [{
                            name: 'retried test', category: 'Suite', outcome: { code: 64 }, duration: 500,
                            startedAt: '2024-01-01T00:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                            tags: [], activities: [],
                            retries: 1, attempts: [
                                { attemptNumber: 1, outcome: { code: 4 }, duration: 250, activities: [] },
                                { attemptNumber: 2, outcome: { code: 64 }, duration: 250, activities: [] },
                            ],
                        }],
                        tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
                    }) },
                },
            });

            aggregator.aggregate();
            const data = readDataJs(filesystem);

            expect(data.scenarios[0].executionHistory[0].retriedAndPassed).toBe(true);
        });

        test('does not set retriedAndPassed when test passed without retry', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-01-01T00:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-01-01T00:00:00.000Z', finishedAt: '2024-01-01T00:00:01.000Z',
                        outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [{
                            name: 'stable test', category: 'Suite', outcome: { code: 64 }, duration: 100,
                            startedAt: '2024-01-01T00:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                            tags: [], activities: [],
                        }],
                        tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
                    }) },
                },
            });

            aggregator.aggregate();
            const data = readDataJs(filesystem);

            expect(data.scenarios[0].executionHistory[0].retriedAndPassed).toBeUndefined();
        });

        test('does not set retriedAndPassed when test was retried but ultimately failed', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-01-01T00:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-01-01T00:00:00.000Z', finishedAt: '2024-01-01T00:00:01.000Z',
                        outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [{
                            name: 'broken test', category: 'Suite', outcome: { code: 4 }, duration: 500,
                            startedAt: '2024-01-01T00:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                            tags: [], activities: [],
                            retries: 1, attempts: [
                                { attemptNumber: 1, outcome: { code: 4 }, duration: 250, activities: [] },
                                { attemptNumber: 2, outcome: { code: 4 }, duration: 250, activities: [] },
                            ],
                        }],
                        tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
                    }) },
                },
            });

            aggregator.aggregate();
            const data = readDataJs(filesystem);

            expect(data.scenarios[0].executionHistory[0].retriedAndPassed).toBeUndefined();
        });

        test('identifies a test that passed via retry as inconsistent (RETRIED_SUCCESS)', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-01-01T00:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-01-01T00:00:00.000Z', finishedAt: '2024-01-01T00:00:01.000Z',
                        outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [{
                            name: 'retried test', category: 'Suite', outcome: { code: 64 }, duration: 500,
                            startedAt: '2024-01-01T00:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                            tags: [], activities: [],
                            retries: 1, attempts: [
                                { attemptNumber: 1, outcome: { code: 4 }, duration: 250, activities: [] },
                                { attemptNumber: 2, outcome: { code: 64 }, duration: 250, activities: [] },
                            ],
                        }],
                        tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
                    }) },
                    '2024-01-02T00:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-01-02T00:00:00.000Z', finishedAt: '2024-01-02T00:00:01.000Z',
                        outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [{
                            name: 'retried test', category: 'Suite', outcome: { code: 64 }, duration: 100,
                            startedAt: '2024-01-02T00:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                            tags: [], activities: [],
                        }],
                        tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
                    }) },
                },
            }, { consistencyWindow: 5 });

            aggregator.aggregate();
            const data = readDataJs(filesystem);

            // RETRIED_SUCCESS + SUCCESS = mixed outcomes → flagged as inconsistent
            expect(data.inconsistentTests).toHaveLength(1);
            expect(data.inconsistentTests[0].name).toBe('retried test');
            expect(data.inconsistentTests[0].history).toContain('RETRIED_SUCCESS');
        });

        test('identifies a test that always passes via retry as inconsistent', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-01-01T00:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-01-01T00:00:00.000Z', finishedAt: '2024-01-01T00:00:01.000Z',
                        outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [{
                            name: 'always-retried test', category: 'Suite', outcome: { code: 64 }, duration: 500,
                            startedAt: '2024-01-01T00:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                            tags: [], activities: [],
                            retries: 1, attempts: [
                                { attemptNumber: 1, outcome: { code: 4 }, duration: 250, activities: [] },
                                { attemptNumber: 2, outcome: { code: 64 }, duration: 250, activities: [] },
                            ],
                        }],
                        tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
                    }) },
                    '2024-01-02T00:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-01-02T00:00:00.000Z', finishedAt: '2024-01-02T00:00:01.000Z',
                        outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [{
                            name: 'always-retried test', category: 'Suite', outcome: { code: 64 }, duration: 500,
                            startedAt: '2024-01-02T00:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                            tags: [], activities: [],
                            retries: 1, attempts: [
                                { attemptNumber: 1, outcome: { code: 4 }, duration: 250, activities: [] },
                                { attemptNumber: 2, outcome: { code: 64 }, duration: 250, activities: [] },
                            ],
                        }],
                        tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
                    }) },
                },
            }, { consistencyWindow: 5 });

            aggregator.aggregate();
            const data = readDataJs(filesystem);

            // Both runs are RETRIED_SUCCESS → consistently retried = still flagged as inconsistent
            expect(data.inconsistentTests).toHaveLength(1);
            expect(data.inconsistentTests[0].name).toBe('always-retried test');
            expect(data.inconsistentTests[0].history).toEqual(['RETRIED_SUCCESS', 'RETRIED_SUCCESS']);
        });

        test('does not count a retried pass as recovered in computeDegradedRecovered', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-01-01T00:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-01-01T00:00:00.000Z', finishedAt: '2024-01-01T00:00:01.000Z',
                        outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [{
                            name: 'retried test', category: 'Suite', outcome: { code: 4 }, duration: 200,
                            startedAt: '2024-01-01T00:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                            tags: [], activities: [],
                        }],
                        tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
                    }) },
                    '2024-01-02T00:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-01-02T00:00:00.000Z', finishedAt: '2024-01-02T00:00:01.000Z',
                        outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [{
                            name: 'retried test', category: 'Suite', outcome: { code: 64 }, duration: 500,
                            startedAt: '2024-01-02T00:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                            tags: [], activities: [],
                            retries: 1, attempts: [
                                { attemptNumber: 1, outcome: { code: 4 }, duration: 250, activities: [] },
                                { attemptNumber: 2, outcome: { code: 64 }, duration: 250, activities: [] },
                            ],
                        }],
                        tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
                    }) },
                },
            });

            aggregator.aggregate();
            const data = readDataJs(filesystem);

            // A retried pass should NOT appear in newPasses (it's not a genuine recovery)
            expect(data.newPasses).toHaveLength(0);
        });

        test('penalises retried passes in consistency score', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-01-01T00:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-01-01T00:00:00.000Z', finishedAt: '2024-01-01T00:00:01.000Z',
                        outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [
                            { name: 'stable test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-01-01T00:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                            { name: 'retried test', category: 'Suite', outcome: { code: 64 }, duration: 500, startedAt: '2024-01-01T00:00:00.000Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [],
                                retries: 1, attempts: [
                                    { attemptNumber: 1, outcome: { code: 4 }, duration: 250, activities: [] },
                                    { attemptNumber: 2, outcome: { code: 64 }, duration: 250, activities: [] },
                                ],
                            },
                        ],
                        tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
                    }) },
                    '2024-01-02T00:00:00.000Z': { 'db.json': JSON.stringify({ schemaVersion: 1,
                        startedAt: '2024-01-02T00:00:00.000Z', finishedAt: '2024-01-02T00:00:01.000Z',
                        outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [
                            { name: 'stable test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-01-02T00:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                            { name: 'retried test', category: 'Suite', outcome: { code: 64 }, duration: 500, startedAt: '2024-01-02T00:00:00.000Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [],
                                retries: 1, attempts: [
                                    { attemptNumber: 1, outcome: { code: 4 }, duration: 250, activities: [] },
                                    { attemptNumber: 2, outcome: { code: 64 }, duration: 250, activities: [] },
                                ],
                            },
                        ],
                        tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
                    }) },
                },
            });

            aggregator.aggregate();
            const data = readDataJs(filesystem);

            // 2 tests over 2 runs. 'stable test' is consistent (SUCCESS, SUCCESS).
            // 'retried test' is RETRIED_SUCCESS in both runs — NOT stable.
            // Consistency = 1 stable / 2 total = 50%
            expect(data.history[1].score.consistency).toBe(50);
        });
    });

    test.describe('external aggregation — artifact copying', () => {

        test('copies artifact files from source test-run directories to the output test-runs directory', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {},
            });

            // Create source directories with db.json + artifacts using the memfs
            const sourceDirectory = '/source/project-a/test-runs/2024-06-15T14:30:00.000Z';
            filesystem.mkdirSync(sourceDirectory, { recursive: true });
            filesystem.writeFileSync(`${sourceDirectory}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14-30-00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
            filesystem.writeFileSync(`${sourceDirectory}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {},
            });

            // Source A
            const sourceDirectoryA = '/source/project-a/test-runs/2024-06-15T14:30:00.000Z';
            filesystem.mkdirSync(sourceDirectoryA, { recursive: true });
            filesystem.writeFileSync(`${sourceDirectoryA}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            filesystem.writeFileSync(`${sourceDirectoryB}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            const directoryA = '/source/module-a/test-runs/run-42-module-a-attempt-1';
            const directoryB = '/source/module-b/test-runs/run-42-module-b-attempt-1';
            filesystem.mkdirSync(directoryA, { recursive: true });
            filesystem.mkdirSync(directoryB, { recursive: true });

            filesystem.writeFileSync(`${directoryA}/db.json`, JSON.stringify({
                schemaVersion: 1,
                testRunId: 'run-42', attempt: 1,
                startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:01.000Z',
                outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                    { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:00.100Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directoryB}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            const directoryA = '/source/module-a/test-runs/run-99-module-a-attempt-1';
            const directoryB = '/source/module-b/test-runs/run-99-module-b-attempt-1';
            filesystem.mkdirSync(directoryA, { recursive: true });
            filesystem.mkdirSync(directoryB, { recursive: true });

            filesystem.writeFileSync(`${directoryA}/db.json`, JSON.stringify({
                schemaVersion: 1,
                testRunId: 'run-99', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:01.000Z',
                outcomes: { passed: 3, failed: 1, pending: 1, skipped: 0, compromised: 0, error: 0 },
                scenes: [], tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directoryB}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            const directoryA = '/source/module-a/test-runs/run-7-module-a-attempt-1';
            const directoryB = '/source/module-b/test-runs/run-7-module-b-attempt-1';
            filesystem.mkdirSync(directoryA, { recursive: true });
            filesystem.mkdirSync(directoryB, { recursive: true });

            filesystem.writeFileSync(`${directoryA}/db.json`, JSON.stringify({
                schemaVersion: 1,
                testRunId: 'run-7', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:01.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'A', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [{ type: 'feature', name: 'login' }], activities: [] }],
                tags: [{ type: 'feature', name: 'login' }], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directoryB}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            const directoryA = '/source/module-a/test-runs/run-5-module-a-attempt-1';
            const directoryB = '/source/module-b/test-runs/run-5-module-b-attempt-1';
            filesystem.mkdirSync(directoryA, { recursive: true });
            filesystem.mkdirSync(directoryB, { recursive: true });

            filesystem.writeFileSync(`${directoryA}/db.json`, JSON.stringify({
                schemaVersion: 1,
                testRunId: 'run-5', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [], tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directoryB}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            const directory1 = '/source/module/test-runs/run-10-attempt-1';
            const directory2 = '/source/module/test-runs/run-10-attempt-2';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            filesystem.writeFileSync(`${directory1}/db.json`, JSON.stringify({
                schemaVersion: 1,
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

            filesystem.writeFileSync(`${directory2}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            const directory1 = '/source/module/test-runs/run-11-attempt-1';
            const directory2 = '/source/module/test-runs/run-11-attempt-2';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            filesystem.writeFileSync(`${directory1}/db.json`, JSON.stringify({
                schemaVersion: 1,
                testRunId: 'run-11', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Stable test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                    { name: 'Failing test', category: 'Suite', outcome: { code: 4 }, duration: 200, startedAt: '2024-06-15T10:00:01.000Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directory2}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            const directory1 = '/source/module/test-runs/run-12-attempt-1';
            const directory2 = '/source/module/test-runs/run-12-attempt-2';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            filesystem.writeFileSync(`${directory1}/db.json`, JSON.stringify({
                schemaVersion: 1,
                testRunId: 'run-12', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Existing test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directory2}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            // Supply attempt-2 before attempt-1 to verify ordering by attempt field
            const directory2 = '/source/module/test-runs/run-13-attempt-2';
            const directory1 = '/source/module/test-runs/run-13-attempt-1';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            filesystem.writeFileSync(`${directory1}/db.json`, JSON.stringify({
                schemaVersion: 1,
                testRunId: 'run-13', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Test', category: 'Suite', outcome: { code: 4 }, duration: 300, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [],
                        error: { name: 'Error', message: 'first attempt error', stack: '' } },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directory2}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            const directory1 = '/source/module/test-runs/run-20-attempt-1';
            const directory2 = '/source/module/test-runs/run-20-legacy';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            // Legacy db.json: has testRunId but no attempt field
            filesystem.writeFileSync(`${directory2}/db.json`, JSON.stringify({
                schemaVersion: 1,
                testRunId: 'run-20',
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [
                    { name: 'Legacy test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                ],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            // Modern db.json: same testRunId, attempt 1
            filesystem.writeFileSync(`${directory1}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            const directoryA = '/source/module-a/test-runs/2024-06-15T10:00:00.000Z';
            const directoryB = '/source/module-b/test-runs/2024-06-15T10:00:00.000Z';
            filesystem.mkdirSync(directoryA, { recursive: true });
            filesystem.mkdirSync(directoryB, { recursive: true });

            filesystem.writeFileSync(`${directoryA}/db.json`, JSON.stringify({
                schemaVersion: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'A', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directoryB}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

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
            filesystem.writeFileSync(`${directories.a1}/db.json`, JSON.stringify({
                schemaVersion: 1,
                testRunId: 'run-30', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'A', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directories.b1}/db.json`, JSON.stringify({
                schemaVersion: 1,
                testRunId: 'run-30', attempt: 1,
                startedAt: '2024-06-15T10:00:01.000Z', finishedAt: '2024-06-15T10:00:06.000Z',
                outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'B', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T10:00:01.000Z', source: { path: 'b.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            // Attempt 2: both pass
            filesystem.writeFileSync(`${directories.a2}/db.json`, JSON.stringify({
                schemaVersion: 1,
                testRunId: 'run-30', attempt: 2,
                startedAt: '2024-06-15T10:01:00.000Z', finishedAt: '2024-06-15T10:01:05.000Z',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'A', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:01:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directories.b2}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            const directory1 = '/source/module/test-runs/run-50-attempt-1';
            const directory2 = '/source/module/test-runs/run-50-attempt-2';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            // Attempt 1: Test A passes, Test B fails
            filesystem.writeFileSync(`${directory1}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            filesystem.writeFileSync(`${directory2}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({
                // Historical run where the test passes cleanly
                'test-runs': {
                    'run-49': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
            filesystem.writeFileSync(`${directory1}/db.json`, JSON.stringify({
                schemaVersion: 1,
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

            filesystem.writeFileSync(`${directory2}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            const directory1 = '/source/module/test-runs/run-51-attempt-1';
            const directory2 = '/source/module/test-runs/run-51-attempt-2';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            // Attempt 1: test passed via Playwright Test retry (failed first, passed second)
            filesystem.writeFileSync(`${directory1}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            filesystem.writeFileSync(`${directory2}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            const directory1 = '/source/module/test-runs/run-52-attempt-1';
            const directory2 = '/source/module/test-runs/run-52-attempt-2';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            filesystem.writeFileSync(`${directory1}/db.json`, JSON.stringify({
                schemaVersion: 1,
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

            filesystem.writeFileSync(`${directory2}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            const directory1 = '/source/module/test-runs/run-40-attempt-1';
            const directory2 = '/source/module/test-runs/run-40-attempt-2';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            filesystem.writeFileSync(`${directory1}/db.json`, JSON.stringify({
                schemaVersion: 1,
                testRunId: 'run-40', attempt: 1,
                startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:05.000Z',
                outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                scenes: [{ name: 'T', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
            }));

            filesystem.writeFileSync(`${directory2}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
                        'db.json': JSON.stringify({ schemaVersion: 1,
                            testRunId: '40',
                            startedAt: '2024-06-13T10:00:00.000Z', finishedAt: '2024-06-13T10:00:05.000Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-13T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'M', version: '1.0.0' },
                        }),
                        'playwright-test-1': { 'screenshot.png': 'OLD' },
                    },
                    '41': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
                            testRunId: '41',
                            startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:05.000Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'M', version: '1.0.0' },
                        }),
                        'playwright-test-1': { 'screenshot.png': 'MID' },
                    },
                    '42': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({ 'test-runs': {} });

            const sourceDirectory = '/source/integration/test-runs/42/playwright-test-1';
            filesystem.mkdirSync(sourceDirectory, { recursive: true });
            filesystem.writeFileSync(`${sourceDirectory}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '40': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
                            testRunId: '40',
                            startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:05.000Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'M', version: '1.0.0' },
                        }),
                        'mocha-1': { 'screenshot.png': 'OLD_SCREENSHOT' },
                    },
                    '41': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
            filesystem.writeFileSync(`${sourceDirectory}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
                        'db.json': JSON.stringify({ schemaVersion: 1, startedAt: '2024-06-14T10:00:00.000Z' }),
                    },
                    '2024-06-15T10:00:00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            const directory1 = '/source/test-runs/run-a';
            const directory2 = '/source/test-runs/run-b';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.mkdirSync(directory2, { recursive: true });

            filesystem.writeFileSync(`${directory1}/db.json`, 'totally broken JSON');
            filesystem.writeFileSync(`${directory2}/db.json`, JSON.stringify({
                schemaVersion: 1,
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
            const { aggregator, filesystem } = createAggregator({});

            const directory1 = '/source/test-runs/run-a';
            filesystem.mkdirSync(directory1, { recursive: true });
            filesystem.writeFileSync(`${directory1}/db.json`, 'not JSON');

            aggregator.aggregate([`${directory1}/db.json`]);

            expect(filesystem.existsSync('/reports/serenity-js/data.js')).toBe(false);
        });
    });

    test.describe('specDirectory detection', () => {

        test('stores the basename of the resolved specDirectory from RequirementsHierarchy', () => {
            const projectFs = createFsFromVolume(Volume.fromNestedJSON({
                '/project': { specs: { 'login.spec.ts': '' } }
            }, '/')) as unknown as typeof fs;
            const projectFileSystem = new FileSystem(Path.from('/project'), projectFs);
            const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('specs'));

            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.100Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            }, { specDirectory: 'specs' }, hierarchy, projectFileSystem);

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.specDirectory).toBe('specs');
        });

        test('auto-detects specDirectory when not explicitly configured', () => {
            const projectFs = createFsFromVolume(Volume.fromNestedJSON({
                '/project': { features: { 'login.feature': '' } }
            }, '/')) as unknown as typeof fs;
            const projectFileSystem = new FileSystem(Path.from('/project'), projectFs);
            const hierarchy = new RequirementsHierarchy(projectFileSystem);

            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({ schemaVersion: 1,
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.100Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/features/login.feature', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'Cucumber', version: '12.0.0' },
                        }),
                    },
                },
            }, {}, hierarchy, projectFileSystem);

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.specDirectory).toBe('features');
        });
    });
});
