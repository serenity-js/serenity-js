import htm from 'htm';
import { h } from 'preact';
import { useCallback, useRef } from 'preact/hooks';

import type { ReportActivity, ReportScenario } from '../../../src/cli/reporting/ReportData.js';
import { RawHtml } from '../../utils/index.js';
import { ActivityNode } from './ActivityNode.js';
import { handleTreeKeyDown } from './activityTreeKeyboard.js';
import { ParameterSetGroups } from './ParameterSetGroups.js';

const html = htm.bind(h);

interface ActivityTreeCardProps {
    scenario: ReportScenario;
    currentActivities: ReportActivity[];
}

export function ActivityTreeCard({ scenario, currentActivities }: ActivityTreeCardProps): ReturnType<typeof html> {
    const treeRef = useRef<HTMLElement>(null);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const container = treeRef.current;
        if (!container) return;
        handleTreeKeyDown(e, container);
    }, []);

    return html`
        <div class="card mb-md">
          ${scenario.description ? html`
            <div class="req-detail-readme readme-content mb-md"><${RawHtml} content=${scenario.description} /></div>
          ` : null}
          <h2 class="card-title mb-sm">Activity Tree</h2>
          ${scenario.scenarioOutline ? html`
            <div class="mb-md panel-section font-mono text-sm" style="background:var(--bg-primary);border-radius:var(--radius-sm);white-space:pre-line;color:var(--text-secondary)">${scenario.scenarioOutline.template}</div>
            <${ParameterSetGroups} parameters=${scenario.scenarioOutline.parameters} />
          ` : html`
            <div class="activity-tree" role="tree" aria-label="Activity tree" ref=${treeRef} onKeyDown=${handleKeyDown}>
              ${currentActivities.map((activity, index) => html`<${ActivityNode} activity=${activity} level=${1} posInSet=${index + 1} setSize=${currentActivities.length} />`)}
            </div>
          `}
        </div>
    `;
}
