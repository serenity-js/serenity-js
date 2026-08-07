import { expect, test } from '@playwright/test';

import { CIDetector } from '../../../src/cli/collection/CiDetector.js';

test.describe('CIDetector', () => {

    test.describe('isCI()', () => {

        test('returns false when no CI environment variables are set', () => {
            const detector = new CIDetector({});
            expect(detector.isCI()).toBe(false);
        });

        test('returns true when GITHUB_ACTIONS is set', () => {
            const detector = new CIDetector({ GITHUB_ACTIONS: 'true' });
            expect(detector.isCI()).toBe(true);
        });

        test('returns true when GITLAB_CI is set', () => {
            const detector = new CIDetector({ GITLAB_CI: 'true' });
            expect(detector.isCI()).toBe(true);
        });

        test('returns true when JENKINS_URL is set', () => {
            const detector = new CIDetector({ JENKINS_URL: 'http://jenkins.example.com' });
            expect(detector.isCI()).toBe(true);
        });

        test('returns true when CIRCLECI is set', () => {
            const detector = new CIDetector({ CIRCLECI: 'true' });
            expect(detector.isCI()).toBe(true);
        });
    });

    test.describe('detect()', () => {

        test('detects GitHub Actions metadata', () => {
            const detector = new CIDetector({
                GITHUB_ACTIONS: 'true',
                GITHUB_RUN_NUMBER: '142',
                GITHUB_REF_NAME: 'main',
                GITHUB_SHA: 'abc123def456',
                GITHUB_SERVER_URL: 'https://github.com',
                GITHUB_REPOSITORY: 'serenity-js/serenity-js',
                GITHUB_RUN_ID: '9876543210',
                GITHUB_WORKFLOW: 'CI',
                GITHUB_ACTOR: 'jan-molak',
            });

            const context = detector.detect();

            expect(context.provider).toBe('GitHub Actions');
            expect(context.buildNumber).toBe('142');
            expect(context.branch).toBe('main');
            expect(context.commit).toBe('abc123def456');
            expect(context.jobUrl).toBe('https://github.com/serenity-js/serenity-js/actions/runs/9876543210');
            expect(context.workflow).toBe('CI');
            expect(context.repositoryUrl).toBe('https://github.com/serenity-js/serenity-js');
            expect(context.triggeredBy).toBe('jan-molak');
        });

        test('detects GitLab CI metadata', () => {
            const detector = new CIDetector({
                GITLAB_CI: 'true',
                CI_PIPELINE_IID: '55',
                CI_COMMIT_REF_NAME: 'feature/login',
                CI_COMMIT_SHORT_SHA: 'a1b2c3d4',
                CI_COMMIT_MESSAGE: 'fix: resolve login issue',
                CI_COMMIT_AUTHOR: 'Jan Molak',
                CI_JOB_URL: 'https://gitlab.com/org/repo/-/jobs/123',
                CI_PIPELINE_NAME: 'default',
                CI_PROJECT_URL: 'https://gitlab.com/org/repo',
                CI_MERGE_REQUEST_IID: '42',
                CI_MERGE_REQUEST_TARGET_BRANCH_NAME: 'main',
                GITLAB_USER_LOGIN: 'jan.molak',
            });

            const context = detector.detect();

            expect(context.provider).toBe('GitLab CI');
            expect(context.buildNumber).toBe('55');
            expect(context.branch).toBe('feature/login');
            expect(context.commit).toBe('a1b2c3d4');
            expect(context.commitMessage).toBe('fix: resolve login issue');
            expect(context.commitAuthor).toBe('Jan Molak');
            expect(context.jobUrl).toBe('https://gitlab.com/org/repo/-/jobs/123');
            expect(context.workflow).toBe('default');
            expect(context.repositoryUrl).toBe('https://gitlab.com/org/repo');
            expect(context.pullRequestNumber).toBe('42');
            expect(context.baseBranch).toBe('main');
            expect(context.triggeredBy).toBe('jan.molak');
        });

        test('detects Jenkins metadata', () => {
            const detector = new CIDetector({
                JENKINS_URL: 'http://jenkins.example.com',
                BUILD_NUMBER: '301',
                GIT_BRANCH: 'origin/main',
                GIT_COMMIT: 'deadbeef12345678',
                BUILD_URL: 'http://jenkins.example.com/job/my-project/301/',
            });

            const context = detector.detect();

            expect(context.provider).toBe('Jenkins');
            expect(context.buildNumber).toBe('301');
            expect(context.branch).toBe('origin/main');
            expect(context.commit).toBe('deadbeef12345678');
            expect(context.jobUrl).toBe('http://jenkins.example.com/job/my-project/301/');
        });

        test('detects CircleCI metadata', () => {
            const detector = new CIDetector({
                CIRCLECI: 'true',
                CIRCLE_BUILD_NUM: '78',
                CIRCLE_BRANCH: 'develop',
                CIRCLE_SHA1: 'cafe1234abcdef00',
                CIRCLE_BUILD_URL: 'https://circleci.com/gh/org/repo/78',
            });

            const context = detector.detect();

            expect(context.provider).toBe('CircleCI');
            expect(context.buildNumber).toBe('78');
            expect(context.branch).toBe('develop');
            expect(context.commit).toBe('cafe1234abcdef00');
            expect(context.jobUrl).toBe('https://circleci.com/gh/org/repo/78');
        });

        test('provides local context when not running in CI', () => {
            const detector = new CIDetector({});

            const context = detector.detect();

            expect(context.provider).toMatch(/^localhost \(.+\)$/);
            expect(context.buildNumber).toBeTruthy();
            expect(context.branch).toEqual(expect.any(String));
            expect(context.commit).toEqual(expect.any(String));
            expect(context.commitMessage).toEqual(expect.any(String));
            expect(context.commitAuthor).toEqual(expect.any(String));
            expect(context.repositoryUrl).toEqual(expect.any(String));
        });

        test('detects GitHub Actions pull request metadata', () => {
            const detector = new CIDetector({
                GITHUB_ACTIONS: 'true',
                GITHUB_RUN_NUMBER: '142',
                GITHUB_REF_NAME: '7/merge',
                GITHUB_HEAD_REF: 'feat/my-feature',
                GITHUB_SHA: 'abc123def456',
                GITHUB_SERVER_URL: 'https://github.com',
                GITHUB_REPOSITORY: 'serenity-js/serenity-js',
                GITHUB_RUN_ID: '9876543210',
                GITHUB_WORKFLOW: 'CI',
                GITHUB_ACTOR: 'jan-molak',
                GITHUB_EVENT_NAME: 'pull_request',
                GITHUB_BASE_REF: 'main',
            });

            const context = detector.detect();

            expect(context.branch).toBe('feat/my-feature');
            expect(context.pullRequestNumber).toBe('7');
            expect(context.pullRequestUrl).toBe('https://github.com/serenity-js/serenity-js/pull/7');
            expect(context.baseBranch).toBe('main');
        });
    });
});
