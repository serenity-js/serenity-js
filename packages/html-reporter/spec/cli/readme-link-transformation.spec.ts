/**
 * Tests verifying that relative links in README files are transformed
 * at build time to navigate correctly within the HTML report's capabilities view.
 */
import type * as fs from 'node:fs';

import { expect, test } from '@playwright/test';
import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import { createFsFromVolume, Volume } from 'memfs';

import { buildCapabilities } from '../../src/cli/capabilities/buildCapabilities.js';
import type { RunData } from '../../src/cli/model/RunData.js';
import type { ReportCapabilityNode } from '../../src/cli/reporting/ReportData.js';

function createMemFs(tree: Record<string, unknown>, root = '/'): typeof fs {
    return createFsFromVolume(Volume.fromNestedJSON(tree as any, root)) as unknown as typeof fs;
}

function makeRun(scenes: Array<{ name: string; path: string; line: number }>): RunData {
    return {
        startedAt: '2024-01-01T00:00:00.000Z',
        finishedAt: '2024-01-01T00:00:01.000Z',
        testRunId: '1',
        outcomes: { passed: scenes.length, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
        scenes: scenes.map((s, i) => ({
            name: s.name,
            category: 'Suite',
            source: { path: s.path, line: s.line },
            outcome: { code: 64 },
            tags: [],
            activities: [],
            startedAt: new Date(Date.parse('2024-01-01T00:00:00.000Z') + i * 100).toISOString(),
            duration: 100,
        })),
        tags: [],
        testRunner: { name: 'Playwright', version: '1.50.0' },
    } as unknown as RunData;
}

function buildWithRootReadme(readmeContent: string, projectTree?: Record<string, unknown>): ReportCapabilityNode {
    const defaultTree = {
        '/project': {
            spec: {
                'readme.md': readmeContent,
                'example.spec.ts': '',
                dashboard: { 'kpis.spec.ts': '' },
                scenarios: { 'finding.spec.ts': '' },
            },
        },
    };

    const tree = projectTree || defaultTree;
    const filesystem = createMemFs(tree);
    const projectFileSystem = new FileSystem(Path.from('/project'), filesystem);
    const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('spec'));

    const run = makeRun([
        { name: 'test a', path: '/project/spec/dashboard/kpis.spec.ts', line: 1 },
        { name: 'test b', path: '/project/spec/scenarios/finding.spec.ts', line: 1 },
        { name: 'test c', path: '/project/spec/example.spec.ts', line: 1 },
    ]);

    return buildCapabilities(run, [run], hierarchy, projectFileSystem);
}

