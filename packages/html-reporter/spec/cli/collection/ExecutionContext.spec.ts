import { expect, test } from '@playwright/test';

import { ExecutionContextDetector } from '../../../src/cli/collection/ExecutionContext.js';
import type { ExecutionContext } from '../../../src/cli/collection/ExecutionContext.js';
import type { RuntimeContext } from '../../../src/cli/collection/CiDetector.js';

test.describe('ExecutionContextDetector', () => {

    test.describe('testRunId detection', () => {

        test('detects GITHUB_RUN_NUMBER', () => {
            const detector = new ExecutionContextDetector({}, { GITHUB_RUN_NUMBER: '4142' });
            expect(detector.testRunId).toBe('4142');
        });

        test('detects CI_PIPELINE_IID (GitLab)', () => {
            const detector = new ExecutionContextDetector({}, { CI_PIPELINE_IID: '789' });
            expect(detector.testRunId).toBe('789');
        });

        test('detects BUILD_NUMBER (Jenkins)', () => {
            const detector = new ExecutionContextDetector({}, { BUILD_NUMBER: '100' });
            expect(detector.testRunId).toBe('100');
        });

        test('detects CIRCLE_BUILD_NUM (CircleCI)', () => {
            const detector = new ExecutionContextDetector({}, { CIRCLE_BUILD_NUM: '55' });
            expect(detector.testRunId).toBe('55');
        });

        test('prefers GITHUB_RUN_NUMBER over other CI variables', () => {
            const detector = new ExecutionContextDetector({}, { GITHUB_RUN_NUMBER: '10', BUILD_NUMBER: '20' });
            expect(detector.testRunId).toBe('10');
        });

        test('returns undefined when no CI env vars are set', () => {
            const detector = new ExecutionContextDetector({}, {});
            expect(detector.testRunId).toBeUndefined();
        });

        test('uses explicit override over env detection', () => {
            const detector = new ExecutionContextDetector({ testRunId: 'explicit-42' }, { GITHUB_RUN_NUMBER: '999' });
            expect(detector.testRunId).toBe('explicit-42');
        });
    });

    test.describe('moduleId detection', () => {

        test('derives moduleId from working directory basename when CI is detected', () => {
            const detector = new ExecutionContextDetector({}, { GITHUB_RUN_NUMBER: '4142' });
            // moduleId defaults to cwd basename when testRunId is detected
            expect(detector.moduleId).toBeDefined();
            expect(detector.moduleId).not.toBe('');
        });

        test('returns undefined when no CI env vars are set', () => {
            const detector = new ExecutionContextDetector({}, {});
            expect(detector.moduleId).toBeUndefined();
        });

        test('uses explicit override over env detection', () => {
            const detector = new ExecutionContextDetector({ moduleId: 'api-tests' }, { GITHUB_RUN_NUMBER: '4142' });
            expect(detector.moduleId).toBe('api-tests');
        });

        test('does not derive moduleId when testRunId is explicitly overridden', () => {
            // When testRunId is explicit (user-provided), don't auto-derive moduleId
            // because the user is managing their own directory structure
            const detector = new ExecutionContextDetector({ testRunId: 'my-run' }, {});
            expect(detector.moduleId).toBeUndefined();
        });
    });

    test.describe('attempt detection', () => {

        test('detects GITHUB_RUN_ATTEMPT', () => {
            const detector = new ExecutionContextDetector({}, { GITHUB_RUN_ATTEMPT: '3' });
            expect(detector.attempt).toBe(3);
        });

        test('detects CI_JOB_RETRY (GitLab, 0-based)', () => {
            const detector = new ExecutionContextDetector({}, { CI_JOB_RETRY: '2' });
            expect(detector.attempt).toBe(3); // 0-based → 1-based
        });

        test('detects BUILD_RETRY_COUNT (Jenkins, 0-based)', () => {
            const detector = new ExecutionContextDetector({}, { BUILD_RETRY_COUNT: '1' });
            expect(detector.attempt).toBe(2); // 0-based → 1-based
        });

        test('defaults to 1 when no retry env vars are set', () => {
            const detector = new ExecutionContextDetector({}, {});
            expect(detector.attempt).toBe(1);
        });
    });

    test.describe('workerId detection', () => {

        test('detects WDIO_WORKER_ID', () => {
            const detector = new ExecutionContextDetector({}, { WDIO_WORKER_ID: '0-5' });
            expect(detector.workerId).toBe('0-5');
        });

        test('returns undefined when WDIO_WORKER_ID is not set', () => {
            const detector = new ExecutionContextDetector({}, {});
            expect(detector.workerId).toBeUndefined();
        });
    });

    test.describe('runtimeContext detection', () => {

        test('detects GitHub Actions runtime context from environment', () => {
            const detector = new ExecutionContextDetector({}, {
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

            expect(detector.runtimeContext.provider).toBe('GitHub Actions');
            expect(detector.runtimeContext.buildNumber).toBe('42');
            expect(detector.runtimeContext.branch).toBe('main');
            expect(detector.runtimeContext.commit).toBe('abc123def456');
            expect(detector.runtimeContext.jobUrl).toBe('https://github.com/org/repo/actions/runs/999');
            expect(detector.runtimeContext.workflow).toBe('CI');
            expect(detector.runtimeContext.triggeredBy).toBe('jan');
        });

        test('detects GitLab CI runtime context from environment', () => {
            const detector = new ExecutionContextDetector({}, {
                GITLAB_CI: 'true',
                CI_PIPELINE_IID: '789',
                CI_COMMIT_REF_NAME: 'feature/login',
                CI_COMMIT_SHORT_SHA: 'deadbeef',
                CI_JOB_URL: 'https://gitlab.com/org/repo/-/jobs/123',
            });

            expect(detector.runtimeContext.provider).toBe('GitLab CI');
            expect(detector.runtimeContext.buildNumber).toBe('789');
            expect(detector.runtimeContext.branch).toBe('feature/login');
            expect(detector.runtimeContext.commit).toBe('deadbeef');
        });

        test('provides local runtime context when no CI environment is detected', () => {
            const detector = new ExecutionContextDetector({}, {});

            expect(detector.runtimeContext.provider).toContain('localhost');
            expect(detector.runtimeContext.branch).toBeDefined();
            expect(detector.runtimeContext.commit).toBeDefined();
        });

        test('applies ci overrides on top of detected runtime context', () => {
            const detector = new ExecutionContextDetector({
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
            expect(detector.runtimeContext.provider).toBe('Custom CI');
            expect(detector.runtimeContext.branch).toBe('release/1.0');
            // Non-overridden values should come from detection
            expect(detector.runtimeContext.commit).toBe('abc123');
        });

        test('applies ci overrides on top of local runtime context', () => {
            const detector = new ExecutionContextDetector({
                ci: {
                    provider: 'TeamCity',
                    buildNumber: '500',
                },
            }, {});

            expect(detector.runtimeContext.provider).toBe('TeamCity');
            expect(detector.runtimeContext.buildNumber).toBe('500');
            // Non-overridden values still come from local detection (git)
            expect(detector.runtimeContext.branch).toBeDefined();
            expect(detector.runtimeContext.commit).toBeDefined();
        });

        test('returns the same runtimeContext instance on repeated access', () => {
            const detector = new ExecutionContextDetector({}, {
                GITHUB_ACTIONS: 'true',
                GITHUB_RUN_NUMBER: '42',
                GITHUB_REF_NAME: 'main',
                GITHUB_SHA: 'abc123',
                GITHUB_SERVER_URL: 'https://github.com',
                GITHUB_REPOSITORY: 'org/repo',
                GITHUB_RUN_ID: '999',
            });

            const first = detector.runtimeContext;
            const second = detector.runtimeContext;

            expect(first).toBe(second);
        });
    });

    test.describe('.detect() method', () => {

        test('returns an ExecutionContext value with all detected fields', () => {
            const detector = new ExecutionContextDetector({
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

            const context: ExecutionContext = detector.detect();

            expect(context.testRunId).toBe('4142');
            expect(context.moduleId).toBe('my-project');
            expect(context.attempt).toBe(2);
            expect(context.workerId).toBe('0-3');
            expect(context.runtimeContext.provider).toBe('GitHub Actions');
            expect(context.runtimeContext.branch).toBe('main');
            expect(context.runtimeContext.commit).toBe('abc123');
        });

        test('returns an immutable value object (plain object, not the detector)', () => {
            const detector = new ExecutionContextDetector({}, {});
            const context = detector.detect();

            // Should not be the detector itself
            expect(context).not.toBe(detector);
            // Should have the required properties
            expect(context).toHaveProperty('testRunId');
            expect(context).toHaveProperty('moduleId');
            expect(context).toHaveProperty('attempt');
            expect(context).toHaveProperty('workerId');
            expect(context).toHaveProperty('runtimeContext');
        });

        test('detect() returns undefined values when no CI is detected and no overrides', () => {
            const detector = new ExecutionContextDetector({}, {});
            const context = detector.detect();

            expect(context.testRunId).toBeUndefined();
            expect(context.moduleId).toBeUndefined();
            expect(context.attempt).toBe(1);
            expect(context.workerId).toBeUndefined();
            expect(context.runtimeContext).toBeDefined();
            expect(context.runtimeContext.provider).toContain('localhost');
        });
    });
});
