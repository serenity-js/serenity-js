import htm from 'htm';
import { h } from 'preact';

import type { ReportHistoryEntry, ReportScenario } from '../../../src/ReportData';
import { formatRunLabel, outcomeClass, outcomeIcon, scenarioUrl } from '../../utils';

const html = htm.bind(h);

export interface ExecutionHistoryProps {
    scenario: ReportScenario;
    runIndex: number | null;
    history: ReportHistoryEntry[];
    onNavigate: (path: string) => void;
}

export function ExecutionHistory({ scenario, runIndex, history, onNavigate }: ExecutionHistoryProps): ReturnType<typeof html> | null {
    if (!scenario.executionHistory || scenario.executionHistory.length === 0) return null;

    // Map runIndex (global history index) to local executionHistory index by matching timestamps
    const activeTimestamp = runIndex !== null && history[runIndex] ? history[runIndex].timestamp : null;
    const localActiveIndex = activeTimestamp !== null
        ? scenario.executionHistory.findIndex(e => e.timestamp === activeTimestamp)
        : -1;
    const activeIndex = localActiveIndex >= 0 ? localActiveIndex : scenario.executionHistory.length - 1;

    const historyUpToNow = scenario.executionHistory.slice(0, activeIndex + 1);
    const passed = historyUpToNow.filter(e => e.outcome === 'SUCCESS').length;
    const total = historyUpToNow.length;
    const flips = historyUpToNow.reduce((count, e, i) => i > 0 && e.outcome !== historyUpToNow[i - 1].outcome ? count + 1 : count, 0);
    const consistency = total > 1 ? Math.round((1 - flips / (total - 1)) * 100) : 100;

    const groups: Array<{ date: string; items: Array<{ entry: typeof scenario.executionHistory[0]; index: number; ts: string }> }> = [];
    let currentDate = '';
    for (let index = 0; index < scenario.executionHistory.length; index++) {
        const entry = scenario.executionHistory[index];
        const ts = entry.timestamp || (history[index] ? history[index].timestamp : '');
        const date = ts ? new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        if (date !== currentDate || groups.length === 0) {
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
                    const isActive = index === activeIndex;
                    const isIso = /^\d{4}-\d{2}-\d{2}T/.test(entry.run);
                    const timeLabel = ts ? new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : entry.run;
                    const shortLabel = isIso ? timeLabel : entry.run;
                    const fullLabel = formatRunLabel(entry.run, ts);
                    const handleRunClick = (e: Event) => { e.stopPropagation(); onNavigate(scenarioUrl(scenario, entry.timestamp || ts)); };
                    const dotOutcome = entry.retriedAndPassed ? 'retried-success' : outcomeClass(entry.outcome);
                    const dotIcon = entry.retriedAndPassed ? outcomeIcon('RETRIED_SUCCESS') : outcomeIcon(entry.outcome);
                    const tooltipText = entry.retriedAndPassed
                        ? `Passed on retry (attempt ${(entry.retries || 1) + 1} of ${(entry.retries || 1) + 1}) — ${fullLabel}`
                        : `${entry.outcome} — ${fullLabel}`;
                    return html`
                      <div class="exec-history-item ${isActive ? 'exec-history-item--active' : ''}" title="${tooltipText}" onClick=${handleRunClick}>
                        <div class="exec-history-dot exec-history-dot--${dotOutcome}" style="background:var(--color-${dotOutcome})">${dotIcon}</div>
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
