import htm from 'htm';
import { h } from 'preact';

import type { ReportActivity } from '../../../src/cli/reporting/ReportData.js';

const html = htm.bind(h);

interface RestQueryPanelProps {
    restQuery: NonNullable<ReportActivity['restQuery']>;
}

export function RestQueryPanel({ restQuery }: RestQueryPanelProps): ReturnType<typeof html> {
    return html`
        <div class="rest-query-panel ml-lg mt-xs mb-sm bordered text-sm" data-testid="rest-query-panel">
          <div class="panel-section-border flex-row gap-sm" style="background:var(--bg-primary)">
            <span class="font-semibold font-mono" data-testid="rest-method">${restQuery.method}</span>
            <span class="font-mono text-secondary" style="word-break:break-all" data-testid="rest-url">${restQuery.url}</span>
            <span class="ml-auto font-semibold" style="color:${restQuery.statusCode < 400 ? 'var(--color-passed)' : 'var(--color-failed)'}" data-testid="rest-status">${restQuery.statusCode}</span>
          </div>
          ${restQuery.requestHeaders ? html`
            <div class="panel-section-border">
              <div class="section-label">Request Headers</div>
              <pre class="code-block">${restQuery.requestHeaders}</pre>
            </div>
          ` : null}
          ${restQuery.requestBody ? html`
            <div class="panel-section-border">
              <div class="section-label">Request Body</div>
              <pre class="code-block">${restQuery.requestBody}</pre>
            </div>
          ` : null}
          ${restQuery.responseHeaders ? html`
            <div class="panel-section-border">
              <div class="section-label">Response Headers</div>
              <pre class="code-block">${restQuery.responseHeaders}</pre>
            </div>
          ` : null}
          ${restQuery.responseBody ? html`
            <div class="panel-section">
              <div class="section-label">Response Body</div>
              <pre class="code-block">${restQuery.responseBody}</pre>
            </div>
          ` : null}
        </div>
    `;
}
