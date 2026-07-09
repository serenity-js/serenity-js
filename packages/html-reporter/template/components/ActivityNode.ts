import htm from 'htm';
import { h } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import type { ReportActivity } from '../../src/ReportData';
import { formatDuration, outcomeClass, outcomeIcon, showToast, useHashHistory } from '../utils';
import { parseActivityContent } from '../utils/parseActivityContent';
import { icons } from './icons';
import { RestQueryPanel } from './RestQueryPanel';

const html = htm.bind(h);

interface ActivityNodeProps {
    activity: ReportActivity;
    defaultExpanded?: boolean;
}

export function ActivityNode({ activity, defaultExpanded }: ActivityNodeProps): ReturnType<typeof html> {
    const hashNav = useHashHistory();
    const hasChildren = activity.children && activity.children.length > 0;
    const [expanded, setExpanded] = useState(defaultExpanded !== undefined ? defaultExpanded : true);
    const [restExpanded, setRestExpanded] = useState(false);
    const hasPhoto = activity.artifacts && activity.artifacts.some(a => a.path && a.path.endsWith('.png'));
    const hasRestQuery = !!activity.restQuery;
    const { displayName, parsedDataTable, parsedDocString } = useMemo(() => parseActivityContent(activity.name), [activity.name]);
    const effectiveDataTable = activity.dataTable ? { headers: activity.dataTable[0], rows: activity.dataTable.slice(1) } : parsedDataTable;
    const effectiveDocString = activity.docString || parsedDocString;
    return html`
    <div class="activity-node">
      <div class="activity-row" style=${hasChildren ? 'cursor:pointer' : ''} onClick=${hasChildren ? () => setExpanded(!expanded) : undefined}>
        ${hasChildren ? html`<span class="expand-chevron-xs ${expanded ? 'open' : ''}">▸</span>` : html`<span style="width:12px;flex-shrink:0"></span>`}
        <div class="activity-icon ${outcomeClass(activity.outcome)}">
          ${outcomeIcon(activity.outcome)}
        </div>
        <span class="activity-name ${activity.type === 'Task' ? 'task' : ''}">${displayName}</span>
        ${hasPhoto ? html`<span style="cursor:pointer;opacity:0.7;font-size:var(--font-sm)" title="View screenshot" onClick=${(e: Event) => { e.stopPropagation(); const photos = document.querySelectorAll('.photo-strip-item'); for (const p of photos) { p.classList.remove('photo-highlight'); } const index = [...photos].findIndex(p => p.querySelector('.photo-strip-caption')?.textContent === activity.name); if (index >= 0) { hashNav.setParam('photo', String(index)); const element = document.getElementById('photo-' + index); if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'center' }); element.classList.add('photo-highlight'); setTimeout(() => element.classList.remove('photo-highlight'), 2000); } } }}>📷</span>` : null}
        ${hasRestQuery ? html`<span class="rest-badge" title="View HTTP exchange" onClick=${(e: Event) => { e.stopPropagation(); setRestExpanded(!restExpanded); }}>REST</span>` : null}
        ${activity.location ? html`<span class="copy-location" title="Copy invocation location: ${activity.location.path}:${activity.location.line}" onClick=${(e: Event) => { e.stopPropagation(); navigator.clipboard.writeText(activity.location!.path + ':' + activity.location!.line).then(() => showToast('Location copied to clipboard')).catch(() => {}); }}>${icons.copy}</span>` : null}
        <span class="activity-duration">${formatDuration(activity.duration || 0)}</span>
      </div>
      ${effectiveDataTable ? html`
        <div class="ml-lg mt-xs mb-sm overflow-x">
          <table class="data-table">
            <thead>
              <tr>${effectiveDataTable.headers.map(header => html`<th>${header}</th>`)}</tr>
            </thead>
            <tbody>
              ${effectiveDataTable.rows.map(row => html`
                <tr>${row.map(cell => html`<td>${cell}</td>`)}</tr>
              `)}
            </tbody>
          </table>
        </div>
      ` : null}
      ${effectiveDocString ? html`
        <div class="ml-lg mt-xs mb-sm">
          <pre class="pre-block">${effectiveDocString}</pre>
        </div>
      ` : null}
      ${hasRestQuery && restExpanded ? html`
        <${RestQueryPanel} restQuery=${activity.restQuery} />
      ` : null}
      ${activity.reportData && activity.reportData.length > 0 ? html`
        ${activity.reportData.map(entry => html`
          <div class="report-data-block ml-lg mt-xs mb-sm">
            <div class="text-sm section-label text-secondary">${entry.title}</div>
            <pre class="pre-block" style="color:var(--text-primary)">${entry.contents}</pre>
          </div>
        `)}
      ` : null}
      ${activity.children && activity.children.length > 0 && expanded ? html`
        <div class="ml-sm">
          ${activity.children.map(child => html`<${ActivityNode} activity=${child} defaultExpanded=${defaultExpanded} />`)}
        </div>
      ` : null}
    </div>
  `;
}
