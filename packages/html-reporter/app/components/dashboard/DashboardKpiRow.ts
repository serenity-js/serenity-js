import htm from 'htm';
import { h } from 'preact';

import type { ReportSummary } from '../../../src/cli/ReportData.js';
import type { DashboardScores } from '../../utils/computeDashboardScores.js';
import { formatDuration, scoreColor } from '../../utils/index.js';
import { AreaSparkline } from '../common/charts/AreaSparkline.js';
import { Delta } from '../common/charts/Delta.js';
import { DotTrend } from '../common/charts/DotTrend.js';
import { DashboardKpiCard } from './DashboardKpiCard.js';

const html = htm.bind(h);

interface DashboardKpiRowProps {
    summary: ReportSummary;
    scores: DashboardScores;
    confidenceSubtitle: string;
    inconsistentCount: number;
    onNavigate: (path: string) => void;
}

export function DashboardKpiRow({ summary, scores, confidenceSubtitle, inconsistentCount, onNavigate }: DashboardKpiRowProps): ReturnType<typeof html> {
    const {
        passRate, consistency, completenessScore, confidence,
        previousPassRate, previousConsistency, previousCompleteness,
        confidenceTrend,
    } = scores;

    return html`
      <div class="kpi-row">
        <${DashboardKpiCard} label="Confidence" value=${percentValue(confidence, 'base')} ariaLabel="Confidence: ${confidence} percent" onClick=${() => onNavigate('/capabilities')} valueColor=${scoreColor(confidence) || ''} variant="hero">
          <span class="kpi-subtitle">${confidenceSubtitle}</span>
          <${AreaSparkline} values=${confidenceTrend} color=${scoreColor(confidence) || 'var(--accent)'} />
        </${DashboardKpiCard}>
        <${DashboardKpiCard} label="Pass Rate" value=${percentValue(passRate, 'sm')} ariaLabel="Pass rate: ${passRate} percent" onClick=${() => onNavigate('/tests?filter=failed,skipped')} valueColor=${scoreColor(passRate) || ''}>
          <${Delta} current=${passRate} previous=${previousPassRate} suffix="%" />
          <span class="kpi-subtitle">${summary.outcomes.passed} of ${summary.totalScenarios} passing</span>
        </${DashboardKpiCard}>
        <${DashboardKpiCard} label="Consistency" value=${percentValue(consistency, 'sm')} ariaLabel="Consistency: ${consistency} percent" onClick=${() => onNavigate('/consistency')} valueColor=${scoreColor(consistency) || ''}>
          <${Delta} current=${consistency} previous=${previousConsistency} suffix="%" />
          <span class="kpi-subtitle">${consistency === 100 ? 'All tests consistent' : inconsistentCount + ' inconsistent test' + (inconsistentCount !== 1 ? 's' : '')}</span>
        </${DashboardKpiCard}>
        <${DashboardKpiCard} label="Completeness" value=${percentValue(completenessScore, 'sm')} ariaLabel="Completeness: ${completenessScore} percent" onClick=${() => onNavigate('/capabilities')} valueColor=${scoreColor(completenessScore) || ''}>
          <${Delta} current=${completenessScore} previous=${previousCompleteness} suffix="%" />
          <span class="kpi-subtitle">${summary.totalScenarios - (summary.outcomes.pending || 0) - (summary.outcomes.skipped || 0)} of ${summary.totalScenarios} implemented</span>
        </${DashboardKpiCard}>
        <${OperationalCards} summary=${summary} scores=${scores} onNavigate=${onNavigate} />
      </div>
    `;
}

function percentValue(value: number, size: 'base' | 'sm'): ReturnType<typeof html> {
    return html`${value}<span style="font-size:var(--font-${size});font-weight:400;color:var(--text-disabled);margin-left:1px">%</span>`;
}

function OperationalCards({ summary, scores, onNavigate }: { summary: ReportSummary; scores: DashboardScores; onNavigate: (path: string) => void }): ReturnType<typeof html> {
    const { totalFailed, previousFailed, failedTrend, previousDuration, durationTrend } = scores;

    return html`
        <div class="kpi-row-operational">
          <${DashboardKpiCard} label="Failed" value=${totalFailed} ariaLabel="${totalFailed} failed scenarios" onClick=${() => onNavigate('/tests?filter=failed')} valueColor=${totalFailed > 0 ? 'var(--color-failed)' : 'var(--text-primary)'} variant="operational">
            <${Delta} current=${totalFailed} previous=${previousFailed} invert=${true} />
            <${DotTrend} values=${failedTrend} color="var(--color-failed)" />
          </${DashboardKpiCard}>
          <${DashboardKpiCard} label="Total Duration" value=${formatDuration(summary.duration)} ariaLabel="Total duration: ${formatDuration(summary.duration)}" onClick=${() => onNavigate('/tests?sort=duration')} variant="operational">
            <${DurationDelta} current=${summary.duration} previous=${previousDuration} />
            <${DotTrend} values=${durationTrend} color="var(--accent)" />
          </${DashboardKpiCard}>
        </div>
    `;
}

function DurationDelta({ current, previous }: { current: number; previous: number | undefined }): ReturnType<typeof html> | null {
    if (previous === undefined) return null;

    const diff = current - previous;
    const cls = diff < 0 ? 'kpi-delta--positive' : diff > 0 ? 'kpi-delta--negative' : 'kpi-delta--neutral';
    const arrow = diff < 0 ? '↑' : diff > 0 ? '↓' : '—';
    const label = diff < 0 ? 'faster' : diff > 0 ? 'slower' : '';

    return html`<span class="kpi-delta ${cls}">${arrow} ${formatDuration(Math.abs(diff))} ${label}</span>`;
}
