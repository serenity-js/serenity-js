import type * as fs from 'node:fs';

import { expect, test } from '@playwright/test';
import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import { ExecutionFailedWithAssertionError, ExecutionSuccessful } from '@serenity-js/core/model';
import { createFsFromVolume, Volume } from 'memfs';

import { buildCapabilities } from '../../src/cli/capabilities/buildCapabilities.js';
import type { RunData } from '../../src/cli/model/RunData.js';

function createMemFs(tree: Record<string, unknown>, root = '/'): typeof fs {
    return createFsFromVolume(Volume.fromNestedJSON(tree as any, root)) as unknown as typeof fs;
}

function makeRun(scenes: Array<{ name: string; path: string; line: number; outcomeCode?: number }>, testRunId = 'run-1'): RunData {
    return {
        startedAt: '2024-01-01T00:00:00.000Z',
        finishedAt: '2024-01-01T00:00:01.000Z',
        testRunId,
        outcomes: { passed: scenes.length, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
        scenes: scenes.map((s, i) => ({
            name: s.name,
            category: 'Suite',
            source: { path: s.path, line: s.line },
            outcome: { code: s.outcomeCode ?? ExecutionSuccessful.Code },
            tags: [],
            activities: [],
            startedAt: new Date(Date.parse('2024-01-01T00:00:00.000Z') + i * 100).toISOString(),
            duration: 100,
        })),
        tags: [],
        testRunner: { name: 'Playwright', version: '1.50.0' },
    } as unknown as RunData;
}

test.describe('buildCapabilities — execution history disambiguation', () => {

    test('disambiguates dynamically-generated tests sharing the same source line', () => {
        const tree = {
            '/project': {
                spec: {
                    'a11y.spec.ts': '',
                },
            },
        };

        const filesystem = createMemFs(tree);
        const projectFileSystem = new FileSystem(Path.from('/project'), filesystem);
        const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('spec'));

        // Historical run: two dynamic tests at same line, one passed, one failed
        const historicalRun = makeRun([
            { name: 'should have no violations at /home', path: '/project/spec/a11y.spec.ts', line: 35, outcomeCode: ExecutionSuccessful.Code },
            { name: 'should have no violations at /about', path: '/project/spec/a11y.spec.ts', line: 35, outcomeCode: ExecutionFailedWithAssertionError.Code },
        ], 'run-1');

        // Latest run: same two dynamic tests
        const latestRun = makeRun([
            { name: 'should have no violations at /home', path: '/project/spec/a11y.spec.ts', line: 35, outcomeCode: ExecutionSuccessful.Code },
            { name: 'should have no violations at /about', path: '/project/spec/a11y.spec.ts', line: 35, outcomeCode: ExecutionSuccessful.Code },
        ], 'run-2');

        const result = buildCapabilities(latestRun, [historicalRun, latestRun], hierarchy);

        // The hierarchy strips the file extension — node name is 'a11y'
        const fileNode = result.children?.find(c => c.name === 'a11y');
        expect(fileNode).toBeDefined();
        expect(fileNode.scenarios).toHaveLength(2);

        // Each scenario should have its own distinct history
        const homeScenario = fileNode.scenarios.find(s => s.name === 'should have no violations at /home');
        const aboutScenario = fileNode.scenarios.find(s => s.name === 'should have no violations at /about');

        expect(homeScenario).toBeDefined();
        expect(aboutScenario).toBeDefined();

        // History: [historicalRun, latestRun]
        // Home passed in both runs
        expect(homeScenario.executionHistory).toEqual(['SUCCESS', 'SUCCESS']);
        // About failed in historical run, passed in latest
        expect(aboutScenario.executionHistory).toEqual(['FAILURE', 'SUCCESS']);
    });
});
