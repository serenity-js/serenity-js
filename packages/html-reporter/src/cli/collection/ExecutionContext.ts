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
    readonly projectName: string | undefined;
    readonly runtimeContext: RuntimeContext;
}

/**
 * Overrides for CI detection. When provided, these values take priority
 * over auto-detection from environment variables.
 */
export interface ExecutionContextOverrides {
    testRunId?: string;
    moduleId?: string;
    projectName?: string;
    ci?: Partial<RuntimeContext>;
}

/**
 * Auto-discovers CI execution context from environment variables and provides
 * it as an {@link ExecutionContext} implementation.
 *
 * In production, reads from `process.env`. In tests, accepts a fake
 * environment object for deterministic assertions without global mutation.
 *
 * @internal
 */
export class AutoDiscoveredExecutionContext implements ExecutionContext {

    private readonly overrides: ExecutionContextOverrides;
    private readonly env: Record<string, string | undefined>;

    private cachedRuntimeContext: RuntimeContext | undefined;

    constructor(
        overrides: ExecutionContextOverrides = {},
        env: Record<string, string | undefined> = process.env,
    ) {
        this.overrides = overrides;
        this.env = env;
    }

    get testRunId(): string | undefined {
        return this.overrides.testRunId || this.detectCIRunId();
    }

    get moduleId(): string | undefined {
        if (this.overrides.moduleId) {
            return this.overrides.moduleId;
        }

        // Derive from working directory whenever a testRunId exists
        if (this.testRunId) {
            return path.basename(process.cwd());
        }

        return undefined;
    }

    get attempt(): number {
        if (this.env.GITHUB_RUN_ATTEMPT) {
            return parseInt(this.env.GITHUB_RUN_ATTEMPT, 10) || 1;
        }
        if (this.env.CI_JOB_RETRY) {
            return (parseInt(this.env.CI_JOB_RETRY, 10) || 0) + 1;
        }
        if (this.env.BUILD_RETRY_COUNT) {
            return (parseInt(this.env.BUILD_RETRY_COUNT, 10) || 0) + 1;
        }
        return 1;
    }

    get workerId(): string | undefined {
        return this.env.WDIO_WORKER_ID;
    }

    get projectName(): string | undefined {
        return this.overrides.projectName;
    }

    get runtimeContext(): RuntimeContext {
        if (!this.cachedRuntimeContext) {
            const detected = new CIDetector(this.env).detect();
            this.cachedRuntimeContext = this.overrides.ci
                ? { ...detected, ...this.overrides.ci } as RuntimeContext
                : detected;
        }
        return this.cachedRuntimeContext;
    }

    private detectCIRunId(): string | undefined {
        return this.env.GITHUB_RUN_NUMBER
            || this.env.CI_PIPELINE_IID
            || this.env.BUILD_NUMBER
            || this.env.CIRCLE_BUILD_NUM;
    }
}
