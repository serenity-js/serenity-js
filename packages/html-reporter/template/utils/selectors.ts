import type { ReportOutcomes, ReportScenario } from '../../src/ReportData';

export function topSlowestScenarios(scenarios: ReportScenario[], limit = 5): ReportScenario[] {
    return [...scenarios].sort((a, b) => b.duration - a.duration).slice(0, limit);
}

export function totalFailedCount(outcomes: ReportOutcomes): number {
    return (outcomes.failed || 0) + (outcomes.error || 0) + (outcomes.compromised || 0);
}
