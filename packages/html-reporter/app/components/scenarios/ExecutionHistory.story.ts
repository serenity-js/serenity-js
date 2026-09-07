import htm from 'htm';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import { ExecutionHistory, type ExecutionHistoryProps } from './ExecutionHistory.js';

const html = htm.bind(h);

export const Default = (props: ExecutionHistoryProps): ReturnType<typeof ExecutionHistory> => ExecutionHistory(props);

export function WithNavigation(props: ExecutionHistoryProps): ReturnType<typeof html> {
    const [navigatedTo, setNavigatedTo] = useState('');

    return html`
        <${ExecutionHistory} ...${props} onNavigate=${(path: string) => setNavigatedTo(decodeURIComponent(path))} />
        <form hidden><input data-testid="navigated-to" readOnly value=${navigatedTo} /></form>
    `;
}
