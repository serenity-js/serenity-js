import htm from 'htm';
import { h } from 'preact';

import { KpiCard } from '../common/KpiCard.js';

const html = htm.bind(h);

export interface ErrorCategorySummary {
    title: string;
    value: string;
    color: string;
    subtitle: string;
}

interface ErrorKpiCardsProps {
    cards: ErrorCategorySummary[];
}

export function ErrorKpiCards({ cards }: ErrorKpiCardsProps): ReturnType<typeof html> {
    return html`
        <div class="kpi-row mb-md stat-grid">
            ${cards.map(card => html`
                <${KpiCard} label=${card.title} value=${card.value} ariaLabel="${card.title}: ${card.value}" valueColor=${card.color} subtitle=${card.subtitle} />
            `)}
        </div>
    `;
}
