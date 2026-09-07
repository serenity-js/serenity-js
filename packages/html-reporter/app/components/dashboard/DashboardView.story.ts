import htm from 'htm';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import { DashboardView } from './DashboardView.js';

const html = htm.bind(h);

type Props = Parameters<typeof DashboardView>[0];

const noop = (): void => { /* no-op */ };

export const Default = ({ onNavigate = noop, onOpenSidebar = noop, ...props }: Props): ReturnType<typeof DashboardView> =>
    DashboardView({ onNavigate, onOpenSidebar, ...props });

export function WithNavigation(props: Props): ReturnType<typeof html> {
    const [navigatedTo, setNavigatedTo] = useState('');

    return html`
        <${DashboardView} ...${props} onNavigate=${(path: string) => setNavigatedTo(decodeURIComponent(path))} />
        <form hidden><input data-testid="navigated-to" readOnly value=${navigatedTo} /></form>
    `;
}
