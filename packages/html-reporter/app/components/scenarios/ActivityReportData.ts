import htm from 'htm';
import { h } from 'preact';

import type { ReportActivity } from '../../../src/cli/ReportData';

const html = htm.bind(h);

interface ActivityReportDataProps {
    entries: NonNullable<ReportActivity['reportData']>;
}

export function ActivityReportData({ entries }: ActivityReportDataProps): ReturnType<typeof html> {
    return html`
        ${entries.map(entry => html`
          <div class="report-data-block ml-lg mt-xs mb-sm">
            <div class="text-sm section-label text-secondary">${entry.title}</div>
            <pre class="pre-block" style="color:var(--text-primary)">${entry.contents}</pre>
          </div>
        `)}
    `;
}
