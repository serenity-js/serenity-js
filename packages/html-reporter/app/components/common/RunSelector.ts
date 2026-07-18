import htm from 'htm';
import { h } from 'preact';

import type { ReportHistoryEntry } from '../../../src/cli/ReportData';
import { formatRunLabel } from '../../utils';

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
        <select class=${selectClass} value=${activeTimestamp} onChange=${onRunChange} aria-label=${ariaLabel} style="min-width:200px">
            ${[...history].reverse().map((run) => {
                const passRate = Math.round((run.outcomes.passed / ((run.outcomes.passed || 0) + (run.outcomes.failed || 0) + (run.outcomes.error || 0) + (run.outcomes.compromised || 0) + (run.outcomes.pending || 0) + (run.outcomes.skipped || 0))) * 100);
                const label = formatRunLabel(run.label, run.timestamp) + ' — ' + passRate + '% pass rate';
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
