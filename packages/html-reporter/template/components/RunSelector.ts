import htm from 'htm';
import { h } from 'preact';

import { DATA, formatRunLabel } from '../utils';

const html = htm.bind(h);

export function RunSelector({ activeTimestamp, onRunChange }: { activeTimestamp: string | null; onRunChange: (event: Event) => void }): ReturnType<typeof html> {
    return html`
    <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-md);flex-wrap:wrap">
        <span class="label-upper">Test run:</span>
        <select class="sort-select" value=${activeTimestamp} onChange=${onRunChange} aria-label="Select test run" style="min-width:200px">
            ${[...DATA.history].reverse().map((run) => {
                const passRate = Math.round((run.outcomes.passed / ((run.outcomes.passed || 0) + (run.outcomes.failed || 0) + (run.outcomes.error || 0) + (run.outcomes.compromised || 0) + (run.outcomes.pending || 0) + (run.outcomes.skipped || 0))) * 100);
                const label = formatRunLabel(run.label, run.timestamp) + ' — ' + passRate + '% pass rate';
                return html`<option value=${run.timestamp} selected=${run.timestamp === activeTimestamp}>${label}</option>`;
            })}
        </select>
    </div>
    `;
}
