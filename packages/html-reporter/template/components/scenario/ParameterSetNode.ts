import htm from 'htm';
import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import type { ReportParameterSet } from '../../../src/ReportData';
import { formatDuration, outcomeClass, outcomeIcon, showToast, useHashHistory } from '../../utils';
import { ActivityNode } from '../ActivityNode';
import { icons } from '../icons';

const html = htm.bind(h);

export interface ParameterSetNodeProps {
    ps: ReportParameterSet;
    index: number;
    groupIndex: number;
    forceExpanded: boolean | undefined;
}

export function ParameterSetNode({ ps, index, groupIndex, forceExpanded }: ParameterSetNodeProps): ReturnType<typeof html> {
    const hashNav = useHashHistory();
    const exampleId = (groupIndex !== undefined ? groupIndex + '-' : '') + (index + 1);
    const isLinked = (() => {
        return hashNav.getParam('example') === exampleId;
    })();
    const [expanded, setExpanded] = useState(true);
    useEffect(() => { if (forceExpanded !== undefined) setExpanded(forceExpanded); }, [forceExpanded]);
    const nodeRef = useRef<HTMLElement | null>(null);
    const copyLink = (e: Event) => {
        e.stopPropagation();
        hashNav.setParam('example', exampleId);
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => showToast('Link copied to clipboard')).catch(() => {});
    };
    useEffect(() => { if (isLinked && nodeRef.current) nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, []);
    const parameterSummary = Object.entries(ps.values).map(([k, v]) => k + ': ' + v).join(', ');
    return html`
    <div ref=${nodeRef} class="mb-sm bordered" style="border-color:${isLinked ? 'var(--accent)' : 'var(--border-color)'}">
      <div class="panel-header flex-row gap-sm"
           onClick=${() => setExpanded(!expanded)}>
        <span class="expand-chevron ${expanded ? 'open' : ''}">▸</span>
        <span class="scenario-outcome-icon ${outcomeClass(ps.outcome)}" style="width:18px;height:18px;font-size:var(--font-2xs);flex-shrink:0">${outcomeIcon(ps.outcome)}</span>
        <span class="text-sm" style="font-weight:500">#${index + 1} — ${parameterSummary}</span>
        <button onClick=${copyLink} title="Copy link to this example" class="icon-btn ml-auto" style="line-height:1;align-items:center">
          ${icons.link}
        </button>
        <span class="text-xs-muted">${formatDuration(ps.duration || 0)}</span>
      </div>
      ${expanded && ps.activities.length > 0 ? html`
        <div class="activity-tree panel-section">
          ${ps.activities.map(activity => html`<${ActivityNode} activity=${activity} />`)}
        </div>
      ` : null}
    </div>
  `;
}
