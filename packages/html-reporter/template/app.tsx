import htm from 'htm';
import { h, render } from 'preact';

import { App } from './components/App';

const html = htm.bind(h);
render(html`<${App} />`, document.getElementById('app')!);
