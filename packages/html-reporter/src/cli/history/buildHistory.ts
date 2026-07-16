import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
} from '@serenity-js/core/model';

import type { RunData } from '../model/RunData.js';
import { tagDiscriminator } from '../model/sceneIdentity.js';
import type { ReportHistoryEntry } from '../ReportData.js';

const OUTCOME_CODE_DISPLAY_STRINGS: Record<number, string> = {
    [ExecutionSuccessful.Code]: 'SUCCESS',
    [ExecutionFailedWithAssertionError.Code]: 'FAILURE',
    [ExecutionFailedWithError.Code]: 'ERROR',
    [ExecutionCompromised.Code]: 'COMPROMISED',
    [ImplementationPending.Code]: 'PENDING',
    [ExecutionSkipped.Code]: 'SKIPPED',
};

function outcomeCodeToDisplayString(code: number): string {
    return OUTCOME_CODE_DISPLAY_STRINGS[code] || 'ERROR';
}

/**
 * Builds the execution history entries from all runs.
 *
 * @package
 */
export function buildHistory(allRuns: RunData[]): ReportHistoryEntry[] {
    return allRuns.map((run, index) => {
        const durations = run.scenes.map(s => s.duration).filter(d => d > 0);
        const ci = run.systemContext?.runtime;

        // Compute score for this run
        const total = Object.values(run.outcomes).reduce((a: number, b: number) => a + b, 0);
        const passed = run.outcomes.passed || 0;
        const pending = (run.outcomes.pending || 0) + (run.outcomes.skipped || 0);
        const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
        const completeness = total > 0 ? Math.round(((total - pending) / total) * 100) : 0;

        // Consistency: proportion of tests with consistent outcomes up to this run
        const runsUpToHere = allRuns.slice(0, index + 1);
        const consistency = computeConsistencyAtRun(runsUpToHere);
        const confidence = Math.round(completeness * 0.3 + passRate * 0.35 + consistency * 0.35);

        return {
            timestamp: run.startedAt,
            duration: new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime(),
            outcomes: run.outcomes,
            label: resolveRunLabel(run),
            slowest: durations.length > 0 ? Math.max(...durations) : 0,
            fastest: durations.length > 0 ? Math.min(...durations) : 0,
            average: durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
            ...(ci?.commit ? { commit: ci.commit } : {}),
            ...(ci?.branch ? { branch: ci.branch } : {}),
            ...(ci?.jobUrl ? { ciJobUrl: ci.jobUrl } : {}),
            ...(ci?.repositoryUrl ? { repositoryUrl: ci.repositoryUrl } : {}),
            score: { confidence, passRate, consistency, completeness },
        };
    });
}

/**
 * Computes consistency percentage at a given point in the run history.
 *
 * @package
 */
export function computeConsistencyAtRun(runs: RunData[]): number {
    if (runs.length < 2) return 100;
    const testOutcomes = new Map<string, string[]>();
    for (const run of runs) {
        for (const scene of run.scenes) {
            const discriminator = tagDiscriminator(scene.tags);
            const identity = `${ scene.name }@${ scene.source.path }@${ discriminator }`;
            if (!testOutcomes.has(identity)) testOutcomes.set(identity, []);

            const effectiveOutcome = (scene.retries > 0 && scene.outcome.code === ExecutionSuccessful.Code)
                ? 'RETRIED_SUCCESS'
                : outcomeCodeToDisplayString(scene.outcome.code);
            testOutcomes.get(identity).push(effectiveOutcome);
        }
    }
    let totalTests = 0;
    let stableTests = 0;
    for (const [, outcomes] of testOutcomes) {
        if (outcomes.length >= 2) {
            totalTests++;
            const uniqueOutcomes = new Set(outcomes);
            if (uniqueOutcomes.size === 1 && !outcomes.includes('RETRIED_SUCCESS')) stableTests++;
        }
    }
    return totalTests > 0 ? Math.round((stableTests / totalTests) * 100) : 100;
}

function resolveRunLabel(run: RunData): string {
    return run.testRunId || run.startedAt;
}
