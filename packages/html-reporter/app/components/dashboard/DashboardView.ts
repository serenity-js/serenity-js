import htm from 'htm';
import { h } from 'preact';
import { useMemo } from 'preact/hooks';

import type { ReportCapabilityNode, ReportHistoryEntry, ReportInconsistentTest, ReportScenario, ReportScenarioRef, ReportSummary, ReportSystemContext } from '../../../src/cli/ReportData';
import { computeDashboardScores } from '../../utils/computeDashboardScores';
import { tagDiscriminator } from '../../utils/navigation';
import { classifyConsistencyKind } from '../../utils/selectors';
import { TrendChart } from '../common/charts/TrendChart';
import { DashboardConsistencyCard } from './DashboardConsistencyCard';
import { DashboardKpiRow } from './DashboardKpiRow';
import { DashboardMeta } from './DashboardMeta';
import { DashboardSlowestCard } from './DashboardSlowestCard';

const html = htm.bind(h);

interface ConfidenceContext {
    confidence: number;
    previousConfidence: number | undefined;
    totalScenarios: number;
    runCount: number;
    newFailCount: number;
    recoveredCount: number;
}

function confidenceSubtitle({ confidence, previousConfidence, totalScenarios, runCount, newFailCount, recoveredCount }: ConfidenceContext): string {
    if (previousConfidence === undefined) {
        return `${totalScenarios} scenarios across ${runCount} run${runCount !== 1 ? 's' : ''}`;
    }
    if (confidence > previousConfidence) {
        return recoveredCount > 0
            ? `Improved since last run — ${recoveredCount} test${recoveredCount > 1 ? 's' : ''} recovered`
            : `Improved since last run — pass rate up`;
    }
    if (confidence < previousConfidence) {
        return newFailCount > 0
            ? `Decreased since last run — ${newFailCount} new failure${newFailCount > 1 ? 's' : ''}`
            : `Decreased since last run — consistency dropped`;
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
        const discriminator = tagDiscriminator(t.tags);
        const match = discriminator
            ? scenarios.find(s => s.source.path + ':' + (s.source.line || '') === key && tagDiscriminator(s.tags) === discriminator)
                || scenarios.find(s => s.name === t.name && s.source.path === t.source.path && tagDiscriminator(s.tags) === discriminator)
            : scenarios.find(s => s.source.path + ':' + (s.source.line || '') === key)
                || scenarios.find(s => s.name === t.name && s.source.path === t.source.path);
        return match && match.executionHistory ? match.executionHistory.slice(-5) : [];
    };

    const latestRun = history.length > 0 ? history[history.length - 1] : undefined;
    const incompleteModules = latestRun?.modules?.filter(m => !m.finishedAt) || [];
    const totalModules = latestRun?.modules?.length || 0;

    return html`
    <div class="dashboard">
      ${incompleteModules.length > 0 && html`
        <div class="dashboard-incomplete-banner" role="alert">
          <span class="dashboard-incomplete-banner-icon">⚠️</span>
          <span>The latest run is incomplete — ${incompleteModules.length} of ${totalModules} module${totalModules !== 1 ? 's' : ''} did not finish. Results below reflect only the modules that completed successfully.</span>
        </div>
      `}
      <${DashboardKpiRow}
        summary=${summary}
        scores=${scores}
        confidenceSubtitle=${confidenceSubtitle({ confidence: scores.confidence, previousConfidence: scores.previousConfidence, totalScenarios: summary.totalScenarios, runCount: history.length, newFailCount: allNewFailures.length, recoveredCount: allNewPasses.length })}
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
