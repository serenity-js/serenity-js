import htm from 'htm';
import { h } from 'preact';
import { useMemo } from 'preact/hooks';

import type { ReportCapabilityNode, ReportHistoryEntry, ReportInconsistentTest, ReportScenario, ReportScenarioRef, ReportSummary, ReportSystemContext } from '../../src/ReportData';
import { computeDashboardScores } from '../utils/computeDashboardScores';
import { classifyConsistencyKind } from '../utils/selectors';
import { TrendChart } from './charts/TrendChart';
import { DashboardConsistencyCard } from './DashboardConsistencyCard';
import { DashboardKpiRow } from './DashboardKpiRow';
import { DashboardMeta } from './DashboardMeta';
import { DashboardSlowestCard } from './DashboardSlowestCard';

const html = htm.bind(h);

function confidenceSubtitle(confidence: number, previousConfidence: number | undefined, totalScenarios: number, runCount: number, newFailCount: number, recoveredCount: number): string {
    if (previousConfidence === undefined) return `${totalScenarios} scenarios across ${runCount} run${runCount !== 1 ? 's' : ''}`;
    if (confidence > previousConfidence) {
        if (recoveredCount > 0) return `Improved since last run — ${recoveredCount} test${recoveredCount > 1 ? 's' : ''} recovered`;
        return `Improved since last run — pass rate up`;
    }
    if (confidence < previousConfidence) {
        if (newFailCount > 0) return `Decreased since last run — ${newFailCount} new failure${newFailCount > 1 ? 's' : ''}`;
        return `Decreased since last run — consistency dropped`;
    }
    return 'No change since last run';
}

// ===== Dashboard View =====
interface DashboardViewProps {
    summary: ReportSummary;
    history: ReportHistoryEntry[];
    scenarios: ReportScenario[];
    newFailures: ReportScenarioRef[];
    newPasses: ReportScenarioRef[];
    inconsistentTests: ReportInconsistentTest[];
    capabilities?: ReportCapabilityNode;
    systemContext?: ReportSystemContext;
    onNavigate: (path: string) => void;
}

export function DashboardView({ summary, history, scenarios, newFailures: allNewFailures, newPasses: allNewPasses, inconsistentTests: allInconsistentTests, capabilities, systemContext, onNavigate }: DashboardViewProps): ReturnType<typeof html> {
    const scores = computeDashboardScores(summary, history, capabilities);

    const sorted = [...scenarios].sort((a, b) => b.duration - a.duration);
    const slowest = sorted.slice(0, 5);
    const newFailures = useMemo(() => allNewFailures.slice(0, 5), []);
    const newPasses = useMemo(() => allNewPasses.slice(0, 5), []);
    const inconsistent = allInconsistentTests.slice(0, 5);

    const consistencyItems = useMemo(() => [
        ...newFailures.map(t => ({ ...t, kind: 'degraded' as const, lastOutcome: 'FAILURE' })),
        ...newPasses.map(t => ({ ...t, kind: 'recovered' as const, lastOutcome: 'SUCCESS' })),
        ...inconsistent
            .filter(t => !newFailures.some(f => f.source.path === t.source.path) && !newPasses.some(p => p.source.path === t.source.path))
            .map(t => {
                const kind = classifyConsistencyKind(t.history || []);
                return { ...t, kind, lastOutcome: t.history && t.history.length > 0 ? t.history[t.history.length - 1] : 'SKIPPED' };
            }),
    ].slice(0, 5), [newFailures, newPasses, inconsistent]);

    const getHistory = (t: ReportScenarioRef) => {
        const key = t.source.path + ':' + (t.source.line || '');
        const match = scenarios.find(s => s.source.path + ':' + (s.source.line || '') === key)
            || scenarios.find(s => s.name === t.name && s.source.path === t.source.path);
        return match && match.executionHistory ? match.executionHistory.slice(-5) : [];
    };

    return html`
    <div class="dashboard">
      <${DashboardKpiRow}
        summary=${summary}
        scores=${scores}
        confidenceSubtitle=${confidenceSubtitle(scores.confidence, scores.previousConfidence, summary.totalScenarios, history.length, allNewFailures.length, allNewPasses.length)}
        inconsistentCount=${allInconsistentTests.length}
        onNavigate=${onNavigate}
      />

      <${DashboardMeta} totalScenarios=${summary.totalScenarios} testRunner=${summary.testRunner} systemContext=${systemContext} />

      <div class="dashboard-main-grid">
        <div class="card dashboard-trend-card">
          <div class="card-header">
            <div class="card-title mb-0">Trend</div>
          </div>
          <${TrendChart} history=${history} onNavigate=${onNavigate} />
        </div>

        <div class="dashboard-health-col">
          <${DashboardConsistencyCard}
            items=${consistencyItems}
            hasItems=${newFailures.length > 0 || newPasses.length > 0 || inconsistent.length > 0}
            onNavigate=${onNavigate}
            getHistory=${getHistory}
          />
          <${DashboardSlowestCard} scenarios=${slowest} onNavigate=${onNavigate} />
        </div>
      </div>
    </div>
  `;
}
