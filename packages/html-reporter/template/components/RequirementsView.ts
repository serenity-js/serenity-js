/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import htm from 'htm';
import { h } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import { DATA, RawHtml } from '../utils';
import { icons } from './icons';

const html = htm.bind(h);

function passRateColor(rate) {
    return rate >= 80 ? 'var(--color-passed)' : rate >= 50 ? 'var(--color-pending)' : 'var(--color-failed)';
}

function ProgressBar({ percent }) {
    return html`
        <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width:${percent}%;background:${passRateColor(percent)}" />
        </div>
    `;
}

function TreeNode({ node, onNavigate, onSelect, selectedPath, depth, autoExpanded, path, searchTerm }) {
    const [expanded, setExpanded] = useState(depth < 1 || autoExpanded);
    const total = Object.values(node.outcomes).reduce((a, b) => a + b, 0);
    const passRate = total > 0 ? Math.round((node.outcomes.passed / total) * 100) : 0;
    const hasChildren = node.type === 'directory' && node.children && node.children.length > 0;
    const hasSingleChild = hasChildren && node.children.length === 1 && node.children[0].type === 'directory';
    const segmentPath = path ? path + '/' + node.name : node.name;
    const displayName = node.displayName || node.name;
    const isSelected = selectedPath === segmentPath;

    const matchesSearch = !searchTerm || displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const childrenMatch = hasChildren && node.children.some(c => nodeMatches(c, searchTerm));

    if (searchTerm && !matchesSearch && !childrenMatch) return null;

    const shouldExpand = searchTerm ? (matchesSearch || childrenMatch) : expanded;

    return html`
        <div style="margin-left:${depth * 16}px">
            <div class="req-tree-node ${isSelected ? 'req-tree-node--active' : ''}"
                 onClick=${() => {
                        if (hasChildren) {
                            setExpanded(!expanded);
                            onSelect(segmentPath, node);
                        } else {
                            onSelect(segmentPath, node);
                        }
                    }}>
                ${hasChildren
                    ? html`<span class="req-tree-toggle">${shouldExpand ? '▾' : '▸'}</span>`
                    : html`<span class="req-tree-toggle" />`}
                <span class="req-tree-label" style="font-weight:${node.type === 'directory' ? '600' : '400'}">${displayName}</span>
                ${total > 0 ? html`
                    <span class="req-tree-bar"><${ProgressBar} percent=${passRate} /></span>
                ` : null}
            </div>
            ${hasChildren && shouldExpand ? html`
                ${node.children.map(child => html`
                    <${TreeNode} node=${child} onNavigate=${onNavigate} onSelect=${onSelect}
                        selectedPath=${selectedPath} depth=${depth + 1}
                        autoExpanded=${hasSingleChild} path=${segmentPath} searchTerm=${searchTerm} />
                `)}
            ` : null}
        </div>
    `;
}

function nodeMatches(node, term) {
    if (!term) return true;
    const name = (node.displayName || node.name).toLowerCase();
    if (name.includes(term.toLowerCase())) return true;
    if (node.children) return node.children.some(c => nodeMatches(c, term));
    return false;
}

