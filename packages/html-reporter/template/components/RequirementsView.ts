/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import htm from 'htm';
import { h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import { DATA, RawHtml } from '../utils';
import { icons } from './icons';

const html = htm.bind(h);

function passRateColor(rate) {
    return rate >= 80 ? 'var(--color-passed)' : rate >= 50 ? 'var(--color-pending)' : 'var(--color-failed)';
}

function ProgressBar({ percent, tooltip }) {
    return html`
        <div class="progress-bar-wrap" title=${tooltip || ''}>
            <div class="progress-bar-fill" style="width:${percent}%;background:${passRateColor(percent)}" />
        </div>
    `;
}

const folderIcon = html`<svg class="req-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
const fileIcon = html`<svg class="req-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;

function TreeBar({ percent, tooltip }) {
    return html`
        <div class="req-tree-bars-item" title=${tooltip || ''}>
            <div class="progress-bar-fill" style="width:${percent}%;background:${passRateColor(percent)}" />
        </div>
    `;
}

function nodeMetrics(node) {
    const total = Object.values(node.outcomes).reduce((a, b) => a + b, 0);
    const passRate = total > 0 ? Math.round((node.outcomes.passed / total) * 100) : 0;
    let fileCount = 0, coveredCount = 0;
    function countReqs(n) {
        if (n.type === 'file') {
            fileCount++;
            const t = Object.values(n.outcomes).reduce((a, b) => a + b, 0);
            if (t > 0 && !(n.outcomes.pending || 0) && !(n.outcomes.skipped || 0)) coveredCount++;
        }
        if (n.children) n.children.forEach(countReqs);
    }
    if (node.children) node.children.forEach(countReqs);
    const coverage = fileCount > 0 ? Math.round((coveredCount / fileCount) * 100) : 0;
    return { total, passRate, fileCount, coveredCount, coverage };
}

function nodeMatches(node, term) {
    if (!term) return true;
    const name = (node.displayName || node.name).toLowerCase();
    if (name.includes(term.toLowerCase())) return true;
    if (node.children) return node.children.some(c => nodeMatches(c, term));
    return false;
}

function findNodeByPath(root, targetPath) {
    if (!targetPath) return root;
    if (!root.children) return null;
    const parts = targetPath.split('/');
    let current = root;
    for (const part of parts) {
        if (!current.children) return null;
        current = current.children.find(c => c.name === part);
        if (!current) return null;
    }
    return current;
}

function TreeNode({ node, onSelect, selectedPath, depth, path, searchTerm, isRoot }) {
    const isDirectory = node.type === 'directory' && node.children && node.children.length > 0;
    const segmentPath = isRoot ? '' : (path ? path + '/' + node.name : node.name);
    const displayName = node.displayName || node.name;
    const isSelected = selectedPath === segmentPath;

    if (!isDirectory) return null;

    const matchesSearch = !searchTerm || displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const childrenMatch = node.children.some(c => nodeMatches(c, searchTerm));
    if (searchTerm && !matchesSearch && !childrenMatch) return null;

    const { total, passRate, fileCount, coveredCount, coverage } = nodeMetrics(node);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(segmentPath, node);
        }
    };

    return html`
        <div style="margin-left:${depth * 12}px">
            <div class="req-tree-node ${isSelected ? 'req-tree-node--active' : ''}"
                 tabindex="0" role="treeitem" aria-selected=${isSelected}
                 onClick=${() => onSelect(segmentPath, node)}
                 onKeyDown=${handleKeyDown}>
                <span class="req-tree-icon">${folderIcon}</span>
                <span class="req-tree-label">${displayName}</span>
                ${total > 0 ? html`
                    <span class="req-tree-bars">
                        <${TreeBar} percent=${coverage} tooltip="${coverage}% Coverage — ${coveredCount} of ${fileCount} requirements covered" />
                        <${TreeBar} percent=${passRate} tooltip="${passRate}% Pass Rate — ${node.outcomes.passed} of ${total} scenarios passing" />
                    </span>
                ` : null}
            </div>
            ${node.children.map(child => html`
                <${TreeNode} node=${child} onSelect=${onSelect}
                    selectedPath=${selectedPath} depth=${depth + 1}
                    path=${segmentPath} searchTerm=${searchTerm} />
            `)}
        </div>
    `;
}

