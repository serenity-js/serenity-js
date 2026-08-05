import htm from 'htm';
import { h, render } from 'preact';

import { redirectQueryParametersToHash } from './redirectQueryParametersToHash.js';

// Convert query-param deep links (e.g., ?route=/tests&search=@tag:showcase)
// to hash routes (e.g., #/tests?search=@tag:showcase) before the app renders.
// This enables linking from contexts that don't preserve # fragments (READMEs, Slack, CI logs).
redirectQueryParametersToHash();

const html = htm.bind(h);

function renderError(message: string): void {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div class="data-error">
                <h1>Unable to Load Report</h1>
                <p>${message}</p>
                <p>Ensure <code>data.js</code> is loaded before the application script.</p>
                <p class="hint">If opening from a local file, some browsers block local file loading. Try serving the report with a local HTTP server.</p>
            </div>
        `;
    }
}

async function boot(): Promise<void> {
    try {
        const { App } = await import('./components/common/App.js');
        render(html`<${App} />`, document.getElementById('app')!);
    } catch (error) {
        console.error('[Serenity/JS Report]', error);
        renderError(error instanceof Error ? error.message : String(error));
    }
}

boot();
