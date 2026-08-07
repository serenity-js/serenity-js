import htm from 'htm';
import { h } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import type { ReportActivity } from '../../../src/cli/reporting/ReportData.js';
import { parseActivityContent } from '../../utils/parseActivityContent.js';
import { RestQueryPanel } from '../common/RestQueryPanel.js';
import { ActivityDataTable } from './ActivityDataTable.js';
import { ActivityDocString } from './ActivityDocString.js';
import { ActivityReportData } from './ActivityReportData.js';
import { ActivityRow } from './ActivityRow.js';

const html = htm.bind(h);

interface ActivityNodeProps {
    activity: ReportActivity;
    level?: number;
    posInSet?: number;
    setSize?: number;
}

interface ActivityDetailsProps {
    activity: ReportActivity;
    effectiveDataTable: { headers: string[]; rows: string[][] } | undefined;
    effectiveDocString: string | undefined;
    hasRestQuery: boolean;
    restExpanded: boolean;
}

function hasFailure(activity: ReportActivity): boolean {
    if (activity.outcome !== 'SUCCESS') return true;
    if (activity.children) {
        for (const child of activity.children) {
            if (hasFailure(child)) return true;
        }
    }
    return false;
}

function countActivities(activity: ReportActivity): { total: number; failed: number } {
    let total = 0;
    let failed = 0;
    function walk(node: ReportActivity) {
        for (const child of (node.children || [])) {
            total++;
            if (child.outcome !== 'SUCCESS') failed++;
            walk(child);
        }
    }
    walk(activity);
    return { total, failed };
}

function renderActivityDetails({ activity, effectiveDataTable, effectiveDocString, hasRestQuery, restExpanded }: ActivityDetailsProps): ReturnType<typeof html> {
    return html`
      ${effectiveDataTable ? html`<${ActivityDataTable} headers=${effectiveDataTable.headers} rows=${effectiveDataTable.rows} />` : null}
      ${effectiveDocString ? html`<${ActivityDocString} content=${effectiveDocString} />` : null}
      ${hasRestQuery && restExpanded ? html`<${RestQueryPanel} restQuery=${activity.restQuery} />` : null}
      ${activity.reportData && activity.reportData.length > 0 ? html`<${ActivityReportData} entries=${activity.reportData} />` : null}
    `;
}

export function ActivityNode({ activity, level = 1, posInSet = 1, setSize = 1 }: ActivityNodeProps): ReturnType<typeof html> {
    const hasChildren = activity.children && activity.children.length > 0;

    // Auto-expand if the activity contains a failure, collapse if all passing
    const shouldAutoExpand = useMemo(() => hasChildren ? hasFailure(activity) : false, [activity, hasChildren]);

    const [expanded, setExpanded] = useState(shouldAutoExpand);
    const [restExpanded, setRestExpanded] = useState(false);
    const hasRestQuery = !!activity.restQuery;
    const { displayName, parsedDataTable, parsedDocString } = useMemo(() => parseActivityContent(activity.name), [activity.name]);
    const effectiveDataTable = activity.dataTable ? { headers: activity.dataTable[0], rows: activity.dataTable.slice(1) } : parsedDataTable;
    const effectiveDocString = activity.docString || parsedDocString;

    // Summary text for collapsed Tasks: "N activities — M failed" or "N activities — all passed"
    const summaryText = useMemo(() => {
        if (!hasChildren) return undefined;
        const { total, failed } = countActivities(activity);
        if (failed > 0) return `${total} activities — ${failed} failed`;
        return `${total} activities — all passed`;
    }, [activity, hasChildren]);

    return html`
    <div class="activity-node" role="treeitem" tabIndex=${level === 1 && posInSet === 1 ? 0 : -1}
         aria-level=${level}
         aria-setsize=${setSize}
         aria-posinset=${posInSet}
         aria-expanded=${hasChildren ? String(expanded) : undefined}>
      <${ActivityRow}
        activity=${activity}
        displayName=${displayName}
        hasChildren=${hasChildren}
        expanded=${expanded}
        onToggle=${() => setExpanded(!expanded)}
        hasRestQuery=${hasRestQuery}
        restExpanded=${restExpanded}
        onToggleRest=${() => setRestExpanded(!restExpanded)}
        summaryText=${summaryText}
      />
      <${renderActivityDetails} activity=${activity} effectiveDataTable=${effectiveDataTable} effectiveDocString=${effectiveDocString} hasRestQuery=${hasRestQuery} restExpanded=${restExpanded} />
      ${hasChildren && expanded ? html`
        <div class="activity-children" role="group">
          ${activity.children.map((child, index) => html`<${ActivityNode} activity=${child} level=${(level || 1) + 1} posInSet=${index + 1} setSize=${activity.children.length} />`)}
        </div>
      ` : null}
    </div>
  `;
}
