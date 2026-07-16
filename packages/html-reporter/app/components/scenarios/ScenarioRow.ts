import htm from 'htm';
import { h } from 'preact';

import type { ReportHistoryEntry, ReportScenario } from '../../../src/cli/ReportData';
import { ansiToHtml, browserBadgeClass, formatDuration, formatRunLabel, getBrowserTag, relativeSourcePath, scenarioUrl } from '../../utils';
import { HistoryDots } from '../common/HistoryDots';
import { OutcomeBadge } from '../common/OutcomeBadge';

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
    const url = scenarioUrl(scenario, runIndex, history);
    const clickHandler = (e: MouseEvent) => {
        // Allow cmd+click / ctrl+click to open in new tab naturally
        if (e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        onNavigate(url);
    };
    const stopProp = (e: Event) => e.stopPropagation();

    return html`
    <a class="scenario-item" href=${'#' + url} onClick=${clickHandler}
         onKeyDown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(url); } }}
         style="height:100%;display:flex;align-items:center">
      <${OutcomeBadge} outcome=${scenario.outcome} />
      <div class="scenario-info">
        <div class="scenario-name">${sort !== 'category' && scenario.category ? scenario.category + ' › ' : ''}${scenario.name}</div>
        ${scenario.error ? html`<div class="scenario-error-preview" dangerouslySetInnerHTML=${{ __html: ansiToHtml(scenario.error.message) }}></div>` : null}
        ${scenario.executionHistory && scenario.executionHistory.length > 1 ? html`
          <div class="scenario-history-line">
            <${HistoryDots} entries=${(runIndex !== null ? scenario.executionHistory.slice(0, runIndex + 1) : scenario.executionHistory).slice(-5).map(entry => ({ outcome: entry.outcome, label: entry.outcome + ' — ' + formatRunLabel(entry.run, entry.timestamp || '') }))} max=${5} />
          </div>
        ` : null}
        <div class="scenario-meta">
          <span class="scenario-source">${relativeSourcePath(scenario, specDirectory)}</span>
        </div>
        <div class="scenario-tags">
          ${getBrowserTag(scenario) ? html`<span class="badge ${browserBadgeClass(getBrowserTag(scenario)!)} badge-link" onClick=${(e: Event) => { stopProp(e); onNavigate('/tests?search=' + encodeURIComponent('"' + getBrowserTag(scenario)! + '"')); }}>${getBrowserTag(scenario)}</span>` : null}
          ${scenario.retries && scenario.retries > 0 ? html`<span class="retries-badge">${scenario.retries + 1} ${(scenario.retries + 1) === 1 ? 'attempt' : 'attempts'}</span>` : null}
          ${[...new Map((scenario.tags || []).filter(t => t.type !== 'feature' && t.type !== 'browser').map(t => [t.type + ':' + t.name, t])).values()].map(t => html`<span class="tag-chip tag-chip-sm" onClick=${(e: Event) => { stopProp(e); onNavigate('/tests?search=' + encodeURIComponent('"' + t.name + '"')); }}>${t.name}</span>`)}
        </div>
      </div>
      <span class="scenario-duration">${formatDuration(scenario.duration)}</span>
    </a>
  `;
}
