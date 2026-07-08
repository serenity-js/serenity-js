import htm from 'htm';
import { h } from 'preact';

import { outcomeClass } from '../utils';

const html = htm.bind(h);

export interface HistoryDotsEntry {
    outcome: string;
    label?: string;
}

export interface HistoryDotsProps {
    entries: HistoryDotsEntry[];
    max?: number;
}

export function HistoryDots({ entries, max = 5 }: HistoryDotsProps): ReturnType<typeof html> {
    const visible = entries.slice(-max);

    return html`
        <span class="scenario-history" data-testid="history-dots">${visible.map(entry => html`<span class="history-dot history-dot--${outcomeClass(entry.outcome)}" title=${entry.label || ''}></span>`)}</span>
    `;
}
