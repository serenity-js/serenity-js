import type { RunData } from '../model/RunData.js';

export function deriveModuleId(run: RunData, index: number): string {
    if (run.moduleId) {
        return run.moduleId;
    }
    if (run.systemContext?.projectName) {
        return run.systemContext.projectName;
    }
    return `module-${index + 1}`;
}

export function deriveModuleOutcome(run: RunData): 'passed' | 'failed' | 'incomplete' {
    if (!run.finishedAt) {
        return 'incomplete';
    }
    const { failed = 0, error = 0, compromised = 0 } = run.outcomes;
    return (failed + error + compromised) > 0 ? 'failed' : 'passed';
}

export function mergeModuleTimestamps(
    a: { startedAt: string; finishedAt?: string },
    b: { startedAt: string; finishedAt?: string },
): { startedAt: string; finishedAt?: string } {
    return {
        startedAt: a.startedAt < b.startedAt ? a.startedAt : b.startedAt,
        finishedAt: latestTimestamp(a.finishedAt, b.finishedAt),
    };
}

export function latestTimestamp(a?: string, b?: string): string | undefined {
    if (!a) return b;
    if (!b) return a;
    return a > b ? a : b;
}

export function sumOutcomes(a: RunData['outcomes'], b: RunData['outcomes']): RunData['outcomes'] {
    return {
        passed: (a.passed || 0) + (b.passed || 0),
        failed: (a.failed || 0) + (b.failed || 0),
        pending: (a.pending || 0) + (b.pending || 0),
        skipped: (a.skipped || 0) + (b.skipped || 0),
        compromised: (a.compromised || 0) + (b.compromised || 0),
        error: (a.error || 0) + (b.error || 0),
    };
}

export function deriveOutcomeFromOutcomes(finishedAt: string | undefined, outcomes: RunData['outcomes']): 'passed' | 'failed' | 'incomplete' {
    if (!finishedAt) {
        return 'incomplete';
    }
    const { failed = 0, error = 0, compromised = 0 } = outcomes;
    return (failed + error + compromised) > 0 ? 'failed' : 'passed';
}

/**
 * Aggregates module metadata from multiple RunData objects, grouping by moduleId.
 * This handles WebdriverIO parallel workers that produce multiple db-*.json files
 * with the same moduleId - they are combined into a single module entry with
 * aggregated outcomes.
 */
export function aggregateModuleMetadata(runs: RunData[]): Array<{
    moduleId: string;
    startedAt: string;
    finishedAt?: string;
    outcome: 'passed' | 'failed' | 'incomplete';
    outcomes: RunData['outcomes'];
}> {
    const moduleMap = new Map<string, {
        moduleId: string;
        startedAt: string;
        finishedAt?: string;
        outcomes: RunData['outcomes'];
    }>();

    for (const [index, run] of runs.entries()) {
        const moduleId = deriveModuleId(run, index);
        const existing = moduleMap.get(moduleId);

        if (existing) {
            const merged = mergeModuleTimestamps(existing, run);
            existing.startedAt = merged.startedAt;
            existing.finishedAt = merged.finishedAt;
            existing.outcomes = sumOutcomes(existing.outcomes, run.outcomes);
        } else {
            moduleMap.set(moduleId, {
                moduleId,
                startedAt: run.startedAt,
                finishedAt: run.finishedAt,
                outcomes: { ...run.outcomes },
            });
        }
    }

    return [...moduleMap.values()].map(m => ({
        ...m,
        outcome: deriveOutcomeFromOutcomes(m.finishedAt, m.outcomes),
    }));
}
