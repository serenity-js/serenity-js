import type { ReportScenario } from '../../../src/cli/ReportData.js';

export interface DurationStats {
    avg: number;
    slowest: number;
    fastest: number;
}

export function computeDurationStats(scenarios: ReportScenario[]): DurationStats {
    const durations = scenarios.map(s => s.duration).filter(d => d > 0);
    const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    const slowest = durations.length ? Math.max(...durations) : 0;
    const fastest = durations.length ? Math.min(...durations) : 0;
    return { avg, slowest, fastest };
}
