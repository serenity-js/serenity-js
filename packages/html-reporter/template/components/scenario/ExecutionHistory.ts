import htm from 'htm';
import { h } from 'preact';

import type { ReportScenario } from '../../../src/ReportData';
import { DATA, formatRunLabel, outcomeClass, outcomeIcon, scenarioUrl } from '../../utils';

const html = htm.bind(h);

export interface ExecutionHistoryProps {
    scenario: ReportScenario;
    runIndex: number | null;
    onNavigate: (path: string) => void;
}

export function ExecutionHistory({ scenario, runIndex, onNavigate }: ExecutionHistoryProps): ReturnType<typeof html> | null {
    if (!scenario.executionHistory || scenario.executionHistory.length === 0) return null;

    const activeIndex = runIndex !== null ? runIndex : scenario.executionHistory.length - 1;
    const historyUpToNow = scenario.executionHistory.slice(0, activeIndex + 1);
    const passed = historyUpToNow.filter(e => e.outcome === 'SUCCESS').length;
    const total = historyUpToNow.length;
    const flips = historyUpToNow.reduce((count, e, i) => i > 0 && e.outcome !== historyUpToNow[i - 1].outcome ? count + 1 : count, 0);
    const consistency = total > 1 ? Math.round((1 - flips / (total - 1)) * 100) : 100;

    const groups: Array<{ date: string; items: Array<{ entry: typeof scenario.executionHistory[0]; index: number; ts: string }> }> = [];
    let currentDate = '';
    for (let index = 0; index < scenario.executionHistory.length; index++) {
        const entry = scenario.executionHistory[index];
        const ts = entry.timestamp || (DATA.history[index] ? DATA.history[index].timestamp : '');
        const date = ts ? new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        if (date !== currentDate) {
            currentDate = date;
            groups.push({ date, items: [] });
        }
        groups[groups.length - 1].items.push({ entry, index, ts });
    }

    return html`
      <div class="mb-md">
        <div class="card-title mb-sm">Execution History</div>
        <div class="exec-history-summary">
          <span>${passed} of ${total} passing</span><span class="req-detail-metric-sep">·</span><span>${consistency}% consistent</span>
        </div>
        <div class="exec-history-strip">
          ${groups.map(group => html`
            <div class="exec-history-group">
              <div class="exec-history-date">${group.date}</div>
              <div class="exec-history-group-items">
                ${group.items.map(({ entry, index, ts }) => {
                    const isActive = runIndex === index || (runIndex === null && index === scenario.executionHistory.length - 1);
                    const isIso = /^\d{4}-\d{2}-\d{2}T/.test(entry.run);
                    const timeLabel = ts ? new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : entry.run;
                    const shortLabel = isIso ? timeLabel : entry.run;
                    const fullLabel = formatRunLabel(entry.run, ts);
                    const handleRunClick = (e: Event) => { e.stopPropagation(); onNavigate(scenarioUrl(scenario) + '?run=' + (DATA.history[index] ? DATA.history[index].timestamp : index)); };
                    return html`
                      <div class="exec-history-item ${isActive ? 'exec-history-item--active' : ''}" title="${entry.outcome} — ${fullLabel}" onClick=${handleRunClick}>
                        <div class="exec-history-dot" style="background:var(--color-${outcomeClass(entry.outcome)})">${outcomeIcon(entry.outcome)}</div>
                        <span class="exec-history-label">${shortLabel}</span>
                      </div>
                    `;
                })}
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
}
