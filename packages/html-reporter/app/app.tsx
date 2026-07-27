import htm from 'htm';
import { h, render } from 'preact';

import { App } from './components/common/App.js';
import { redirectQueryParametersToHash } from './redirectQueryParametersToHash.js';

// Convert query-param deep links (e.g., ?route=/tests&search=@tag:showcase)
// to hash routes (e.g., #/tests?search=@tag:showcase) before the app renders.
// This enables linking from contexts that don't preserve # fragments (READMEs, Slack, CI logs).
redirectQueryParametersToHash();

const html = htm.bind(h);
render(html`<${App} />`, document.getElementById('app')!);
