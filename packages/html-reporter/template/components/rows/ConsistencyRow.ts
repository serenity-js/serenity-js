import htm from 'htm';
import { h } from 'preact';

import type { ReportInconsistentTest } from '../../../src/ReportData';
import { browserBadgeClass, getBrowserTag, outcomeClass, outcomeDisplayName, outcomeIcon, relativeSourcePath, scenarioUrl } from '../../utils';

const html = htm.bind(h);

export interface ConsistencyRowProps {
    item: ReportInconsistentTest & { kind: string; lastOutcome: string };
    specDirectory?: string;
    onNavigate: (path: string) => void;
}

export function ConsistencyRow({ item: t, specDirectory, onNavigate }: ConsistencyRowProps): ReturnType<typeof html> {
    const clickHandler = () => onNavigate(scenarioUrl(t));

    return html`
    <div class="scenario-item" role="button" tabindex="0" onClick=${clickHandler}
         onKeyDown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clickHandler(); } }}
         style="height:100%;display:flex;align-items:center">
      <span class="scenario-outcome-icon ${outcomeClass(t.lastOutcome)}">${outcomeIcon(t.lastOutcome)}</span>
      <div class="scenario-info">
        <div class="scenario-name">${t.name}</div>
        <div class="scenario-meta">
          ${getBrowserTag(t) ? html`<span class="badge ${browserBadgeClass(getBrowserTag(t)!)}">${getBrowserTag(t)}</span>` : null}
          ${(t.tags || []).filter(tag => tag.type === 'project').map(tag => html`<span class="badge">${tag.name}</span>`)}
          <span class="status-item-kind" style="color:${t.kind === 'degraded' ? 'var(--color-failed)' : t.kind === 'recovered' ? 'var(--color-passed)' : 'var(--color-pending)'}">${t.kind}</span>
          <span class="scenario-source">${relativeSourcePath(t, specDirectory)}</span>
          ${t.history && t.history.length > 1 ? html`<span class="scenario-history">${t.history.slice(-5).map((outcome, i) => html`<span class="history-dot history-dot--${outcomeClass(outcome)}" title=${outcomeDisplayName(outcome) + (t.labels && t.labels[i] ? ' (' + t.labels[i] + ')' : '')}></span>`)}</span>` : null}
        </div>
      </div>
      <span class="scenario-duration" style="color:var(--color-pending)">${Math.round(t.inconsistencyRate * 100)}%</span>
    </div>
  `;
}
