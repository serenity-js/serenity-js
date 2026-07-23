export type ConsistencyKind = 'flaky' | 'inconsistent' | 'degraded' | 'recovered';

/**
 * Classifies a test's consistency based on its execution history outcomes.
 *
 * - flaky: never genuinely fails (all outcomes are SUCCESS or RETRIED_SUCCESS)
 * - recovered: has failed before, but last outcome is a clean SUCCESS
 * - inconsistent: has failed before, last outcome is RETRIED_SUCCESS (surviving via retry)
 * - degraded: has failed before, last outcome is a failure
 *
 * @package
 */
export function classifyConsistencyKind(history: string[]): ConsistencyKind {
    const lastOutcome = history[history.length - 1];
    const hasFailure = history.some(o => o !== 'SUCCESS' && o !== 'RETRIED_SUCCESS');

    if (!hasFailure) return 'flaky';
    if (lastOutcome === 'SUCCESS') return 'recovered';
    if (lastOutcome === 'RETRIED_SUCCESS') return 'inconsistent';
    return 'degraded';
}
