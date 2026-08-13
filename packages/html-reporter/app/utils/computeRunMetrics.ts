import type { ReportHistoryEntry } from '../../src/cli/reporting/ReportData.js';
import { totalFailedCount } from './selectors.js';

export interface RunMetrics {
    total: number;
    confidence: number;
    failedCount: number;
    skippedCount: number;
    passedPct: number;
    failedPct: number;
    skippedPct: number;
}

export function computeRunMetrics(run: ReportHistoryEntry): RunMetrics {
    const total = Object.values(run.outcomes).reduce((a: number, b: number) => a + b, 0);
    const confidence = run.score ? run.score.confidence : (total > 0 ? Math.round((run.outcomes.passed / total) * 100) : 0);
    const failedCount = totalFailedCount(run.outcomes);
    const skippedCount = (run.outcomes.pending || 0) + (run.outcomes.skipped || 0);

    return {
        total,
        confidence,
        failedCount,
        skippedCount,
        passedPct: total > 0 ? (run.outcomes.passed / total) * 100 : 0,
        failedPct: total > 0 ? (failedCount / total) * 100 : 0,
        skippedPct: total > 0 ? (skippedCount / total) * 100 : 0,
    };
}

export function normaliseRepoUrl(repositoryUrl: string | undefined): string {
    if (!repositoryUrl) return '';
    return repositoryUrl.replace(/\.git$/, '').replace(/^git@([^:]+):/, 'https://$1/');
}
