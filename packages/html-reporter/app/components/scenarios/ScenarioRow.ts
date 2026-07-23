import htm from 'htm';
import { h } from 'preact';

import type { ReportHistoryEntry, ReportScenario } from '../../../src/cli/ReportData';
import { browserBadgeClass, formatDuration, formatRunLabel, getBrowserTag, relativeSourcePath, scenarioUrl, searchContainsTag, stripAbsolutePaths, stripAnsi, toggleTagInSearch } from '../../utils';
import { HistoryDots } from '../common/HistoryDots';
import { icons } from '../common/icons';
import { OutcomeBadge } from '../common/OutcomeBadge';

const html = htm.bind(h);

export interface ScenarioRowProps {
    scenario: ReportScenario;
    sort: string;
    onNavigate: (path: string) => void;
    runIndex: number | null;
    setSearch: (search: string) => void;
    search: string;
    specDirectory?: string;
    history?: ReportHistoryEntry[];
}

function ScenarioMeta({ scenario, specDirectory }: { scenario: ReportScenario; specDirectory?: string }): ReturnType<typeof html> {
    return html`
        <div class="scenario-meta">
          <span class="scenario-source">${relativeSourcePath(scenario, specDirectory)}</span>
          <span class="scenario-duration">${icons.clock}${formatDuration(scenario.duration)}</span>
        </div>
    `;
}

function ScenarioTags({ scenario, search, handleTagClick }: { scenario: ReportScenario; search: string; handleTagClick: (e: Event, tag: { type: string; name: string }) => void }): ReturnType<typeof html> {
    const browserTag = getBrowserTag(scenario);
    const browserTagObject = browserTag ? (scenario.tags || []).find(t => t.type === 'browser') : null;
    const browserActive = browserTagObject ? searchContainsTag(search, browserTagObject) : false;

    const uniqueTags = [...new Map((scenario.tags || []).filter(t => t.type !== 'browser').map(t => [t.name, t])).values()];

    return html`
        <div class="scenario-tags scroll-x-hidden">
          ${browserTag && browserTagObject ? html`<span class="badge ${browserBadgeClass(browserTag)} badge-link${browserActive ? ' active' : ''}" aria-pressed=${browserActive ? 'true' : 'false'} onClick=${(e: Event) => handleTagClick(e, browserTagObject)}>${browserTag}</span>` : null}
          ${scenario.retries && scenario.retries > 0 ? html`<span class="retries-badge">${scenario.retries + 1} ${(scenario.retries + 1) === 1 ? 'attempt' : 'attempts'}</span>` : null}
          ${uniqueTags.map(t => {
                const isActive = searchContainsTag(search, t);
                return html`<span class="tag-chip tag-chip-sm${isActive ? ' active' : ''}" aria-pressed=${isActive ? 'true' : 'false'} onClick=${(e: Event) => handleTagClick(e, t)}>${t.name}</span>`;
            })}
        </div>
    `;
}

function ScenarioHistoryLine({ scenario, runIndex }: { scenario: ReportScenario; runIndex: number | null }): ReturnType<typeof html> | null {
    if (!scenario.executionHistory || scenario.executionHistory.length <= 1) return null;
    const entries = (runIndex !== null ? scenario.executionHistory.slice(0, runIndex + 1) : scenario.executionHistory)
        .slice(-5)
        .map(entry => ({ outcome: entry.outcome, label: entry.outcome + ' — ' + formatRunLabel(entry.run, entry.timestamp || '') }));
    return html`
        <div class="scenario-history-line">
          <${HistoryDots} entries=${entries} max=${5} />
        </div>
    `;
}

export function ScenarioRow({ scenario, sort, onNavigate, runIndex, setSearch, search, specDirectory, history }: ScenarioRowProps): ReturnType<typeof html> {
    const url = scenarioUrl(scenario, runIndex, history);
    const clickHandler = (e: MouseEvent) => {
        if (e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        onNavigate(url);
    };

    const handleTagClick = (e: Event, tag: { type: string; name: string }) => {
        e.stopPropagation();
        e.preventDefault();
        setSearch(toggleTagInSearch(search, tag));
    };

    return html`
    <a class="scenario-item" href=${'#' + url} onClick=${clickHandler}
         onKeyDown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(url); } }}
         style="height:100%;display:flex;align-items:center">
      <${OutcomeBadge} outcome=${scenario.outcome} />
      <div class="scenario-info">
        <div class="scenario-name">${sort !== 'category' && scenario.category ? scenario.category + ' › ' : ''}${scenario.name}</div>
        ${scenario.error ? html`<div class="scenario-error-preview">${stripAnsi(stripAbsolutePaths(scenario.error.message, specDirectory))}</div>` : null}
        <${ScenarioHistoryLine} scenario=${scenario} runIndex=${runIndex} />
        <${ScenarioMeta} scenario=${scenario} specDirectory=${specDirectory} />
        <${ScenarioTags} scenario=${scenario} search=${search} handleTagClick=${handleTagClick} />
      </div>
    </a>
  `;
}
