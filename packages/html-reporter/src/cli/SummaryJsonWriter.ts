import type { FileSystem } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';

import { computeFailureClusters } from './FailureClusterAnalyser.js';
import type { ReportData } from './ReportData.js';
import type { ReportSummaryJson, SummaryConsistency, SummaryScores } from './ReportSummaryJson.js';

type ConsistencyKind = 'flaky' | 'inconsistent' | 'degraded' | 'recovered';

/**
 * Writes a machine-readable `summary.json` alongside the HTML report
 * for consumption by CI/CD dashboards, badge generators, and other tools.
 *
 * @package
 */
export class SummaryJsonWriter {
    constructor(private readonly fileSystem: FileSystem) {
    }

    write(data: ReportData, specDirectory?: string): void {
        const summary = this.buildSummary(data, specDirectory);
        this.fileSystem.storeSync(
            Path.from('summary.json'),
            JSON.stringify(summary, undefined, 2) + '\n',
            'utf8',
        );
    }

    private buildSummary(data: ReportData, specDirectory?: string): ReportSummaryJson {
        const { summary } = data;
        const latestLabel = data.history.length > 0
            ? data.history[data.history.length - 1].label
            : summary.startedAt;

        const runs = Math.max(data.history.length, 1);
        const failureClusters = computeFailureClusters(data.scenarios, specDirectory);
        const consistency = this.computeConsistency(data);
        const scores = this.computeScores(summary, data.inconsistentTests.length);

        return {
            generated: new Date().toISOString(),
            title: summary.title,
            schemaVersion: 1,
            latestRun: {
                timestamp: summary.startedAt,
                label: latestLabel,
                totals: summary.outcomes,
                duration: summary.duration,
            },
            runs,
            failureClusters,
            consistency,
            scores,
        };
    }

    private computeConsistency(data: ReportData): SummaryConsistency {
        const counts: SummaryConsistency = { flaky: 0, inconsistent: 0, degraded: 0, recovered: 0 };

        // Classify each inconsistent test by its history pattern
        for (const test of data.inconsistentTests) {
            const kind = classifyConsistencyKind(test.history || []);
            counts[kind]++;
        }

        // Add degraded/recovered from degraded/recovered detection
        counts.degraded += data.newFailures.length;
        counts.recovered += data.newPasses.length;

        return counts;
    }

    private computeScores(
        summary: ReportData['summary'],
        inconsistentCount: number,
    ): SummaryScores {
        const total = summary.totalScenarios;
        const { passed, pending, skipped } = summary.outcomes;

        const executed = total - pending - skipped;
        const passRate = executed > 0 ? (passed / executed) * 100 : 0;
        const completeness = total > 0 ? (executed / total) * 100 : 0;
        const consistency = total > 0 ? ((total - inconsistentCount) / total) * 100 : 100;
        const confidence = passRate * 0.40 + completeness * 0.25 + consistency * 0.35;

        return {
            passRate: round1(passRate),
            completeness: round1(completeness),
            consistency: round1(consistency),
            confidence: round1(confidence),
        };
    }
}

function classifyConsistencyKind(history: string[]): ConsistencyKind {
    const lastOutcome = history[history.length - 1];
    const hasFailure = history.some(o => o !== 'SUCCESS' && o !== 'RETRIED_SUCCESS');

    if (!hasFailure) return 'flaky';
    if (lastOutcome === 'SUCCESS') return 'recovered';
    if (lastOutcome === 'RETRIED_SUCCESS') return 'inconsistent';
    return 'degraded';
}

function round1(value: number): number {
    return Math.round(value * 10) / 10;
}
