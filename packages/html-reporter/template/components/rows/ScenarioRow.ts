import htm from 'htm';
import { h } from 'preact';

import type { ReportHistoryEntry, ReportScenario } from '../../../src/ReportData';
import { browserBadgeClass, formatDuration, formatRunLabel, getBrowserTag, outcomeClass, outcomeIcon, relativeSourcePath, scenarioUrl } from '../../utils';

const html = htm.bind(h);

export interface ScenarioRowProps {
    scenario: ReportScenario;
    sort: string;
    onNavigate: (path: string) => void;
    runIndex: number | null;
    setSearch: (search: string) => void;
    specDirectory?: string;
    history?: ReportHistoryEntry[];
}

export function ScenarioRow({ scenario, sort, onNavigate, runIndex, setSearch, specDirectory, history }: ScenarioRowProps): ReturnType<typeof html> {
    const clickHandler = () => onNavigate(scenarioUrl(scenario, runIndex, history));
    const stopProp = (e: Event) => e.stopPropagation();

    return html`
    <div class="scenario-item" role="button" tabindex="0" onClick=${clickHandler}
         onKeyDown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clickHandler(); } }}
         style="height:100%;display:flex;align-items:center">
      <div class="scenario-outcome-icon ${outcomeClass(scenario.outcome)}">
        ${outcomeIcon(scenario.outcome)}
      </div>
      <div class="scenario-info">
        <div class="scenario-name">${sort !== 'category' && scenario.category ? scenario.category + ' › ' : ''}${scenario.name}</div>
        ${scenario.error ? html`<div class="scenario-error-preview">${scenario.error.message}</div>` : null}
        <div class="scenario-tags">
          ${getBrowserTag(scenario) ? html`<a href=${'#/tests?search=' + encodeURIComponent('"' + getBrowserTag(scenario)! + '"')} class="badge ${browserBadgeClass(getBrowserTag(scenario)!)} badge-link" onClick=${stopProp}>${getBrowserTag(scenario)}</a>` : null}
          ${scenario.retries && scenario.retries > 0 ? html`<span class="retries-badge">${scenario.retries + 1} ${(scenario.retries + 1) === 1 ? 'attempt' : 'attempts'}</span>` : null}
          ${[...new Map((scenario.tags || []).filter(t => t.type !== 'feature' && t.type !== 'browser').map(t => [t.type + ':' + t.name, t])).values()].map(t => html`<a href=${'#/tests?search=' + encodeURIComponent('"' + t.name + '"')} class="tag-chip tag-chip-sm" onClick=${stopProp}>${t.name}</a>`)}
        </div>
        <div class="scenario-meta">
          <span class="scenario-source">${relativeSourcePath(scenario, specDirectory)}</span>
          ${scenario.executionHistory && scenario.executionHistory.length > 1 ? html`<span class="scenario-history">${(runIndex !== null ? scenario.executionHistory.slice(0, runIndex + 1) : scenario.executionHistory).slice(-5).map(entry => html`<span class="history-dot history-dot--${outcomeClass(entry.outcome)}" title=${entry.outcome + ' — ' + formatRunLabel(entry.run, entry.timestamp || '')}></span>`)}</span>` : null}
        </div>
      </div>
      <span class="scenario-duration">${formatDuration(scenario.duration)}</span>
    </div>
  `;
}
