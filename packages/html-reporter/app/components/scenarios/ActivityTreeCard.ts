import htm from 'htm';
import { h } from 'preact';

import type { ReportActivity, ReportScenario } from '../../../src/cli/ReportData';
import { RawHtml } from '../../utils';
import { ActivityNode } from './ActivityNode';
import { ParameterSetGroups } from './ParameterSetGroups';

const html = htm.bind(h);

interface ActivityTreeCardProps {
    scenario: ReportScenario;
    currentActivities: ReportActivity[];
    treeKey: number;
    setTreeKey: (fn: (k: number) => number) => void;
    treeExpanded: boolean;
    setTreeExpanded: (v: boolean) => void;
}

export function ActivityTreeCard({ scenario, currentActivities, treeKey, setTreeKey, treeExpanded, setTreeExpanded }: ActivityTreeCardProps): ReturnType<typeof html> {
    const hasExpandableChildren = !scenario.scenarioOutline && currentActivities.some(a => a.children && a.children.length > 0);

    return html`
        <div class="card mb-md">
          ${scenario.description ? html`
            <div class="req-detail-readme readme-content mb-md"><${RawHtml} content=${scenario.description} /></div>
          ` : null}
          <div class="flex-row gap-sm mb-sm">
            <div class="card-title mb-0">Activity Tree</div>
            ${hasExpandableChildren ? html`
              <button onClick=${() => { setTreeExpanded(true); setTreeKey(k => k + 1); }} title="Expand all" class="icon-btn-sm" aria-label="Expand all">▼</button>
              <button onClick=${() => { setTreeExpanded(false); setTreeKey(k => k + 1); }} title="Collapse all" class="icon-btn-sm" aria-label="Collapse all">▶</button>
            ` : null}
          </div>
          ${scenario.scenarioOutline ? html`
            <div class="mb-md panel-section font-mono text-sm" style="background:var(--bg-primary);border-radius:var(--radius-sm);white-space:pre-line;color:var(--text-secondary)">${scenario.scenarioOutline.template}</div>
            <${ParameterSetGroups} parameters=${scenario.scenarioOutline.parameters} />
          ` : html`
            <div class="activity-tree" key=${treeKey}>
              ${currentActivities.map(activity => html`<${ActivityNode} activity=${activity} defaultExpanded=${treeExpanded} />`)}
            </div>
          `}
        </div>
    `;
}
