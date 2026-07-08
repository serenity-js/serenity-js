import htm from 'htm';
import { h } from 'preact';

const html = htm.bind(h);

export interface ResultCountProps {
    showing: number;
    total?: number;
    label: string;
}

export function ResultCount({ showing, total, label }: ResultCountProps): ReturnType<typeof html> {
    const text = total !== undefined
        ? `Showing ${showing} of ${total} ${label}`
        : `Showing ${showing} ${label}`;

    return html`
        <div class="text-muted mb-md" aria-live="polite" aria-atomic="true" data-testid="result-count">${text}</div>
    `;
}
