/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import htm from 'htm';
import { h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import { DATA, RawHtml } from '../utils';
import { icons } from './icons';

const html = htm.bind(h);

// Mini sparkline for KPI cards
function MiniSparkline({ values, color }) {
    if (!values || values.length < 2) return null;
    const width = 48;
    const height = 16;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const points = values.map((v, i) =>
        `${(i / (values.length - 1)) * width},${1 + (1 - (v - min) / range) * (height - 2)}`
    ).join(' ');
    return html`<svg style="flex-shrink:0;opacity:0.7" width=${width} height=${height} viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><polyline fill="none" stroke=${color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" points=${points} /></svg>`;
}

function passRateColor(rate) {
    return rate >= 90 ? 'var(--color-passed)' : rate < 50 ? 'var(--color-failed)' : rate < 70 ? 'var(--color-pending)' : 'var(--color-passed)';
}

const folderIcon = html`<svg class="req-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
const fileIcon = html`<svg class="req-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;

function SegmentedBar({ outcomes, tooltip }) {
    const total = Object.values(outcomes).reduce((a: number, b: number) => a + b, 0);
    if (total === 0) return null;
    const passed = (outcomes.passed || 0) / total * 100;
    const failed = ((outcomes.failed || 0) + (outcomes.error || 0) + (outcomes.compromised || 0)) / total * 100;
    const pending = (outcomes.pending || 0) / total * 100;
    const skipped = (outcomes.skipped || 0) / total * 100;
    return html`
        <div class="req-tree-bars-item" title=${tooltip || ''} style="display:flex;overflow:hidden;border-radius:2px;background:var(--border-color)">
            ${passed > 0 ? html`<div style="width:${passed}%;height:100%;background:var(--color-passed)"></div>` : null}
            ${failed > 0 ? html`<div style="width:${failed}%;height:100%;background:var(--color-failed)"></div>` : null}
            ${pending > 0 ? html`<div style="width:${pending}%;height:100%;background:var(--color-pending)"></div>` : null}
            ${skipped > 0 ? html`<div style="width:${skipped}%;height:100%;background:var(--color-skipped)"></div>` : null}
        </div>
    `;
}

function nodeMetrics(node) {
    const total = Object.values(node.outcomes).reduce((a, b) => a + b, 0);
    const executed = total - (node.outcomes.skipped || 0) - (node.outcomes.pending || 0);
    const passRate = executed > 0 ? Math.round((node.outcomes.passed / executed) * 100) : 0;
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
    const completeness = fileCount > 0 ? Math.round((coveredCount / fileCount) * 100) : 0;
    return { total, executed, passRate, fileCount, coveredCount, completeness };
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

function nodeHasGap(node) {
    if (node.type === 'file') {
        const total = Object.values(node.outcomes).reduce((a, b) => a + b, 0);
        return total === 0 || (node.outcomes.pending || 0) + (node.outcomes.skipped || 0) > 0;
    }
    if (node.children) return node.children.some(nodeHasGap);
    return false;
}

function nodeIsIncomplete(node) {
    if (node.type === 'file') {
        const total = Object.values(node.outcomes).reduce((a, b) => a + b, 0);
        const passed = node.outcomes.passed || 0;
        return total === 0 || passed < total;
    }
    if (node.children) return node.children.some(nodeIsIncomplete);
    return false;
}

function TreeNode({ node, onSelect, selectedPath, depth, path, searchTerm, isRoot, nodeFilter }) {
    const isDirectory = node.type === 'directory' && node.children && node.children.length > 0;
    const segmentPath = isRoot ? '' : (path ? path + '/' + node.name : node.name);

    if (!isDirectory) return null;

    // Apply KPI filter — hide nodes that don't match
    if (!isRoot && nodeFilter && !nodeFilter(node)) return null;

    // Collapse single-child directory chains into one label (GitHub-style)
    let displayNode = node;
    let collapsedPath = segmentPath;
    let collapsedLabel = node.displayName || node.name;
    if (!isRoot) {
        while (displayNode.children) {
            const directoryChildren = displayNode.children.filter(c => c.type === 'directory' && c.children && c.children.length > 0);
            const fileChildren = displayNode.children.filter(c => c.type === 'file');
            if (directoryChildren.length === 1 && fileChildren.length === 0) {
                const only = directoryChildren[0];
                collapsedPath = collapsedPath ? collapsedPath + '/' + only.name : only.name;
                collapsedLabel += '/' + (only.displayName || only.name);
                displayNode = only;
            } else {
                break;
            }
        }
    }

    const isSelected = selectedPath === collapsedPath;

    const matchesSearch = !searchTerm || collapsedLabel.toLowerCase().includes(searchTerm.toLowerCase());
    const childrenMatch = displayNode.children ? displayNode.children.some(c => nodeMatches(c, searchTerm)) : false;
    if (searchTerm && !matchesSearch && !childrenMatch) return null;

    const { total, passRate } = nodeMetrics(displayNode);

    // Compute node confidence: completeness × 0.3 + passRate × 0.35 + stability × 0.35
    const pending = (displayNode.outcomes.pending || 0) + (displayNode.outcomes.skipped || 0);
    const nodeCompleteness = total > 0 ? Math.round(((total - pending) / total) * 100) : 0;
    const nodeConfidence = total > 0 ? Math.round(nodeCompleteness * 0.3 + passRate * 0.35 + 100 * 0.35) : 0;

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(collapsedPath, displayNode);
        }
    };

    return html`
        <div style="margin-left:${depth * 8}px">
            <div class="req-tree-node ${isSelected ? 'req-tree-node--active' : ''}"
                 tabindex="0" role="treeitem" aria-selected=${isSelected}
                 onClick=${() => onSelect(collapsedPath, displayNode)}
                 onKeyDown=${handleKeyDown}>
                <span class="req-tree-icon">${folderIcon}</span>
                <span class="req-tree-label">${isRoot ? (node.displayName || node.name) : collapsedLabel}</span>
                ${total > 0 ? html`
                    <span class="req-tree-bars">
                        <${SegmentedBar} outcomes=${displayNode.outcomes} tooltip="${passRate}% passing · ${nodeCompleteness}% complete · Confidence ${nodeConfidence}" />
                    </span>
                    <span class="req-tree-metric" style="color:${nodeCompleteness >= 90 ? 'var(--color-passed)' : nodeCompleteness < 50 ? 'var(--color-failed)' : nodeCompleteness < 70 ? 'var(--color-pending)' : 'var(--text-secondary)'}">${nodeCompleteness}%</span>
                    <span class="req-tree-score" style="color:${nodeConfidence >= 90 ? 'var(--color-passed)' : nodeConfidence < 50 ? 'var(--color-failed)' : nodeConfidence < 70 ? 'var(--color-pending)' : 'var(--text-secondary)'}">${nodeConfidence}%</span>
                ` : null}
            </div>
            ${displayNode.children.map(child => html`
                <${TreeNode} node=${child} onSelect=${onSelect}
                    selectedPath=${selectedPath} depth=${depth + 1}
                    path=${collapsedPath} searchTerm=${searchTerm} nodeFilter=${nodeFilter} />
            `)}
        </div>
    `;
}

