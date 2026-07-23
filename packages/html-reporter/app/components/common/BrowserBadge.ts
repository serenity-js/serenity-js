import htm from 'htm';
import { h } from 'preact';

import { browserBadgeClass, getBrowserTag } from '../../utils';

const html = htm.bind(h);

export interface BrowserBadgeProps {
    scenario: { tags?: Array<{ type: string; name: string }> };
}

export function BrowserBadge({ scenario }: BrowserBadgeProps): ReturnType<typeof html> | null {
    const browserTag = getBrowserTag(scenario);
    if (!browserTag) {
        return null;
    }
    return html`<span class="badge ${browserBadgeClass(browserTag)}">${browserTag}</span>`;
}
