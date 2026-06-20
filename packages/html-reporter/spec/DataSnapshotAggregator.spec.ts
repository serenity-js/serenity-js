import type * as fs from 'node:fs';

import { expect } from '@integration/testing-tools';
import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import { createFsFromVolume, Volume } from 'memfs';
import { describe, it } from 'mocha';

import { DataSnapshotAggregator } from '../src/DataSnapshotAggregator.js';

describe('DataSnapshotAggregator', () => {

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

    describe('aggregation', () => {

        it('produces data.js from a single test run', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            timestamp: '2024-06-15T14:30:00.000Z',
                            duration: 1000,
                            outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:00.100Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [] },
                                { name: 'Test C', category: 'Suite', outcome: { code: 64 }, duration: 300, startedAt: '2024-06-15T14:30:00.300Z', source: { path: 'b.spec.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'Test D', category: 'Suite', outcome: { code: 4 }, duration: 400, startedAt: '2024-06-15T14:30:00.600Z', source: { path: 'b.spec.ts', line: 5 }, tags: [], activities: [] },
                            ],
                            tags: [],
                            testRunner: 'Mocha',
                            testRunnerVersion: '11.0.0',
                        }),
                    },
                },
            });

            aggregator.aggregate();

            expect(filesystem.existsSync('/reports/serenity-js/data.js')).to.equal(true);
            const data = readDataJs(filesystem);
            expect(data.scenarios).to.have.lengthOf(4);
            expect(data.summary.totalScenarios).to.equal(4);
            expect(data.summary.outcomes.passed).to.equal(3);
            expect(data.summary.outcomes.failed).to.equal(1);
            expect(data.summary.startedAt).to.equal('2024-06-15T14:30:00.000Z');
            expect(data.summary.finishedAt).to.equal('2024-06-15T14:30:01.000Z');
        });

        it('assigns data to window.__SERENITY_REPORT_DATA__', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            timestamp: '2024-06-15T14:30:00.000Z', duration: 100,
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: 'Mocha', testRunnerVersion: '11.0.0',
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const content = filesystem.readFileSync('/reports/serenity-js/data.js', 'utf8') as string;
            expect(content).to.match(/^window\.__SERENITY_REPORT_DATA__\s*=/);
            expect(content).to.match(/;\s*$/);
        });

        it('builds history array ordered chronologically from multiple runs', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': {
                        'db.json': JSON.stringify({
                            timestamp: '2024-06-14T10:00:00.000Z', duration: 500,
                            outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 400, startedAt: '2024-06-14T10:00:00.100Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [] },
                            ],
                            tags: [], testRunner: 'Mocha', testRunnerVersion: '11.0.0',
                        }),
                    },
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            timestamp: '2024-06-15T14:30:00.000Z', duration: 1000,
                            outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'Test B', category: 'Suite', outcome: { code: 4 }, duration: 900, startedAt: '2024-06-15T14:30:00.100Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [] },
                            ],
                            tags: [], testRunner: 'Mocha', testRunnerVersion: '11.0.0',
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.history).to.have.lengthOf(2);
            expect(data.history[0].timestamp).to.equal('2024-06-14T10:00:00.000Z');
            expect(data.history[1].timestamp).to.equal('2024-06-15T14:30:00.000Z');
        });

        it('uses scenes from the latest run in the snapshot', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': {
                        'db.json': JSON.stringify({
                            timestamp: '2024-06-14T10:00:00.000Z', duration: 500,
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Old Test', category: 'Suite', outcome: { code: 64 }, duration: 500, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'old.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: 'Mocha', testRunnerVersion: '11.0.0',
                        }),
                    },
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            timestamp: '2024-06-15T14:30:00.000Z', duration: 200,
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'New Test', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'new.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: 'Playwright', testRunnerVersion: '1.45.0',
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.scenarios).to.have.lengthOf(1);
            expect(data.scenarios[0].name).to.equal('New Test');
            expect(data.summary.testRunner).to.equal('Playwright');
        });

        it('applies custom title from configuration', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            timestamp: '2024-06-15T14:30:00.000Z', duration: 100,
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: 'Mocha', testRunnerVersion: '11.0.0',
                        }),
                    },
                },
            }, { title: 'My Project Report' });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.summary.title).to.equal('My Project Report');
        });

        it('includes system context from the latest run in the data snapshot', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            timestamp: '2024-06-15T14:30:00.000Z', duration: 100,
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: 'Mocha', testRunnerVersion: '11.0.0',
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
            expect(data.systemContext).to.deep.equal({
                nodeVersion: 'v22.0.0',
                os: { name: 'darwin', version: '24.0.0', arch: 'arm64' },
                serenityVersion: '3.44.0',
                testRunner: { name: 'Mocha', version: '11.0.0' },
                browsers: [],
                ci: { provider: 'GitHub Actions', buildNumber: '42', branch: 'main', commit: 'abc123de', jobUrl: 'https://github.com/org/repo/actions/runs/1' },
            });
        });
    });

    describe('requirements hierarchy', () => {

        it('builds a requirements tree from scenario source paths when specDirectory is configured', () => {
            const projectFs = createFsFromVolume(Volume.fromNestedJSON({
                '/project': { spec: { 'readme.md': '**bold** text', login: { 'basic.spec.ts': '' }, 'checkout.spec.ts': '' } }
            }, '/')) as unknown as typeof fs;
            const projectFileSystem = new FileSystem(Path.from('/project'), projectFs);
            const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('spec'));

            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            timestamp: '2024-06-15T14:30:00.000Z', duration: 500,
                            outcomes: { passed: 2, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'Test A', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: '/project/spec/login/basic.spec.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'Test B', category: 'Suite', outcome: { code: 64 }, duration: 200, startedAt: '2024-06-15T14:30:00.100Z', source: { path: '/project/spec/login/basic.spec.ts', line: 5 }, tags: [], activities: [] },
                                { name: 'Test C', category: 'Suite', outcome: { code: 4 }, duration: 200, startedAt: '2024-06-15T14:30:00.300Z', source: { path: '/project/spec/checkout.spec.ts', line: 1 }, tags: [], activities: [] },
                            ],
                            tags: [], testRunner: 'Mocha', testRunnerVersion: '11.0.0',
                        }),
                    },
                },
            }, {}, hierarchy, projectFileSystem);

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.requirements).to.exist;
            expect(data.requirements.scenarioCount).to.equal(3);
            expect(data.requirements.outcomes.passed).to.equal(2);
            expect(data.requirements.outcomes.failed).to.equal(1);
            expect(data.requirements.children).to.have.lengthOf(2);

            const names = data.requirements.children.map((c: any) => c.name).sort();
            expect(names).to.deep.equal(['checkout', 'login']);
            expect(data.requirements.readme).to.contain('<strong>bold</strong>');
        });

        it('does not produce requirements when specDirectory is not configured', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            timestamp: '2024-06-15T14:30:00.000Z', duration: 100,
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: 'Mocha', testRunnerVersion: '11.0.0',
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.requirements).to.be.undefined;
        });
    });

    describe('maxHistory pruning', () => {

        it('retains only the most recent N test run directories when maxHistory is configured', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-13T10:00:00.000Z': { 'db.json': JSON.stringify({ timestamp: '2024-06-13T10:00:00.000Z', duration: 100, outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-13T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: 'M', testRunnerVersion: '1.0.0' }), 'screenshot.png': 'old-data' },
                    '2024-06-14T10:00:00.000Z': { 'db.json': JSON.stringify({ timestamp: '2024-06-14T10:00:00.000Z', duration: 100, outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: 'M', testRunnerVersion: '1.0.0' }) },
                    '2024-06-15T10:00:00.000Z': { 'db.json': JSON.stringify({ timestamp: '2024-06-15T10:00:00.000Z', duration: 100, outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: 'M', testRunnerVersion: '1.0.0' }) },
                },
            }, { maxHistory: 2 });

            aggregator.aggregate();

            // Oldest run should be removed
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/2024-06-13T10:00:00.000Z')).to.equal(false);
            // Two most recent retained
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/2024-06-14T10:00:00.000Z')).to.equal(true);
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/2024-06-15T10:00:00.000Z')).to.equal(true);

            const data = readDataJs(filesystem);
            expect(data.history).to.have.lengthOf(2);
        });
    });

    describe('unstable test identification', () => {

        it('identifies tests with mixed outcomes within the stability window as unstable', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-13T10:00:00.000Z': { 'db.json': JSON.stringify({ timestamp: '2024-06-13T10:00:00.000Z', duration: 100, outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Flaky Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-13T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: 'M', testRunnerVersion: '1.0.0' }) },
                    '2024-06-14T10:00:00.000Z': { 'db.json': JSON.stringify({ timestamp: '2024-06-14T10:00:00.000Z', duration: 100, outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Flaky Test', category: 'Suite', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: 'M', testRunnerVersion: '1.0.0' }) },
                    '2024-06-15T10:00:00.000Z': { 'db.json': JSON.stringify({ timestamp: '2024-06-15T10:00:00.000Z', duration: 100, outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Flaky Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: 'M', testRunnerVersion: '1.0.0' }) },
                },
            }, { stabilityWindow: 5 });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.unstableTests).to.have.lengthOf(1);
            expect(data.unstableTests[0].name).to.equal('Flaky Test');
        });

        it('does not flag a test as unstable if all outcomes within the stability window are the same', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-13T10:00:00.000Z': { 'db.json': JSON.stringify({ timestamp: '2024-06-13T10:00:00.000Z', duration: 100, outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Stable Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-13T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: 'M', testRunnerVersion: '1.0.0' }) },
                    '2024-06-14T10:00:00.000Z': { 'db.json': JSON.stringify({ timestamp: '2024-06-14T10:00:00.000Z', duration: 100, outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Stable Test', category: 'Suite', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: 'M', testRunnerVersion: '1.0.0' }) },
                },
            }, { stabilityWindow: 5 });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.unstableTests).to.have.lengthOf(0);
        });

        it('considers only the last N runs when determining stability', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    // Old failure (outside window of 2)
                    '2024-06-12T10:00:00.000Z': { 'db.json': JSON.stringify({ timestamp: '2024-06-12T10:00:00.000Z', duration: 100, outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Test', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-12T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: 'M', testRunnerVersion: '1.0.0' }) },
                    // Recent passes (inside window of 2)
                    '2024-06-14T10:00:00.000Z': { 'db.json': JSON.stringify({ timestamp: '2024-06-14T10:00:00.000Z', duration: 100, outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Test', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: 'M', testRunnerVersion: '1.0.0' }) },
                    '2024-06-15T10:00:00.000Z': { 'db.json': JSON.stringify({ timestamp: '2024-06-15T10:00:00.000Z', duration: 100, outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenes: [{ name: 'Test', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }], tags: [], testRunner: 'M', testRunnerVersion: '1.0.0' }) },
                },
            }, { stabilityWindow: 2 });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            // Old failure is outside the window of 2, so test is stable
            expect(data.unstableTests).to.have.lengthOf(0);
        });
    });

    describe('tag statistics', () => {

        it('computes scenarioCount and passed for each tag', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            timestamp: '2024-06-15T14:30:00.000Z', duration: 500,
                            outcomes: { passed: 2, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'A', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [{ type: 'browser', name: 'chrome' }], activities: [] },
                                { name: 'B', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.100Z', source: { path: 'a.ts', line: 5 }, tags: [{ type: 'browser', name: 'chrome' }], activities: [] },
                                { name: 'C', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T14:30:00.200Z', source: { path: 'b.ts', line: 1 }, tags: [{ type: 'browser', name: 'chrome' }, { type: 'tag', name: 'slow' }], activities: [] },
                            ],
                            tags: [], testRunner: 'M', testRunnerVersion: '1.0.0',
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            const chromeTag = data.tags.find((t: any) => t.name === 'chrome');
            expect(chromeTag.scenarioCount).to.equal(3);
            expect(chromeTag.passed).to.equal(2);
            const slowTag = data.tags.find((t: any) => t.name === 'slow');
            expect(slowTag.scenarioCount).to.equal(1);
            expect(slowTag.passed).to.equal(0);
        });
    });

    describe('execution history', () => {

        it('correlates scenarios across runs by source path and line', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': {
                        'db.json': JSON.stringify({
                            timestamp: '2024-06-14T10:00:00.000Z', duration: 100,
                            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'T', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: 'M', testRunnerVersion: '1.0.0',
                        }),
                    },
                    '2024-06-15T10:00:00.000Z': {
                        'db.json': JSON.stringify({
                            timestamp: '2024-06-15T10:00:00.000Z', duration: 100,
                            outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [{ name: 'T', category: 'S', outcome: { code: 4 }, duration: 100, startedAt: '2024-06-15T10:00:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] }],
                            tags: [], testRunner: 'M', testRunnerVersion: '1.0.0',
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.scenarios[0].executionHistory).to.have.lengthOf(2);
            expect(data.scenarios[0].executionHistory[0].outcome).to.equal('SUCCESS');
            expect(data.scenarios[0].executionHistory[1].outcome).to.equal('FAILURE');
        });
    });

    describe('history duration stats', () => {

        it('includes slowest and fastest test durations per run', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            timestamp: '2024-06-15T14:30:00.000Z', duration: 500,
                            outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'Fast', category: 'S', outcome: { code: 64 }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.ts', line: 1 }, tags: [], activities: [] },
                                { name: 'Slow', category: 'S', outcome: { code: 64 }, duration: 400, startedAt: '2024-06-15T14:30:00.100Z', source: { path: 'a.ts', line: 5 }, tags: [], activities: [] },
                            ],
                            tags: [], testRunner: 'M', testRunnerVersion: '1.0.0',
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            expect(data.history[0].slowest).to.equal(400);
            expect(data.history[0].fastest).to.equal(100);
        });
    });

    describe('activity location and outcome mapping', () => {

        it('preserves activity location and maps outcome codes to display strings', () => {
            const { aggregator, filesystem } = createAggregator({
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify({
                            timestamp: '2024-06-15T14:30:00.000Z', duration: 100,
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
                            tags: [], testRunner: 'Cucumber', testRunnerVersion: '12.0.0',
                        }),
                    },
                },
            });

            aggregator.aggregate();

            const data = readDataJs(filesystem);
            const activities = data.scenarios[0].activities;

            expect(activities).to.have.lengthOf(3);
            expect(activities[0].outcome).to.equal('SUCCESS');
            expect(activities[0].location).to.deep.equal({ path: 'features/pending.feature', line: 14 });
            expect(activities[1].outcome).to.equal('PENDING');
            expect(activities[1].location).to.deep.equal({ path: 'features/pending.feature', line: 15 });
            expect(activities[2].outcome).to.equal('SKIPPED');
            expect(activities[2].location).to.deep.equal({ path: 'features/pending.feature', line: 16 });
        });
    });
});
