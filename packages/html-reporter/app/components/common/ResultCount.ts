import htm from 'htm';
import { h } from 'preact';

const html = htm.bind(h);

export interface ResultCountProps {
    showing: number;
    total?: number;
    label: string;
    suffix?: string;
}

export function ResultCount({ showing, total, label, suffix }: ResultCountProps): ReturnType<typeof html> {
    const text = total !== undefined
        ? `Showing ${showing} of ${total} ${label}`
        : `Showing ${showing} ${label}`;

    return html`
        <div class="text-muted mb-md" aria-live="polite" aria-atomic="true" data-testid="result-count">${text}${suffix ? html` · <span class="result-count-suffix">${suffix}</span>` : null}</div>
    `;
}
