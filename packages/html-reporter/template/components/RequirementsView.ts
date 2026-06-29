/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import htm from 'htm';
import { h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import { DATA, RawHtml } from '../utils';
import { icons } from './icons';

const html = htm.bind(h);

const folderIcon = html`<svg class="req-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
const fileIcon = html`<svg class="req-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;

function confidenceColor(score) {
    if (score >= 90) return 'var(--color-passed)';
    if (score < 50) return 'var(--color-failed)';
    if (score < 70) return 'var(--color-pending)';
    return 'inherit';
}

function computeNodeScore(node) {
    if (node.score) return node.score;
    const total = Object.values(node.outcomes).reduce((a: number, b: number) => a + b, 0);
    if (total === 0) return { confidence: 0, passRate: 0, completeness: 0, consistency: 100 };
    const pending = (node.outcomes.pending || 0) + (node.outcomes.skipped || 0);
    if (pending === total) return { confidence: 0, passRate: 0, completeness: 0, consistency: 100 };
    const executed = total - pending;
    const passRate = executed > 0 ? Math.round((node.outcomes.passed / executed) * 100) : 0;
    const completeness = Math.round(((total - pending) / total) * 100);
    const consistency = 100;
    const confidence = Math.round(passRate * 0.40 + completeness * 0.25 + consistency * 0.35);
    return { confidence, passRate, completeness, consistency };
}

function SegmentedBar({ outcomes, className }) {
    const total = Object.values(outcomes).reduce((a: number, b: number) => a + b, 0);
    if (total === 0) return null;
    const passedCount = outcomes.passed || 0;
    const failedCount = (outcomes.failed || 0) + (outcomes.error || 0) + (outcomes.compromised || 0);
    const skippedCount = (outcomes.pending || 0) + (outcomes.skipped || 0);
    const passed = passedCount / total * 100;
    const failed = failedCount / total * 100;
    const skipped = skippedCount / total * 100;
    const height = className === 'req-detail-outcome-bar' ? '10px' : '6px';
    const tooltip = `${passedCount} passed, ${failedCount} failed, ${skippedCount} skipped`;
    return html`
        <div class=${className || 'req-tree-bars'} style="display:flex;overflow:hidden;border-radius:3px;background:var(--divider);height:${height};min-height:${height}" title=${tooltip}>
            ${passed > 0 ? html`<div style="width:${passed}%;height:100%;background:var(--color-passed)" title="${passedCount} passed"></div>` : null}
            ${failed > 0 ? html`<div style="width:${failed}%;height:100%;background:var(--color-failed)" title="${failedCount} failed"></div>` : null}
            ${skipped > 0 ? html`<div style="width:${skipped}%;height:100%;background:var(--color-skipped)" title="${skippedCount} skipped"></div>` : null}
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

function nodeConfidence(node) {
    return computeNodeScore(node).confidence;
}

function nodeHasGap(node) {
    if (node.type === 'file') {
        const total = Object.values(node.outcomes).reduce((a, b) => a + b, 0);
        return total === 0 || (node.outcomes.pending || 0) + (node.outcomes.skipped || 0) > 0;
    }
    if (node.children) return node.children.some(nodeHasGap);
    return false;
}

function RequirementsFilterBar({ activeFilter, onFilter, requirements }) {
    let healthy = 0, atRisk = 0, critical = 0, gaps = 0;
    function walk(n) {
        if (n.type === 'directory' && n.children) {
            const score = nodeConfidence(n);
            if (score < 50) critical++;
            else if (score < 90) atRisk++;
            else healthy++;
            if (nodeHasGap(n)) gaps++;
            n.children.forEach(walk);
        }
    }
    if (requirements.children) requirements.children.forEach(walk);
    const total = healthy + atRisk + critical;

    const filters = [
        { key: 'all', label: 'All', count: total },
        { key: 'healthy', label: 'Healthy', count: healthy },
        { key: 'at-risk', label: 'At Risk', count: atRisk },
        { key: 'critical', label: 'Critical', count: critical },
        { key: 'gaps', label: 'Gaps', count: gaps },
    ];

    return html`
        <div class="filter-bar" role="group" aria-label="Filter requirements by health">
            ${filters.map(f => html`
                <button class="filter-chip ${activeFilter === f.key ? 'active' : ''}"
                    onClick=${() => onFilter(f.key)} aria-pressed=${activeFilter === f.key}>
                    <span>${f.label}</span>
                    <span class="count">${f.count}</span>
                </button>
            `)}
        </div>
    `;
}

function TreeNode({ node, onSelect, selectedPath, depth, path, searchTerm, isRoot, nodeFilter }) {
    const isDirectory = node.type === 'directory' && node.children && node.children.length > 0;
    const segmentPath = isRoot ? '' : (path ? path + '/' + node.name : node.name);

    if (!isDirectory) return null;
    if (!isRoot && nodeFilter && !nodeFilter(node)) return null;

    // GitHub-style single-child collapse
    let displayNode = node;
    let collapsedPath = segmentPath;
    let collapsedLabel = node.displayName || node.name;
    if (!isRoot) {
        while (displayNode.children) {
            const directories = displayNode.children.filter(c => c.type === 'directory' && c.children && c.children.length > 0);
            const files = displayNode.children.filter(c => c.type === 'file');
            if (directories.length === 1 && files.length === 0) {
                const only = directories[0];
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

    const score = computeNodeScore(displayNode);

    return html`
        <div style="margin-left:${depth * 8}px">
            <div class="req-tree-node ${isSelected ? 'req-tree-node--active' : ''}"
                 tabindex="0" role="treeitem" aria-selected=${isSelected}
                 onClick=${() => onSelect(collapsedPath, displayNode)}>
                <span class="req-tree-icon">${folderIcon}</span>
                <span class="req-tree-label">${isRoot ? (node.displayName || node.name) : collapsedLabel}</span>
                <span class="req-tree-metrics">
                    <span class="req-tree-confidence" style="color:${confidenceColor(score.confidence)}" title="Confidence: ${score.confidence}%"><span class="req-tree-confidence-icon">◐</span>${score.confidence}%</span>
                    <${SegmentedBar} outcomes=${displayNode.outcomes} />
                </span>
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
    const displayNode = node || requirements;
    const score = computeNodeScore(displayNode);
    const total = Object.values(displayNode.outcomes).reduce((a: number, b: number) => a + b, 0);
    const failedCount = (displayNode.outcomes.failed || 0) + (displayNode.outcomes.error || 0) + (displayNode.outcomes.compromised || 0);

    const directories = displayNode.children ? displayNode.children.filter(c => c.type === 'directory') : [];
    const files = displayNode.children ? displayNode.children.filter(c => c.type === 'file') : [];

    const rootName = requirements.name || 'features';
    const fullPath = segmentPath ? rootName + '/' + segmentPath : rootName;

    const copyPath = () => {
        navigator.clipboard.writeText(fullPath).then(() => {
            const el = document.getElementById('req-path-copied');
            if (el) { el.style.opacity = '1'; setTimeout(() => { el.style.opacity = '0'; }, 1500); }
        });
    };

    return html`
        <div class="req-detail-panel">
            <!-- Requirement header: single source of truth -->
            <div class="req-detail-header">
                <h2 class="req-detail-title">${displayNode.displayName || displayNode.name}</h2>
                <div class="req-detail-path-bar">
                    <span class="req-detail-path">${fullPath}</span>
                    <button class="req-detail-path-copy" onClick=${copyPath} title="Copy path" aria-label="Copy path to clipboard">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    </button>
                    <span id="req-path-copied" class="req-detail-path-toast">Copied!</span>
                </div>
                <div class="req-detail-summary">
                    <span class="req-detail-confidence" style="color:${confidenceColor(score.confidence)}">${score.confidence}%</span>
                    <span class="req-detail-confidence-label">confidence</span>
                    <span class="req-detail-scenario-count">${total} scenario${total !== 1 ? 's' : ''}</span>
                </div>
                ${total > 0 ? html`
                    <${SegmentedBar} outcomes=${displayNode.outcomes} className="req-detail-outcome-bar" />
                    <div class="req-detail-metrics">
                        <span class="req-detail-metric">${score.passRate}% passing</span>
                        <span class="req-detail-metric-sep">·</span>
                        <span class="req-detail-metric">${score.completeness}% complete</span>
                        <span class="req-detail-metric-sep">·</span>
                        <span class="req-detail-metric">${score.consistency}% consistent</span>
                        ${failedCount > 0 ? html`
                            <span class="req-detail-metric-sep">·</span>
                            <span class="req-detail-metric" style="color:var(--color-failed)">${failedCount} failed</span>
                        ` : null}
                    </div>
                ` : html`
                    <div class="req-detail-metrics">
                        <span class="req-detail-metric" style="color:var(--text-disabled)">No scenarios yet</span>
                    </div>
                `}
            </div>

            ${displayNode.readme ? html`<div class="readme-content"><${RawHtml} content=${displayNode.readme} /></div>` : null}

            ${files.length > 0 ? html`
                <div class="req-detail-files">
                    <h4 class="req-detail-section-title">Specs</h4>
                    ${files.map(child => {
                        const childScore = computeNodeScore(child);
                        const filePath = segmentPath + '/' + child.name;
                        return html`
                            <div class="req-detail-file-card clickable" onClick=${() => onNavigate('/tests?search=' + encodeURIComponent('"' + filePath + '"'))}>
                                <span class="req-detail-child-icon">${fileIcon}</span>
                                <span class="req-detail-child-name">${child.displayName || child.name}</span>
                                <span class="req-detail-child-health">
                                    <span class="req-detail-child-confidence" style="color:${confidenceColor(childScore.confidence)}" title="Confidence: ${childScore.confidence}%"><span class="req-tree-confidence-icon">◐</span>${childScore.confidence}%</span>
                                    <${SegmentedBar} outcomes=${child.outcomes} />
                                </span>
                            </div>
                        `;
                    })}
                </div>
            ` : null}

            ${directories.length > 0 ? html`
                <div class="req-detail-files">
                    <h4 class="req-detail-section-title">Capabilities</h4>
                    ${directories.map(child => {
                        const childScore = computeNodeScore(child);
                        const childPath = segmentPath ? segmentPath + '/' + child.name : child.name;
                        return html`
                            <div class="req-detail-file-card clickable" onClick=${() => onSelect(childPath, child)}>
                                <span class="req-detail-child-icon">${folderIcon}</span>
                                <span class="req-detail-child-name">${child.displayName || child.name}</span>
                                <span class="req-detail-child-health">
                                    <span class="req-detail-child-confidence" style="color:${confidenceColor(childScore.confidence)}" title="Confidence: ${childScore.confidence}%"><span class="req-tree-confidence-icon">◐</span>${childScore.confidence}%</span>
                                    <${SegmentedBar} outcomes=${child.outcomes} />
                                </span>
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
    const [selectedNode, setSelectedNode] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        const params = route && route.includes('?') ? new URLSearchParams(route.split('?')[1]) : null;
        const pathFromUrl = params?.get('path') ?? '';
        const node = findNodeByPath(requirements, pathFromUrl);
        if (node) {
            setSelectedPath(pathFromUrl);
            setSelectedNode(node);
        }
    }, [route]);

    const nodeFilter = useMemo(() => {
        if (activeFilter === 'critical') return (n) => nodeConfidence(n) < 50;
        if (activeFilter === 'at-risk') return (n) => { const s = nodeConfidence(n); return s >= 50 && s < 90; };
        if (activeFilter === 'healthy') return (n) => nodeConfidence(n) >= 90;
        if (activeFilter === 'gaps') return nodeHasGap;
        return null;
    }, [activeFilter]);

    const handleSelect = (path, node) => {
        setSelectedPath(path);
        setSelectedNode(node);
        const newHash = path ? '#/requirements?path=' + encodeURIComponent(path) : '#/requirements';
        if (window.location.hash !== newHash) {
            window.history.pushState(null, '', newHash);
        }
    };

    return html`
        <div class="requirements-split">
            <div class="card req-tree-panel">
                <input type="text" class="search-input" placeholder="Search requirements..."
                    style="margin-bottom:var(--space-sm)"
                    value=${searchTerm} onInput=${(e) => setSearchTerm(e.target.value)} />
                <${RequirementsFilterBar} activeFilter=${activeFilter} onFilter=${setActiveFilter}
                    requirements=${requirements} />
                <div class="req-tree-list" role="tree" style="margin-top:var(--space-sm)">
                    <${TreeNode} node=${requirements} onSelect=${handleSelect}
                        selectedPath=${selectedPath} depth=${0}
                        path=${''} searchTerm=${searchTerm} isRoot=${true} nodeFilter=${nodeFilter} />
                </div>
            </div>
            <div class="req-detail-wrap">
                <${DetailPanel} node=${selectedNode} segmentPath=${selectedPath}
                    requirements=${requirements} onNavigate=${onNavigate} onSelect=${handleSelect} />
            </div>
        </div>
    `;
}
