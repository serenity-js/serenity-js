import htm from 'htm';
import { h } from 'preact';

import type { ReportHistoryEntry, ReportScenario } from '../../src/ReportData';
import { useScenarioDetail } from '../hooks/useScenarioDetail';
import { formatRunLabel, scenarioUrl } from '../utils';
import { ErrorBlock } from './ErrorBlock';
import { HistoricalBanner } from './HistoricalBanner';
import { ActivityTreeCard } from './scenario/ActivityTreeCard';
import { PhotoStrip } from './scenario/PhotoStrip';
import { RetryTabs } from './scenario/RetryTabs';
import { ScenarioHeader } from './scenario/ScenarioHeader';
import { VideoPlayer } from './scenario/VideoPlayer';

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
        return html`<div class="card"><p>Test scenario not found.</p></div>`;
    }

    const { scenario, runIndex, activeAttempt, setActiveAttempt, currentActivities, currentError,
        currentVideo, errorLocation, activeAttempts, hasRetries, activeDuration,
        tags, cast, hasCast, hasTags, hasExecutionHistory,
        treeKey, setTreeKey, treeExpanded, setTreeExpanded } = detail;

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
        <${ActivityTreeCard} scenario=${scenario} currentActivities=${currentActivities}
          treeKey=${treeKey} setTreeKey=${setTreeKey} treeExpanded=${treeExpanded} setTreeExpanded=${setTreeExpanded} />
      ` : null}

      ${currentError ? html`<${ErrorBlock} error=${currentError} errorLocation=${errorLocation} />` : null}

      ${currentVideo ? html`<${VideoPlayer} src=${currentVideo} />` : null}

      <${PhotoStrip} activities=${currentActivities} scenarioStartedAt=${scenario.startedAt} />
    </div>
  `;
}

function Breadcrumb({ scenario, runIndex, history, onNavigate }: { scenario: ReportScenario; runIndex: number | null; history: ReportHistoryEntry[]; onNavigate: (path: string) => void }): ReturnType<typeof html> {
    const backUrl = '/tests' + (runIndex !== null && history[runIndex] ? '?run=' + history[runIndex].timestamp : '');

    return html`
      <div class="breadcrumb">
        <a onClick=${() => onNavigate(backUrl)}>Test Scenarios</a>
        ${scenario.category.split(' › ').map((segment) => html`
          <span>›</span>
          <a onClick=${() => onNavigate('/tests?search=' + encodeURIComponent('"' + segment + '"'))}>${segment}</a>
        `)}
        <span>›</span>
        <span>${scenario.name}</span>
      </div>
    `;
}
