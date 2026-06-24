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

function nodeMatches(node, term) {
    if (!term) return true;
    const name = (node.displayName || node.name).toLowerCase();
    if (name.includes(term.toLowerCase())) return true;
    if (node.children) return node.children.some(c => nodeMatches(c, term));
    return false;
}

function TreeNode({ node, onSelect, selectedPath, depth, path, searchTerm }) {
    const total = Object.values(node.outcomes).reduce((a, b) => a + b, 0);
    const passRate = total > 0 ? Math.round((node.outcomes.passed / total) * 100) : 0;
    const isDirectory = node.type === 'directory' && node.children && node.children.length > 0;
    const segmentPath = path ? path + '/' + node.name : node.name;
    const displayName = node.displayName || node.name;
    const isSelected = selectedPath === segmentPath;
    const hasReadme = !!node.readme;

    // Only show directory nodes in the tree
    if (!isDirectory) return null;

    const matchesSearch = !searchTerm || displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const childrenMatch = node.children.some(c => nodeMatches(c, searchTerm));
    if (searchTerm && !matchesSearch && !childrenMatch) return null;

    return html`
        <div style="margin-left:${depth * 16}px">
            <div class="req-tree-node ${isSelected ? 'req-tree-node--active' : ''}" onClick=${() => onSelect(segmentPath, node)}>
                <span class="req-tree-label">${displayName}</span>
                ${hasReadme ? html`<span class="req-tree-readme-badge" title="Has documentation">📄</span>` : null}
                ${total > 0 ? html`<span class="req-tree-bar"><${ProgressBar} percent=${passRate} /></span>` : null}
            </div>
            ${node.children.map(child => html`
                <${TreeNode} node=${child} onSelect=${onSelect}
                    selectedPath=${selectedPath} depth=${depth + 1}
                    path=${segmentPath} searchTerm=${searchTerm} />
            `)}
        </div>
    `;
}

function DetailPanel({ node, segmentPath, requirements, onNavigate }) {
    if (!node) {
        const total = Object.values(requirements.outcomes).reduce((a, b) => a + b, 0);
        const passRate = total > 0 ? Math.round((requirements.outcomes.passed / total) * 100) : 0;
        return html`
            <div class="req-detail-panel">
                <h3 class="req-detail-title">Overall Coverage</h3>
                <div class="req-detail-stat">
                    <span class="req-detail-stat-label">Pass Rate</span>
                    <span class="req-detail-stat-value" style="color:${passRateColor(passRate)}">${passRate}%</span>
                </div>
                <${ProgressBar} percent=${passRate} />
                <div class="req-detail-stat" style="margin-top:var(--space-md)">
                    <span class="req-detail-stat-label">Total Scenarios</span>
                    <span class="req-detail-stat-value">${total}</span>
                </div>
                ${requirements.readme ? html`<div class="req-detail-readme"><${RawHtml} content=${requirements.readme} /></div>` : null}
            </div>
        `;
    }

    const total = Object.values(node.outcomes).reduce((a, b) => a + b, 0);
    const passRate = total > 0 ? Math.round((node.outcomes.passed / total) * 100) : 0;
    const failed = (node.outcomes.failed || 0) + (node.outcomes.error || 0) + (node.outcomes.compromised || 0);
    const skipped = (node.outcomes.skipped || 0) + (node.outcomes.pending || 0);

    let reqCount = 0, coveredCount = 0;
    function countReqs(n) {
        if (n.type === 'file') {
            reqCount++;
            const t = Object.values(n.outcomes).reduce((a, b) => a + b, 0);
            if (t > 0 && !(n.outcomes.pending || 0) && !(n.outcomes.skipped || 0)) coveredCount++;
        }
        if (n.children) n.children.forEach(countReqs);
    }
    if (node.children) node.children.forEach(countReqs);
    const coveragePercent = reqCount > 0 ? Math.round((coveredCount / reqCount) * 100) : 0;

    const dirs = node.children ? node.children.filter(c => c.type === 'directory') : [];
    const files = node.children ? node.children.filter(c => c.type === 'file') : [];

    return html`
        <div class="req-detail-panel">
            <h3 class="req-detail-title">${node.displayName || node.name}</h3>

            ${node.readme ? html`<div class="req-detail-readme"><${RawHtml} content=${node.readme} /></div>` : null}

            <div class="req-detail-stats-grid">
                <div class="req-detail-stat-card">
                    <span class="req-detail-stat-label">Coverage</span>
                    <span class="req-detail-stat-value" style="color:${passRateColor(coveragePercent)}">${coveragePercent}%</span>
                    <${ProgressBar} percent=${coveragePercent} />
                </div>
                <div class="req-detail-stat-card">
                    <span class="req-detail-stat-label">Pass Rate</span>
                    <span class="req-detail-stat-value" style="color:${passRateColor(passRate)}">${passRate}%</span>
                    <${ProgressBar} percent=${passRate} />
                </div>
                <div class="req-detail-stat-card">
                    <span class="req-detail-stat-label">Scenarios</span>
                    <span class="req-detail-stat-value">${total}</span>
                </div>
                ${failed > 0 ? html`<div class="req-detail-stat-card">
                    <span class="req-detail-stat-label">Failed</span>
                    <span class="req-detail-stat-value" style="color:var(--color-failed)">${failed}</span>
                </div>` : null}
                ${skipped > 0 ? html`<div class="req-detail-stat-card">
                    <span class="req-detail-stat-label">Skipped</span>
                    <span class="req-detail-stat-value" style="color:var(--text-secondary)">${skipped}</span>
                </div>` : null}
            </div>

            ${dirs.length > 0 ? html`
                <div style="margin-top:var(--space-lg)">
                    <h4 class="req-detail-section-title">Subdirectories</h4>
                    ${dirs.map(child => {
                        const ct = Object.values(child.outcomes).reduce((a, b) => a + b, 0);
                        const cr = ct > 0 ? Math.round((child.outcomes.passed / ct) * 100) : 0;
                        return html`
                            <div class="req-detail-child">
                                <span class="req-detail-child-icon">📁</span>
                                <span class="req-detail-child-name">${child.displayName || child.name}</span>
                                <span class="req-detail-child-rate" style="color:${ct > 0 ? passRateColor(cr) : 'var(--text-disabled)'}">${ct > 0 ? cr + '%' : '—'}</span>
                            </div>
                        `;
                    })}
                </div>
            ` : null}
            ${files.length > 0 ? html`
                <div style="margin-top:var(--space-lg)">
                    <h4 class="req-detail-section-title">Test Files</h4>
                    ${files.map(child => {
                        const ct = Object.values(child.outcomes).reduce((a, b) => a + b, 0);
                        const cr = ct > 0 ? Math.round((child.outcomes.passed / ct) * 100) : 0;
                        const filePath = segmentPath + '/' + child.name;
                        return html`
                            <div class="req-detail-child req-detail-child--link clickable" onClick=${() => onNavigate('/tests?search=' + encodeURIComponent('"' + filePath + '"'))}>
                                <span class="req-detail-child-icon">📄</span>
                                <span class="req-detail-child-name">${child.displayName || child.name}</span>
                                <span class="req-detail-child-rate" style="color:${ct > 0 ? passRateColor(cr) : 'var(--text-disabled)'}">${ct > 0 ? cr + '%' : '—'}</span>
                                <span class="req-tree-nav-arrow">→</span>
                            </div>
                        `;
                    })}
                </div>
            ` : null}
        </div>
    `;
}

