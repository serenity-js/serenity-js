import htm from 'htm';
import { h } from 'preact';

import type { ReportHistoryEntry } from '../../../src/cli/ReportData';
import { formatDuration, formatRunLabel, formatTimestamp, scoreColor } from '../../utils';
import { computeRunMetrics, normaliseRepoUrl } from '../../utils/computeRunMetrics';
import { GitLink } from '../common/GitLink';
import { icons } from '../common/icons';

const html = htm.bind(h);

interface TestRunRowProps {
    run: ReportHistoryEntry;
    onNavigate: (path: string) => void;
}

export function TestRunRow({ run, onNavigate }: TestRunRowProps): ReturnType<typeof html> {
    const { confidence, failedCount, skippedCount, passedPct, failedPct, skippedPct } = computeRunMetrics(run);
    const repoUrl = normaliseRepoUrl(run.repositoryUrl);
    const labelIsTimestamp = /^\d{4}-\d{2}-\d{2}T/.test(run.label);

    return html`
      <div class="scenario-item test-run-row" onClick=${() => onNavigate('/tests?run=' + run.timestamp)}>
        <div class="scenario-info" style="min-width:0;flex:1">
          <div class="scenario-name">${formatRunLabel(run.label, run.timestamp)}</div>
          <div class="scenario-meta">
            ${labelIsTimestamp ? null : html`<span>${formatTimestamp(run.timestamp)}</span><span>·</span>`}
            <span>${formatDuration(run.duration)}</span>
            ${run.commit ? html`<${GitLink} icon=${icons.commit} label=${run.commit.slice(0, 7)} href=${repoUrl ? repoUrl + '/commit/' + run.commit : ''} mono=${true} />` : null}
          </div>
          <div class="run-outcomes-line">
            <span style="font-size:var(--font-sm);font-weight:600;color:${scoreColor(confidence) || 'var(--text-primary)'}" title="Confidence: ${confidence}%">◐${confidence}%</span>
            <div class="run-outcomes-bar" title="${run.outcomes.passed} passed, ${failedCount} failed, ${skippedCount} skipped">
              ${passedPct > 0 ? html`<div style="width:${passedPct}%;height:100%;background:var(--color-passed)"></div>` : null}
              ${failedPct > 0 ? html`<div style="width:${failedPct}%;height:100%;background:var(--color-failed)"></div>` : null}
              ${skippedPct > 0 ? html`<div style="width:${skippedPct}%;height:100%;background:var(--color-skipped)"></div>` : null}
            </div>
          </div>
        </div>
      </div>
    `;
}