function DetailPanel({ node, segmentPath, onNavigate, requirements }) {
    if (!node) {
        // Default: overall summary
        const total = Object.values(requirements.outcomes).reduce((a, b) => a + b, 0);
        const passRate = total > 0 ? Math.round((requirements.outcomes.passed / total) * 100) : 0;
        return html`
            <div class="req-detail-panel">
                <h3 style="margin:0 0 var(--space-md)">Overall Coverage</h3>
                <div class="req-detail-stat">
                    <span class="req-detail-stat-label">Pass Rate</span>
                    <span class="req-detail-stat-value" style="color:${passRateColor(passRate)}">${passRate}%</span>
                </div>
                <${ProgressBar} percent=${passRate} />
                <div class="req-detail-stat" style="margin-top:var(--space-md)">
                    <span class="req-detail-stat-label">Total Scenarios</span>
                    <span class="req-detail-stat-value">${total}</span>
                </div>
                ${requirements.readme ? html`
                    <${RawHtml} content=${requirements.readme} class="req-detail-readme" />
                ` : null}
            </div>
        `;
    }

    if (node.type === 'file') {
        onNavigate('/tests?search=' + encodeURIComponent('"' + segmentPath + '"'));
        return null;
    }

    // Directory node
    const total = Object.values(node.outcomes).reduce((a, b) => a + b, 0);
    const passRate = total > 0 ? Math.round((node.outcomes.passed / total) * 100) : 0;
    const scenarioCount = node.scenarioCount || total;

    return html`
        <div class="req-detail-panel">
            <h3 style="margin:0 0 var(--space-md)">${node.displayName || node.name}</h3>
            <div class="req-detail-stat">
                <span class="req-detail-stat-label">Pass Rate</span>
                <span class="req-detail-stat-value" style="color:${passRateColor(passRate)}">${passRate}%</span>
            </div>
            <${ProgressBar} percent=${passRate} />
            <div class="req-detail-stat" style="margin-top:var(--space-md)">
                <span class="req-detail-stat-label">Scenarios</span>
                <span class="req-detail-stat-value">${scenarioCount}</span>
            </div>
            ${node.children && node.children.length > 0 ? html`
                <div style="margin-top:var(--space-lg)">
                    <h4 style="margin:0 0 var(--space-sm);font-size:var(--font-sm);color:var(--text-secondary)">Children</h4>
                    ${node.children.map(child => {
                        const ct = Object.values(child.outcomes).reduce((a, b) => a + b, 0);
                        const cr = ct > 0 ? Math.round((child.outcomes.passed / ct) * 100) : 0;
                        return html`
                            <div class="req-detail-child">
                                <span>${child.displayName || child.name}</span>
                                <span style="color:${passRateColor(cr)};font-size:var(--font-sm)">${ct > 0 ? cr + '%' : '—'}</span>
                            </div>
                        `;
                    })}
                </div>
            ` : null}
            ${node.readme ? html`<${RawHtml} content=${node.readme} class="req-detail-readme" />` : null}
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

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPath, setSelectedPath] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    const totalFiles = useMemo(() => {
        let count = 0;
        function walk(n) { if (n.type === 'file') count++; if (n.children) n.children.forEach(walk); }
        if (requirements.children) requirements.children.forEach(walk);
        return count;
    }, []);

    const gapCount = useMemo(() => {
        let count = 0;
        function walk(n) {
            if (n.type === 'file') {
                const total = Object.values(n.outcomes).reduce((a, b) => a + b, 0);
                if (total === 0 || (n.outcomes.pending || 0) + (n.outcomes.skipped || 0) > 0) count++;
            }
            if (n.children) n.children.forEach(walk);
        }
        if (requirements.children) requirements.children.forEach(walk);
        return count;
    }, []);

    const coveredFiles = totalFiles - gapCount;
    const coveragePercent = totalFiles > 0 ? Math.round((coveredFiles / totalFiles) * 100) : 100;
    const totalScenarios = Object.values(requirements.outcomes).reduce((a, b) => a + b, 0);
    const passRate = totalScenarios > 0 ? Math.round((requirements.outcomes.passed / totalScenarios) * 100) : 0;

    const handleSelect = (path, node) => {
        if (node.type === 'file') {
            onNavigate('/tests?search=' + encodeURIComponent('"' + path + '"'));
        } else {
            setSelectedPath(path);
            setSelectedNode(node);
        }
    };

    return html`
        <div>
            <div class="kpi-row" style="margin-bottom:var(--space-lg)">
                <div class="kpi-card">
                    <div class="kpi-icon-wrap kpi-icon--coverage">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-value" style="color:${passRateColor(coveragePercent)}">${coveragePercent}%</span>
                        <span class="kpi-label">Coverage</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon-wrap kpi-icon--pass-rate">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-value" style="color:${passRateColor(passRate)}">${passRate}%</span>
                        <span class="kpi-label">Pass Rate</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon-wrap kpi-icon--failed">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-value" style="color:${gapCount === 0 ? 'var(--color-passed)' : 'var(--color-failed)'}">${gapCount}</span>
                        <span class="kpi-label">Requirement Gaps</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon-wrap kpi-icon--coverage">
                        ${icons.coverage}
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-value">${totalFiles}</span>
                        <span class="kpi-label">Total Requirements</span>
                    </div>
                </div>
            </div>

            <div class="requirements-split">
                <div class="req-tree-panel">
                    <div class="req-search-wrap">
                        <input type="text" class="req-search-input" placeholder="Search requirements..."
                            value=${searchTerm} onInput=${(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div class="req-tree-list">
                        ${requirements.children.map(node => html`
                            <${TreeNode} node=${node} onNavigate=${onNavigate} onSelect=${handleSelect}
                                selectedPath=${selectedPath} depth=${0} autoExpanded=${false}
                                path=${''} searchTerm=${searchTerm} />
                        `)}
                    </div>
                </div>
                <div class="req-detail-wrap">
                    <${DetailPanel} node=${selectedNode} segmentPath=${selectedPath}
                        onNavigate=${onNavigate} requirements=${requirements} />
                </div>
            </div>
        </div>
    `;
}
