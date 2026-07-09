import htm from 'htm';
import { h } from 'preact';

import type { ReportError } from '../../src/ReportData';
import { ansiToHtml, showToast } from '../utils';
import { icons } from './icons';

const html = htm.bind(h);

interface ErrorBlockProps {
    error: ReportError;
    errorLocation?: { path: string; line: number; column: number } | null;
}

export function ErrorBlock({ error, errorLocation }: ErrorBlockProps): ReturnType<typeof html> {
    const copyLocation = (e: Event) => {
        e.stopPropagation();
        if (errorLocation) {
            navigator.clipboard.writeText(errorLocation.path + ':' + errorLocation.line)
                .then(() => showToast('Location copied to clipboard'))
                .catch(() => {});
        }
    };

    return html`
        <div class="error-block" data-testid="error-block">
          <div class="error-name flex-row gap-sm">
            ${error.name}
            ${errorLocation ? html`
              <span class="ml-auto inline-flex-center text-xs font-mono text-secondary" style="font-weight:400">
                ${errorLocation.path.split('/').pop()}:${errorLocation.line}
                <span class="copy-location" title="Copy location" onClick=${copyLocation}>${icons.copy}</span>
              </span>
            ` : null}
          </div>
          <div class="error-message" dangerouslySetInnerHTML=${{ __html: ansiToHtml(error.message) }}></div>
          <pre class="error-stack" dangerouslySetInnerHTML=${{ __html: ansiToHtml(error.stack || '') }}></pre>
        </div>
    `;
}
