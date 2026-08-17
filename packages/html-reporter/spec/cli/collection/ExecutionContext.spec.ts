import { expect, test } from '@playwright/test';

import type { ExecutionContext } from '../../../src/cli/collection/ExecutionContext.js';
import { AutoDiscoveredExecutionContext } from '../../../src/cli/collection/ExecutionContext.js';

test.describe('AutoDiscoveredExecutionContext', () => {

    test.describe('testRunId detection', () => {

        test('detects GITHUB_RUN_NUMBER', () => {
            const context = new AutoDiscoveredExecutionContext({}, { GITHUB_RUN_NUMBER: '4142' });
            expect(context.testRunId).toBe('4142');
        });

        test('detects CI_PIPELINE_IID (GitLab)', () => {
            const context = new AutoDiscoveredExecutionContext({}, { CI_PIPELINE_IID: '789' });
            expect(context.testRunId).toBe('789');
        });

        test('detects BUILD_NUMBER (Jenkins)', () => {
            const context = new AutoDiscoveredExecutionContext({}, { BUILD_NUMBER: '100' });
            expect(context.testRunId).toBe('100');
        });

        test('detects CIRCLE_BUILD_NUM (CircleCI)', () => {
            const context = new AutoDiscoveredExecutionContext({}, { CIRCLE_BUILD_NUM: '55' });
            expect(context.testRunId).toBe('55');
        });

        test('prefers GITHUB_RUN_NUMBER over other CI variables', () => {
            const context = new AutoDiscoveredExecutionContext({}, { GITHUB_RUN_NUMBER: '10', BUILD_NUMBER: '20' });
            expect(context.testRunId).toBe('10');
        });

        test('returns undefined when no CI env vars are set', () => {
            const context = new AutoDiscoveredExecutionContext({}, {});
            expect(context.testRunId).toBeUndefined();
        });

        test('uses explicit override over env detection', () => {
            const context = new AutoDiscoveredExecutionContext({ testRunId: 'explicit-42' }, { GITHUB_RUN_NUMBER: '999' });
            expect(context.testRunId).toBe('explicit-42');
        });
    });

    test.describe('moduleId detection', () => {

        test('derives moduleId from working directory basename when CI is detected', () => {
            const context = new AutoDiscoveredExecutionContext({}, { GITHUB_RUN_NUMBER: '4142' });
            // moduleId defaults to cwd basename when testRunId is detected
            expect(context.moduleId).toBeDefined();
            expect(context.moduleId).not.toBe('');
        });

        test('returns undefined when no CI env vars are set', () => {
            const context = new AutoDiscoveredExecutionContext({}, {});
            expect(context.moduleId).toBeUndefined();
        });

        test('uses explicit override over env detection', () => {
            const context = new AutoDiscoveredExecutionContext({ moduleId: 'api-tests' }, { GITHUB_RUN_NUMBER: '4142' });
            expect(context.moduleId).toBe('api-tests');
        });

        test('derives moduleId from working directory when testRunId is explicitly overridden', () => {
            const context = new AutoDiscoveredExecutionContext({ testRunId: 'my-run' }, {});
            expect(context.moduleId).toBeDefined();
        });
    });

    test.describe('attempt detection', () => {

        test('detects GITHUB_RUN_ATTEMPT', () => {
            const context = new AutoDiscoveredExecutionContext({}, { GITHUB_RUN_ATTEMPT: '3' });
            expect(context.attempt).toBe(3);
        });

        test('detects CI_JOB_RETRY (GitLab, 0-based)', () => {
            const context = new AutoDiscoveredExecutionContext({}, { CI_JOB_RETRY: '2' });
            expect(context.attempt).toBe(3); // 0-based → 1-based
        });

        test('detects BUILD_RETRY_COUNT (Jenkins, 0-based)', () => {
            const context = new AutoDiscoveredExecutionContext({}, { BUILD_RETRY_COUNT: '1' });
            expect(context.attempt).toBe(2); // 0-based → 1-based
        });

        test('defaults to 1 when no retry env vars are set', () => {
            const context = new AutoDiscoveredExecutionContext({}, {});
            expect(context.attempt).toBe(1);
        });
    });

    test.describe('workerId detection', () => {

        test('detects WDIO_WORKER_ID', () => {
            const context = new AutoDiscoveredExecutionContext({}, { WDIO_WORKER_ID: '0-5' });
            expect(context.workerId).toBe('0-5');
        });

        test('returns undefined when WDIO_WORKER_ID is not set', () => {
            const context = new AutoDiscoveredExecutionContext({}, {});
            expect(context.workerId).toBeUndefined();
        });
    });

    test.describe('runtimeContext detection', () => {

        test('detects GitHub Actions runtime context from environment', () => {
            const context = new AutoDiscoveredExecutionContext({}, {
                GITHUB_ACTIONS: 'true',
                GITHUB_RUN_NUMBER: '42',
                GITHUB_REF_NAME: 'main',
                GITHUB_SHA: 'abc123def456',
                GITHUB_SERVER_URL: 'https://github.com',
                GITHUB_REPOSITORY: 'org/repo',
                GITHUB_RUN_ID: '999',
                GITHUB_WORKFLOW: 'CI',
                GITHUB_ACTOR: 'jan',
            });

            expect(context.runtimeContext.provider).toBe('GitHub Actions');
            expect(context.runtimeContext.buildNumber).toBe('42');
            expect(context.runtimeContext.branch).toBe('main');
            expect(context.runtimeContext.commit).toBe('abc123def456');
            expect(context.runtimeContext.jobUrl).toBe('https://github.com/org/repo/actions/runs/999');
            expect(context.runtimeContext.workflow).toBe('CI');
            expect(context.runtimeContext.triggeredBy).toBe('jan');
        });

        test('detects GitLab CI runtime context from environment', () => {
            const context = new AutoDiscoveredExecutionContext({}, {
                GITLAB_CI: 'true',
                CI_PIPELINE_IID: '789',
                CI_COMMIT_REF_NAME: 'feature/login',
                CI_COMMIT_SHORT_SHA: 'deadbeef',
                CI_JOB_URL: 'https://gitlab.com/org/repo/-/jobs/123',
            });

            expect(context.runtimeContext.provider).toBe('GitLab CI');
            expect(context.runtimeContext.buildNumber).toBe('789');
            expect(context.runtimeContext.branch).toBe('feature/login');
            expect(context.runtimeContext.commit).toBe('deadbeef');
        });

        test('provides local runtime context when no CI environment is detected', () => {
            const context = new AutoDiscoveredExecutionContext({}, {});

            expect(context.runtimeContext.provider).toContain('localhost');
            expect(context.runtimeContext.branch).toBeDefined();
            expect(context.runtimeContext.commit).toBeDefined();
        });

        test('applies ci overrides on top of detected runtime context', () => {
            const context = new AutoDiscoveredExecutionContext({
                ci: {
                    provider: 'Custom CI',
                    branch: 'release/1.0',
                },
            }, {
                GITHUB_ACTIONS: 'true',
                GITHUB_RUN_NUMBER: '42',
                GITHUB_REF_NAME: 'main',
                GITHUB_SHA: 'abc123',
                GITHUB_SERVER_URL: 'https://github.com',
                GITHUB_REPOSITORY: 'org/repo',
                GITHUB_RUN_ID: '999',
            });

            // Overrides should replace detected values
            expect(context.runtimeContext.provider).toBe('Custom CI');
            expect(context.runtimeContext.branch).toBe('release/1.0');
            // Non-overridden values should come from detection
            expect(context.runtimeContext.commit).toBe('abc123');
        });

        test('applies ci overrides on top of local runtime context', () => {
            const context = new AutoDiscoveredExecutionContext({
                ci: {
                    provider: 'TeamCity',
                    buildNumber: '500',
                },
            }, {});

            expect(context.runtimeContext.provider).toBe('TeamCity');
            expect(context.runtimeContext.buildNumber).toBe('500');
            // Non-overridden values still come from local detection (git)
            expect(context.runtimeContext.branch).toBeDefined();
            expect(context.runtimeContext.commit).toBeDefined();
        });

        test('returns the same runtimeContext instance on repeated access', () => {
            const context = new AutoDiscoveredExecutionContext({}, {
                GITHUB_ACTIONS: 'true',
                GITHUB_RUN_NUMBER: '42',
                GITHUB_REF_NAME: 'main',
                GITHUB_SHA: 'abc123',
                GITHUB_SERVER_URL: 'https://github.com',
                GITHUB_REPOSITORY: 'org/repo',
                GITHUB_RUN_ID: '999',
            });

            const first = context.runtimeContext;
            const second = context.runtimeContext;

            expect(first).toBe(second);
        });
    });

    test.describe('implements ExecutionContext interface', () => {

        test('is assignable to ExecutionContext', () => {
            const context: ExecutionContext = new AutoDiscoveredExecutionContext({
                testRunId: '4142',
                moduleId: 'my-project',
            }, {
                GITHUB_RUN_ATTEMPT: '2',
                WDIO_WORKER_ID: '0-3',
                GITHUB_ACTIONS: 'true',
                GITHUB_RUN_NUMBER: '4142',
                GITHUB_REF_NAME: 'main',
                GITHUB_SHA: 'abc123',
                GITHUB_SERVER_URL: 'https://github.com',
                GITHUB_REPOSITORY: 'org/repo',
                GITHUB_RUN_ID: '999',
            });

            expect(context.testRunId).toBe('4142');
            expect(context.moduleId).toBe('my-project');
            expect(context.attempt).toBe(2);
            expect(context.workerId).toBe('0-3');
            expect(context.runtimeContext.provider).toBe('GitHub Actions');
            expect(context.runtimeContext.branch).toBe('main');
            expect(context.runtimeContext.commit).toBe('abc123');
        });

        test('returns undefined values when no CI is detected and no overrides', () => {
            const context: ExecutionContext = new AutoDiscoveredExecutionContext({}, {});

            expect(context.testRunId).toBeUndefined();
            expect(context.moduleId).toBeUndefined();
            expect(context.attempt).toBe(1);
            expect(context.workerId).toBeUndefined();
            expect(context.runtimeContext).toBeDefined();
            expect(context.runtimeContext.provider).toContain('localhost');
        });
    });
});
