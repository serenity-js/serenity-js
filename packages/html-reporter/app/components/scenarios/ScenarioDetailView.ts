import htm from 'htm';
import { h } from 'preact';

import type { ReportHistoryEntry, ReportScenario } from '../../../src/cli/ReportData.js';
import { useScenarioDetail } from '../../hooks/useScenarioDetail.js';
import { useScrollFade } from '../../hooks/useScrollFade.js';
import { formatRunLabel, scenarioUrl } from '../../utils/index.js';
import { link } from '../../utils/link.js';
import { HistoricalBanner } from '../common/HistoricalBanner.js';
import { ErrorBlock } from '../errors/ErrorBlock.js';
import { ActivityTreeCard } from './ActivityTreeCard.js';
import { PhotoStrip } from './PhotoStrip.js';
import { RetryTabs } from './RetryTabs.js';
import { ScenarioHeader } from './ScenarioHeader.js';
import { VideoPlayer } from './VideoPlayer.js';

const html = htm.bind(h);

// ===== Test Scenario Detail View =====
interface ScenarioDetailViewProps {
    scenarios: ReportScenario[];
    history: ReportHistoryEntry[];
    specDirectory?: string;
    scenarioId: string;
    onNavigate: (path: string) => void;
}

export function ScenarioDetailView({ scenarios, history, specDirectory, scenarioId, onNavigate }: ScenarioDetailViewProps): ReturnType<typeof html> {
    const detail = useScenarioDetail(scenarioId, scenarios, history);

    if (!detail.scenario) {
        return html`<div class="card">
            <nav class="breadcrumb"><a href="#/tests" onClick=${(e: Event) => { e.preventDefault(); onNavigate('/tests'); }}>Test Scenarios</a><span>›</span><span>Not Found</span></nav>
            <p>Test scenario not found.</p>
            <a href="#/tests" onClick=${(e: Event) => { e.preventDefault(); onNavigate('/tests'); }}>← Back to Test Scenarios</a>
        </div>`;
    }

    const { scenario, runIndex, activeAttempt, setActiveAttempt, currentActivities, currentError,
        currentVideo, errorLocation, activeAttempts, hasRetries, activeDuration,
        tags, cast, hasCast, hasTags, hasExecutionHistory } = detail;

    const isHistorical = runIndex !== null && runIndex !== history.length - 1 && history[runIndex];

    return html`
    <div>
      <${Breadcrumb} scenario=${scenario} runIndex=${runIndex} history=${history} onNavigate=${onNavigate} />

      ${isHistorical ? html`
        <${HistoricalBanner} label="Viewing results from:" runLabel=${formatRunLabel(history[runIndex!].label, history[runIndex!].timestamp)} onShowLatest=${() => onNavigate(scenarioUrl(scenario))} />
      ` : null}

      <${ScenarioHeader}
        scenario=${scenario} activeDuration=${activeDuration} specDirectory=${specDirectory}
        tags=${tags} hasTags=${hasTags} hasExecutionHistory=${hasExecutionHistory}
        cast=${cast} hasCast=${hasCast} runIndex=${runIndex} history=${history} onNavigate=${onNavigate}
      />

      ${hasRetries ? html`<${RetryTabs} attempts=${activeAttempts} activeAttempt=${activeAttempt} onSelect=${setActiveAttempt} />` : null}

      ${currentActivities.length > 0 || scenario.scenarioOutline ? html`
        <${ActivityTreeCard} scenario=${scenario} currentActivities=${currentActivities} />
      ` : null}

      ${currentError ? html`<${ErrorBlock} error=${currentError} errorLocation=${errorLocation} specDirectory=${specDirectory} />` : null}

      ${currentVideo ? html`<${VideoPlayer} src=${currentVideo} />` : null}

      <${PhotoStrip} activities=${currentActivities} scenarioStartedAt=${scenario.startedAt} />
    </div>
  `;
}

function Breadcrumb({ scenario, runIndex, history, onNavigate }: { scenario: ReportScenario; runIndex: number | null; history: ReportHistoryEntry[]; onNavigate: (path: string) => void }): ReturnType<typeof html> {
    const backUrl = '/tests' + (runIndex !== null && history[runIndex] ? '?run=' + history[runIndex].timestamp : '');
    const { ref, fadeClass } = useScrollFade<HTMLDivElement>();

    return html`
      <div class="breadcrumb scroll-x-hidden${fadeClass}" ref=${ref}>
        <a onClick=${() => onNavigate(backUrl)}>Test Scenarios</a>
        ${scenario.category.split(' › ').map((segment) => html`
          <span>›</span>
          <a onClick=${() => onNavigate(link({ view: 'tests', search: `"${segment}"` }))}>${segment}</a>
        `)}
        <span>›</span>
        <span>${scenario.name}</span>
      </div>
    `;
}
