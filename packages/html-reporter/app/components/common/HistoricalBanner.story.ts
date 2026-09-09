import htm from 'htm';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import { HistoricalBanner } from './HistoricalBanner.js';

const html = htm.bind(h);

type Props = Parameters<typeof HistoricalBanner>[0];

const noop = (): void => { /* no-op */ };

export const Default = ({ onShowLatest = noop, ...props }: Props): ReturnType<typeof HistoricalBanner> =>
    HistoricalBanner({ onShowLatest, ...props });

export function WithCallbacks(props: Props): ReturnType<typeof html> {
    const [clicked, setClicked] = useState(false);

    return html`
        <${HistoricalBanner} ...${props} onShowLatest=${() => setClicked(true)} />
        <form hidden><input data-testid="show-latest-clicked" readOnly value=${String(clicked)} /></form>
    `;
}
