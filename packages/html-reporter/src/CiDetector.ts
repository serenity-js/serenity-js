import { execSync } from 'node:child_process';
import { hostname } from 'node:os';

/**
 * Runtime context for a test run executed in a CI environment.
 */
export interface CIContext {
    provider: string;
    buildNumber: string;
    branch: string;
    commit: string;
    commitMessage?: string;
    jobUrl: string;
}

/**
 * Runtime context for a test run executed locally (not in CI).
 */
export interface LocalContext {
    provider: string;
    buildNumber: string;
    branch: string;
    commit: string;
    commitMessage: string;
}

export type RuntimeContext = CIContext | LocalContext;

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
            return {
                provider: 'GitHub Actions',
                buildNumber: this.env.GITHUB_RUN_NUMBER,
                branch: this.env.GITHUB_REF_NAME,
                commit: this.env.GITHUB_SHA?.slice(0, 8),
                jobUrl: `${ this.env.GITHUB_SERVER_URL }/${ this.env.GITHUB_REPOSITORY }/actions/runs/${ this.env.GITHUB_RUN_ID }`,
            };
        }

        if (this.env.GITLAB_CI) {
            return {
                provider: 'GitLab CI',
                buildNumber: this.env.CI_PIPELINE_IID,
                branch: this.env.CI_COMMIT_REF_NAME,
                commit: this.env.CI_COMMIT_SHORT_SHA,
                commitMessage: this.env.CI_COMMIT_MESSAGE,
                jobUrl: this.env.CI_JOB_URL,
            };
        }

        if (this.env.JENKINS_URL) {
            return {
                provider: 'Jenkins',
                buildNumber: this.env.BUILD_NUMBER,
                branch: this.env.GIT_BRANCH,
                commit: this.env.GIT_COMMIT?.slice(0, 8),
                jobUrl: this.env.BUILD_URL,
            };
        }

        if (this.env.CIRCLECI) {
            return {
                provider: 'CircleCI',
                buildNumber: this.env.CIRCLE_BUILD_NUM,
                branch: this.env.CIRCLE_BRANCH,
                commit: this.env.CIRCLE_SHA1?.slice(0, 8),
                jobUrl: this.env.CIRCLE_BUILD_URL,
            };
        }

        return this.detectLocal();
    }

    private detectLocal(): LocalContext {
        return {
            provider: hostname(),
            buildNumber: new Date().toISOString().slice(0, 16).replace('T', ' '),
            branch: this.git('rev-parse --abbrev-ref HEAD'),
            commit: this.git('rev-parse --short HEAD'),
            commitMessage: this.git('log -1 --pretty=%s'),
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
