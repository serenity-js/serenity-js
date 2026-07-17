import htm from 'htm';
import { h } from 'preact';

import type { ReportHistoryEntry } from '../../../src/cli/ReportData';
import { formatRunLabel } from '../../utils';

const html = htm.bind(h);

export function RunSelector({ activeTimestamp, history, onRunChange }: { activeTimestamp: string | null; history: ReportHistoryEntry[]; onRunChange: (event: Event) => void }): ReturnType<typeof html> {
    return html`
    <div class="run-selector-row">
        <select class="sort-select" value=${activeTimestamp} onChange=${onRunChange} aria-label="Select test run" style="min-width:200px">
            ${[...history].reverse().map((run) => {
                const passRate = Math.round((run.outcomes.passed / ((run.outcomes.passed || 0) + (run.outcomes.failed || 0) + (run.outcomes.error || 0) + (run.outcomes.compromised || 0) + (run.outcomes.pending || 0) + (run.outcomes.skipped || 0))) * 100);
                const label = formatRunLabel(run.label, run.timestamp) + ' — ' + passRate + '% pass rate';
                return html`<option value=${run.timestamp} selected=${run.timestamp === activeTimestamp}>${label}</option>`;
            })}
        </select>
    </div>
    `;
}
