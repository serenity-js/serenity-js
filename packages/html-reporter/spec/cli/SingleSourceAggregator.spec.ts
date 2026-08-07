import type * as fs from 'node:fs';

import { expect, test } from '@playwright/test';
import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import { createFsFromVolume, Volume } from 'memfs';

import { MultiSourceAggregator } from '../../src/cli/MultiSourceAggregator.js';
import type { ReportData } from '../../src/cli/ReportData.js';
import { SingleSourceAggregator } from '../../src/cli/SingleSourceAggregator.js';

test.describe('SingleSourceAggregator', () => {

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
        }, hierarchy, defaultProjectFs, () => undefined);

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

    test.describe('aggregation', () => {

        test('produces data.js from a single test run', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': runData({
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
                        'db.json': runData({
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
                        'db.json': runData({
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
                        'db.json': runData({
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
                        'db.json': runData({
                            startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.500Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Old Test', category: 'Suite', outcome: { code: 64 }, duration: 500, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'old.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': runData({
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
                        'db.json': runData({
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
                        'db.json': runData({
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
                        'db.json': runData({
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
                        'db.json': runData({
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
                        'db.json': runData({
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
                        'db.json': runData({
                            startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.500Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: '/project/spec/login.spec.ts', line: 1 }, tags: [], activities: [] },
                            ],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': runData({
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
                        'db.json': runData({
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

        test('uses all available runs for consistency when consistencyWindow exceeds maxHistory', () => {
            // maxHistory=2 keeps only 2 runs on disk, but consistencyWindow=10 requests 10.
            // The test was unstable (pass → fail) within those 2 runs, so it should still
            // be detected as inconsistent despite the window being larger than available data.
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': { 'db.json': runData({ startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Flaky Test', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    '2024-06-15T10:00:00.000Z': { 'db.json': runData({ startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.100Z', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Flaky Test', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                },
            }, { maxHistory: 2, consistencyWindow: 10 });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            // consistencyWindow is effectively capped at the available runs (2)
            // The test flipped from pass to fail, so it's detected as inconsistent
            expect(data.inconsistentTests).toHaveLength(1);
            expect(data.inconsistentTests[0].name).toBe('Flaky Test');
            expect(data.inconsistentTests[0].history).toEqual(['SUCCESS', 'FAILURE']);
        });
    });

    test.describe('inconsistent test identification', () => {

        test('identifies tests with mixed outcomes within the consistency window as inconsistent', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-13T10:00:00.000Z': { 'db.json': runData({ startedAt: '2024-06-13T10:00:00.000Z', finishedAt: '2024-06-13T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Unstable Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-13T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    '2024-06-14T10:00:00.000Z': { 'db.json': runData({ startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Unstable Test', category: 'Suite', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    '2024-06-15T10:00:00.000Z': { 'db.json': runData({ startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Unstable Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
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
                    '2024-06-13T10:00:00.000Z': { 'db.json': runData({ startedAt: '2024-06-13T10:00:00.000Z', finishedAt: '2024-06-13T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Stable Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-13T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    '2024-06-14T10:00:00.000Z': { 'db.json': runData({ startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Stable Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
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
                    '2024-06-12T10:00:00.000Z': { 'db.json': runData({ startedAt: '2024-06-12T10:00:00.000Z', finishedAt: '2024-06-12T10:00:00.100Z', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Test', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-12T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    // Recent passes (inside window of 2)
                    '2024-06-14T10:00:00.000Z': { 'db.json': runData({ startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Test', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
                    '2024-06-15T10:00:00.000Z': { 'db.json': runData({ startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.100Z', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Test', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: { name: 'M', version: '1.0.0' } }) },
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
                    '2024-06-14T10:00:00.000Z': { 'db.json': runData({
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
                    '2024-06-15T10:00:00.000Z': { 'db.json': runData({
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
                    '2024-06-14T10:00:00.000Z': { 'db.json': runData({ startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z', outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [
                        { name: 'Login test', category: 'Auth', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'login.spec.ts', line: 5 }, tags: [{ type: 'project', name: 'chromium' }], activities: [] },
                        { name: 'Login test', category: 'Auth', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'login.spec.ts', line: 5 }, tags: [{ type: 'project', name: 'firefox' }], activities: [] },
                    ], tags: [], testRunner: { name: 'PW', version: '1.0.0' } }) },
                    '2024-06-15T10:00:00.000Z': { 'db.json': runData({ startedAt: '2024-06-15T10:00:00.000Z', finishedAt: '2024-06-15T10:00:00.100Z', outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [
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
                        'db.json': runData({
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
                        'db.json': runData({
                            startedAt: '2024-06-14T10:00:00.000Z', finishedAt: '2024-06-14T10:00:00.100Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'M', version: '1.0.0' },
                        }),
                    },
                    '2024-06-15T10:00:00.000Z': {
                        'db.json': runData({
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
                        'db.json': runData({
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
                        'db.json': runData({
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

    test.describe('markdown rendering', () => {

        test('parses scenario narrative as markdown', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    'run1': {
                        'db.json': runData({
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
                        'db.json': runData({
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
                        'db.json': runData({
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
                            'db.json': runData({
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
            const aggregator = new SingleSourceAggregator(fileSystem, { consistencyWindow: 5, buildCapabilities: true }, hierarchy, projectFs, () => undefined);

            aggregator.aggregate();
            const data = readDataJs(filesystem);

            expect(data.capabilities.children[0].children[0].narrative).toBe('As a user\nI want something');
        });
    });

    test.describe('retry support', () => {

        test('passes through retries count and attempts array in enriched scenarios', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-01-01T00:00:00.000Z': { 'db.json': runData({
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
                    '2024-01-01T00:00:00.000Z': { 'db.json': runData({
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
                    '2024-01-02T00:00:00.000Z': { 'db.json': runData({
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
                    '2024-01-01T00:00:00.000Z': { 'db.json': runData({
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
                    '2024-01-01T00:00:00.000Z': { 'db.json': runData({
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
                    '2024-01-01T00:00:00.000Z': { 'db.json': runData({
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
                    '2024-01-01T00:00:00.000Z': { 'db.json': runData({
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
                    '2024-01-01T00:00:00.000Z': { 'db.json': runData({
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
                    '2024-01-02T00:00:00.000Z': { 'db.json': runData({
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
                    '2024-01-01T00:00:00.000Z': { 'db.json': runData({
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
                    '2024-01-02T00:00:00.000Z': { 'db.json': runData({
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
                    '2024-01-01T00:00:00.000Z': { 'db.json': runData({
                        startedAt: '2024-01-01T00:00:00.000Z', finishedAt: '2024-01-01T00:00:01.000Z',
                        outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [{
                            name: 'retried test', category: 'Suite', outcome: { code: 4 }, duration: 200,
                            startedAt: '2024-01-01T00:00:00.000Z', source: { path: 'a.spec.ts', line: 1 },
                            tags: [], activities: [],
                        }],
                        tags: [], testRunner: { name: 'Playwright', version: '1.50.0' },
                    }) },
                    '2024-01-02T00:00:00.000Z': { 'db.json': runData({
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
                    '2024-01-01T00:00:00.000Z': { 'db.json': runData({
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
                    '2024-01-02T00:00:00.000Z': { 'db.json': runData({
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
                        'db.json': runData({
                            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:00.100Z',
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: { name: 'Mocha', version: '11.0.0' },
                        }),
                    },
                },
            }, { }, hierarchy, projectFileSystem);

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
                        'db.json': runData({
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

    test.describe('incomplete run detection', () => {

        test('includes a run with missing finishedAt in history with duration 0', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14-30-00.000Z': {
                        'db.json': runData({
                            startedAt: '2024-06-15T14:30:00.000Z',
                            outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [],
                            tags: [],
                            systemContext: { nodeVersion: 'v22', os: { name: 'linux', version: '6', arch: 'x64' }, serenityVersion: '3.44.0', runtime: { provider: 'node', version: 'v22' } },
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.history).toHaveLength(1);
            expect(data.history[0].duration).toBe(0);
            expect(data.history[0].timestamp).toBe('2024-06-15T14:30:00.000Z');
        });

        test('tracks modules with finishedAt in history when merging external runs', () => {
            const filesystem = createMemFs({
                '/source/test-runs/42/module-a-1': {
                    'db.json': runData({ testRunId: '42',
                        startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:05.000Z',
                        outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [
                            { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                            { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:00.100Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [] },
                        ],
                        tags: [],
                        testRunner: { name: 'Playwright', version: '1.50.0' },
                        systemContext: { nodeVersion: 'v22', os: { name: 'linux', version: '6', arch: 'x64' }, serenityVersion: '3.44.0', runtime: { provider: 'node', version: 'v22' }, projectName: 'module-a' },
                    }),
                },
                '/source/test-runs/42/module-b-1': {
                    'db.json': runData({ testRunId: '42',
                        startedAt: '2024-06-15T14:30:00.000Z',
                        outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        scenes: [],
                        tags: [],
                        systemContext: { nodeVersion: 'v22', os: { name: 'linux', version: '6', arch: 'x64' }, serenityVersion: '3.44.0', runtime: { provider: 'node', version: 'v22' }, projectName: 'module-b' },
                    }),
                },
                [outputDirectory.value]: {},
            });

            const fileSystem = new FileSystem(outputDirectory, filesystem);
            const sourceFileSystem = new FileSystem(Path.from('/'), filesystem);
            const projectFs = new FileSystem(Path.from('/'), filesystem);
            const hierarchy = new RequirementsHierarchy(projectFs);
            const aggregator = new MultiSourceAggregator(fileSystem, { consistencyWindow: 5 }, hierarchy, projectFs, sourceFileSystem);

            aggregator.aggregate([
                '/source/test-runs/42/module-a-1/db.json',
                '/source/test-runs/42/module-b-1/db.json',
            ]);

            const data = readDataJs(filesystem);
            expect(data.history).toHaveLength(1);
            expect(data.history[0].modules).toHaveLength(2);

            const completeModule = data.history[0].modules.find(m => m.finishedAt);
            const incompleteModule = data.history[0].modules.find(m => !m.finishedAt);
            expect(completeModule.moduleId).toBe('module-a');
            expect(completeModule.finishedAt).toBe('2024-06-15T14:30:05.000Z');
            expect(incompleteModule.moduleId).toBe('module-b');
            expect(incompleteModule.finishedAt).toBeUndefined();
        });
    });
});
