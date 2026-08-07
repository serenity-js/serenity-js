import type { FileSystem } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';

import { computeFailureClusters } from '../analysis/FailureClusterAnalyser.js';
import { classifyConsistencyKind } from '../model/classifyConsistencyKind.js';
import { formatSource } from '../model/formatSource.js';
import type { ReportData } from '../reporting/ReportData.js';
import type { ReportSummaryJson, SummaryConsistency, SummaryScores } from '../reporting/ReportSummaryJson.js';

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
        const consistency = this.computeConsistency(data, specDirectory);
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
            ...this.buildModules(data),
        };
    }

    private computeConsistency(data: ReportData, specDirectory?: string): SummaryConsistency {
        const result: SummaryConsistency = { flaky: [], inconsistent: [], degraded: [], recovered: [] };

        // Classify each inconsistent test by its history pattern
        for (const test of data.inconsistentTests) {
            const kind = classifyConsistencyKind(test.history || []);
            result[kind].push({
                name: test.name,
                source: formatSource(test.source, specDirectory),
                ...getBrowser(test.tags) && { browser: getBrowser(test.tags) },
            });
        }

        // Add degraded/recovered from degraded/recovered detection
        for (const test of data.newFailures) {
            result.degraded.push({
                name: test.name,
                source: formatSource(test.source, specDirectory),
                ...getBrowser(test.tags) && { browser: getBrowser(test.tags) },
            });
        }
        for (const test of data.newPasses) {
            result.recovered.push({
                name: test.name,
                source: formatSource(test.source, specDirectory),
                ...getBrowser(test.tags) && { browser: getBrowser(test.tags) },
            });
        }

        return result;
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

    private buildModules(data: ReportData): { modules?: Array<{ id: string; outcome: 'passed' | 'failed' | 'incomplete'; tests: number; passed: number; failed: number; duration?: number; startedAt: string; finishedAt?: string }> } {
        const latestEntry = data.history.length > 0 ? data.history[data.history.length - 1] : undefined;
        if (!latestEntry?.modules || latestEntry.modules.length <= 1) {
            return {};
        }

        return {
            modules: latestEntry.modules.map(m => {
                const tests = m.outcomes ? Object.values(m.outcomes).reduce((a, b) => a + b, 0) : 0;
                const failed = m.outcomes ? (m.outcomes.failed || 0) + (m.outcomes.error || 0) + (m.outcomes.compromised || 0) : 0;
                const duration = m.finishedAt ? new Date(m.finishedAt).getTime() - new Date(m.startedAt).getTime() : undefined;

                return {
                    id: m.moduleId,
                    outcome: (m.outcome || 'passed') as 'passed' | 'failed' | 'incomplete',
                    tests,
                    passed: m.outcomes?.passed || 0,
                    failed,
                    ...(duration !== undefined ? { duration } : {}),
                    startedAt: m.startedAt,
                    ...(m.finishedAt ? { finishedAt: m.finishedAt } : {}),
                };
            }),
        };
    }
}

function getBrowser(tags?: Array<{ type: string; name: string }>): string | undefined {
    return tags?.find(t => t.type === 'browser')?.name;
}

function round1(value: number): number {
    return Math.round(value * 10) / 10;
}
