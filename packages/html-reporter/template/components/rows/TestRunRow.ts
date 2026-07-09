import htm from 'htm';
import { h } from 'preact';

import type { ReportHistoryEntry } from '../../../src/ReportData';
import { formatDuration, formatRunLabel, formatTimestamp, scoreColor } from '../../utils';
import { icons } from '../icons';

const html = htm.bind(h);

interface TestRunRowProps {
    run: ReportHistoryEntry;
    onNavigate: (path: string) => void;
}

export function TestRunRow({ run, onNavigate }: TestRunRowProps): ReturnType<typeof html> {
    const total = Object.values(run.outcomes).reduce((a: number, b: number) => a + b, 0);
    const confidence = run.score ? run.score.confidence : (total > 0 ? Math.round((run.outcomes.passed / total) * 100) : 0);
    const failedCount = (run.outcomes.failed || 0) + (run.outcomes.error || 0) + (run.outcomes.compromised || 0);
    const skippedCount = (run.outcomes.pending || 0) + (run.outcomes.skipped || 0);
    const passedPct = total > 0 ? (run.outcomes.passed / total) * 100 : 0;
    const failedPct = total > 0 ? (failedCount / total) * 100 : 0;
    const skippedPct = total > 0 ? (skippedCount / total) * 100 : 0;

    const repoUrl = run.repositoryUrl ? run.repositoryUrl.replace(/\.git$/, '').replace(/^git@([^:]+):/, 'https://$1/') : '';

    return html`
      <div class="scenario-item" onClick=${() => onNavigate('/tests?run=' + run.timestamp)}>
        <div class="scenario-outcome-icon passed" style="background:var(--accent-light);color:var(--text-primary)">
          #
        </div>
        <div class="scenario-info">
          <div class="scenario-name">${formatRunLabel(run.label, run.timestamp)}</div>
          <div class="scenario-meta">
            <span>${formatTimestamp(run.timestamp)}</span>
            <span>•</span>
            <span>${formatDuration(run.duration)}</span>
            ${run.branch ? html`<span>•</span><span class="inline-flex-center">${icons.branch}${repoUrl ? html`<a href="${repoUrl}/tree/${run.branch}" target="_blank" rel="noopener" onClick=${(e: Event) => e.stopPropagation()} class="text-xs" style="color:inherit;text-decoration:none" onMouseOver=${(e: Event) => (e.target as HTMLElement).style.textDecoration='underline'} onMouseOut=${(e: Event) => (e.target as HTMLElement).style.textDecoration='none'}>${run.branch}</a>` : html`<span class="text-xs">${run.branch}</span>`}</span>` : null}
            ${run.commit ? html`<span>•</span><span class="inline-flex-center">${icons.commit}${repoUrl ? html`<a href="${repoUrl}/commit/${run.commit}" target="_blank" rel="noopener" onClick=${(e: Event) => e.stopPropagation()} class="font-mono text-xs" style="color:inherit;text-decoration:none" onMouseOver=${(e: Event) => (e.target as HTMLElement).style.textDecoration='underline'} onMouseOut=${(e: Event) => (e.target as HTMLElement).style.textDecoration='none'}>${run.commit}</a>` : html`<span class="font-mono text-xs">${run.commit}</span>`}</span>` : null}
            ${run.ciJobUrl ? html`<span>•</span><a href=${run.ciJobUrl} target="_blank" rel="noopener" onClick=${(e: Event) => e.stopPropagation()} class="ci-link inline-flex-center" style="color:var(--accent);text-decoration:none" title="View CI job">${icons.externalLink}CI</a>` : null}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;min-width:120px">
          <span style="font-size:var(--font-sm);font-weight:600;color:${scoreColor(confidence) || 'var(--text-primary)'}" title="Confidence: ${confidence}%"><span style="font-size:0.7em;opacity:0.7;margin-right:2px">◐</span>${confidence}%</span>
          <div style="display:flex;overflow:hidden;border-radius:3px;background:var(--divider);height:6px;width:100%" title="${run.outcomes.passed} passed, ${failedCount} failed, ${skippedCount} skipped">
            ${passedPct > 0 ? html`<div style="width:${passedPct}%;height:100%;background:var(--color-passed)"></div>` : null}
            ${failedPct > 0 ? html`<div style="width:${failedPct}%;height:100%;background:var(--color-failed)"></div>` : null}
            ${skippedPct > 0 ? html`<div style="width:${skippedPct}%;height:100%;background:var(--color-skipped)"></div>` : null}
          </div>
        </div>
      </div>
    `;
}
