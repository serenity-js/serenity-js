import { ExecutionSuccessful } from '@serenity-js/core/model';

import { groupOutcomesByScene } from '../model/groupScenes.js';
import { findHistoricalMatch } from '../model/index.js';
import type { RunData, TagRecord } from '../model/RunData.js';

/**
 * Identifies tests with inconsistent outcomes across recent runs.
 * A test is considered unstable if its outcomes vary (mixed pass/fail)
 * or if it required retries to pass.
 *
 * @internal
 */
export function identifyUnstableTests(
    allRuns: RunData[],
    consistencyWindow: number,
): Array<{ name: string; category: string; source: { path: string; line: number }; tags: TagRecord[]; inconsistencyRate: number; history: string[]; labels: string[] }> {
    const recentRuns = allRuns.slice(-consistencyWindow);
    const groups = groupOutcomesByScene(recentRuns);

    const unstable: Array<{ name: string; category: string; source: { path: string; line: number }; tags: TagRecord[]; inconsistencyRate: number; history: string[]; labels: string[] }> = [];

    for (const group of groups) {
        const uniqueOutcomes = new Set(group.outcomes);
        if (uniqueOutcomes.size > 1 || group.outcomes.includes('RETRIED_SUCCESS')) {
            const failures = group.outcomes.filter(o => o !== 'SUCCESS').length;
            unstable.push({
                name: group.representative.name,
                category: group.representative.category,
                source: group.representative.source,
                tags: group.representative.tags,
                inconsistencyRate: failures / group.outcomes.length,
                history: group.outcomes,
                labels: group.labels,
            });
        }
    }

    return unstable.sort((a, b) => b.inconsistencyRate - a.inconsistencyRate);
}

/**
 * Computes newly degraded and recovered tests by comparing the latest run
 * to the previous run. A test is "degraded" when it was passing and is now
 * failing. A test is "recovered" when it was failing and now passes cleanly
 * (without retries).
 *
 * @internal
 */
export function computeDegradedRecovered(allRuns: RunData[]): {
    newFailures: Array<{ name: string; category: string; source: { path: string; line: number }; tags?: TagRecord[] }>;
    newPasses: Array<{ name: string; category: string; source: { path: string; line: number }; tags?: TagRecord[] }>;
} {
    const newFailures: Array<{ name: string; category: string; source: { path: string; line: number }; tags?: TagRecord[] }> = [];
    const newPasses: Array<{ name: string; category: string; source: { path: string; line: number }; tags?: TagRecord[] }> = [];

    if (allRuns.length < 2) {
        return { newFailures, newPasses };
    }

    const latestRun = allRuns[allRuns.length - 1];
    const previousRun = allRuns[allRuns.length - 2];

    for (const scene of latestRun.scenes) {
        const match = findHistoricalMatch(scene, previousRun.scenes);
        if (match) {
            const previousSuccess = match.outcome.code === ExecutionSuccessful.Code;
            const currentSuccess = scene.outcome.code === ExecutionSuccessful.Code;
            const currentRetried = scene.retries > 0 && currentSuccess;
            if (previousSuccess && !currentSuccess) {
                newFailures.push({ name: scene.name, category: scene.category, source: scene.source, tags: scene.tags });
            } else if (!previousSuccess && currentSuccess && !currentRetried) {
                // Only count as "recovered" if it passed without retrying
                newPasses.push({ name: scene.name, category: scene.category, source: scene.source, tags: scene.tags });
            }
        }
    }

    return { newFailures, newPasses };
}
