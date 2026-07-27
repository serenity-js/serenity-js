import htm from 'htm';
import { h } from 'preact';

import type { ReportActivity, ReportScenario } from '../../../src/cli/ReportData.js';
import { RawHtml } from '../../utils/index.js';
import { ActivityNode } from './ActivityNode.js';
import { ParameterSetGroups } from './ParameterSetGroups.js';

const html = htm.bind(h);

interface ActivityTreeCardProps {
    scenario: ReportScenario;
    currentActivities: ReportActivity[];
}

export function ActivityTreeCard({ scenario, currentActivities }: ActivityTreeCardProps): ReturnType<typeof html> {
    return html`
        <div class="card mb-md">
          ${scenario.description ? html`
            <div class="req-detail-readme readme-content mb-md"><${RawHtml} content=${scenario.description} /></div>
          ` : null}
          <div class="card-title mb-sm">Activity Tree</div>
          ${scenario.scenarioOutline ? html`
            <div class="mb-md panel-section font-mono text-sm" style="background:var(--bg-primary);border-radius:var(--radius-sm);white-space:pre-line;color:var(--text-secondary)">${scenario.scenarioOutline.template}</div>
            <${ParameterSetGroups} parameters=${scenario.scenarioOutline.parameters} />
          ` : html`
            <div class="activity-tree">
              ${currentActivities.map(activity => html`<${ActivityNode} activity=${activity} />`)}
            </div>
          `}
        </div>
    `;
}
