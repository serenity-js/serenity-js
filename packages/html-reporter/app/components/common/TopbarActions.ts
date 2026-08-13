import htm from 'htm';
import { h } from 'preact';

import { icons } from './icons.js';

const html = htm.bind(h);

export interface TopbarActionsProps {
    onOpenFilter: () => void;
    onOpenSort?: () => void;
    onOpenStats?: () => void;
}

export function TopbarActions({ onOpenFilter, onOpenSort, onOpenStats }: TopbarActionsProps): ReturnType<typeof html> {
    return html`
        ${onOpenStats ? html`
            <button class="btn-icon" onClick=${onOpenStats} aria-label="Timing statistics">
                ${icons.stats}
            </button>
        ` : null}
        <button class="btn-icon" onClick=${onOpenFilter} aria-label="Search and filter">
            ${icons.search}
        </button>
        ${onOpenSort ? html`
            <button class="btn-icon" onClick=${onOpenSort} aria-label="Sort options">
                ${icons.sort}
            </button>
        ` : null}
    `;
}
