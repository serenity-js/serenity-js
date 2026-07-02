import htm from 'htm';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import type { ReportParameterSet } from '../../../src/ReportData';
import { RawHtml } from '../../utils';
import { ParameterSetNode } from './ParameterSetNode';

const html = htm.bind(h);

export interface ParameterSetGroupProps {
    group: { key: string; name: string | undefined; description: string | undefined; items: ReportParameterSet[] };
    index: number;
}

export function ParameterSetGroup({ group, index }: ParameterSetGroupProps): ReturnType<typeof html> {
    const [expanded, setExpanded] = useState(true);
    const [forceExpanded, setForceExpanded] = useState<boolean | undefined>(undefined);
    const passCount = group.items.filter(ps => ps.outcome === 'SUCCESS').length;
    const label = group.name || ('Examples' + (index !== undefined ? ' #' + (index + 1) : ''));
    const collapseAll = (e: Event) => { e.stopPropagation(); setForceExpanded(false); };
    const expandAll = (e: Event) => { e.stopPropagation(); setForceExpanded(true); };
    return html`
    <div style="margin-bottom:var(--space-md);border:1px solid var(--border-color);border-radius:var(--radius-sm);overflow:hidden">
      <div style="display:flex;align-items:center;gap:var(--space-sm);padding:var(--space-sm) var(--space-md);background:var(--bg-primary);cursor:pointer;user-select:none"
           onClick=${() => setExpanded(!expanded)}>
        <span style="font-size:var(--font-sm);transform:${expanded ? 'rotate(90deg)' : 'none'};transition:transform 0.2s">▸</span>
        <span style="font-size:var(--font-md);font-weight:600">${label}</span>
        <span style="margin-left:auto;display:flex;align-items:center;gap:var(--space-sm)">
          <button onClick=${expandAll} title="Expand all examples" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:2px;display:flex;opacity:0.6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><path d="M7 9l5 5 5-5"/><path d="M7 15l5 5 5-5"/></svg>
          </button>
          <button onClick=${collapseAll} title="Collapse all examples" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:2px;display:flex;opacity:0.6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><path d="M17 15l-5-5-5 5"/><path d="M17 9l-5-5-5 5"/></svg>
          </button>
          <span class="text-xs-muted">${passCount}/${group.items.length} passed</span>
        </span>
      </div>
      ${group.description ? html`
        <div class="req-detail-readme readme-content" style="margin:0;border:none;border-top:1px solid var(--divider);border-radius:0;padding:var(--space-sm) var(--space-md)"><${RawHtml} content=${group.description} /></div>
      ` : null}
      ${expanded ? html`
        <div style="padding:var(--space-sm) var(--space-md)">
          ${group.items.map((ps, index_) => html`<${ParameterSetNode} ps=${ps} index=${index_} groupIndex=${index} forceExpanded=${forceExpanded} />`)}
        </div>
      ` : null}
    </div>
  `;
}
