import htm from 'htm';
import { h } from 'preact';
import { useState } from 'preact/hooks';

const html = htm.bind(h);

const noop = (): void => { /* no-op */ };

export function createViewStory<ViewComponent extends (props: { onNavigate: (path: string) => void; onOpenSidebar: () => void }) => ReturnType<typeof html>>(
    View: ViewComponent,
): {
    Default: (props: Parameters<ViewComponent>[0]) => ReturnType<ViewComponent>;
    WithNavigation: (props: Parameters<ViewComponent>[0]) => ReturnType<typeof html>;
} {
    const Default = ({ onNavigate = noop, onOpenSidebar = noop, ...props }: Parameters<ViewComponent>[0]): ReturnType<ViewComponent> =>
        View({ onNavigate, onOpenSidebar, ...props }) as ReturnType<ViewComponent>;

    function WithNavigation(props: Parameters<ViewComponent>[0]): ReturnType<typeof html> {
        const [navigatedTo, setNavigatedTo] = useState('');

        return html`
            <${View} ...${props} onNavigate=${(path: string) => setNavigatedTo(decodeURIComponent(path))} />
            <form hidden><input data-testid="navigated-to" readOnly value=${navigatedTo} /></form>
        `;
    }

    return { Default, WithNavigation };
}
