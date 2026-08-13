import htm from 'htm';
import type { ComponentChildren } from 'preact';
import { h } from 'preact';

import { formatTimestamp } from '../../utils/index.js';
import { icons } from './icons.js';

const html = htm.bind(h);

export interface ViewTopbarProps {
    title: string;
    onOpenSidebar: () => void;
    actions?: ComponentChildren;
}

function getFinishedAt(): string | undefined {
    try {
        const raw = (window as { __SERENITY_REPORT_DATA__?: { summary?: { finishedAt?: string } } }).__SERENITY_REPORT_DATA__;
        return raw?.summary?.finishedAt;
    } catch {
        return undefined;
    }
}

export function ViewTopbar({ title, onOpenSidebar, actions }: ViewTopbarProps): ReturnType<typeof html> {
    const finishedAt = getFinishedAt();
    const subtitle = finishedAt ? formatTimestamp(finishedAt) : '';

    return html`
        <div class="view-topbar" data-testid="view-topbar">
            <div class="view-topbar-left">
                <button class="btn-icon hamburger" onClick=${onOpenSidebar} aria-label="Open menu">
                    ${icons.menu}
                </button>
                <div>
                    <h1 class="topbar-title">${title}</h1>
                    ${subtitle ? html`<div class="topbar-subtitle" title=${finishedAt}>${subtitle}</div>` : null}
                </div>
            </div>
            ${actions ? html`<div class="view-topbar-right">${actions}</div>` : null}
        </div>
    `;
}
