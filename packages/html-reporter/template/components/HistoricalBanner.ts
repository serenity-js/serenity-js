import htm from 'htm';
import { h } from 'preact';

const html = htm.bind(h);

interface HistoricalBannerProps {
    label: string;
    runLabel: string;
    subtitle?: string;
    onShowLatest: () => void;
    showLatestHref?: string;
}

export function HistoricalBanner({ label, runLabel, subtitle, onShowLatest, showLatestHref }: HistoricalBannerProps): ReturnType<typeof html> {
    return html`
        <div class="historical-banner">
            <span>${label} <strong>${runLabel}</strong>${subtitle ? ` ${subtitle}` : ''}</span>
            ${showLatestHref
                    ? html`<a href=${showLatestHref} class="link-underline">show latest</a>`
                    : html`<a onClick=${onShowLatest} class="link-underline">show latest</a>`
            }
        </div>
    `;
}
