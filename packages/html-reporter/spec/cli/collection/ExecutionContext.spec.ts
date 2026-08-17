import { expect, test } from '@playwright/test';

import { ExecutionContext } from '../../../src/cli/collection/ExecutionContext.js';

test.describe('ExecutionContext', () => {

    test.describe('testRunId detection', () => {

        test('detects GITHUB_RUN_NUMBER', () => {
            const context = new ExecutionContext({}, { GITHUB_RUN_NUMBER: '4142' });
            expect(context.testRunId).toBe('4142');
        });

        test('detects CI_PIPELINE_IID (GitLab)', () => {
            const context = new ExecutionContext({}, { CI_PIPELINE_IID: '789' });
            expect(context.testRunId).toBe('789');
        });

        test('detects BUILD_NUMBER (Jenkins)', () => {
            const context = new ExecutionContext({}, { BUILD_NUMBER: '100' });
            expect(context.testRunId).toBe('100');
        });

        test('detects CIRCLE_BUILD_NUM (CircleCI)', () => {
            const context = new ExecutionContext({}, { CIRCLE_BUILD_NUM: '55' });
            expect(context.testRunId).toBe('55');
        });

        test('prefers GITHUB_RUN_NUMBER over other CI variables', () => {
            const context = new ExecutionContext({}, { GITHUB_RUN_NUMBER: '10', BUILD_NUMBER: '20' });
            expect(context.testRunId).toBe('10');
        });

        test('returns undefined when no CI env vars are set', () => {
            const context = new ExecutionContext({}, {});
            expect(context.testRunId).toBeUndefined();
        });

        test('uses explicit override over env detection', () => {
            const context = new ExecutionContext({ testRunId: 'explicit-42' }, { GITHUB_RUN_NUMBER: '999' });
            expect(context.testRunId).toBe('explicit-42');
        });
    });

    test.describe('moduleId detection', () => {

        test('derives moduleId from working directory basename when CI is detected', () => {
            const context = new ExecutionContext({}, { GITHUB_RUN_NUMBER: '4142' });
            // moduleId defaults to cwd basename when testRunId is detected
            expect(context.moduleId).toBeDefined();
            expect(context.moduleId).not.toBe('');
        });

        test('returns undefined when no CI env vars are set', () => {
            const context = new ExecutionContext({}, {});
            expect(context.moduleId).toBeUndefined();
        });

        test('uses explicit override over env detection', () => {
            const context = new ExecutionContext({ moduleId: 'api-tests' }, { GITHUB_RUN_NUMBER: '4142' });
            expect(context.moduleId).toBe('api-tests');
        });

        test('does not derive moduleId when testRunId is explicitly overridden', () => {
            // When testRunId is explicit (user-provided), don't auto-derive moduleId
            // because the user is managing their own directory structure
            const context = new ExecutionContext({ testRunId: 'my-run' }, {});
            expect(context.moduleId).toBeUndefined();
        });
    });

    test.describe('attempt detection', () => {

        test('detects GITHUB_RUN_ATTEMPT', () => {
            const context = new ExecutionContext({}, { GITHUB_RUN_ATTEMPT: '3' });
            expect(context.attempt).toBe(3);
        });

        test('detects CI_JOB_RETRY (GitLab, 0-based)', () => {
            const context = new ExecutionContext({}, { CI_JOB_RETRY: '2' });
            expect(context.attempt).toBe(3); // 0-based → 1-based
        });

        test('detects BUILD_RETRY_COUNT (Jenkins, 0-based)', () => {
            const context = new ExecutionContext({}, { BUILD_RETRY_COUNT: '1' });
            expect(context.attempt).toBe(2); // 0-based → 1-based
        });

        test('defaults to 1 when no retry env vars are set', () => {
            const context = new ExecutionContext({}, {});
            expect(context.attempt).toBe(1);
        });
    });

    test.describe('workerId detection', () => {

        test('detects WDIO_WORKER_ID', () => {
            const context = new ExecutionContext({}, { WDIO_WORKER_ID: '0-5' });
            expect(context.workerId).toBe('0-5');
        });

        test('returns undefined when WDIO_WORKER_ID is not set', () => {
            const context = new ExecutionContext({}, {});
            expect(context.workerId).toBeUndefined();
        });
    });
});
