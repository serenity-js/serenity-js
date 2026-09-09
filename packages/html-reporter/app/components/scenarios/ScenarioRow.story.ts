import htm from 'htm';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import { ScenarioRow, type ScenarioRowProps } from './ScenarioRow.js';

const html = htm.bind(h);

const noop = (): void => { /* no-op */ };

export const Default = ({ onNavigate = noop, setSearch = noop, ...props }: ScenarioRowProps): ReturnType<typeof ScenarioRow> =>
    ScenarioRow({ onNavigate, setSearch, ...props });

export function WithNavigation(props: ScenarioRowProps): ReturnType<typeof html> {
    const [navigatedTo, setNavigatedTo] = useState('');

    return html`
        <${ScenarioRow} ...${props} onNavigate=${(path: string) => setNavigatedTo(decodeURIComponent(path))} />
        <form hidden><input data-testid="navigated-to" readOnly value=${navigatedTo} /></form>
    `;
}
