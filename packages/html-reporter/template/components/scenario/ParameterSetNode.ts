import htm from 'htm';
import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import type { ReportParameterSet } from '../../../src/ReportData';
import { formatDuration, outcomeClass, outcomeIcon, showToast } from '../../utils';
import { ActivityNode } from '../ActivityNode';

const html = htm.bind(h);

export interface ParameterSetNodeProps {
    ps: ReportParameterSet;
    index: number;
    groupIndex: number;
    forceExpanded: boolean | undefined;
}

export function ParameterSetNode({ ps, index, groupIndex, forceExpanded }: ParameterSetNodeProps): ReturnType<typeof html> {
    const exampleId = (groupIndex !== undefined ? groupIndex + '-' : '') + (index + 1);
    const isLinked = (() => {
        const hash = window.location.hash;
        const m = hash.match(/[&?]example=([^&]*)/);
        return m && m[1] === exampleId;
    })();
    const [expanded, setExpanded] = useState(true);
    useEffect(() => { if (forceExpanded !== undefined) setExpanded(forceExpanded); }, [forceExpanded]);
    const nodeRef = useRef<HTMLElement | null>(null);
    const copyLink = (e: Event) => {
        e.stopPropagation();
        const hash = window.location.hash.replace(/([&?])example=[^&]*/g, '');
        const url = window.location.origin + window.location.pathname + window.location.search + hash + (hash.includes('?') ? '&' : '?') + 'example=' + exampleId;
        navigator.clipboard.writeText(url).then(() => showToast('Link copied to clipboard')).catch(() => {});
    };
    useEffect(() => { if (isLinked && nodeRef.current) nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, []);
    const parameterSummary = Object.entries(ps.values).map(([k, v]) => k + ': ' + v).join(', ');
    return html`
    <div ref=${nodeRef} style="margin-bottom:var(--space-sm);border:1px solid ${isLinked ? 'var(--accent)' : 'var(--border-color)'};border-radius:var(--radius-sm);overflow:hidden">
      <div style="display:flex;align-items:center;gap:var(--space-sm);padding:var(--space-sm) var(--space-md);background:var(--bg-primary);cursor:pointer;user-select:none"
           onClick=${() => setExpanded(!expanded)}>
        <span style="font-size:var(--font-sm);transform:${expanded ? 'rotate(90deg)' : 'none'};transition:transform 0.2s">▸</span>
        <span class="scenario-outcome-icon ${outcomeClass(ps.outcome)}" style="width:18px;height:18px;font-size:var(--font-2xs);flex-shrink:0">${outcomeIcon(ps.outcome)}</span>
        <span style="font-size:var(--font-sm);font-weight:500">#${index + 1} — ${parameterSummary}</span>
        <button onClick=${copyLink} title="Copy link to this example" style="margin-left:auto;background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:2px;line-height:1;opacity:0.6;display:flex;align-items:center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        </button>
        <span class="text-xs-muted">${formatDuration(ps.duration || 0)}</span>
      </div>
      ${expanded && ps.activities.length > 0 ? html`
        <div class="activity-tree" style="padding:var(--space-sm) var(--space-md)">
          ${ps.activities.map(activity => html`<${ActivityNode} activity=${activity} />`)}
        </div>
      ` : null}
    </div>
  `;
}