export function RequirementsView({ onNavigate }) {
    const requirements = DATA.requirements;

    if (!requirements) {
        return html`
            <div class="empty-state">
                <div class="empty-state-icon">${icons.coverage}</div>
                <div class="empty-state-title">Requirements</div>
                <div class="empty-state-description">Configure a <code>specDirectory</code> to derive the requirements hierarchy.</div>
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
                const t = Object.values(n.outcomes).reduce((a, b) => a + b, 0);
                if (t === 0 || (n.outcomes.pending || 0) + (n.outcomes.skipped || 0) > 0) count++;
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
        setSelectedPath(path);
        setSelectedNode(node);
    };

    return html`
        <div>
            <div class="kpi-row" style="margin-bottom:var(--space-lg)">
                <div class="kpi-card">
                    <div class="kpi-icon-wrap kpi-icon--coverage">
                        ${icons.coverage}
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-value">${totalFiles}</span>
                        <span class="kpi-label">Total Requirements</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon-wrap kpi-icon--pass-rate">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-value" style="color:${passRateColor(coveragePercent)}">${coveragePercent}%</span>
                        <span class="kpi-label">Coverage</span>
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
                <div class="kpi-card" onClick=${() => onNavigate('/tests?filter=failed,skipped')}>
                    <div class="kpi-icon-wrap kpi-icon--coverage">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-value" style="color:${passRateColor(passRate)}">${passRate}%</span>
                        <span class="kpi-label">Pass Rate</span>
                    </div>
                </div>
            </div>

            <div class="requirements-split">
                <div class="card req-tree-panel">
                    <div class="req-search-wrap">
                        <input type="text" class="search-input" placeholder="Search requirements..."
                            value=${searchTerm} onInput=${(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div class="req-tree-list">
                        ${requirements.children.map(node => html`
                            <${TreeNode} node=${node} onSelect=${handleSelect}
                                selectedPath=${selectedPath} depth=${0}
                                path=${''} searchTerm=${searchTerm} />
                        `)}
                    </div>
                </div>
                <div class="card req-detail-wrap">
                    <${DetailPanel} node=${selectedNode} segmentPath=${selectedPath}
                        requirements=${requirements} onNavigate=${onNavigate} />
                </div>
            </div>
        </div>
    `;
}
