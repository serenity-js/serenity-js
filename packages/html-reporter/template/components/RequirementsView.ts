/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import htm from 'htm';
import { h } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';

import { DATA, RawHtml } from '../utils';
import { icons } from './icons';

const html = htm.bind(h);

function RequestNode({ node, onNavigate, depth, autoExpanded, path }) {
    const [expanded, setExpanded] = useState(depth < 1 || autoExpanded);
    const total = Object.values(node.outcomes).reduce((a, b) => a + b, 0);
    const passRate = total > 0 ? Math.round((node.outcomes.passed / total) * 100) : 0;
    const hasChildren = node.type === 'directory' && node.children && node.children.length > 0;
    const hasSingleChild = hasChildren && node.children.length === 1 && node.children[0].type === 'directory';
    const hasGap = total === 0 && (node.scenarioCount === 0 || node.type === 'directory');
    const segmentPath = path ? path + '/' + node.name : node.name;
    const nodePath = segmentPath.split('/').map(s => s === node.name ? (node.displayName || s) : s).join(' / ');
    const passColor = total > 0 ? (passRate >= 80 ? 'var(--color-passed)' : passRate >= 50 ? 'var(--color-pending)' : 'var(--color-failed)') : 'var(--color-failed)';

    return html`
    <div style="margin-left:${depth * 20}px;margin-bottom:2px" data-req-path=${hasChildren && expanded ? nodePath : null}>
      <div class="scenario-item" style="padding:8px var(--space-sm)"
           onClick=${() => hasChildren ? setExpanded(!expanded) : onNavigate('/tests?search=' + encodeURIComponent('"' + segmentPath + '"'))}>
        ${hasChildren ? html`
          <span style="font-size:1.5rem;line-height:1;color:var(--text-primary);width:28px;text-align:center;cursor:pointer">${expanded ? '▾' : '▸'}</span>
        ` : html`<span style="width:28px"></span>`}
        <span style="font-size:var(--font-md);font-weight:${node.type === 'directory' ? '600' : '400'};flex:1">${node.displayName || node.name}</span>
        ${total > 0 ? html`
          <span style="font-size:var(--font-sm);font-weight:500;color:${passColor}" title="${node.outcomes.passed} passed, ${node.outcomes.failed || 0} failed, ${(node.outcomes.error || 0) + (node.outcomes.compromised || 0)} error, ${(node.outcomes.skipped || 0) + (node.outcomes.pending || 0)} skipped">${passRate}%</span>
          <span style="font-size:var(--font-xs);color:var(--text-secondary);min-width:80px;text-align:right;display:inline-flex;gap:6px;justify-content:flex-end">${node.outcomes.passed ? html`<span style="color:var(--color-passed)" title="Passed">${node.outcomes.passed}✓</span>` : null}${node.outcomes.failed ? html`<span style="color:var(--color-failed)" title="Failed">${node.outcomes.failed}✗</span>` : null}${(node.outcomes.error || 0) + (node.outcomes.compromised || 0) > 0 ? html`<span style="color:var(--color-error)" title="Error / Compromised">${(node.outcomes.error || 0) + (node.outcomes.compromised || 0)}!</span>` : null}${(node.outcomes.skipped || 0) + (node.outcomes.pending || 0) > 0 ? html`<span style="color:var(--color-skipped)" title="Skipped / Pending">${(node.outcomes.skipped || 0) + (node.outcomes.pending || 0)}⊘</span>` : null}</span>
        ` : html`
          <span style="font-size:var(--font-xs);color:var(--color-failed);font-weight:500">${hasGap ? 'No tests' : ''}</span>
        `}
      </div>
      ${hasChildren && expanded && node.readme ? html`
        <${RawHtml} content=${node.readme} class="readme-content" style="margin-left:${28 + 8}px;margin-bottom:var(--space-md);padding:var(--space-md) var(--space-lg);background:var(--bg-surface);border-radius:var(--radius-sm);border-left:3px solid var(--accent);font-size:var(--font-md);color:var(--text-primary);line-height:1.7" />
      ` : null}
      ${hasChildren && expanded ? html`
        ${node.children.map(child => html`<${RequestNode} node=${child} onNavigate=${onNavigate} depth=${depth + 1} autoExpanded=${hasSingleChild} path=${segmentPath} />`)}
      ` : null}
    </div>
  `;
}

