import htm from 'htm';
import { h } from 'preact';

import type { ReportHistoryEntry } from '../../../src/ReportData';
import { formatDuration, formatRunLabel, formatTimestamp, scoreColor } from '../../utils';
import { computeRunMetrics, normaliseRepoUrl } from '../../utils/computeRunMetrics';
import { GitLink } from '../GitLink';
import { icons } from '../icons';

const html = htm.bind(h);

interface TestRunRowProps {
    run: ReportHistoryEntry;
    onNavigate: (path: string) => void;
}

export function TestRunRow({ run, onNavigate }: TestRunRowProps): ReturnType<typeof html> {
    const { confidence, failedCount, skippedCount, passedPct, failedPct, skippedPct } = computeRunMetrics(run);
    const repoUrl = normaliseRepoUrl(run.repositoryUrl);

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
            ${run.branch ? html`<${GitLink} icon=${icons.branch} label=${run.branch} href=${repoUrl ? repoUrl + '/tree/' + run.branch : ''} />` : null}
            ${run.commit ? html`<${GitLink} icon=${icons.commit} label=${run.commit} href=${repoUrl ? repoUrl + '/commit/' + run.commit : ''} mono=${true} />` : null}
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
