import htm from 'htm';
import { h } from 'preact';
import { useMemo } from 'preact/hooks';

import type { ReportCapabilityNode, ReportHistoryEntry, ReportInconsistentTest, ReportScenario, ReportScenarioRef, ReportSummary, ReportSystemContext } from '../../src/ReportData';
import { browserBadgeClass, computeCompletenessFromTree, formatDuration, getBrowserTag, outcomeClass, runConfidence, scenarioUrl } from '../utils';
import { AreaSparkline } from './charts/AreaSparkline';
import { Delta } from './charts/Delta';
import { DotTrend } from './charts/DotTrend';
import { TrendChart } from './charts/TrendChart';
import { icons } from './icons';

const html = htm.bind(h);

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

    // Colour: only exceptional or warning states get colour; "normal good" uses default text
    const heroColor = (v: number) => v >= 90 ? 'var(--color-passed)' : v < 50 ? 'var(--color-failed)' : v < 70 ? 'var(--color-pending)' : undefined;
    const scoreColor = (v: number) => v >= 90 ? 'var(--color-passed)' : v < 50 ? 'var(--color-failed)' : v < 70 ? 'var(--color-pending)' : undefined;

    const sorted = [...scenarios].sort((a, b) => b.duration - a.duration);
    const slowest = sorted.slice(0, 5);
    const newFailures = useMemo(() => allNewFailures.slice(0, 5), []);
    const newPasses = useMemo(() => allNewPasses.slice(0, 5), []);
    const inconsistent = allInconsistentTests.slice(0, 5);

    // Look up execution history for a test by source identity
    const consistencyItems = useMemo(() => [
        ...newFailures.map(t => ({ ...t, kind: 'degraded' as const })),
        ...newPasses.map(t => ({ ...t, kind: 'recovered' as const })),
        ...inconsistent
            .filter(t => !newFailures.some(f => f.source.path === t.source.path) && !newPasses.some(p => p.source.path === t.source.path))
            .map(t => ({ ...t, kind: 'inconsistent' as const })),
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
        <button type="button" class="kpi-card kpi-card--hero" onClick=${() => onNavigate('/capabilities')} aria-label="Confidence: ${confidence} percent">
          <span class="kpi-label">Confidence</span>
          <span class="kpi-value" style=${heroColor(confidence) ? `color:${heroColor(confidence)}` : ''}>${confidence}<span style="font-size:var(--font-base);font-weight:400;color:var(--text-disabled);margin-left:1px">%</span></span>
          <span class="kpi-subtitle">${(() => {
                if (previousConfidence === undefined) return `${summary.totalScenarios} scenarios across ${history.length} run${history.length !== 1 ? 's' : ''}`;
                const newFails = allNewFailures.length;
                const recovered = allNewPasses.length;
                if (confidence > previousConfidence) {
                    if (recovered > 0) return `Improved since last run — ${recovered} test${recovered > 1 ? 's' : ''} recovered`;
                    return `Improved since last run — pass rate up`;
                }
                if (confidence < previousConfidence) {
                    if (newFails > 0) return `Decreased since last run — ${newFails} new failure${newFails > 1 ? 's' : ''}`;
                    return `Decreased since last run — consistency dropped`;
                }
                return 'No change since last run';
            })()}</span>
          <${AreaSparkline} values=${confidenceTrend} color=${heroColor(confidence) || 'var(--accent)'} />
        </button>
        <button type="button" class="kpi-card" onClick=${() => onNavigate('/tests?filter=failed,skipped')} aria-label="Pass rate: ${passRate} percent">
          <span class="kpi-label">Pass Rate</span>
          <span class="kpi-value" style=${scoreColor(passRate) ? `color:${scoreColor(passRate)}` : ''}>${passRate}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled);margin-left:1px">%</span></span>
          <${Delta} current=${passRate} previous=${previousPassRate} suffix="%" />
          <span class="kpi-subtitle">${summary.outcomes.passed} of ${summary.totalScenarios} passing</span>
        </button>
        <button type="button" class="kpi-card" onClick=${() => onNavigate('/consistency')} aria-label="Consistency: ${consistency} percent">
          <span class="kpi-label">Consistency</span>
          <span class="kpi-value" style=${scoreColor(consistency) ? `color:${scoreColor(consistency)}` : ''}>${consistency}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled);margin-left:1px">%</span></span>
          <${Delta} current=${consistency} previous=${previousConsistency} suffix="%" />
          <span class="kpi-subtitle">${consistency === 100 ? 'All tests consistent' : allInconsistentTests.length + ' inconsistent test' + (allInconsistentTests.length !== 1 ? 's' : '')}</span>
        </button>
        <button type="button" class="kpi-card" onClick=${() => onNavigate('/capabilities')} aria-label="Completeness: ${completenessScore} percent">
          <span class="kpi-label">Completeness</span>
          <span class="kpi-value" style=${scoreColor(completenessScore) ? `color:${scoreColor(completenessScore)}` : ''}>${completenessScore}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled);margin-left:1px">%</span></span>
          <${Delta} current=${completenessScore} previous=${previousCompleteness} suffix="%" />
          <span class="kpi-subtitle">${summary.totalScenarios - (summary.outcomes.pending || 0) - (summary.outcomes.skipped || 0)} of ${summary.totalScenarios} implemented</span>
        </button>
        <div class="kpi-row-operational">
          <button type="button" class="kpi-card kpi-card--operational" onClick=${() => onNavigate('/tests?filter=failed')} aria-label="${totalFailed} failed scenarios">
            <span class="kpi-label">Failed</span>
            <span class="kpi-value" style="color:${totalFailed > 0 ? 'var(--color-failed)' : 'var(--text-primary)'}">${totalFailed}</span>
            <${Delta} current=${totalFailed} previous=${previousFailed} invert=${true} />
            <${DotTrend} values=${failedTrend} color="var(--color-failed)" />
          </button>
          <button type="button" class="kpi-card kpi-card--operational" onClick=${() => onNavigate('/tests?sort=duration')} aria-label="Total duration: ${formatDuration(summary.duration)}">
            <span class="kpi-label">Total Duration</span>
            <span class="kpi-value">${formatDuration(summary.duration)}</span>
            ${previousDuration !== undefined ? html`<span class="kpi-delta ${summary.duration < previousDuration ? 'kpi-delta--positive' : summary.duration > previousDuration ? 'kpi-delta--negative' : 'kpi-delta--neutral'}">${summary.duration < previousDuration ? '↑' : summary.duration > previousDuration ? '↓' : '—'} ${formatDuration(Math.abs(summary.duration - previousDuration))} ${summary.duration < previousDuration ? 'faster' : summary.duration > previousDuration ? 'slower' : ''}</span>` : null}
            <${DotTrend} values=${durationTrend} color="var(--accent)" />
          </button>
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
          <div class="card dashboard-status-card">
            <div class="card-header">
              <span class="status-card-title">Consistency</span>
              ${(newFailures.length > 0 || newPasses.length > 0 || inconsistent.length > 0) ? html`<a class="view-all-link" onClick=${() => onNavigate('/consistency')}>View all →</a>` : null}
            </div>
            ${(() => {
                if (consistencyItems.length === 0) return html`<div class="status-empty status-empty--ok"><span class="status-chip">✓</span> All tests consistent</div>`;
                return consistencyItems.map(t => html`
                    <div class="status-item status-item--rich clickable" onClick=${() => onNavigate(scenarioUrl(t))}>
                      <div class="status-item-main">
                        <span class="status-icon ${t.kind === 'degraded' ? 'status-icon--fail' : t.kind === 'recovered' ? 'status-icon--pass' : 'status-icon--warn'}">${t.kind === 'degraded' ? '✗' : t.kind === 'recovered' ? '✓' : '⚠'}</span>
                        <span class="status-item-name">${t.name}</span>
                        ${getBrowserTag(t) ? html`<span class="badge ${browserBadgeClass(getBrowserTag(t)!)}" style="font-size:10px;padding:1px 6px">${getBrowserTag(t)}</span>` : null}
                        <span class="status-item-kind" style="color:${t.kind === 'degraded' ? 'var(--color-failed)' : t.kind === 'recovered' ? 'var(--color-passed)' : 'var(--color-pending)'}">${t.kind}</span>
                      </div>
                      <div class="status-item-history">${((t as { history?: string[] }).history || getHistory(t)).map((h: string | { outcome: string; run: string }, i: number) => {
                    const outcome = typeof h === 'string' ? h : h.outcome;
                    const label = (t as { labels?: string[] }).labels ? (t as { labels?: string[] }).labels![i] : (typeof h === 'object' ? h.run : '');
                    return html`<span class="history-dot history-dot--${outcomeClass(outcome)}" title=${outcome + (label ? ' (' + label + ')' : '')}></span>`;
                })}</div>
                    </div>
                `);
            })()}
          </div>
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
