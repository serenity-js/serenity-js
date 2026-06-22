/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import htm from 'htm';
import { h } from 'preact';

import { DATA, formatDuration, formatTimestamp } from '../utils';
import { TrendChart } from './DashboardView';

const html = htm.bind(h);

export function TestRunsView({ onNavigate }) {
    const runs = [...DATA.history].reverse();
    return html`
    <div class="card" style="margin-bottom:var(--space-md);overflow:hidden">
      <div class="card-title">Trend (All ${DATA.history.length} runs)</div>
      <${TrendChart} history=${DATA.history} onNavigate=${onNavigate} />
    </div>
    <div class="card">
      <div class="card-title">Test Run History</div>
      <div class="scenario-list">
        ${runs.map((run) => {
            return html`
          <div class="scenario-item" onClick=${() => onNavigate('/tests?run=' + run.timestamp)}>
            <div class="scenario-outcome-icon passed" style="background:var(--accent-light);color:var(--text-primary)">
              #
            </div>
            <div class="scenario-info">
              <div class="scenario-name">${run.label} — ${formatTimestamp(run.timestamp)}</div>
              <div class="scenario-meta">
                <span>${formatTimestamp(run.timestamp)}</span>
                <span>•</span>
                <span>${formatDuration(run.duration)}</span>
                ${run.branch ? html`<span>•</span><span style="display:inline-flex;align-items:center;gap:3px">${(() => { const repoUrl = run.repositoryUrl ? run.repositoryUrl.replace(/\.git$/, '').replace(/^git@([^:]+):/, 'https://$1/') : ''; return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-xs"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>${repoUrl ? html`<a href="${repoUrl}/tree/${run.branch}" target="_blank" rel="noopener" onClick=${(e) => e.stopPropagation()} style="font-size:var(--font-xs);color:inherit;text-decoration:none" onMouseOver=${(e) => e.target.style.textDecoration='underline'} onMouseOut=${(e) => e.target.style.textDecoration='none'}>${run.branch}</a>` : html`<span style="font-size:var(--font-xs)">${run.branch}</span>`}`; })()}</span>` : null}
                ${run.commit ? html`<span>•</span><span style="display:inline-flex;align-items:center;gap:3px">${(() => { const repoUrl = run.repositoryUrl ? run.repositoryUrl.replace(/\.git$/, '').replace(/^git@([^:]+):/, 'https://$1/') : ''; return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-xs"><circle cx="12" cy="12" r="4"/><line x1="1" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="23" y2="12"/></svg>${repoUrl ? html`<a href="${repoUrl}/commit/${run.commit}" target="_blank" rel="noopener" onClick=${(e) => e.stopPropagation()} style="font-family:var(--font-mono);font-size:var(--font-xs);color:inherit;text-decoration:none" onMouseOver=${(e) => e.target.style.textDecoration='underline'} onMouseOut=${(e) => e.target.style.textDecoration='none'}>${run.commit}</a>` : html`<span style="font-family:var(--font-mono);font-size:var(--font-xs)">${run.commit}</span>`}`; })()}</span>` : null}
                ${run.ciJobUrl ? html`<span>•</span><a href=${run.ciJobUrl} target="_blank" rel="noopener" onClick=${(e) => e.stopPropagation()} style="color:var(--accent);text-decoration:none;display:inline-flex;align-items:center;gap:3px" class="ci-link" title="View CI job"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>CI</a>` : null}
              </div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
              <span style="font-size:var(--font-md);font-weight:600;color:var(--color-passed)">${Math.round((run.outcomes.passed / Object.values(run.outcomes).reduce((a, b) => a + b, 0)) * 100)}%</span>
              <span class="text-xs-muted">${Object.values(run.outcomes).reduce((a, b) => a + b, 0)} scenarios</span>
            </div>
          </div>
        `;
        })}
      </div>
    </div>
  `;
}
