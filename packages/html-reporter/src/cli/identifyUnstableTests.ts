import { ExecutionSuccessful } from '@serenity-js/core/model';

import { resolveRunLabel, sceneIdentity } from './model/index.js';
import { outcomeCodeToDisplayString } from './model/outcomes.js';
import type { RunData, TagRecord } from './model/RunData.js';

/**
 * Identifies tests with inconsistent outcomes across recent runs.
 * A test is considered unstable if its outcomes vary (mixed pass/fail)
 * or if it required retries to pass.
 *
 * @package
 */
export function identifyUnstableTests(
    allRuns: RunData[],
    consistencyWindow: number,
): Array<{ name: string; category: string; source: { path: string; line: number }; tags: TagRecord[]; inconsistencyRate: number; history: string[]; labels: string[] }> {
    const recentRuns = allRuns.slice(-consistencyWindow);

    // Collect outcomes per test identity (name@path@project)
    // Including the project tag ensures different browser/OS variations are tracked separately
    const testOutcomes = new Map<string, { name: string; category: string; source: { path: string; line: number }; tags: TagRecord[]; outcomes: string[]; labels: string[] }>();

    for (const run of recentRuns) {
        const runLabel = resolveRunLabel(run);
        for (const scene of run.scenes) {
            const projectTag = scene.tags.find(t => t.type === 'project')?.name || '';
            const identity = `${ scene.name }@${ scene.source.path }@${ projectTag }`;
            if (!testOutcomes.has(identity)) {
                testOutcomes.set(identity, { name: scene.name, category: scene.category, source: scene.source, tags: scene.tags, outcomes: [], labels: [] });
            }
            const entry = testOutcomes.get(identity);

            // A retried pass counts as a distinct outcome signal
            const effectiveOutcome = (scene.retries > 0 && scene.outcome.code === ExecutionSuccessful.Code)
                ? 'RETRIED_SUCCESS'
                : outcomeCodeToDisplayString(scene.outcome.code);
            entry.outcomes.push(effectiveOutcome);
            entry.labels.push(runLabel);
        }
    }

    // Find tests with mixed outcomes or any retried success
    const unstable: Array<{ name: string; category: string; source: { path: string; line: number }; tags: TagRecord[]; inconsistencyRate: number; history: string[]; labels: string[] }> = [];

    for (const [, test] of testOutcomes) {
        const uniqueOutcomes = new Set(test.outcomes);
        if (uniqueOutcomes.size > 1 || test.outcomes.includes('RETRIED_SUCCESS')) {
            const failures = test.outcomes.filter(o => o !== 'SUCCESS').length;
            unstable.push({
                name: test.name,
                category: test.category,
                source: test.source,
                tags: test.tags,
                inconsistencyRate: failures / test.outcomes.length,
                history: test.outcomes,
                labels: test.labels,
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
 * @package
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
    const previousOutcomes = new Map(previousRun.scenes.map(s => [sceneIdentity(s), s.outcome.code]));

    for (const scene of latestRun.scenes) {
        const key = sceneIdentity(scene);
        const previousCode = previousOutcomes.get(key);
        if (previousCode !== undefined) {
            const previousSuccess = previousCode === ExecutionSuccessful.Code;
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
