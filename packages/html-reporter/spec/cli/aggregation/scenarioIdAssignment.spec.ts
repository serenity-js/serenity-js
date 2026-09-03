import type * as fs from 'node:fs';

import { expect, test } from '@playwright/test';
import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import { ExecutionSuccessful } from '@serenity-js/core/model';
import { createFsFromVolume, Volume } from 'memfs';

import { SingleSourceAggregator } from '../../../src/cli/aggregation/SingleSourceAggregator.js';
import type { ReportData } from '../../../src/cli/reporting/ReportData.js';

function createMemFs(tree: Record<string, unknown>, root = '/'): typeof fs {
    return createFsFromVolume(Volume.fromNestedJSON(tree as any, root)) as unknown as typeof fs;
}

const outputDirectory = Path.from('/reports/serenity-js');

const defaultSystemContext = {
    nodeVersion: 'v22.0.0',
    os: { name: 'linux', version: '6.0.0', arch: 'x64' },
    serenityVersion: '3.44.0',
    runtime: { provider: 'node', version: 'v22.0.0' },
};

function runData(data: Record<string, unknown>): string {
    return JSON.stringify({
        schemaVersion: 1,
        systemContext: defaultSystemContext,
        ...data,
    });
}

function readDataJs(filesystem: typeof fs): ReportData {
    const content = filesystem.readFileSync('/reports/serenity-js/data.js', 'utf8') as string;
    const json = content.replace(/^window\.__SERENITY_REPORT_DATA__\s*=\s*/, '').replace(/;\s*$/, '');
    return JSON.parse(json) as ReportData;
}

test.describe('ReportAggregator — scenario id assignment', () => {

    test('sets a unique id on each scenario based on collision-aware identity', () => {
        const filesystem = createMemFs({
            [outputDirectory.value]: {
                'test-runs': {
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': runData({
                            startedAt: '2024-06-15T14:30:00.000Z',
                            finishedAt: '2024-06-15T14:30:01.000Z',
                            outcomes: { passed: 3, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            scenes: [
                                { name: 'unique test', category: 'Suite', outcome: { code: ExecutionSuccessful.Code }, duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'spec/a.spec.ts', line: 10 }, tags: [], activities: [] },
                                { name: 'should have no violations at /home', category: 'Suite', outcome: { code: ExecutionSuccessful.Code }, duration: 100, startedAt: '2024-06-15T14:30:00.100Z', source: { path: 'spec/a11y.spec.ts', line: 35 }, tags: [], activities: [] },
                                { name: 'should have no violations at /about', category: 'Suite', outcome: { code: ExecutionSuccessful.Code }, duration: 100, startedAt: '2024-06-15T14:30:00.200Z', source: { path: 'spec/a11y.spec.ts', line: 35 }, tags: [], activities: [] },
                            ],
                            tags: [],
                            testRunner: { name: 'Playwright', version: '1.50.0' },
                        }),
                    },
                },
            },
        });

        const fileSystem = new FileSystem(outputDirectory, filesystem);
        const projectFileSystem = new FileSystem(Path.from('/'), filesystem);
        const hierarchy = new RequirementsHierarchy(projectFileSystem);

        const aggregator = new SingleSourceAggregator(fileSystem, { consistencyWindow: 5, buildCapabilities: false }, hierarchy, () => undefined);
        aggregator.aggregate();

        const data = readDataJs(filesystem);

        // Non-colliding scene uses path:line identity
        const uniqueScenario = data.scenarios.find(s => s.name === 'unique test');
        expect(uniqueScenario.id).toBe('spec/a.spec.ts:10');

        // Colliding scenes use path:line:name identity to disambiguate
        const homeScenario = data.scenarios.find(s => s.name === 'should have no violations at /home');
        const aboutScenario = data.scenarios.find(s => s.name === 'should have no violations at /about');
        expect(homeScenario.id).toBe('spec/a11y.spec.ts:35:should have no violations at /home');
        expect(aboutScenario.id).toBe('spec/a11y.spec.ts:35:should have no violations at /about');

        // All ids are distinct
        const ids = data.scenarios.map(s => s.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});
