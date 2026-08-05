import type { ReportCapabilityNode, ReportHistoryEntry, ReportOutcomes, ReportScenario } from '../../src/cli/ReportData.js';

export { classifyConsistencyKind, type ConsistencyKind } from '../../src/cli/model/classifyConsistencyKind.js';

export function topSlowestScenarios(scenarios: ReportScenario[], limit = 5): ReportScenario[] {
    return [...scenarios].sort((a, b) => b.duration - a.duration).slice(0, limit);
}

export function totalFailedCount(outcomes: ReportOutcomes): number {
    return (outcomes.failed || 0) + (outcomes.error || 0) + (outcomes.compromised || 0);
}

/**
 * Validates a filter value against a set of allowed keys.
 * Returns the validated filter or 'all' if invalid.
 */
export function validateFilter(raw: string, validKeys: string[] | undefined): string {
    if (!validKeys || !raw || raw === 'all') return raw || 'all';
    const parts = raw.split(',').filter(k => validKeys.includes(k));
    return parts.length === 0 ? 'all' : parts.join(',');
}

/**
 * Map from filter UI keys to outcome strings.
 */
const OUTCOME_FILTER_MAP: Record<string, string[]> = {
    passed: ['SUCCESS'],
    failed: ['FAILURE', 'ERROR', 'COMPROMISED'],
    skipped: ['SKIPPED', 'PENDING'],
};

/**
 * Returns true if the given outcome passes the filter.
 * Supports comma-separated multi-filters (e.g. 'failed,skipped').
 */
export function matchesOutcomeFilter(outcome: string, filterKey: string): boolean {
    if (!filterKey || filterKey === 'all') return true;
    const allowed = filterKey.split(',').flatMap(k => OUTCOME_FILTER_MAP[k] || []);
    return allowed.length === 0 || allowed.includes(outcome);
}

/**
 * Resolves a `run` URL parameter to a history index.
 * Tries timestamp match first, then falls back to integer index.
 */
export function resolveRunIndex(runParameter: string | null, history: ReportHistoryEntry[]): number | null {
    if (!runParameter) return null;
    const byTimestamp = history.findIndex(r => r.timestamp === runParameter);
    if (byTimestamp >= 0) return byTimestamp;
    const parsed = parseInt(runParameter, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed < history.length) return parsed;
    return null;
}

/**
 * Confidence score for a report run (weighted toward stability).
 * Use for dashboard-level scoring where consistency and completeness matter equally.
 */
export function runConfidence(passRate: number, completeness: number, consistency: number): number {
    return Math.round(completeness * 0.3 + passRate * 0.35 + consistency * 0.35);
}

/**
 * Confidence score for a capability node (weighted toward pass rate).
 * Capabilities emphasise "does this work?" over completeness because
 * a feature's confidence is primarily about its current correctness.
 */
export function capabilityConfidence(passRate: number, completeness: number, consistency: number): number {
    return Math.round(passRate * 0.40 + completeness * 0.25 + consistency * 0.35);
}

/**
 * Computes completeness by walking the capabilities tree.
 * A file is "complete" if it has at least one executed test and no pending/skipped tests.
 */
export function computeCompletenessFromTree(capabilities: ReportCapabilityNode | undefined): number {
    if (!capabilities) return 0;
    let total = 0;
    let complete = 0;
    function walk(node: ReportCapabilityNode) {
        if (node.type === 'file') {
            total++;
            const all = (node.outcomes.passed || 0) + (node.outcomes.failed || 0) + (node.outcomes.error || 0)
                + (node.outcomes.compromised || 0) + (node.outcomes.pending || 0) + (node.outcomes.skipped || 0);
            if (all > 0 && !(node.outcomes.pending || 0) && !(node.outcomes.skipped || 0)) complete++;
        }
        if (node.children) node.children.forEach(walk);
    }
    if (capabilities.children) capabilities.children.forEach(walk);
    return total > 0 ? Math.round((complete / total) * 100) : 0;
}

