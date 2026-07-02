import htm from 'htm';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import type { ReportParameterSet } from '../../../src/ReportData';
import { RawHtml } from '../../utils';
import { icons } from '../icons';
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
    <div class="bordered mb-md">
      <div class="panel-header flex-row gap-sm"
           onClick=${() => setExpanded(!expanded)}>
        <span class="expand-chevron ${expanded ? 'open' : ''}">▸</span>
        <span style="font-size:var(--font-md)" class="font-semibold">${label}</span>
        <span class="ml-auto flex-row gap-sm">
          <button onClick=${expandAll} title="Expand all examples" class="icon-btn">
            ${icons.expandAll}
          </button>
          <button onClick=${collapseAll} title="Collapse all examples" class="icon-btn">
            ${icons.collapseAll}
          </button>
          <span class="text-xs-muted">${passCount}/${group.items.length} passed</span>
        </span>
      </div>
      ${group.description ? html`
        <div class="req-detail-readme readme-content" style="margin:0;border:none;border-top:1px solid var(--divider);border-radius:0;padding:var(--space-sm) var(--space-md)"><${RawHtml} content=${group.description} /></div>
      ` : null}
      ${expanded ? html`
        <div class="panel-section">
          ${group.items.map((ps, index_) => html`<${ParameterSetNode} ps=${ps} index=${index_} groupIndex=${index} forceExpanded=${forceExpanded} />`)}
        </div>
      ` : null}
    </div>
  `;
}
