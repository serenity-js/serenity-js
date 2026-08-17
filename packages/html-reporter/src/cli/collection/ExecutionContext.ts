import * as path from 'node:path';

import { CIDetector, type RuntimeContext } from './CiDetector.js';

/**
 * Immutable execution context values for a test run.
 * Consumed by {@link TestRunArchiver} and {@link SystemContextDetector}.
 *
 * In tests, construct as a plain object literal.
 *
 * @internal
 */
export interface ExecutionContext {
    readonly testRunId: string | undefined;
    readonly moduleId: string | undefined;
    readonly attempt: number;
    readonly workerId: string | undefined;
    readonly runtimeContext: RuntimeContext;
}

/**
 * Overrides for CI detection. When provided, these values take priority
 * over auto-detection from environment variables.
 */
export interface ExecutionContextOverrides {
    testRunId?: string;
    moduleId?: string;
    ci?: Partial<RuntimeContext>;
}

/**
 * Auto-discovers CI execution context from environment variables and provides
 * it as an immutable {@link ExecutionContext} value via lazy cached getters.
 *
 * In production, reads from `process.env`. In tests, accepts a fake
 * environment object for deterministic assertions without global mutation.
 *
 * @internal
 */
export class AutoDiscoveredExecutionContext implements ExecutionContext {

    private readonly overrides: ExecutionContextOverrides;
    private readonly env: Record<string, string | undefined>;

    private cachedTestRunId: string | undefined | null = null;
    private cachedModuleId: string | undefined | null = null;
    private cachedAttempt: number | undefined;
    private cachedRuntimeContext: RuntimeContext | undefined;

    constructor(
        overrides: ExecutionContextOverrides = {},
        env: Record<string, string | undefined> = process.env,
    ) {
        this.overrides = overrides;
        this.env = env;
    }

    get testRunId(): string | undefined {
        if (this.cachedTestRunId === null) {
            this.cachedTestRunId = this.overrides.testRunId || this.detectTestRunId();
        }
        return this.cachedTestRunId;
    }

    get moduleId(): string | undefined {
        if (this.cachedModuleId === null) {
            this.cachedModuleId = this.overrides.moduleId || (this.overrides.testRunId ? undefined : this.detectModuleId());
        }
        return this.cachedModuleId;
    }

    get attempt(): number {
        if (!this.cachedAttempt) {
            this.cachedAttempt = this.detectAttemptNumber();
        }
        return this.cachedAttempt;
    }

    get workerId(): string | undefined {
        return this.env.WDIO_WORKER_ID;
    }

    get runtimeContext(): RuntimeContext {
        if (!this.cachedRuntimeContext) {
            const ciDetector = new CIDetector(this.env);
            const detected = ciDetector.detect();
            this.cachedRuntimeContext = this.overrides.ci
                ? { ...detected, ...this.overrides.ci } as RuntimeContext
                : detected;
        }
        return this.cachedRuntimeContext;
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
}
