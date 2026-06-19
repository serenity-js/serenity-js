import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

import { CIDetector } from '../src/CiDetector.js';

describe('CIDetector', () => {

    describe('isCI()', () => {

        it('returns false when no CI environment variables are set', () => {
            const detector = new CIDetector({});

            expect(detector.isCI()).to.equal(false);
        });

        it('returns true when GITHUB_ACTIONS is set', () => {
            const detector = new CIDetector({ GITHUB_ACTIONS: 'true' });

            expect(detector.isCI()).to.equal(true);
        });

        it('returns true when GITLAB_CI is set', () => {
            const detector = new CIDetector({ GITLAB_CI: 'true' });

            expect(detector.isCI()).to.equal(true);
        });

        it('returns true when JENKINS_URL is set', () => {
            const detector = new CIDetector({ JENKINS_URL: 'http://jenkins.example.com' });

            expect(detector.isCI()).to.equal(true);
        });

        it('returns true when CIRCLECI is set', () => {
            const detector = new CIDetector({ CIRCLECI: 'true' });

            expect(detector.isCI()).to.equal(true);
        });
    });

    describe('detect()', () => {

        it('detects GitHub Actions metadata', () => {
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

            expect(context.provider).to.equal('GitHub Actions');
            expect(context.buildNumber).to.equal('142');
            expect(context.branch).to.equal('main');
            expect(context.commit).to.equal('abc123de');
            expect(context.jobUrl).to.equal('https://github.com/serenity-js/serenity-js/actions/runs/9876543210');
            expect(context.workflow).to.equal('CI');
            expect(context.repositoryUrl).to.equal('https://github.com/serenity-js/serenity-js');
            expect(context.triggeredBy).to.equal('jan-molak');
        });

        it('detects GitLab CI metadata', () => {
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

            expect(context.provider).to.equal('GitLab CI');
            expect(context.buildNumber).to.equal('55');
            expect(context.branch).to.equal('feature/login');
            expect(context.commit).to.equal('a1b2c3d4');
            expect(context.commitMessage).to.equal('fix: resolve login issue');
            expect(context.commitAuthor).to.equal('Jan Molak');
            expect(context.jobUrl).to.equal('https://gitlab.com/org/repo/-/jobs/123');
            expect(context.workflow).to.equal('default');
            expect(context.repositoryUrl).to.equal('https://gitlab.com/org/repo');
            expect(context.pullRequestNumber).to.equal('42');
            expect(context.baseBranch).to.equal('main');
            expect(context.triggeredBy).to.equal('jan.molak');
        });

        it('detects Jenkins metadata', () => {
            const detector = new CIDetector({
                JENKINS_URL: 'http://jenkins.example.com',
                BUILD_NUMBER: '301',
                GIT_BRANCH: 'origin/main',
                GIT_COMMIT: 'deadbeef12345678',
                BUILD_URL: 'http://jenkins.example.com/job/my-project/301/',
            });

            const context = detector.detect();

            expect(context.provider).to.equal('Jenkins');
            expect(context.buildNumber).to.equal('301');
            expect(context.branch).to.equal('origin/main');
            expect(context.commit).to.equal('deadbeef');
            expect(context.jobUrl).to.equal('http://jenkins.example.com/job/my-project/301/');
        });

        it('detects CircleCI metadata', () => {
            const detector = new CIDetector({
                CIRCLECI: 'true',
                CIRCLE_BUILD_NUM: '78',
                CIRCLE_BRANCH: 'develop',
                CIRCLE_SHA1: 'cafe1234abcdef00',
                CIRCLE_BUILD_URL: 'https://circleci.com/gh/org/repo/78',
            });

            const context = detector.detect();

            expect(context.provider).to.equal('CircleCI');
            expect(context.buildNumber).to.equal('78');
            expect(context.branch).to.equal('develop');
            expect(context.commit).to.equal('cafe1234');
            expect(context.jobUrl).to.equal('https://circleci.com/gh/org/repo/78');
        });

        it('provides local context when not running in CI', () => {
            const detector = new CIDetector({});

            const context = detector.detect();

            expect(context.provider).to.be.a('string').that.matches(/^localhost \(.+\)$/);
            expect(context.buildNumber).to.be.a('string').that.is.not.empty;
            expect(context.branch).to.be.a('string');
            expect(context.commit).to.be.a('string');
            expect(context.commitMessage).to.be.a('string');
            expect(context.commitAuthor).to.be.a('string');
            expect(context.repositoryUrl).to.be.a('string');
        });

        it('detects GitHub Actions pull request metadata', () => {
            const detector = new CIDetector({
                GITHUB_ACTIONS: 'true',
                GITHUB_RUN_NUMBER: '142',
                GITHUB_REF_NAME: '7/merge',
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

            expect(context.pullRequestNumber).to.equal('merge');
            expect(context.baseBranch).to.equal('main');
        });
    });
});
