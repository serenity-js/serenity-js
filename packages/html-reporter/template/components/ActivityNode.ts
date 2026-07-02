import htm from 'htm';
import { h } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import type { ReportActivity } from '../../src/ReportData';
import { formatDuration, outcomeClass, outcomeIcon, showToast, useHashHistory } from '../utils';
import { icons } from './icons';

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
    const { displayName, parsedDataTable, parsedDocString } = useMemo(() => {
        const name = activity.name;
        const lines = name.split('\n');
        const firstTableIndex = lines.findIndex(l => l.trim().startsWith('|'));
        if (firstTableIndex > 0 || (firstTableIndex === 0 && lines.length > 1)) {
            const textLines: string[] = [];
            const tableLines: string[] = [];
            let inTable = false;
            for (const line of lines) {
                if (line.trim().startsWith('|')) { inTable = true; tableLines.push(line); }
                else if (!inTable) textLines.push(line);
                else { textLines.push(line); inTable = false; }
            }
            if (tableLines.length > 0) {
                const headers = tableLines[0].split('|').filter(c => c.trim()).map(c => c.trim());
                const rows = tableLines.slice(1).map(row => row.split('|').filter(c => c.trim()).map(c => c.trim()));
                return { displayName: textLines.join('\n').replace(/:\s*$/, ':'), parsedDataTable: { headers, rows }, parsedDocString: null as string | null };
            }
        }
        const colonIndex = name.indexOf(':\n');
        if (colonIndex > 0 && !name.substring(colonIndex + 2).trim().startsWith('|')) {
            const prefix = name.substring(0, colonIndex + 1);
            const docContent = name.substring(colonIndex + 2);
            return { displayName: prefix, parsedDataTable: null as { headers: string[]; rows: string[][] } | null, parsedDocString: docContent };
        }
        return { displayName: name, parsedDataTable: null as { headers: string[]; rows: string[][] } | null, parsedDocString: null as string | null };
    }, [activity.name]);
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
        <div class="rest-query-panel ml-lg mt-xs mb-sm bordered text-sm">
          <div class="panel-section-border flex-row gap-sm" style="background:var(--bg-primary)">
            <span class="font-semibold font-mono">${activity.restQuery!.method}</span>
            <span class="font-mono text-secondary" style="word-break:break-all">${activity.restQuery!.url}</span>
            <span class="ml-auto font-semibold" style="color:${activity.restQuery!.statusCode < 400 ? 'var(--color-passed)' : 'var(--color-failed)'}">${activity.restQuery!.statusCode}</span>
          </div>
          ${activity.restQuery!.requestHeaders ? html`
            <div class="panel-section-border">
              <div class="section-label">Request Headers</div>
              <pre class="code-block">${activity.restQuery!.requestHeaders}</pre>
            </div>
          ` : null}
          ${activity.restQuery!.requestBody ? html`
            <div class="panel-section-border">
              <div class="section-label">Request Body</div>
              <pre class="code-block">${activity.restQuery!.requestBody}</pre>
            </div>
          ` : null}
          ${activity.restQuery!.responseHeaders ? html`
            <div class="panel-section-border">
              <div class="section-label">Response Headers</div>
              <pre class="code-block">${activity.restQuery!.responseHeaders}</pre>
            </div>
          ` : null}
          ${activity.restQuery!.responseBody ? html`
            <div class="panel-section">
              <div class="section-label">Response Body</div>
              <pre class="code-block">${activity.restQuery!.responseBody}</pre>
            </div>
          ` : null}
        </div>
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
