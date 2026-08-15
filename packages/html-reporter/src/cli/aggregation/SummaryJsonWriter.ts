import type { FileSystem } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';

import { computeFailureClusters } from '../analysis/FailureClusterAnalyser.js';
import { classifyConsistencyKind } from '../model/classifyConsistencyKind.js';
import { formatSource } from '../model/formatSource.js';
import type { ReportData } from '../reporting/ReportData.js';
import type { ConsistencyScenarioRef, ReportSummaryJson, SummaryCIContext, SummaryConsistency, SummaryDelta, SummaryScores } from '../reporting/ReportSummaryJson.js';

/**
 * Writes a machine-readable `summary.json` alongside the HTML report
 * for consumption by CI/CD dashboards, badge generators, and other tools.
 *
 * @internal
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
        const delta = this.computeDelta(data);
        const ci = this.extractCI(data);
        const slowest = this.computeSlowest(data, specDirectory);

        return {
            $schema: 'https://serenity-js.org/schemas/report-summary.json',
            generated: new Date().toISOString(),
            title: summary.title,
            schemaVersion: 1,
            reportUrl: './index.html',
            ...optionalField('ci', ci),
            latestRun: {
                timestamp: summary.startedAt,
                label: latestLabel,
                totals: summary.outcomes,
                duration: summary.duration,
            },
            runs,
            ...optionalField('delta', delta),
            failureClusters,
            consistency,
            scores,
            ...optionalField('slowest', slowest.length > 0 ? slowest : undefined),
            ...this.buildModules(data),
        };
    }

    private computeConsistency(data: ReportData, specDirectory?: string): SummaryConsistency {
        const result: SummaryConsistency = { flaky: [], inconsistent: [], degraded: [], recovered: [] };

        // Classify each inconsistent test by its history pattern
        for (const test of data.inconsistentTests) {
            const kind = classifyConsistencyKind(test.history || []);
            const lastOutcome = test.history?.length > 0 ? test.history[test.history.length - 1] : undefined;
            const entry: ConsistencyScenarioRef = {
                name: test.name,
                source: formatSource(test.source, specDirectory),
                ...optionalField('browser', getBrowser(test.tags)),
                ...optionalField('lastOutcome', lastOutcome),
            };
            result[kind].push(entry);
        }

        // Add degraded/recovered from degraded/recovered detection
        for (const test of data.newFailures) {
            result.degraded.push({
                name: test.name,
                source: formatSource(test.source, specDirectory),
                ...optionalField('browser', getBrowser(test.tags)),
                lastOutcome: 'FAILURE',
            });
        }
        for (const test of data.newPasses) {
            result.recovered.push({
                name: test.name,
                source: formatSource(test.source, specDirectory),
                ...optionalField('browser', getBrowser(test.tags)),
                lastOutcome: 'SUCCESS',
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

    private computeDelta(data: ReportData): SummaryDelta | undefined {
        if (data.history.length < 2) {
            return undefined;
        }

        const current = data.history[data.history.length - 1].outcomes;
        const previous = data.history[data.history.length - 2].outcomes;

        return {
            passed: (current.passed || 0) - (previous.passed || 0),
            failed: (current.failed || 0) - (previous.failed || 0),
            pending: (current.pending || 0) - (previous.pending || 0),
            skipped: (current.skipped || 0) - (previous.skipped || 0),
            compromised: (current.compromised || 0) - (previous.compromised || 0),
            error: (current.error || 0) - (previous.error || 0),
        };
    }

    private extractCI(data: ReportData): SummaryCIContext | undefined {
        const ci = data.systemContext?.ci;
        if (!ci?.commit || !ci?.branch) {
            return undefined;
        }

        return {
            commit: ci.commit,
            branch: ci.branch,
            ...optionalField('jobUrl', ci.jobUrl),
            ...optionalField('pullRequestUrl', ci.pullRequestUrl),
        };
    }

    private computeSlowest(data: ReportData, specDirectory?: string): Array<{ name: string; source: string; duration: number }> {
        if (data.scenarios.length === 0) {
            return [];
        }

        return [...data.scenarios]
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 5)
            .map(s => ({
                name: s.name,
                source: formatSource(s.source, specDirectory),
                duration: s.duration,
            }));
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

function optionalField<K extends string, V>(key: K, value: V | undefined | null): { [P in K]: V } | Record<string, never> {
    return value ? { [key]: value } as { [P in K]: V } : {} as Record<string, never>;
}
