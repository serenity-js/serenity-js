import * as path from 'node:path';

/**
 * Overrides for CI detection. When provided, these values take priority
 * over auto-detection from environment variables.
 */
export interface ExecutionContextOverrides {
    testRunId?: string;
    moduleId?: string;
}

/**
 * Encapsulates CI execution context detection: test run ID, module ID,
 * attempt number, and worker ID.
 *
 * In production, reads from `process.env`. In tests, accepts a fake
 * environment object for deterministic assertions without global mutation.
 *
 * @internal
 */
export class ExecutionContext {

    readonly testRunId: string | undefined;
    readonly moduleId: string | undefined;
    readonly attempt: number;
    readonly workerId: string | undefined;

    constructor(
        overrides: ExecutionContextOverrides = {},
        private readonly env: Record<string, string | undefined> = process.env,
    ) {
        this.testRunId = overrides.testRunId || this.detectTestRunId();
        this.moduleId = overrides.moduleId || (overrides.testRunId ? undefined : this.detectModuleId());
        this.attempt = this.detectAttemptNumber();
        this.workerId = this.detectWorkerId();
    }

    private detectTestRunId(): string | undefined {
        const CI_RUN_ID_ENV_VARS = [
            'GITHUB_RUN_NUMBER',
            'CI_PIPELINE_IID',      // GitLab CI
            'BUILD_NUMBER',         // Jenkins
            'CIRCLE_BUILD_NUM',     // CircleCI
        ];

        for (const variableName of CI_RUN_ID_ENV_VARS) {
            if (this.env[variableName]) {
                return this.env[variableName];
            }
        }
        return undefined;
    }

    private detectModuleId(): string | undefined {
        // When a CI testRunId is detected, derive moduleId from the working
        // directory basename. This ensures each parallel CI job writes to its
        // own subdirectory under test-runs/{buildId}/{moduleId}-{attempt}/.
        if (this.detectTestRunId()) {
            return path.basename(process.cwd());
        }
        return undefined;
    }

    private detectAttemptNumber(): number {
        if (this.env.GITHUB_RUN_ATTEMPT) {
            return parseInt(this.env.GITHUB_RUN_ATTEMPT, 10) || 1;
        }
        if (this.env.CI_JOB_RETRY) {
            // GitLab: 0-based → convert to 1-based
            return (parseInt(this.env.CI_JOB_RETRY, 10) || 0) + 1;
        }
        if (this.env.BUILD_RETRY_COUNT) {
            // Jenkins: 0-based → convert to 1-based
            return (parseInt(this.env.BUILD_RETRY_COUNT, 10) || 0) + 1;
        }
        return 1;
    }

    private detectWorkerId(): string | undefined {
        return this.env.WDIO_WORKER_ID;
    }
}
