import htm from 'htm';
import { h } from 'preact';
import { useMemo } from 'preact/hooks';

import type { ReportCapabilityNode, ReportHistoryEntry, ReportInconsistentTest, ReportScenario, ReportScenarioRef, ReportSummary, ReportSystemContext } from '../../src/ReportData';
import { computeCompletenessFromTree, formatDuration, runConfidence, scenarioUrl, scoreColor } from '../utils';
import { classifyConsistencyKind } from '../utils/selectors';
import { AreaSparkline } from './charts/AreaSparkline';
import { Delta } from './charts/Delta';
import { DotTrend } from './charts/DotTrend';
import { TrendChart } from './charts/TrendChart';
import { DashboardConsistencyCard } from './DashboardConsistencyCard';
import { DashboardKpiCard } from './DashboardKpiCard';
import { icons } from './icons';

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
    const totalFailed = (summary.outcomes.failed || 0) + (summary.outcomes.error || 0) + (summary.outcomes.compromised || 0);

    // Compute current scores from latest history entry or derive from summary
    const latestScore = history.length > 0 && history[history.length - 1].score;
    const previousScore = history.length > 1 && history[history.length - 2].score;
    const passRate = latestScore ? latestScore.passRate : (summary.totalScenarios > 0 ? Math.round((summary.outcomes.passed / summary.totalScenarios) * 100) : 0);
    const consistency = latestScore ? latestScore.consistency : 100;
    const completenessScore = latestScore ? latestScore.completeness : computeCompletenessFromTree(capabilities);
    const confidence = latestScore ? latestScore.confidence : runConfidence(passRate, completenessScore, consistency);

    // Previous run values for deltas
    const previousConfidence = previousScore ? previousScore.confidence : undefined;
    const previousPassRate = previousScore ? previousScore.passRate : undefined;
    const previousConsistency = previousScore ? previousScore.consistency : undefined;
    const previousCompleteness = previousScore ? previousScore.completeness : undefined;
    const previousFailed = history.length > 1 ? ((h: ReportHistoryEntry) => (h.outcomes.failed || 0) + (h.outcomes.error || 0) + (h.outcomes.compromised || 0))(history[history.length - 2]) : undefined;
    const previousDuration = history.length > 1 ? history[history.length - 2].duration : undefined;

    // Sparkline data from history
    const scoreHistory = history.filter(h => h.score);
    const confidenceTrend = scoreHistory.map(h => h.score!.confidence);
    const failedTrend = history.map(h => (h.outcomes.failed || 0) + (h.outcomes.error || 0) + (h.outcomes.compromised || 0));
    const durationTrend = history.map(h => h.duration);

    const sorted = [...scenarios].sort((a, b) => b.duration - a.duration);
    const slowest = sorted.slice(0, 5);
    const newFailures = useMemo(() => allNewFailures.slice(0, 5), []);
    const newPasses = useMemo(() => allNewPasses.slice(0, 5), []);
    const inconsistent = allInconsistentTests.slice(0, 5);

    // Look up execution history for a test by source identity
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
      <!-- KPI Row -->
      <div class="kpi-row">
        <${DashboardKpiCard} label="Confidence" value=${html`${confidence}<span style="font-size:var(--font-base);font-weight:400;color:var(--text-disabled);margin-left:1px">%</span>`} ariaLabel="Confidence: ${confidence} percent" onClick=${() => onNavigate('/capabilities')} valueColor=${scoreColor(confidence) || ''} variant="hero">
          <span class="kpi-subtitle">${confidenceSubtitle(confidence, previousConfidence, summary.totalScenarios, history.length, allNewFailures.length, allNewPasses.length)}</span>
          <${AreaSparkline} values=${confidenceTrend} color=${scoreColor(confidence) || 'var(--accent)'} />
        </${DashboardKpiCard}>
        <${DashboardKpiCard} label="Pass Rate" value=${html`${passRate}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled);margin-left:1px">%</span>`} ariaLabel="Pass rate: ${passRate} percent" onClick=${() => onNavigate('/tests?filter=failed,skipped')} valueColor=${scoreColor(passRate) || ''}>
          <${Delta} current=${passRate} previous=${previousPassRate} suffix="%" />
          <span class="kpi-subtitle">${summary.outcomes.passed} of ${summary.totalScenarios} passing</span>
        </${DashboardKpiCard}>
        <${DashboardKpiCard} label="Consistency" value=${html`${consistency}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled);margin-left:1px">%</span>`} ariaLabel="Consistency: ${consistency} percent" onClick=${() => onNavigate('/consistency')} valueColor=${scoreColor(consistency) || ''}>
          <${Delta} current=${consistency} previous=${previousConsistency} suffix="%" />
          <span class="kpi-subtitle">${consistency === 100 ? 'All tests consistent' : allInconsistentTests.length + ' inconsistent test' + (allInconsistentTests.length !== 1 ? 's' : '')}</span>
        </${DashboardKpiCard}>
        <${DashboardKpiCard} label="Completeness" value=${html`${completenessScore}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled);margin-left:1px">%</span>`} ariaLabel="Completeness: ${completenessScore} percent" onClick=${() => onNavigate('/capabilities')} valueColor=${scoreColor(completenessScore) || ''}>
          <${Delta} current=${completenessScore} previous=${previousCompleteness} suffix="%" />
          <span class="kpi-subtitle">${summary.totalScenarios - (summary.outcomes.pending || 0) - (summary.outcomes.skipped || 0)} of ${summary.totalScenarios} implemented</span>
        </${DashboardKpiCard}>
        <div class="kpi-row-operational">
          <${DashboardKpiCard} label="Failed" value=${totalFailed} ariaLabel="${totalFailed} failed scenarios" onClick=${() => onNavigate('/tests?filter=failed')} valueColor=${totalFailed > 0 ? 'var(--color-failed)' : 'var(--text-primary)'} variant="operational">
            <${Delta} current=${totalFailed} previous=${previousFailed} invert=${true} />
            <${DotTrend} values=${failedTrend} color="var(--color-failed)" />
          </${DashboardKpiCard}>
          <${DashboardKpiCard} label="Total Duration" value=${formatDuration(summary.duration)} ariaLabel="Total duration: ${formatDuration(summary.duration)}" onClick=${() => onNavigate('/tests?sort=duration')} variant="operational">
            ${previousDuration !== undefined ? html`<span class="kpi-delta ${summary.duration < previousDuration ? 'kpi-delta--positive' : summary.duration > previousDuration ? 'kpi-delta--negative' : 'kpi-delta--neutral'}">${summary.duration < previousDuration ? '↑' : summary.duration > previousDuration ? '↓' : '—'} ${formatDuration(Math.abs(summary.duration - previousDuration))} ${summary.duration < previousDuration ? 'faster' : summary.duration > previousDuration ? 'slower' : ''}</span>` : null}
            <${DotTrend} values=${durationTrend} color="var(--accent)" />
          </${DashboardKpiCard}>
        </div>
      </div>

      <!-- Context metadata -->
      <div class="dashboard-meta">
        <span>${summary.totalScenarios} scenarios • ${summary.testRunner}</span>
        ${systemContext && systemContext.ci ? (() => { const ci = systemContext.ci; const repoUrl = ci.repositoryUrl ? ci.repositoryUrl.replace(/\.git$/, '').replace(/^git@([^:]+):/, 'https://$1/') : ''; return html`
          ${ci.branch ? html`<span class="dashboard-meta-item">${icons.branchSm}${repoUrl ? html`<a href="${repoUrl}/tree/${ci.branch}" target="_blank" class="meta-link">${ci.branch}</a>` : html`<span>${ci.branch}</span>`}</span>` : null}
          ${ci.commit ? html`<span class="dashboard-meta-item">${icons.commitSm}${repoUrl ? html`<a href="${repoUrl}/commit/${ci.commit}" target="_blank" class="meta-link mono">${ci.commit.slice(0, 10)}</a>` : html`<span class="mono">${ci.commit.slice(0, 10)}</span>`}</span>` : null}
        `; })() : null}
      </div>

      <!-- Main grid: Trend (8col) + Health Summary (4col) -->
      <div class="dashboard-main-grid">
        <div class="card dashboard-trend-card">
          <div class="card-header">
            <div class="card-title mb-0">Trend</div>
          </div>
          <${TrendChart} history=${history} onNavigate=${onNavigate} />
        </div>

        <div class="dashboard-health-col">
          <!-- Consistency -->
          <${DashboardConsistencyCard}
            items=${consistencyItems}
            hasItems=${newFailures.length > 0 || newPasses.length > 0 || inconsistent.length > 0}
            onNavigate=${onNavigate}
            getHistory=${getHistory}
          />
          <!-- Slowest Tests -->
          <div class="card dashboard-status-card">
            <div class="card-header">
              <span class="status-card-title">Slowest Tests</span>
              <a class="view-all-link" onClick=${() => onNavigate('/tests?sort=duration')}>View all →</a>
            </div>
            ${slowest.map(s => html`
              <div class="status-item clickable" onClick=${() => onNavigate(scenarioUrl(s))}>
                <span class="status-icon" style="color:var(--color-pending)">⏱</span>
                <span class="status-item-name">${s.name}</span>
                <span class="status-item-meta">${formatDuration(s.duration)}</span>
              </div>
            `)}
          </div>
        </div>
      </div>
    </div>
  `;
}
