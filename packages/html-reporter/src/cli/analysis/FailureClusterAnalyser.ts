import { formatSource } from '../model/formatSource.js';
import type { ReportActivity, ReportScenario } from '../reporting/ReportData.js';
import type { FailureCluster, FailureClusterScenario } from '../reporting/ReportSummaryJson.js';

/**
 * Compute a stable fingerprint from an error type and message.
 *
 * The fingerprint normalises away environment-specific details (absolute paths,
 * line numbers, ports, timestamps, ANSI escape sequences) so that equivalent
 * errors from different machines/runs cluster together.
 *
 * @package
 */
export function fingerprintError(errorType: string, message: string): string {
    const normalised = normaliseMessage(message);
    const fingerprint = normalised.replace(/\s+/g, '-');
    return `${ errorType }:${ fingerprint }`;
}

/**
 * Groups failed scenarios by error fingerprint, producing a list of
 * {@link FailureCluster} objects ordered by scenario count descending.
 *
 * @package
 */
export function computeFailureClusters(scenarios: ReportScenario[], specDirectory?: string): FailureCluster[] {
    const failedScenarios = scenarios.filter(s =>
        s.outcome !== 'SUCCESS' && s.outcome !== 'SKIPPED' && s.outcome !== 'PENDING' && s.error,
    );

    if (failedScenarios.length === 0) {
        return [];
    }

    const groups = new Map<string, { errorType: string; message: string; scenarios: FailureClusterScenario[] }>();

    for (const scenario of failedScenarios) {
        const error = scenario.error!;
        const fp = fingerprintError(error.name, error.message);
        const normalisedMessage = normaliseMessage(error.message);

        if (!groups.has(fp)) {
            groups.set(fp, {
                errorType: error.name,
                message: normalisedMessage,
                scenarios: [],
            });
        }

        const group = groups.get(fp)!;
        const clusterScenario: FailureClusterScenario = {
            name: scenario.name,
            source: formatSource(scenario.source, specDirectory),
        };

        const browserTag = scenario.tags.find(t => t.type === 'browser');
        if (browserTag) {
            clusterScenario.browser = browserTag.name;
        }

        const failingStep = findFailingStep(scenario.activities);
        if (failingStep) {
            clusterScenario.failingStep = failingStep;
        }

        group.scenarios.push(clusterScenario);
    }

    const clusters: FailureCluster[] = [...groups.entries()].map(([fingerprint, group]) => ({
        fingerprint,
        errorType: group.errorType,
        message: group.message,
        scenarios: group.scenarios,
    }));

    // Sort by scenario count descending (most impactful clusters first)
    clusters.sort((a, b) => b.scenarios.length - a.scenarios.length);

    return clusters;
}

function normaliseMessage(message: string): string {
    let normalised = message
        // Strip ANSI escape sequences
        .replace(/\u001b\[[0-9;]*m/g, '')
        // Strip absolute file paths
        .replace(/\/[^\s:]+\//g, '')
        // Strip line:col numbers
        .replace(/:\d+:\d+/g, '')
        // Normalise large numbers (ports, timestamps)
        .replace(/\d{4,}/g, 'N');

    normalised = normalised.trim();

    // Cap at 200 characters
    if (normalised.length > 200) {
        normalised = normalised.slice(0, 200);
    }

    return normalised;
}

function findFailingStep(activities: ReportActivity[]): string | undefined {
    for (const a of activities) {
        if (a.outcome !== 'SUCCESS' && a.outcome !== 'SKIPPED') {
            if (a.children && a.children.length > 0) {
                const deeper = findFailingStep(a.children);
                if (deeper) return deeper;
            }
            return a.name;
        }
    }
    return undefined;
}
