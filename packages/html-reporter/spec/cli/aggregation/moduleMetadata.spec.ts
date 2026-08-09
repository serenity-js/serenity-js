import { expect, test } from '@playwright/test';

import { aggregateModuleMetadata } from '../../../src/cli/aggregation/moduleMetadata.js';
import type { RunData } from '../../../src/cli/model/RunData.js';

function minimalRun(overrides: Partial<RunData> = {}): RunData {
    return {
        schemaVersion: 1,
        startedAt: '2024-06-15T14:30:00.000Z',
        finishedAt: '2024-06-15T14:31:00.000Z',
        outcomes: { passed: 10, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
        scenes: [],
        tags: [],
        ...overrides,
    } as RunData;
}

test.describe('aggregateModuleMetadata', () => {

    test('sorts modules in natural order (numeric segments sorted numerically)', () => {
        const runs = [
            minimalRun({ moduleId: 'cucumber-10', startedAt: '2024-06-15T14:30:00.000Z' }),
            minimalRun({ moduleId: 'cucumber-2', startedAt: '2024-06-15T14:30:01.000Z' }),
            minimalRun({ moduleId: 'cucumber-1', startedAt: '2024-06-15T14:30:02.000Z' }),
            minimalRun({ moduleId: 'cucumber-9', startedAt: '2024-06-15T14:30:03.000Z' }),
            minimalRun({ moduleId: 'html-reporter', startedAt: '2024-06-15T14:30:04.000Z' }),
            minimalRun({ moduleId: 'cucumber-3', startedAt: '2024-06-15T14:30:05.000Z' }),
        ];

        const result = aggregateModuleMetadata(runs);

        expect(result.map(m => m.moduleId)).toEqual([
            'cucumber-1',
            'cucumber-2',
            'cucumber-3',
            'cucumber-9',
            'cucumber-10',
            'html-reporter',
        ]);
    });

    test('sorts modules with mixed prefixes naturally', () => {
        const runs = [
            minimalRun({ moduleId: 'webdriverio-web', startedAt: '2024-06-15T14:30:00.000Z' }),
            minimalRun({ moduleId: 'cucumber-13', startedAt: '2024-06-15T14:30:01.000Z' }),
            minimalRun({ moduleId: 'cucumber-2', startedAt: '2024-06-15T14:30:02.000Z' }),
            minimalRun({ moduleId: 'jasmine', startedAt: '2024-06-15T14:30:03.000Z' }),
            minimalRun({ moduleId: 'playwright-test', startedAt: '2024-06-15T14:30:04.000Z' }),
            minimalRun({ moduleId: 'cucumber-1', startedAt: '2024-06-15T14:30:05.000Z' }),
        ];

        const result = aggregateModuleMetadata(runs);

        expect(result.map(m => m.moduleId)).toEqual([
            'cucumber-1',
            'cucumber-2',
            'cucumber-13',
            'jasmine',
            'playwright-test',
            'webdriverio-web',
        ]);
    });
});
