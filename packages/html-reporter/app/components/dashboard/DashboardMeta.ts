import htm from 'htm';
import { h } from 'preact';

import type { ReportSystemContext } from '../../../src/cli/reporting/ReportData.js';
import { normaliseRepositoryUrl } from '../../utils/computeRunMetrics.js';
import { icons } from '../common/icons.js';

const html = htm.bind(h);

interface DashboardMetaProps {
    testRunner: string;
    systemContext?: ReportSystemContext;
}

export function DashboardMeta({ testRunner, systemContext }: DashboardMetaProps): ReturnType<typeof html> {
    const ci = systemContext?.ci;
    const repositoryUrl = ci?.repositoryUrl ? normaliseRepositoryUrl(ci.repositoryUrl) : '';

    return html`
        <div class="dashboard-meta">
          <span>${testRunner}</span>
          ${ci ? html`
            ${ci.branch ? html`<span class="dashboard-meta-item">${icons.branchSm}${repositoryUrl ? html`<a href="${repositoryUrl}/tree/${ci.branch}" target="_blank" class="meta-link">${ci.branch}</a>` : html`<span>${ci.branch}</span>`}</span>` : null}
            ${ci.commit ? html`<span class="dashboard-meta-item">${icons.commitSm}${repositoryUrl ? html`<a href="${repositoryUrl}/commit/${ci.commit}" target="_blank" class="meta-link mono">${ci.commit.slice(0, 7)}</a>` : html`<span class="mono">${ci.commit.slice(0, 7)}</span>`}</span>` : null}
          ` : null}
        </div>
    `;
}