function DetailPanel({ node, segmentPath, requirements, onNavigate, onSelect }) {
    if (!node) {
        const total = Object.values(requirements.outcomes).reduce((a, b) => a + b, 0);
        const passRate = total > 0 ? Math.round((requirements.outcomes.passed / total) * 100) : 0;
        return html`
            <div class="req-detail-panel">
                <h3 class="req-detail-title">Overall</h3>
                <div class="req-detail-stat">
                    <span class="req-detail-stat-label">Pass Rate</span>
                    <span class="req-detail-stat-value" style="color:${passRateColor(passRate)}">${passRate}%</span>
                </div>
                <${ProgressBar} percent=${passRate} tooltip="${passRate}% Pass Rate — ${requirements.outcomes.passed} of ${total} scenarios passing" />
                <div class="req-detail-stat" style="margin-top:var(--space-md)">
                    <span class="req-detail-stat-label">Scenarios</span>
                    <span class="req-detail-stat-value">${total}</span>
                </div>
                ${requirements.readme ? html`<div class="req-detail-readme readme-content"><${RawHtml} content=${requirements.readme} /></div>` : null}
            </div>
        `;
    }

    const { total, passRate, fileCount, coveredCount, coverage: coveragePercent } = nodeMetrics(node);
    const failed = (node.outcomes.failed || 0) + (node.outcomes.error || 0) + (node.outcomes.compromised || 0);
    const skipped = (node.outcomes.skipped || 0) + (node.outcomes.pending || 0);

    const directories = node.children ? node.children.filter(c => c.type === 'directory') : [];
    const files = node.children ? node.children.filter(c => c.type === 'file') : [];

    return html`
        <div class="req-detail-panel">
            <h3 class="req-detail-title">${node.displayName || node.name}</h3>

            ${node.readme ? html`<div class="req-detail-readme readme-content"><${RawHtml} content=${node.readme} /></div>` : null}

            <div class="req-detail-stats-grid">
                <div class="req-detail-stat-card" title="Requirement Coverage — ${coveredCount} of ${fileCount} areas fully covered">
                    <span class="req-detail-stat-label">Coverage</span>
                    <span class="req-detail-stat-value" style="color:${passRateColor(coveragePercent)}">${coveragePercent}%</span>
                    <${ProgressBar} percent=${coveragePercent} />
                </div>
                <div class="req-detail-stat-card" title="${passRate}% Pass Rate — ${node.outcomes.passed} of ${total} scenarios passing">
                    <span class="req-detail-stat-label">Pass Rate</span>
                    <span class="req-detail-stat-value" style="color:${passRateColor(passRate)}">${passRate}%</span>
                    <${ProgressBar} percent=${passRate} />
                </div>
                <div class="req-detail-stat-card" title="${total} scenarios in this area">
                    <span class="req-detail-stat-label">Scenarios</span>
                    <span class="req-detail-stat-value">${total}</span>
                </div>
                ${failed > 0 ? html`<div class="req-detail-stat-card" title="${failed} failed, compromised, or broken scenarios">
                    <span class="req-detail-stat-label">Failed</span>
                    <span class="req-detail-stat-value" style="color:var(--color-failed)">${failed}</span>
                </div>` : null}
                ${skipped > 0 ? html`<div class="req-detail-stat-card" title="${skipped} skipped or pending scenarios">
                    <span class="req-detail-stat-label">Skipped</span>
                    <span class="req-detail-stat-value" style="color:var(--text-secondary)">${skipped}</span>
                </div>` : null}
            </div>

            ${directories.length > 0 ? html`
                <div style="margin-top:var(--space-lg)">
                    <h4 class="req-detail-section-title">Subdirectories</h4>
                    ${directories.map(child => {
                        const m = nodeMetrics(child);
                        const childPath = segmentPath ? segmentPath + '/' + child.name : child.name;
                        return html`
                            <div class="req-detail-child req-detail-child--link clickable" title="${m.coverage}% Coverage, ${m.passRate}% Pass Rate" onClick=${() => onSelect(childPath, child)}>
                                <span class="req-detail-child-icon">${folderIcon}</span>
                                <span class="req-detail-child-name">${child.displayName || child.name}</span>
                                <span class="req-detail-child-rate" style="color:${m.total > 0 ? passRateColor(m.passRate) : 'var(--text-disabled)'}">${m.total > 0 ? m.passRate + '%' : '—'}</span>
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
                            <div class="req-detail-file-card">
                                <div class="req-detail-child req-detail-child--link clickable" onClick=${() => onNavigate('/tests?search=' + encodeURIComponent('"' + filePath + '"'))}>
                                    <span class="req-detail-child-icon">${fileIcon}</span>
                                    <span class="req-detail-child-name">${child.displayName || child.name}</span>
                                    <span class="req-detail-child-rate" style="color:${ct > 0 ? passRateColor(cr) : 'var(--text-disabled)'}">${ct > 0 ? cr + '%' : '—'}</span>
                                    <span class="req-tree-nav-arrow">→</span>
                                </div>
                                ${child.narrative ? html`<p class="req-file-narrative">${child.narrative}</p>` : null}
                            </div>
                        `;
                    })}
                </div>
            ` : null}
        </div>
    `;
}