export function RequirementsView({ onNavigate }) {
    const requirements = DATA.requirements;

    if (!requirements) {
        return html`
      <div class="placeholder-view">
        ${icons.coverage}
        <h2>Requirements</h2>
        <p>Configure a <code>specDirectory</code> to derive the requirements hierarchy.</p>
      </div>
    `;
    }

    const totalFiles = useMemo(() => {
        let count = 0;
        function walk(node) { if (node.type === 'file') count++; if (node.children) node.children.forEach(walk); }
        if (requirements.children) requirements.children.forEach(walk);
        return count;
    }, []);

    const gapCount = useMemo(() => {
        let count = 0;
        function walk(node) {
            if (node.type === 'file') {
                const pending = (node.outcomes.pending || 0) + (node.outcomes.skipped || 0);
                const total = Object.values(node.outcomes).reduce((a, b) => a + b, 0);
                if (total === 0 || pending > 0) count++;
            }
            if (node.children) node.children.forEach(walk);
        }
        if (requirements.children) requirements.children.forEach(walk);
        return count;
    }, []);

    const coveredFiles = totalFiles - gapCount;
    const coveragePercent = totalFiles > 0 ? Math.round((coveredFiles / totalFiles) * 100) : 100;
    const totalScenarios = Object.values(requirements.outcomes).reduce((a, b) => a + b, 0);
    const passRate = totalScenarios > 0 ? Math.round((requirements.outcomes.passed / totalScenarios) * 100) : 0;

    const [breadcrumb, setBreadcrumb] = useState('');
    const containerRef = useRef(null);

    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;
        const nodes = containerRef.current.querySelectorAll('[data-req-path]');
        let current = '';
        for (const node of nodes) {
            const rect = node.getBoundingClientRect();
            if (rect.top <= 120) {
                current = node.getAttribute('data-req-path');
            } else {
                break;
            }
        }
        setBreadcrumb(current);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return html`
    <div ref=${containerRef}>
      ${breadcrumb && html`
        <div style="position:sticky;top:0;z-index:10;background:var(--bg-primary);border-bottom:1px solid var(--border);padding:var(--space-xs) var(--space-md);font-size:var(--font-sm);color:var(--text-secondary);font-weight:500;margin:0 calc(-1 * var(--space-md));margin-bottom:var(--space-sm)">
          ${breadcrumb}
        </div>
      `}
      <div class="grid-stats mb-md">
        <div class="card stat-card" title="${coveredFiles} of ${totalFiles} areas are fully covered (no pending or skipped tests)">
          <div class="card-title mb-0">Coverage</div>
          <div class="card-value" style="color:${coveragePercent >= 80 ? 'var(--color-passed)' : coveragePercent >= 50 ? 'var(--color-pending)' : 'var(--color-failed)'};font-size:var(--font-lg)">${coveragePercent}%</div>
          <div class="card-subtitle" style="margin-top:0;margin-left:auto">${coveredFiles} of ${totalFiles} areas fully covered</div>
        </div>
        <div class="card stat-card" title="${requirements.outcomes.passed || 0} of ${totalScenarios} scenarios are passing">
          <div class="card-title mb-0">Pass Rate</div>
          <div class="card-value" style="color:${passRate >= 80 ? 'var(--color-passed)' : passRate >= 50 ? 'var(--color-pending)' : 'var(--color-failed)'};font-size:var(--font-lg)">${passRate}%</div>
          <div class="card-subtitle" style="margin-top:0;margin-left:auto">${totalScenarios} scenarios total</div>
        </div>
        <div class="card stat-card" title="${gapCount} ${gapCount === 1 ? 'area has' : 'areas have'} incomplete tests (pending or skipped)">
          <div class="card-title mb-0">Gaps</div>
          <div class="card-value" style="color:${gapCount === 0 ? 'var(--color-passed)' : 'var(--color-failed)'};font-size:var(--font-lg)">${gapCount}</div>
          <div class="card-subtitle" style="margin-top:0;margin-left:auto">${gapCount === 1 ? 'area' : 'areas'} with incomplete tests</div>
        </div>
      </div>

      ${requirements.readme ? html`
        <${RawHtml} content=${requirements.readme} class="card readme-content" style="margin-bottom:var(--space-md);padding:var(--space-md) var(--space-lg);border-left:3px solid var(--accent);font-size:var(--font-md);color:var(--text-primary);line-height:1.7" />
      ` : null}

      <div class="card">
        ${requirements.children.map(node => html`<${RequestNode} node=${node} onNavigate=${onNavigate} depth=${0} autoExpanded=${false} path=${''} />`)}
      </div>
    </div>
  `;
}
