import htm from 'htm';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import { ErrorsView } from './ErrorsView.js';

const html = htm.bind(h);

type Props = Parameters<typeof ErrorsView>[0];

export const Default = (props: Props): ReturnType<typeof ErrorsView> => ErrorsView(props);

export function WithNavigation(props: Props): ReturnType<typeof html> {
    const [navigatedTo, setNavigatedTo] = useState('');

    return html`
        <${ErrorsView} ...${props} onNavigate=${(path: string) => setNavigatedTo(decodeURIComponent(path))} />
        <form hidden><input data-testid="navigated-to" readOnly value=${navigatedTo} /></form>
    `;
}