export function RequirementsView({ onNavigate, route }) {
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
    const [selectedPath, setSelectedPath] = useState('');
    const [selectedNode, setSelectedNode] = useState(requirements);

    // Restore selection from URL on mount / route change
    useEffect(() => {
        const params = route && route.includes('?') ? new URLSearchParams(route.split('?')[1]) : null;
        const pathFromUrl = params?.get('path') ?? '';
        const node = findNodeByPath(requirements, pathFromUrl);
        if (node) {
            setSelectedPath(pathFromUrl);
            setSelectedNode(node);
        }
    }, [route]);

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
        const newHash = path ? '#/requirements?path=' + encodeURIComponent(path) : '#/requirements';
        if (window.location.hash !== newHash) {
            window.history.replaceState(null, '', newHash);
        }
    };

    return html`
        <div>
            <div class="kpi-row" style="margin-bottom:var(--space-lg)">
                <div class="kpi-card" title="${totalFiles} test files discovered in the spec directory">
                    <div class="kpi-icon-wrap kpi-icon--coverage">
                        ${icons.coverage}
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-value">${totalFiles}</span>
                        <span class="kpi-label">Total Requirements</span>
                    </div>
                </div>
                <div class="kpi-card" title="Requirement Coverage — ${coveredFiles} of ${totalFiles} areas fully covered">
                    <div class="kpi-icon-wrap kpi-icon--pass-rate">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-value" style="color:${passRateColor(coveragePercent)}">${coveragePercent}%</span>
                        <span class="kpi-label">Coverage</span>
                    </div>
                </div>
                <div class="kpi-card" title="${gapCount} requirements with no passing scenarios or incomplete coverage">
                    <div class="kpi-icon-wrap kpi-icon--failed">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    </div>
                    <div class="kpi-content">
                        <span class="kpi-value" style="color:${gapCount === 0 ? 'var(--color-passed)' : 'var(--color-failed)'}">${gapCount}</span>
                        <span class="kpi-label">Requirement Gaps</span>
                    </div>
                </div>
                <div class="kpi-card" onClick=${() => onNavigate('/tests?filter=failed,skipped')} title="${passRate}% Pass Rate — ${requirements.outcomes.passed} of ${totalScenarios} scenarios passing">
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
                    <div class="req-tree-list" role="tree">
                        <${TreeNode} node=${requirements} onSelect=${handleSelect}
                            selectedPath=${selectedPath} depth=${0}
                            path=${''} searchTerm=${searchTerm} isRoot=${true} />
                    </div>
                </div>
                <div class="card req-detail-wrap">
                    <${DetailPanel} node=${selectedNode} segmentPath=${selectedPath}
                        requirements=${requirements} onNavigate=${onNavigate} onSelect=${handleSelect} />
                </div>
            </div>
        </div>
    `;
}
