import htm from 'htm';
import { h } from 'preact';

import { outcomeClass } from '../../utils/index.js';

const html = htm.bind(h);

export interface HistoryDotsEntry {
    outcome: string;
    label?: string;
    retriedAndPassed?: boolean;
}

export interface HistoryDotsProps {
    entries: HistoryDotsEntry[];
    max?: number;
}

export function HistoryDots({ entries, max = 5 }: HistoryDotsProps): ReturnType<typeof html> {
    const visible = entries.slice(-max);

    return html`
        <span class="scenario-history" data-testid="history-dots">${visible.map(entry => {
            const effectiveOutcome = entry.retriedAndPassed ? 'RETRIED_SUCCESS' : entry.outcome;
            return html`<span class="history-dot history-dot--${outcomeClass(effectiveOutcome)}" data-outcome=${effectiveOutcome} title=${entry.label || ''}></span>`;
        })}</span>
    `;
}