function DetailPanel({ node, segmentPath, requirements, onNavigate, onSelect }) {
    if (!node) {
        const total = Object.values(requirements.outcomes).reduce((a, b) => a + b, 0);
        const executed = total - (requirements.outcomes.skipped || 0) - (requirements.outcomes.pending || 0);
        const passRate = executed > 0 ? Math.round((requirements.outcomes.passed / executed) * 100) : 0;
        const pending = (requirements.outcomes.pending || 0) + (requirements.outcomes.skipped || 0);
        const overallCompleteness = total > 0 ? Math.round(((total - pending) / total) * 100) : 0;
        const overallConfidence = total > 0 ? Math.round(overallCompleteness * 0.3 + passRate * 0.35 + 100 * 0.35) : 0;
        return html`
            <div class="req-detail-panel">
                <h3 class="req-detail-title">Overall</h3>
                <div class="req-detail-stats-grid">
                    <div class="kpi-card" tabindex="0"><span class="kpi-label">Confidence</span><span class="kpi-value" style=${overallConfidence >= 90 ? 'color:var(--color-passed)' : overallConfidence < 50 ? 'color:var(--color-failed)' : overallConfidence < 70 ? 'color:var(--color-pending)' : ''}>${overallConfidence}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled)">%</span></span><span class="kpi-subtitle">${total} scenarios</span></div>
                    <div class="kpi-card" tabindex="0"><span class="kpi-label">Pass Rate</span><span class="kpi-value" style=${passRate >= 90 ? 'color:var(--color-passed)' : passRate < 50 ? 'color:var(--color-failed)' : passRate < 70 ? 'color:var(--color-pending)' : ''}>${passRate}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled)">%</span></span><span class="kpi-subtitle">${requirements.outcomes.passed} of ${executed} passing</span></div>
                    <div class="kpi-card" tabindex="0"><span class="kpi-label">Completeness</span><span class="kpi-value" style=${overallCompleteness >= 90 ? 'color:var(--color-passed)' : overallCompleteness < 50 ? 'color:var(--color-failed)' : overallCompleteness < 70 ? 'color:var(--color-pending)' : ''}>${overallCompleteness}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled)">%</span></span><span class="kpi-subtitle">${total - pending} of ${total} implemented</span></div>
                    <div class="kpi-card" tabindex="0"><span class="kpi-label">Stability</span><span class="kpi-value" style="color:var(--color-passed)">100<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled)">%</span></span><span class="kpi-subtitle">All tests consistent</span></div>
                </div>
                ${requirements.readme ? html`<div class="req-detail-readme readme-content"><${RawHtml} content=${requirements.readme} /></div>` : null}
            </div>
        `;
    }

    const { total, executed, passRate } = nodeMetrics(node);
    const pending = (node.outcomes.pending || 0) + (node.outcomes.skipped || 0);
    const detailCompleteness = total > 0 ? Math.round(((total - pending) / total) * 100) : 0;
    const detailConfidence = total > 0 ? Math.round(detailCompleteness * 0.3 + passRate * 0.35 + 100 * 0.35) : 0;

    const directories = node.children ? node.children.filter(c => c.type === 'directory') : [];
    const files = node.children ? node.children.filter(c => c.type === 'file') : [];

    return html`
        <div class="req-detail-panel">
            <h3 class="req-detail-title">${node.displayName || node.name}</h3>

            ${node.readme ? html`<div class="req-detail-readme readme-content"><${RawHtml} content=${node.readme} /></div>` : null}

            <div class="req-detail-stats-grid">
                <div class="kpi-card" tabindex="0" aria-label="Confidence: ${detailConfidence} percent">
                    <span class="kpi-label">Confidence</span>
                    <span class="kpi-value" style=${detailConfidence >= 90 ? 'color:var(--color-passed)' : detailConfidence < 50 ? 'color:var(--color-failed)' : detailConfidence < 70 ? 'color:var(--color-pending)' : ''}>${detailConfidence}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled)">%</span></span>
                    <span class="kpi-subtitle">${total} scenarios</span>
                </div>
                <div class="kpi-card" tabindex="0" aria-label="Pass Rate: ${passRate} percent">
                    <span class="kpi-label">Pass Rate</span>
                    <span class="kpi-value" style=${passRate >= 90 ? 'color:var(--color-passed)' : passRate < 50 ? 'color:var(--color-failed)' : passRate < 70 ? 'color:var(--color-pending)' : ''}>${passRate}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled)">%</span></span>
                    <span class="kpi-subtitle">${node.outcomes.passed} of ${executed} passing</span>
                </div>
                <div class="kpi-card" tabindex="0" aria-label="Completeness: ${detailCompleteness} percent">
                    <span class="kpi-label">Completeness</span>
                    <span class="kpi-value" style=${detailCompleteness >= 90 ? 'color:var(--color-passed)' : detailCompleteness < 50 ? 'color:var(--color-failed)' : detailCompleteness < 70 ? 'color:var(--color-pending)' : ''}>${detailCompleteness}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled)">%</span></span>
                    <span class="kpi-subtitle">${total - pending} of ${total} implemented</span>
                </div>
                <div class="kpi-card" tabindex="0" aria-label="Stability: 100 percent">
                    <span class="kpi-label">Stability</span>
                    <span class="kpi-value" style="color:var(--color-passed)">100<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled)">%</span></span>
                    <span class="kpi-subtitle">All tests consistent</span>
                </div>
            </div>

            ${directories.length > 0 ? html`
                <div style="margin-top:var(--space-lg)">
                    <h4 class="req-detail-section-title">Subdirectories</h4>
                    ${directories.map(child => {
                        const m = nodeMetrics(child);
                        const childPath = segmentPath ? segmentPath + '/' + child.name : child.name;
                        return html`
                            <div class="req-detail-child req-detail-child--link clickable" title="${m.completeness}% Completeness, ${m.passRate}% Pass Rate" onClick=${() => onSelect(childPath, child)}>
                                <span class="req-detail-child-icon">${folderIcon}</span>
                                <span class="req-detail-child-name">${child.displayName || child.name}</span>
                                <span class="req-detail-child-rate" style="color:${m.total > 0 ? passRateColor(m.passRate) : 'var(--text-disabled)'}">${m.total > 0 ? m.passRate + '% (' + m.executed + '/' + m.total + ')' : '—'}</span>
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
                <div class="empty-state-icon">${icons.completeness}</div>
                <div class="empty-state-title">Requirements</div>
                <div class="empty-state-description">Configure a <code>specDirectory</code> to derive the requirements hierarchy.</div>
            </div>
        `;
    }

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPath, setSelectedPath] = useState('');
    const [selectedNode, setSelectedNode] = useState(requirements);
    const [kpiFilter, setKpiFilter] = useState('all');

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

    const completeFiles = totalFiles - gapCount;
    const completenessPercent = totalFiles > 0 ? Math.round((completeFiles / totalFiles) * 100) : 100;
    const totalScenarios = Object.values(requirements.outcomes).reduce((a, b) => a + b, 0);
    const executedScenarios = totalScenarios - (requirements.outcomes.skipped || 0) - (requirements.outcomes.pending || 0);
    const passRate = executedScenarios > 0 ? Math.round((requirements.outcomes.passed / executedScenarios) * 100) : 0;

    // Sparkline trends from history scores
    const scoreHistory = (DATA.history || []).filter(h => h.score);
    const completenessTrend = scoreHistory.map(h => h.score.completeness);
    const passRateTrend = scoreHistory.map(h => h.score.passRate);

    const nodeFilter = useMemo(() => {
        if (kpiFilter === 'completeness') return nodeIsIncomplete;
        if (kpiFilter === 'gaps') return nodeHasGap;
        return null;
    }, [kpiFilter]);

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
            <div class="kpi-row" style="margin-bottom:var(--space-lg);grid-template-columns:repeat(4, 1fr);grid-template-rows:auto">
                <div class="kpi-card ${kpiFilter === 'all' ? 'kpi-card--active' : ''}" onClick=${() => setKpiFilter('all')} tabindex="0" role="button" aria-pressed=${kpiFilter === 'all'} aria-label="Total Requirements: ${totalFiles}. Show all.">
                    <span class="kpi-label">Total Requirements</span>
                    <span class="kpi-value">${totalFiles}</span>
                    <span class="kpi-subtitle">${totalScenarios} scenarios</span>
                </div>
                <div class="kpi-card ${kpiFilter === 'completeness' ? 'kpi-card--active' : ''}" onClick=${() => setKpiFilter('completeness')} tabindex="0" role="button" aria-pressed=${kpiFilter === 'completeness'} aria-label="Completeness: ${completenessPercent} percent. Filter to incomplete.">
                    <span class="kpi-label">Completeness</span>
                    <div style="display:flex;align-items:center;justify-content:space-between">
                        <span class="kpi-value" style=${completenessPercent >= 90 ? 'color:var(--color-passed)' : completenessPercent < 50 ? 'color:var(--color-failed)' : completenessPercent < 70 ? 'color:var(--color-pending)' : ''}>${completenessPercent}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled);margin-left:1px">%</span></span>
                        <${MiniSparkline} values=${completenessTrend} color=${completenessPercent >= 90 ? 'var(--color-passed)' : completenessPercent < 70 ? 'var(--color-pending)' : 'var(--accent)'} />
                    </div>
                    <span class="kpi-subtitle">${completeFiles} of ${totalFiles} implemented</span>
                </div>
                <div class="kpi-card ${kpiFilter === 'gaps' ? 'kpi-card--active' : ''}" onClick=${() => setKpiFilter('gaps')} tabindex="0" role="button" aria-pressed=${kpiFilter === 'gaps'} aria-label="Requirement Gaps: ${gapCount}. Filter to gaps.">
                    <span class="kpi-label">Gaps</span>
                    <span class="kpi-value" style="color:${gapCount === 0 ? 'var(--color-passed)' : gapCount > 3 ? 'var(--color-failed)' : 'var(--color-pending)'}">${gapCount}</span>
                    <span class="kpi-subtitle">${gapCount === 0 ? 'All requirements covered' : gapCount === 1 ? '1 requirement missing tests' : gapCount + ' requirements missing tests'}</span>
                </div>
                <div class="kpi-card" onClick=${() => onNavigate('/tests?filter=failed,skipped')} tabindex="0" role="button" aria-label="Pass Rate: ${passRate} percent">
                    <span class="kpi-label">Pass Rate</span>
                    <div style="display:flex;align-items:center;justify-content:space-between">
                        <span class="kpi-value" style=${passRate >= 90 ? 'color:var(--color-passed)' : passRate < 50 ? 'color:var(--color-failed)' : passRate < 70 ? 'color:var(--color-pending)' : ''}>${passRate}<span style="font-size:var(--font-sm);font-weight:400;color:var(--text-disabled);margin-left:1px">%</span></span>
                        <${MiniSparkline} values=${passRateTrend} color=${passRate >= 90 ? 'var(--color-passed)' : passRate < 70 ? 'var(--color-pending)' : 'var(--accent)'} />
                    </div>
                    <span class="kpi-subtitle">${requirements.outcomes.passed} of ${executedScenarios} passing</span>
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
                            path=${''} searchTerm=${searchTerm} isRoot=${true} nodeFilter=${nodeFilter} />
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
