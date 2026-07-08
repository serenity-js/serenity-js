import htm from 'htm';
import { h } from 'preact';

import { outcomeClass, outcomeIcon } from '../utils';

const html = htm.bind(h);

export interface OutcomeBadgeProps {
    outcome: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeStyles: Record<string, string> = {
    sm: 'width:18px;height:18px;font-size:var(--font-2xs);flex-shrink:0',
    md: '',
    lg: 'width:28px;height:28px;font-size:var(--font-md)',
};

export function OutcomeBadge({ outcome, size = 'md' }: OutcomeBadgeProps): ReturnType<typeof html> {
    const style = sizeStyles[size] || '';

    return html`
        <span class="scenario-outcome-icon ${outcomeClass(outcome)}" style=${style} data-testid="outcome-badge">${outcomeIcon(outcome)}</span>
    `;
}
