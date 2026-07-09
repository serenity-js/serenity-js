import htm from 'htm';
import { h } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import type { ReportActivity } from '../../src/ReportData';
import { parseActivityContent } from '../utils/parseActivityContent';
import { ActivityDataTable } from './activity/ActivityDataTable';
import { ActivityDocString } from './activity/ActivityDocString';
import { ActivityReportData } from './activity/ActivityReportData';
import { ActivityRow } from './activity/ActivityRow';
import { RestQueryPanel } from './RestQueryPanel';

const html = htm.bind(h);

interface ActivityNodeProps {
    activity: ReportActivity;
    defaultExpanded?: boolean;
}

export function ActivityNode({ activity, defaultExpanded }: ActivityNodeProps): ReturnType<typeof html> {
    const hasChildren = activity.children && activity.children.length > 0;
    const [expanded, setExpanded] = useState(defaultExpanded !== undefined ? defaultExpanded : true);
    const [restExpanded, setRestExpanded] = useState(false);
    const hasRestQuery = !!activity.restQuery;
    const { displayName, parsedDataTable, parsedDocString } = useMemo(() => parseActivityContent(activity.name), [activity.name]);
    const effectiveDataTable = activity.dataTable ? { headers: activity.dataTable[0], rows: activity.dataTable.slice(1) } : parsedDataTable;
    const effectiveDocString = activity.docString || parsedDocString;

    return html`
    <div class="activity-node">
      <${ActivityRow}
        activity=${activity}
        displayName=${displayName}
        hasChildren=${hasChildren}
        expanded=${expanded}
        onToggle=${() => setExpanded(!expanded)}
        hasRestQuery=${hasRestQuery}
        restExpanded=${restExpanded}
        onToggleRest=${() => setRestExpanded(!restExpanded)}
      />
      ${effectiveDataTable ? html`<${ActivityDataTable} headers=${effectiveDataTable.headers} rows=${effectiveDataTable.rows} />` : null}
      ${effectiveDocString ? html`<${ActivityDocString} content=${effectiveDocString} />` : null}
      ${hasRestQuery && restExpanded ? html`<${RestQueryPanel} restQuery=${activity.restQuery} />` : null}
      ${activity.reportData && activity.reportData.length > 0 ? html`<${ActivityReportData} entries=${activity.reportData} />` : null}
      ${hasChildren && expanded ? html`
        <div class="ml-sm">
          ${activity.children.map(child => html`<${ActivityNode} activity=${child} defaultExpanded=${defaultExpanded} />`)}
        </div>
      ` : null}
    </div>
  `;
}
