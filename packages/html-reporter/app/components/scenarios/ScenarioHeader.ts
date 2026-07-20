import htm from 'htm';
import { h } from 'preact';

import type { ReportHistoryEntry, ReportScenario } from '../../../src/cli/ReportData';
import { useScrollFade } from '../../hooks/useScrollFade';
import { browserBadgeClass, formatDuration, getBrowserTag, outcomeClass, outcomeIcon, RawHtml, relativeSourcePath, showToast } from '../../utils';
import { icons } from '../common/icons';
import { CastSection } from './CastSection';
import { ExecutionHistory } from './ExecutionHistory';

const html = htm.bind(h);

interface ScenarioHeaderProps {
    scenario: ReportScenario;
    activeDuration: number;
    specDirectory?: string;
    tags: ReportScenario['tags'];
    hasTags: boolean;
    hasExecutionHistory: boolean;
    cast: NonNullable<ReportScenario['cast']>;
    hasCast: boolean;
    runIndex: number | null;
    history: ReportHistoryEntry[];
    onNavigate: (path: string) => void;
}

export function ScenarioHeader({ scenario, activeDuration, specDirectory, tags, hasTags, hasExecutionHistory, cast, hasCast, runIndex, history, onNavigate }: ScenarioHeaderProps): ReturnType<typeof html> {
    const { ref: tagsRef, fadeClass: tagsFadeClass } = useScrollFade<HTMLDivElement>();

    const copyTestPath = () => {
        const text = scenario.source.line ? scenario.source.path + ':' + scenario.source.line : scenario.source.path;
        navigator.clipboard.writeText(text).then(() => showToast('Path copied to clipboard')).catch(() => {});
    };

    return html`
      <div class="card mb-md">
        <div class="scenario-detail-header">
          <div class="scenario-detail-outcome scenario-outcome-icon ${outcomeClass(scenario.outcome)}">
            ${outcomeIcon(scenario.outcome)}
          </div>
          <div class="flex-1">
            <div class="flex-row gap-sm">
              <div class="scenario-detail-title flex-1">${scenario.name}</div>
              <button onClick=${copyTestPath} title="Copy test path to clipboard" class="copy-btn">
                ${icons.copy}
              </button>
            </div>
            <div class="scenario-detail-meta">
              <span class="scenario-source">${relativeSourcePath(scenario, specDirectory)}</span>
              <span class="scenario-duration">${icons.clock}${formatDuration(activeDuration)}</span>
            </div>
          </div>
        </div>

        ${hasTags ? html`
          <div class="scenario-detail-tags scroll-x-hidden flex-row flex-wrap gap-sm mb-md${tagsFadeClass}" style="gap:6px" ref=${tagsRef}>
            ${getBrowserTag(scenario) ? html`<span class="badge ${browserBadgeClass(getBrowserTag(scenario)!)}">${getBrowserTag(scenario)}</span>` : null}
            ${[...new Map(tags.filter(t => t.type !== 'browser').map(t => [t.name, t])).values()].map(t => html`<span class="tag-chip tag-chip-static">${t.name}</span>`)}
          </div>
        ` : null}

        ${hasExecutionHistory ? html`
          <${ExecutionHistory} scenario=${scenario} runIndex=${runIndex} history=${history} onNavigate=${onNavigate} />
        ` : null}

        ${scenario.narrative ? html`
          <div class="req-detail-readme readme-content mb-md"><${RawHtml} content=${scenario.narrative} /></div>
        ` : null}

        ${hasCast ? html`
          <${CastSection} cast=${cast} />
        ` : null}
      </div>
    `;
}
