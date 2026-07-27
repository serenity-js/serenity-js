import htm from 'htm';
import { h } from 'preact';

import type { ReportHistoryEntry } from '../../../src/cli/ReportData.js';
import { formatRunLabel, totalFailedCount } from '../../utils/index.js';

const html = htm.bind(h);

interface RunSelectorProps {
    activeTimestamp: string | null;
    history: ReportHistoryEntry[];
    onRunChange: (event: Event) => void;
    isHistorical?: boolean;
    showLatestHref?: string;
    onShowLatest?: () => void;
}

export function RunSelector({ activeTimestamp, history, onRunChange, isHistorical, showLatestHref, onShowLatest }: RunSelectorProps): ReturnType<typeof html> {
    const wrapperClass = 'run-selector-row' + (isHistorical ? ' run-selector-row--historical' : '');
    const selectClass = 'sort-select' + (isHistorical ? ' run-select--historical' : '');
    const ariaLabel = isHistorical ? 'Select test run (historical)' : 'Select test run';

    return html`
    <div class=${wrapperClass}>
        <select class=${selectClass} value=${activeTimestamp} onChange=${onRunChange} aria-label=${ariaLabel}>
            ${[...history].reverse().map((run) => {
                const hasIncompleteModules = run.modules?.some(m => !m.finishedAt);
                const passRate = Math.round((run.outcomes.passed / ((run.outcomes.passed || 0) + totalFailedCount(run.outcomes) + (run.outcomes.pending || 0) + (run.outcomes.skipped || 0))) * 100);
                const prefix = hasIncompleteModules ? '⚠️ ' : '';
                const suffix = hasIncompleteModules ? ' (incomplete)' : ' — ' + passRate + '% pass rate';
                const label = prefix + formatRunLabel(run.label, run.timestamp) + suffix;
                return html`<option value=${run.timestamp} selected=${run.timestamp === activeTimestamp}>${label}</option>`;
            })}
        </select>
        ${isHistorical ? html`${
            showLatestHref
                ? html`<a class="show-latest-link" href=${showLatestHref}>show latest</a>`
                : html`<a class="show-latest-link" href="javascript:void(0)" onClick=${onShowLatest}>show latest</a>`
        }` : null}
    </div>
    `;
}
