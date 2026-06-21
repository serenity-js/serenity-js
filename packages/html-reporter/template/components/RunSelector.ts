import htm from 'htm';
import { h } from 'preact';

import { DATA } from '../utils';

const html = htm.bind(h);

export function RunSelector({ activeTimestamp, onRunChange }: { activeTimestamp: string | null; onRunChange: (event: Event) => void }): ReturnType<typeof html> {
    return html`
    <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-md);flex-wrap:wrap">
        <span style="font-size:var(--font-xs);font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">Test run:</span>
        <select class="sort-select" value=${activeTimestamp} onChange=${onRunChange} aria-label="Select test run" style="min-width:200px">
            ${[...DATA.history].reverse().map((run: { timestamp: string; label: string; outcomes: Record<string, number> }) => {
                const passRate = Math.round((run.outcomes.passed / Object.values(run.outcomes).reduce((a, b) => a + b, 0)) * 100);
                const label = run.label.replace('build ', '') + ' — ' + new Date(run.timestamp).toLocaleDateString() + ' — ' + passRate + '% pass rate';
                return html`<option value=${run.timestamp} selected=${run.timestamp === activeTimestamp}>${label}</option>`;
            })}
        </select>
    </div>
    `;
}
