import type { ReportCapabilityNode, ReportHistoryEntry, ReportSummary } from '../../src/ReportData';
import { computeCompletenessFromTree, runConfidence } from '../utils';

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
    const totalFailed = (summary.outcomes.failed || 0) + (summary.outcomes.error || 0) + (summary.outcomes.compromised || 0);

    const latestScore = history.length > 0 && history[history.length - 1].score;
    const previousScore = history.length > 1 && history[history.length - 2].score;

    const passRate = latestScore ? latestScore.passRate : (summary.totalScenarios > 0 ? Math.round((summary.outcomes.passed / summary.totalScenarios) * 100) : 0);
    const consistency = latestScore ? latestScore.consistency : 100;
    const completenessScore = latestScore ? latestScore.completeness : computeCompletenessFromTree(capabilities);
    const confidence = latestScore ? latestScore.confidence : runConfidence(passRate, completenessScore, consistency);

    const previousConfidence = previousScore ? previousScore.confidence : undefined;
    const previousPassRate = previousScore ? previousScore.passRate : undefined;
    const previousConsistency = previousScore ? previousScore.consistency : undefined;
    const previousCompleteness = previousScore ? previousScore.completeness : undefined;
    const previousFailed = history.length > 1
        ? (history[history.length - 2].outcomes.failed || 0) + (history[history.length - 2].outcomes.error || 0) + (history[history.length - 2].outcomes.compromised || 0)
        : undefined;
    const previousDuration = history.length > 1 ? history[history.length - 2].duration : undefined;

    const scoreHistory = history.filter(h => h.score);
    const confidenceTrend = scoreHistory.map(h => h.score!.confidence);
    const failedTrend = history.map(h => (h.outcomes.failed || 0) + (h.outcomes.error || 0) + (h.outcomes.compromised || 0));
    const durationTrend = history.map(h => h.duration);

    return {
        passRate, consistency, completenessScore, confidence,
        previousConfidence, previousPassRate, previousConsistency, previousCompleteness,
        previousFailed, previousDuration, totalFailed,
        confidenceTrend, failedTrend, durationTrend,
    };
}
