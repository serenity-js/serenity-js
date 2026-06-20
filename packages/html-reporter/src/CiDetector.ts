import { execSync } from 'node:child_process';
import { hostname } from 'node:os';

/**
 * Runtime context for a test run.
 */
export interface RuntimeContext {
    provider: string;
    buildNumber: string;
    branch: string;
    commit: string;
    commitMessage?: string;
    commitAuthor?: string;
    jobUrl?: string;
    workflow?: string;
    repositoryUrl?: string;
    baseBranch?: string;
    pullRequestNumber?: string;
    pullRequestUrl?: string;
    triggeredBy?: string;
}

/**
 * Detects CI provider metadata from environment variables,
 * or provides sensible local defaults derived from git.
 *
 * @package
 */
export class CIDetector {

    constructor(private readonly env: Record<string, string | undefined>) {
    }

    isCI(): boolean {
        return Boolean(
            this.env.GITHUB_ACTIONS
            || this.env.GITLAB_CI
            || this.env.JENKINS_URL
            || this.env.CIRCLECI,
        );
    }

    detect(): RuntimeContext {
        if (this.env.GITHUB_ACTIONS) {
            const prNumber = this.env.GITHUB_EVENT_NAME === 'pull_request' ? this.env.GITHUB_REF_NAME?.replace(/.*\//, '') : undefined;
            const repoUrl = `${ this.env.GITHUB_SERVER_URL }/${ this.env.GITHUB_REPOSITORY }`;
            return {
                provider: 'GitHub Actions',
                buildNumber: this.env.GITHUB_RUN_NUMBER,
                branch: this.env.GITHUB_REF_NAME,
                commit: this.env.GITHUB_SHA?.slice(0, 8),
                commitMessage: this.git('log -1 --pretty=%s'),
                commitAuthor: this.git('log -1 --pretty=%an'),
                jobUrl: `${ repoUrl }/actions/runs/${ this.env.GITHUB_RUN_ID }`,
                workflow: this.env.GITHUB_WORKFLOW,
                repositoryUrl: repoUrl,
                baseBranch: this.env.GITHUB_BASE_REF || undefined,
                pullRequestNumber: prNumber,
                pullRequestUrl: prNumber ? `${ repoUrl }/pull/${ prNumber }` : undefined,
                triggeredBy: this.env.GITHUB_ACTOR,
            };
        }

        if (this.env.GITLAB_CI) {
            const mrIid = this.env.CI_MERGE_REQUEST_IID || undefined;
            return {
                provider: 'GitLab CI',
                buildNumber: this.env.CI_PIPELINE_IID,
                branch: this.env.CI_COMMIT_REF_NAME,
                commit: this.env.CI_COMMIT_SHORT_SHA,
                commitMessage: this.env.CI_COMMIT_MESSAGE,
                commitAuthor: this.env.CI_COMMIT_AUTHOR,
                jobUrl: this.env.CI_JOB_URL,
                workflow: this.env.CI_PIPELINE_NAME,
                repositoryUrl: this.env.CI_PROJECT_URL,
                baseBranch: this.env.CI_MERGE_REQUEST_TARGET_BRANCH_NAME || undefined,
                pullRequestNumber: mrIid,
                pullRequestUrl: mrIid && this.env.CI_PROJECT_URL ? `${ this.env.CI_PROJECT_URL }/-/merge_requests/${ mrIid }` : undefined,
                triggeredBy: this.env.GITLAB_USER_LOGIN,
            };
        }

        if (this.env.JENKINS_URL) {
            return {
                provider: 'Jenkins',
                buildNumber: this.env.BUILD_NUMBER,
                branch: this.env.GIT_BRANCH,
                commit: this.env.GIT_COMMIT?.slice(0, 8),
                commitMessage: this.git('log -1 --pretty=%s'),
                commitAuthor: this.git('log -1 --pretty=%an'),
                jobUrl: this.env.BUILD_URL,
                workflow: this.env.JOB_NAME,
                repositoryUrl: this.env.GIT_URL,
                pullRequestNumber: this.env.CHANGE_ID || undefined,
                pullRequestUrl: this.env.CHANGE_URL || undefined,
                triggeredBy: this.env.BUILD_USER || undefined,
            };
        }

        if (this.env.CIRCLECI) {
            return {
                provider: 'CircleCI',
                buildNumber: this.env.CIRCLE_BUILD_NUM,
                branch: this.env.CIRCLE_BRANCH,
                commit: this.env.CIRCLE_SHA1?.slice(0, 8),
                commitMessage: this.git('log -1 --pretty=%s'),
                commitAuthor: this.git('log -1 --pretty=%an'),
                jobUrl: this.env.CIRCLE_BUILD_URL,
                workflow: this.env.CIRCLE_WORKFLOW_ID,
                repositoryUrl: this.env.CIRCLE_REPOSITORY_URL,
                pullRequestNumber: this.env.CIRCLE_PR_NUMBER || undefined,
                pullRequestUrl: this.env.CIRCLE_PULL_REQUEST || undefined,
                triggeredBy: this.env.CIRCLE_USERNAME,
            };
        }

        return this.detectLocal();
    }

    private detectLocal(): RuntimeContext {
        return {
            provider: `localhost (${ hostname() })`,
            buildNumber: new Date().toISOString().slice(0, 16).replace('T', ' '),
            branch: this.git('rev-parse --abbrev-ref HEAD'),
            commit: this.git('rev-parse --short HEAD'),
            commitMessage: this.git('log -1 --pretty=%s'),
            commitAuthor: this.git('log -1 --pretty=%an'),
            repositoryUrl: this.git('remote get-url origin'),
        };
    }

    private git(command: string): string {
        try {
            return execSync(`git ${ command }`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
        } catch {
            return 'unknown';
        }
    }
}
