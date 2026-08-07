import { ExecutionSuccessful } from '@serenity-js/core/model';

import { outcomeCodeToDisplayString } from '../model/outcomes.js';
import { resolveRunLabel } from '../model/resolveRunLabel.js';
import type { RunData } from '../model/RunData.js';
import { sceneIdentity } from '../model/sceneIdentity.js';
import type { ReportHistoryEntry } from '../reporting/ReportData.js';

interface DurationStats {
    slowest: number;
    fastest: number;
    average: number;
}

interface CiMetadata {
    commit?: string;
    branch?: string;
    ciJobUrl?: string;
    repositoryUrl?: string;
}

function computeDurationStats(scenes: RunData['scenes']): DurationStats {
    const durations = scenes.map(s => s.duration).filter(d => d > 0);
    return {
        slowest: durations.length > 0 ? Math.max(...durations) : 0,
        fastest: durations.length > 0 ? Math.min(...durations) : 0,
        average: durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
    };
}

function extractCiMetadata(run: RunData): CiMetadata {
    const ci = run.systemContext?.runtime;
    return {
        ...(ci?.commit ? { commit: ci.commit } : {}),
        ...(ci?.branch ? { branch: ci.branch } : {}),
        ...(ci?.jobUrl ? { ciJobUrl: ci.jobUrl } : {}),
        ...(ci?.repositoryUrl ? { repositoryUrl: ci.repositoryUrl } : {}),
    };
}

function computeRunScore(passRate: number, completeness: number, consistency: number): ReportHistoryEntry['score'] {
    const confidence = Math.round(completeness * 0.3 + passRate * 0.35 + consistency * 0.35);
    return { confidence, passRate, consistency, completeness };
}

function buildOutcomeMap(runs: RunData[]): Map<string, string[]> {
    const testOutcomes = new Map<string, string[]>();
    for (const run of runs) {
        for (const scene of run.scenes) {
            const identity = sceneIdentity(scene);
            if (!testOutcomes.has(identity)) testOutcomes.set(identity, []);

            const effectiveOutcome = (scene.retries > 0 && scene.outcome.code === ExecutionSuccessful.Code)
                ? 'RETRIED_SUCCESS'
                : outcomeCodeToDisplayString(scene.outcome.code);
            testOutcomes.get(identity).push(effectiveOutcome);
        }
    }
    return testOutcomes;
}

/**
 * Builds the execution history entries from all runs.
 *
 * @package
 */
export function buildHistory(allRuns: RunData[]): ReportHistoryEntry[] {
    return allRuns.map((run, index) => {
        const total = Object.values(run.outcomes).reduce((a: number, b: number) => a + b, 0);
        const passed = run.outcomes.passed || 0;
        const pending = (run.outcomes.pending || 0) + (run.outcomes.skipped || 0);
        const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
        const completeness = total > 0 ? Math.round(((total - pending) / total) * 100) : 0;

        const runsUpToHere = allRuns.slice(0, index + 1);
        const consistency = computeConsistencyAtRun(runsUpToHere);

        const duration = run.finishedAt
            ? new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()
            : 0;

        return {
            timestamp: run.startedAt,
            duration,
            outcomes: run.outcomes,
            label: resolveRunLabel(run),
            ...computeDurationStats(run.scenes),
            ...extractCiMetadata(run),
            score: computeRunScore(passRate, completeness, consistency),
            ...(run.modules ? { modules: run.modules } : {}),
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

    const testOutcomes = buildOutcomeMap(runs);

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
