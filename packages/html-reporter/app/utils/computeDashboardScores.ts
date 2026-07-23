import type { ReportCapabilityNode, ReportHistoryEntry, ReportSummary } from '../../src/cli/ReportData';
import { computeCompletenessFromTree, runConfidence, totalFailedCount } from './selectors';

export interface DashboardScores {
    passRate: number;
    consistency: number;
    completenessScore: number;
    confidence: number;
    previousConfidence: number | undefined;
    previousPassRate: number | undefined;
    previousConsistency: number | undefined;
    previousCompleteness: number | undefined;
    previousFailed: number | undefined;
    previousDuration: number | undefined;
    totalFailed: number;
    confidenceTrend: number[];
    failedTrend: number[];
    durationTrend: number[];
}

export function computeDashboardScores(summary: ReportSummary, history: ReportHistoryEntry[], capabilities?: ReportCapabilityNode): DashboardScores {
    const current = computeCurrentScores(summary, history, capabilities);
    const previous = computePreviousScores(history);
    const trends = computeTrends(history);

    return { ...current, ...previous, ...trends };
}

function computeCurrentScores(summary: ReportSummary, history: ReportHistoryEntry[], capabilities?: ReportCapabilityNode) {
    const totalFailed = totalFailedCount(summary.outcomes);
    const latestScore = history.length > 0 ? history[history.length - 1].score : undefined;

    const passRate = latestScore ? latestScore.passRate : (summary.totalScenarios > 0 ? Math.round((summary.outcomes.passed / summary.totalScenarios) * 100) : 0);
    const consistency = latestScore ? latestScore.consistency : 100;
    const completenessScore = latestScore ? latestScore.completeness : computeCompletenessFromTree(capabilities);
    const confidence = latestScore ? latestScore.confidence : runConfidence(passRate, completenessScore, consistency);

    return { passRate, consistency, completenessScore, confidence, totalFailed };
}

function computePreviousScores(history: ReportHistoryEntry[]) {
    if (history.length <= 1) {
        return {
            previousConfidence: undefined,
            previousPassRate: undefined,
            previousConsistency: undefined,
            previousCompleteness: undefined,
            previousFailed: undefined,
            previousDuration: undefined,
        };
    }

    const previousRun = history[history.length - 2];
    const previousScore = previousRun.score;

    return {
        previousConfidence: previousScore?.confidence,
        previousPassRate: previousScore?.passRate,
        previousConsistency: previousScore?.consistency,
        previousCompleteness: previousScore?.completeness,
        previousFailed: totalFailedCount(previousRun.outcomes),
        previousDuration: previousRun.duration,
    };
}

function computeTrends(history: ReportHistoryEntry[]) {
    const scoreHistory = history.filter(h => h.score);
    return {
        confidenceTrend: scoreHistory.map(h => h.score!.confidence),
        failedTrend: history.map(h => totalFailedCount(h.outcomes)),
        durationTrend: history.map(h => h.duration),
    };
}

