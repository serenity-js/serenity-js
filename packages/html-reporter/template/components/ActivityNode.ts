import htm from 'htm';
import { h } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import type { ReportActivity } from '../../src/ReportData';
import { formatDuration, outcomeClass, outcomeIcon, showToast } from '../utils';

const html = htm.bind(h);

interface ActivityNodeProps {
    activity: ReportActivity;
    defaultExpanded?: boolean;
}

export function ActivityNode({ activity, defaultExpanded }: ActivityNodeProps) {
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
        ${hasChildren ? html`<span style="font-size:var(--font-xs);width:12px;flex-shrink:0;text-align:center;transform:${expanded ? 'rotate(90deg)' : 'none'};transition:transform 0.15s">▸</span>` : html`<span style="width:12px;flex-shrink:0"></span>`}
        <div class="activity-icon ${outcomeClass(activity.outcome)}">
          ${outcomeIcon(activity.outcome)}
        </div>
        <span class="activity-name ${activity.type === 'Task' ? 'task' : ''}">${displayName}</span>
        ${hasPhoto ? html`<span style="cursor:pointer;opacity:0.7;font-size:var(--font-sm)" title="View screenshot" onClick=${(e: Event) => { e.stopPropagation(); const photos = document.querySelectorAll('.photo-strip-item'); for (const p of photos) { p.classList.remove('photo-highlight'); } const index = [...photos].findIndex(p => p.querySelector('.photo-strip-caption')?.textContent === activity.name); if (index >= 0) { const hash = window.location.hash.split('&photo=')[0]; window.history.replaceState(null, '', hash + '&photo=' + index); const element = document.getElementById('photo-' + index); if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'center' }); element.classList.add('photo-highlight'); setTimeout(() => element.classList.remove('photo-highlight'), 2000); } } }}>📷</span>` : null}
        ${hasRestQuery ? html`<span class="rest-badge" title="View HTTP exchange" onClick=${(e: Event) => { e.stopPropagation(); setRestExpanded(!restExpanded); }}>REST</span>` : null}
        ${activity.location ? html`<span style="cursor:pointer;opacity:0.6;display:inline-flex;align-items:center" title="Copy invocation location: ${activity.location.path}:${activity.location.line}" onClick=${(e: Event) => { e.stopPropagation(); navigator.clipboard.writeText(activity.location!.path + ':' + activity.location!.line).then(() => showToast('Location copied to clipboard')).catch(() => {}); }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></span>` : null}
        <span class="activity-duration">${formatDuration(activity.duration || 0)}</span>
      </div>
      ${effectiveDataTable ? html`
        <div style="margin-left:var(--space-lg);margin-top:var(--space-xs);margin-bottom:var(--space-sm);overflow-x:auto">
          <table style="border-collapse:collapse;font-size:var(--font-sm);font-family:var(--font-mono);width:auto">
            <thead>
              <tr>${effectiveDataTable.headers.map(header => html`<th style="padding:4px 10px;border:1px solid var(--border-color);background:var(--bg-primary);font-weight:600;white-space:nowrap">${header}</th>`)}</tr>
            </thead>
            <tbody>
              ${effectiveDataTable.rows.map(row => html`
                <tr>${row.map(cell => html`<td style="padding:4px 10px;border:1px solid var(--border-color);white-space:nowrap">${cell}</td>`)}</tr>
              `)}
            </tbody>
          </table>
        </div>
      ` : null}
      ${effectiveDocString ? html`
        <div style="margin-left:var(--space-lg);margin-top:var(--space-xs);margin-bottom:var(--space-sm)">
          <pre style="font-size:var(--font-sm);font-family:var(--font-mono);background:var(--bg-primary);padding:var(--space-sm) var(--space-md);border-radius:var(--radius-sm);border:1px solid var(--border-color);white-space:pre-wrap;margin:0">${effectiveDocString}</pre>
        </div>
      ` : null}
      ${hasRestQuery && restExpanded ? html`
        <div class="rest-query-panel" style="margin-left:var(--space-lg);margin-top:var(--space-xs);margin-bottom:var(--space-sm);border:1px solid var(--border-color);border-radius:var(--radius-sm);overflow:hidden;font-size:var(--font-sm)">
          <div style="padding:var(--space-sm) var(--space-md);background:var(--bg-primary);border-bottom:1px solid var(--border-color);display:flex;align-items:center;gap:var(--space-sm)">
            <span style="font-weight:600;font-family:var(--font-mono)">${activity.restQuery!.method}</span>
            <span style="font-family:var(--font-mono);color:var(--text-secondary);word-break:break-all">${activity.restQuery!.url}</span>
            <span style="margin-left:auto;font-weight:600;color:${activity.restQuery!.statusCode < 400 ? 'var(--color-passed)' : 'var(--color-failed)'}">${activity.restQuery!.statusCode}</span>
          </div>
          ${activity.restQuery!.requestHeaders ? html`
            <div style="padding:var(--space-sm) var(--space-md);border-bottom:1px solid var(--border-color)">
              <div style="font-weight:500;margin-bottom:4px">Request Headers</div>
              <pre style="font-family:var(--font-mono);font-size:var(--font-xs);white-space:pre-wrap;margin:0;color:var(--text-secondary)">${activity.restQuery!.requestHeaders}</pre>
            </div>
          ` : null}
          ${activity.restQuery!.requestBody ? html`
            <div style="padding:var(--space-sm) var(--space-md);border-bottom:1px solid var(--border-color)">
              <div style="font-weight:500;margin-bottom:4px">Request Body</div>
              <pre style="font-family:var(--font-mono);font-size:var(--font-xs);white-space:pre-wrap;margin:0;color:var(--text-secondary)">${activity.restQuery!.requestBody}</pre>
            </div>
          ` : null}
          ${activity.restQuery!.responseHeaders ? html`
            <div style="padding:var(--space-sm) var(--space-md);border-bottom:1px solid var(--border-color)">
              <div style="font-weight:500;margin-bottom:4px">Response Headers</div>
              <pre style="font-family:var(--font-mono);font-size:var(--font-xs);white-space:pre-wrap;margin:0;color:var(--text-secondary)">${activity.restQuery!.responseHeaders}</pre>
            </div>
          ` : null}
          ${activity.restQuery!.responseBody ? html`
            <div style="padding:var(--space-sm) var(--space-md)">
              <div style="font-weight:500;margin-bottom:4px">Response Body</div>
              <pre style="font-family:var(--font-mono);font-size:var(--font-xs);white-space:pre-wrap;margin:0;color:var(--text-secondary)">${activity.restQuery!.responseBody}</pre>
            </div>
          ` : null}
        </div>
      ` : null}
      ${activity.reportData && activity.reportData.length > 0 ? html`
        ${activity.reportData.map(entry => html`
          <div class="report-data-block" style="margin-left:var(--space-lg);margin-top:var(--space-xs);margin-bottom:var(--space-sm)">
            <div style="font-size:var(--font-sm);font-weight:500;margin-bottom:4px;color:var(--text-secondary)">${entry.title}</div>
            <pre style="font-size:var(--font-xs);font-family:var(--font-mono);background:var(--bg-primary);padding:var(--space-sm) var(--space-md);border-radius:var(--radius-sm);border:1px solid var(--border-color);white-space:pre-wrap;margin:0;color:var(--text-primary)">${entry.contents}</pre>
          </div>
        `)}
      ` : null}
      ${activity.children && activity.children.length > 0 && expanded ? html`
        <div style="margin-left:var(--space-sm)">
          ${activity.children.map(child => html`<${ActivityNode} activity=${child} defaultExpanded=${defaultExpanded} />`)}
        </div>
      ` : null}
    </div>
  `;
}
