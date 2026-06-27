/**
 * Test data factories for component tests.
 * Produces minimal valid DATA objects for individual component rendering.
 * Modelled after the real data.js produced by DataSnapshotAggregator.
 */

import type { ReportData } from '../../src/ReportData';

export function minimalData(overrides: Partial<ReportData> & Record<string, unknown> = {}): ReportData {
    return {
        summary: {
            title: 'Test Project',
            totalScenarios: 4,
            outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
            startedAt: '2024-06-15T14:30:00.000Z',
            finishedAt: '2024-06-15T14:30:01.000Z',
            duration: 1000,
            testRunner: 'Playwright',
            ...overrides.summary,
        },
        scenarios: overrides.scenarios || [
            {
                name: 'Test A', category: 'Suite', outcome: 'SUCCESS', duration: 100,
                startedAt: '2024-06-15T14:30:00.000Z',
                source: { path: 'spec/a.spec.ts' },
                tags: [{ type: 'feature', name: 'Login' }],
                activities: [],
                executionHistory: [
                    { outcome: 'SUCCESS', run: '#41' },
                    { outcome: 'SUCCESS', run: '#42' },
                ],
            },
            {
                name: 'Test B', category: 'Suite', outcome: 'SUCCESS', duration: 200,
                startedAt: '2024-06-15T14:30:00.100Z',
                source: { path: 'spec/a.spec.ts' },
                tags: [{ type: 'feature', name: 'Login' }],
                activities: [],
                executionHistory: [
                    { outcome: 'SUCCESS', run: '#41' },
                    { outcome: 'SUCCESS', run: '#42' },
                ],
            },
            {
                name: 'Test C', category: 'Other', outcome: 'SUCCESS', duration: 300,
                startedAt: '2024-06-15T14:30:00.300Z',
                source: { path: 'spec/b.spec.ts' },
                tags: [{ type: 'tag', name: 'smoke' }],
                activities: [],
                executionHistory: [
                    { outcome: 'SUCCESS', run: '#41' },
                    { outcome: 'SUCCESS', run: '#42' },
                ],
            },
            {
                name: 'Test D', category: 'Other', outcome: 'FAILURE', duration: 400,
                startedAt: '2024-06-15T14:30:00.600Z',
                source: { path: 'spec/b.spec.ts' },
                tags: [{ type: 'tag', name: 'smoke' }],
                activities: [],
                error: { name: 'AssertionError', message: 'Expected true to be false', stack: 'at Test (b.spec.ts:5)' },
                executionHistory: [
                    { outcome: 'SUCCESS', run: '#41' },
                    { outcome: 'FAILURE', run: '#42' },
                ],
            },
        ],
        history: overrides.history || [
            {
                timestamp: '2024-06-14T10:00:00.000Z',
                label: '#41',
                outcomes: { passed: 4, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                duration: 800,
                slowest: 300,
                fastest: 100,
                average: 200,
                commit: 'abc1233',
                branch: 'main',
                repositoryUrl: 'git@github.com:serenity-js/serenity-js.git',
                score: { confidence: 70, passRate: 80, stability: 75, completeness: 65 },
            },
            {
                timestamp: '2024-06-15T14:30:00.000Z',
                label: '#42',
                outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                duration: 1000,
                slowest: 400,
                fastest: 100,
                average: 250,
                commit: 'abc1234',
                branch: 'main',
                repositoryUrl: 'git@github.com:serenity-js/serenity-js.git',
                score: { confidence: 75, passRate: 75, stability: 80, completeness: 70 },
            },
        ],
        tags: overrides.tags || [
            { type: 'feature', name: 'Login', scenarioCount: 2, passed: 2 },
            { type: 'tag', name: 'smoke', scenarioCount: 2, passed: 1 },
        ],
        unstableTests: overrides.unstableTests || [],
        newFailures: overrides.newFailures || [],
        newPasses: overrides.newPasses || [],
        systemContext: 'systemContext' in overrides ? overrides.systemContext : {
            nodeVersion: 'v22.0.0',
            os: { name: 'darwin', version: '24.0.0', arch: 'arm64' },
            serenityVersion: '3.44.0',
            testRunner: { name: 'Playwright', version: '1.45.0' },
            browsers: [{ name: 'chromium', version: '126.0.1' }],
            ci: {
                provider: 'GitHub Actions',
                buildNumber: '42',
                branch: 'main',
                commit: 'abc1234',
                commitMessage: 'fix: resolve unstable test',
                repositoryUrl: 'git@github.com:serenity-js/serenity-js.git',
            },
            projectName: '@serenity-js/test-project',
            packageManager: 'pnpm',
        },
        requirements: overrides.requirements || null,
    };
}
