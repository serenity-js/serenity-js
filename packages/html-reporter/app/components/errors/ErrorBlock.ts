import htm from 'htm';
import { h } from 'preact';

import type { ReportError } from '../../../src/cli/ReportData.js';
import { ansiToHtml, relativeLocationPath, showToast, stripAbsolutePaths } from '../../utils/index.js';
import { icons } from '../common/icons.js';

const html = htm.bind(h);

interface ErrorBlockProps {
    error: ReportError;
    errorLocation?: { path: string; line: number; column: number } | null;
    specDirectory?: string;
}

export function ErrorBlock({ error, errorLocation, specDirectory }: ErrorBlockProps): ReturnType<typeof html> {
    const copyLocation = (e: Event) => {
        e.stopPropagation();
        if (errorLocation) {
            const relativePath = relativeLocationPath(errorLocation, specDirectory);
            navigator.clipboard.writeText(relativePath)
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
          <div class="error-message" dangerouslySetInnerHTML=${{ __html: ansiToHtml(stripAbsolutePaths(error.message, specDirectory)) }}></div>
          <pre class="error-stack" dangerouslySetInnerHTML=${{ __html: ansiToHtml(stripAbsolutePaths(error.stack || '', specDirectory)) }}></pre>
        </div>
    `;
}