test.describe('README link transformation', () => {

    test.describe('directory links', () => {

        test('transforms relative directory links to capabilities view navigation', () => {
            const tree = buildWithRootReadme('[Dashboard](./dashboard/)');
            expect(tree.readme).toContain('href="#/capabilities?path=dashboard"');
        });

        test('transforms directory links without trailing slash when node exists in tree', () => {
            const tree = buildWithRootReadme('[Dashboard](./dashboard)');
            expect(tree.readme).toContain('href="#/capabilities?path=dashboard"');
        });

        test('does not transform directory links to non-existent nodes', () => {
            const tree = buildWithRootReadme('[Missing](./nonexistent/)');
            expect(tree.readme).toContain('href="./nonexistent/"');
        });

        test('transforms readme.md links as directory links (case-insensitive)', () => {
            const tree = buildWithRootReadme('[Dashboard docs](./dashboard/README.md)');
            expect(tree.readme).toContain('href="#/capabilities?path=dashboard"');
        });

        test('transforms readme.md links with lowercase filename', () => {
            const tree = buildWithRootReadme('[Dashboard docs](./dashboard/readme.md)');
            expect(tree.readme).toContain('href="#/capabilities?path=dashboard"');
        });

        test('navigates to capabilities root when resolving to root path', () => {
            const projectTree = {
                '/project': {
                    spec: {
                        'example.spec.ts': '',
                        dashboard: { 'kpis.spec.ts': '', 'readme.md': '[Root](../)\n' },
                    },
                },
            };
            const filesystem = createMemFs(projectTree);
            const projectFileSystem = new FileSystem(Path.from('/project'), filesystem);
            const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('spec'));

            const run = makeRun([
                { name: 'test a', path: '/project/spec/dashboard/kpis.spec.ts', line: 1 },
                { name: 'test b', path: '/project/spec/example.spec.ts', line: 2 },
            ]);

            const tree = buildCapabilities(run, [run], hierarchy, projectFileSystem);
            const dashboardNode = tree.children!.find(c => c.name === 'dashboard')!;
            expect(dashboardNode.readme).toContain('href="#/capabilities"');
            expect(dashboardNode.readme).not.toContain('path=');
        });
    });

    test.describe('spec file links', () => {

        test('transforms .spec.ts file links to test search', () => {
            const tree = buildWithRootReadme('[KPI tests](./dashboard/kpis.spec.ts)');
            expect(tree.readme).toContain('href="#/tests?search=');
            expect(tree.readme).toContain(encodeURIComponent('"dashboard/kpis.spec.ts"'));
        });

        test('transforms .test.ts file links to test search', () => {
            const projectTree = {
                '/project': {
                    spec: {
                        'readme.md': '[Tests](./login.test.ts)',
                        'login.test.ts': '',
                    },
                },
            };
            const filesystem = createMemFs(projectTree);
            const projectFileSystem = new FileSystem(Path.from('/project'), filesystem);
            const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('spec'));

            const run = makeRun([
                { name: 'test a', path: '/project/spec/login.test.ts', line: 1 },
            ]);

            const tree = buildCapabilities(run, [run], hierarchy, projectFileSystem);
            expect(tree.readme).toContain('href="#/tests?search=');
            expect(tree.readme).toContain(encodeURIComponent('"login.test.ts"'));
        });

        test('transforms .spec.js file links to test search', () => {
            const tree = buildWithRootReadme('[Tests](./dashboard/kpis.spec.js)');
            expect(tree.readme).toContain('href="#/tests?search=');
        });
    });

    test.describe('external links', () => {

        test('does not transform absolute http links', () => {
            const tree = buildWithRootReadme('[Serenity/JS](https://serenity-js.org)');
            expect(tree.readme).toContain('href="https://serenity-js.org"');
            expect(tree.readme).toContain('target="_blank"');
            expect(tree.readme).toContain('rel="noopener"');
        });

        test('does not transform non-relative links (no ./ or ../ prefix)', () => {
            const tree = buildWithRootReadme('[Anchor](#section)');
            expect(tree.readme).toContain('href="#section"');
        });
    });

    test.describe('escaping specDirectory', () => {

        test('does not transform links that escape the specDirectory', () => {
            const tree = buildWithRootReadme('[Package](../../package.json)');
            expect(tree.readme).toContain('href="../../package.json"');
        });

        test('does not transform links that resolve above specDirectory via nested path', () => {
            const projectTree = {
                '/project': {
                    spec: {
                        'example.spec.ts': '',
                        dashboard: { 'kpis.spec.ts': '', 'readme.md': '[Escape](../../package.json)\n' },
                    },
                },
            };
            const filesystem = createMemFs(projectTree);
            const projectFileSystem = new FileSystem(Path.from('/project'), filesystem);
            const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('spec'));

            const run = makeRun([
                { name: 'test a', path: '/project/spec/dashboard/kpis.spec.ts', line: 1 },
                { name: 'test b', path: '/project/spec/example.spec.ts', line: 2 },
            ]);

            const tree = buildCapabilities(run, [run], hierarchy, projectFileSystem);
            const dashboardNode = tree.children!.find(c => c.name === 'dashboard')!;
            expect(dashboardNode.readme).toContain('href="../../package.json"');
        });
    });

    test.describe('other links', () => {

        test('does not transform links to non-spec files within specDirectory', () => {
            const tree = buildWithRootReadme('[Utils](./helpers/utils.ts)');
            expect(tree.readme).toContain('href="./helpers/utils.ts"');
        });

        test('preserves link title attribute', () => {
            const tree = buildWithRootReadme('[Dashboard](./dashboard/ "Go to dashboard")');
            expect(tree.readme).toContain('title="Go to dashboard"');
            expect(tree.readme).toContain('href="#/capabilities?path=dashboard"');
        });
    });

    test.describe('nested README resolution', () => {

        test('resolves sibling directory links relative to the README location', () => {
            const projectTree = {
                '/project': {
                    spec: {
                        'example.spec.ts': '',
                        dashboard: { 'kpis.spec.ts': '', 'readme.md': '[Scenarios](../scenarios/)\n' },
                        scenarios: { 'finding.spec.ts': '' },
                    },
                },
            };
            const filesystem = createMemFs(projectTree);
            const projectFileSystem = new FileSystem(Path.from('/project'), filesystem);
            const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('spec'));

            const run = makeRun([
                { name: 'test a', path: '/project/spec/dashboard/kpis.spec.ts', line: 1 },
                { name: 'test b', path: '/project/spec/scenarios/finding.spec.ts', line: 1 },
                { name: 'test c', path: '/project/spec/example.spec.ts', line: 2 },
            ]);

            const tree = buildCapabilities(run, [run], hierarchy, projectFileSystem);
            const dashboardNode = tree.children!.find(c => c.name === 'dashboard')!;
            expect(dashboardNode.readme).toContain('href="#/capabilities?path=scenarios"');
        });

        test('resolves spec file links relative to the README location', () => {
            const projectTree = {
                '/project': {
                    spec: {
                        'example.spec.ts': '',
                        dashboard: { 'kpis.spec.ts': '', 'readme.md': '[KPI tests](./kpis.spec.ts)\n' },
                    },
                },
            };
            const filesystem = createMemFs(projectTree);
            const projectFileSystem = new FileSystem(Path.from('/project'), filesystem);
            const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('spec'));

            const run = makeRun([
                { name: 'test a', path: '/project/spec/dashboard/kpis.spec.ts', line: 1 },
                { name: 'test b', path: '/project/spec/example.spec.ts', line: 2 },
            ]);

            const tree = buildCapabilities(run, [run], hierarchy, projectFileSystem);
            const dashboardNode = tree.children!.find(c => c.name === 'dashboard')!;
            expect(dashboardNode.readme).toContain(encodeURIComponent('"dashboard/kpis.spec.ts"'));
        });
    });

    test.describe('case-insensitive README detection', () => {

        test('loads README.md with uppercase filename', () => {
            const projectTree = {
                '/project': {
                    spec: {
                        'README.md': '# Project\n\n[Dashboard](./dashboard/)',
                        'example.spec.ts': '',
                        dashboard: { 'kpis.spec.ts': '' },
                    },
                },
            };
            const filesystem = createMemFs(projectTree);
            const projectFileSystem = new FileSystem(Path.from('/project'), filesystem);
            const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('spec'));

            const run = makeRun([
                { name: 'test a', path: '/project/spec/dashboard/kpis.spec.ts', line: 1 },
                { name: 'test b', path: '/project/spec/example.spec.ts', line: 2 },
            ]);

            const tree = buildCapabilities(run, [run], hierarchy, projectFileSystem);
            expect(tree.displayName).toEqual('Project');
            expect(tree.readme).toContain('href="#/capabilities?path=dashboard"');
        });

        test('loads README.md with uppercase filename in subdirectory', () => {
            const projectTree = {
                '/project': {
                    spec: {
                        'example.spec.ts': '',
                        e2e: { 'purchase.spec.ts': '', 'README.md': '# End-to-End Flows\n\nFull journey tests.' },
                    },
                },
            };
            const filesystem = createMemFs(projectTree);
            const projectFileSystem = new FileSystem(Path.from('/project'), filesystem);
            const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('spec'));

            const run = makeRun([
                { name: 'test a', path: '/project/spec/e2e/purchase.spec.ts', line: 1 },
                { name: 'test b', path: '/project/spec/example.spec.ts', line: 2 },
            ]);

            const tree = buildCapabilities(run, [run], hierarchy, projectFileSystem);
            const e2eNode = tree.children!.find(c => c.name === 'e2e')!;
            expect(e2eNode.displayName).toEqual('End-to-End Flows');
            expect(e2eNode.readme).toContain('Full journey tests.');
        });
    });
});
