import htm from 'htm';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import { RunSelector } from './RunSelector.js';

const html = htm.bind(h);

type Props = Parameters<typeof RunSelector>[0];

const noop = (): void => { /* no-op */ };

export const Default = ({ onRunChange = noop, onShowLatest = noop, ...props }: Props): ReturnType<typeof RunSelector> =>
    RunSelector({ onRunChange, onShowLatest, ...props });

export function WithCallbacks(props: Props): ReturnType<typeof html> {
    const [selectedValue, setSelectedValue] = useState('');
    const [showLatestClicked, setShowLatestClicked] = useState(false);

    return html`
        <${RunSelector} ...${props}
            onRunChange=${(e: Event) => setSelectedValue((e.target as HTMLSelectElement).value)}
            onShowLatest=${() => setShowLatestClicked(true)} />
        <form hidden>
            <input data-testid="selected-value" readOnly value=${selectedValue} />
            <input data-testid="show-latest-clicked" readOnly value=${String(showLatestClicked)} />
        </form>
    `;
}
