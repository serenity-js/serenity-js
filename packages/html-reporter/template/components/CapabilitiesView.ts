import htm from 'htm';
import { h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import type { ReportCapabilityNode, ReportOutcomes } from '../../src/ReportData';
import { DATA, RawHtml } from '../utils';
import { icons } from './icons';

const html = htm.bind(h);

const folderIcon = html`<svg class="req-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
const fileIcon = html`<svg class="req-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;

function confidenceColor(score: number): string {
    if (score >= 90) return 'var(--color-passed)';
    if (score < 50) return 'var(--color-failed)';
    if (score < 70) return 'var(--color-pending)';
    return 'inherit';
}

function computeNodeScore(node: ReportCapabilityNode) {
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

interface SegmentedBarProps {
    outcomes: ReportOutcomes;
    className?: string;
}

function SegmentedBar({ outcomes, className }: SegmentedBarProps) {
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
        <div class=${className || 'req-tree-bars'} role="img" aria-label=${tooltip} style="display:flex;overflow:hidden;border-radius:3px;background:var(--divider);height:${height};min-height:${height}" title=${tooltip}>
            <span class="visually-hidden">${tooltip}</span>
            ${passed > 0 ? html`<div aria-hidden="true" style="width:${passed}%;height:100%;background:var(--color-passed)"></div>` : null}
            ${failed > 0 ? html`<div aria-hidden="true" style="width:${failed}%;height:100%;background:var(--color-failed)"></div>` : null}
            ${skipped > 0 ? html`<div aria-hidden="true" style="width:${skipped}%;height:100%;background:var(--color-skipped)"></div>` : null}
        </div>
    `;
}

function nodeMatches(node: ReportCapabilityNode, term: string): boolean {
    if (!term) return true;
    const name = (node.displayName || node.name).toLowerCase();
    if (name.includes(term.toLowerCase())) return true;
    if (node.children) return node.children.some(c => nodeMatches(c, term));
    return false;
}

function findNodeByPath(root: ReportCapabilityNode, targetPath: string): ReportCapabilityNode | null {
    if (!targetPath) return root;
    if (!root.children) return null;
    const parts = targetPath.split('/');
    let current: ReportCapabilityNode = root;
    for (const part of parts) {
        if (!current.children) return null;
        const found = current.children.find(c => c.name === part);
        if (!found) return null;
        current = found;
    }
    return current;
}

function nodeConfidence(node: ReportCapabilityNode): number {
    return computeNodeScore(node).confidence;
}

function nodeHasGap(node: ReportCapabilityNode): boolean {
    if (node.type === 'file') {
        const total = Object.values(node.outcomes).reduce((a: number, b: number) => a + b, 0);
        return total === 0 || (node.outcomes.pending || 0) + (node.outcomes.skipped || 0) > 0;
    }
    if (node.children) return node.children.some(nodeHasGap);
    return false;
}

function nodeHasFiles(node: ReportCapabilityNode): boolean {
    return !!(node.children && node.children.some(c => c.type === 'file'));
}

function countTopLevelCapabilities(capabilities: ReportCapabilityNode): number {
    if (!capabilities || !capabilities.children) return 0;
    return capabilities.children.filter(c => c.type === 'directory' && c.children && c.children.length > 0).length;
}

function countVisibleNodes(root: ReportCapabilityNode, searchTerm: string, nodeFilter: ((node: ReportCapabilityNode) => boolean) | null): number {
    let count = 0;
    function walk(node: ReportCapabilityNode) {
        if (!node.children) return;
        for (const child of node.children) {
            if (child.type !== 'directory' || !child.children || child.children.length === 0) continue;
            if (nodeFilter && !nodeFilter(child)) continue;
            if (searchTerm && !nodeMatches(child, searchTerm)) continue;
            count++;
            walk(child);
        }
    }
    walk(root);
    return count;
}

interface CapabilitiesFilterBarProps {
    activeFilter: string;
    onFilter: (filter: string) => void;
    capabilities: ReportCapabilityNode;
    searchTerm: string;
    onSearch: (term: string) => void;
    activeSort: string;
    onSort: (sort: string) => void;
}

function CapabilitiesFilterBar({ activeFilter, onFilter, capabilities, searchTerm, onSearch, activeSort, onSort }: CapabilitiesFilterBarProps) {
    let healthy = 0, atRisk = 0, critical = 0, gaps = 0;
    function walk(n: ReportCapabilityNode) {
        if (n.type === 'directory' && n.children) {
            const score = nodeConfidence(n);
            if (score < 50) critical++;
            else if (score < 90) atRisk++;
            else healthy++;
            if (nodeHasGap(n)) gaps++;
            n.children.forEach(walk);
        }
    }
    if (capabilities.children) capabilities.children.forEach(walk);
    const total = healthy + atRisk + critical;

    const filters = [
        { key: 'all', label: 'All', count: total },
        { key: 'healthy', label: 'Healthy', count: healthy },
        { key: 'at-risk', label: 'At Risk', count: atRisk },
        { key: 'critical', label: 'Critical', count: critical },
        { key: 'gaps', label: 'Gaps', count: gaps },
    ];

    const sortOptions = [
        { key: 'name', label: 'Name' },
        { key: 'confidence', label: 'Confidence' },
        { key: 'scenarios', label: 'Scenarios' },
    ];

    return html`
        <div class="filter-bar" role="group" aria-label="Filter capabilities by health" style="align-items:center">
            <span style="font-size:var(--font-xs);font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;align-self:center">Health:</span>
            ${filters.map(f => html`
                <button class="filter-chip ${f.key} ${activeFilter === f.key ? 'active' : ''}"
                    onClick=${() => onFilter(f.key)} aria-pressed=${activeFilter === f.key}>
                    <span>${f.label}</span>
                    <span class="count">${f.count}</span>
                </button>
            `)}
            <div class="sort-group">
                <label class="label-upper" for="cap-sort-select">Sort:</label>
                <select id="cap-sort-select" class="sort-select" value=${activeSort} onChange=${(e: Event) => onSort((e.target as HTMLSelectElement).value)} aria-label="Sort order">
                    ${sortOptions.map(s => html`<option value=${s.key} selected=${activeSort === s.key}>${s.label}</option>`)}
                </select>
            </div>
        </div>
    `;
}

function getVisiblePaths(root: ReportCapabilityNode, searchTerm: string, nodeFilter: ((node: ReportCapabilityNode) => boolean) | null): string[] {
    const paths: string[] = [];

    function walk(node: ReportCapabilityNode, parentPath: string, isRoot: boolean) {
        const isDirectory = node.type === 'directory' && node.children && node.children.length > 0;
        if (!isDirectory) return;

        const segmentPath = isRoot ? '' : (parentPath ? parentPath + '/' + node.name : node.name);

        if (!isRoot && nodeFilter && !nodeFilter(node)) return;

        // Apply single-child collapse logic
        let displayNode = node;
        let collapsedPath = segmentPath;
        let collapsedLabel = node.displayName || node.name;
        if (!isRoot && !node.readme && !nodeHasFiles(node)) {
            while (displayNode.children) {
                const directories = displayNode.children.filter(c => c.type === 'directory' && c.children && c.children.length > 0);
                const files = displayNode.children.filter(c => c.type === 'file');
                if (directories.length === 1 && files.length === 0) {
                    const only = directories[0];
                    if (only.readme) break;
                    collapsedPath = collapsedPath ? collapsedPath + '/' + only.name : only.name;
                    collapsedLabel += '/' + (only.displayName || only.name);
                    displayNode = only;
                } else {
                    break;
                }
            }
        }

        // Check search filtering
        const matchesSearch = !searchTerm || collapsedLabel.toLowerCase().includes(searchTerm.toLowerCase());
        const childrenMatch = displayNode.children ? displayNode.children.some(c => nodeMatches(c, searchTerm)) : false;
        if (searchTerm && !matchesSearch && !childrenMatch) return;

        paths.push(collapsedPath);

        if (displayNode.children) {
            for (const child of displayNode.children) {
                walk(child, collapsedPath, false);
            }
        }
    }

    walk(root, '', true);
    return paths;
}

function sortChildren(children: ReportCapabilityNode[] | undefined, sortMode: string): ReportCapabilityNode[] {
    if (!children) return [];
    const sorted = [...children];
    switch (sortMode) {
        case 'confidence':
            sorted.sort((a, b) => nodeConfidence(a) - nodeConfidence(b));
            break;
        case 'scenarios':
            sorted.sort((a, b) => {
                const totalB = Object.values(b.outcomes).reduce((s: number, v: number) => s + v, 0);
                const totalA = Object.values(a.outcomes).reduce((s: number, v: number) => s + v, 0);
                return totalB - totalA;
            });
            break;
        default: // 'name'
            sorted.sort((a, b) => (a.displayName || a.name).localeCompare(b.displayName || b.name));
            break;
    }
    return sorted;
}

interface TreeNodeProps {
    node: ReportCapabilityNode;
    onSelect: (path: string, node: ReportCapabilityNode) => void;
    selectedPath: string;
    focusedPath: string;
    depth: number;
    path: string;
    searchTerm: string;
    isRoot?: boolean;
    nodeFilter: ((node: ReportCapabilityNode) => boolean) | null;
    sortMode: string;
}

function TreeNode({ node, onSelect, selectedPath, focusedPath, depth, path, searchTerm, isRoot, nodeFilter, sortMode }: TreeNodeProps) {
    const isDirectory = node.type === 'directory' && node.children && node.children.length > 0;
    const segmentPath = isRoot ? '' : (path ? path + '/' + node.name : node.name);

    if (!isDirectory) return null;
    if (!isRoot && nodeFilter && !nodeFilter(node)) return null;

    // GitHub-style single-child collapse
    let displayNode = node;
    let collapsedPath = segmentPath;
    let collapsedLabel = node.displayName || node.name;
    if (!isRoot && !node.readme && !nodeHasFiles(node)) {
        while (displayNode.children) {
            const directories = displayNode.children.filter(c => c.type === 'directory' && c.children && c.children.length > 0);
            const files = displayNode.children.filter(c => c.type === 'file');
            if (directories.length === 1 && files.length === 0) {
                const only = directories[0];
                if (only.readme) break;  // Stop before a node that has documentation
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
                 tabindex=${collapsedPath === focusedPath ? '0' : '-1'}
                 role="treeitem" aria-selected=${isSelected}
                 data-tree-path=${collapsedPath}
                 onClick=${() => onSelect(collapsedPath, displayNode)}>
                <span class="req-tree-icon">${folderIcon}</span>
                <span class="req-tree-label">${isRoot ? (node.displayName || node.name) : collapsedLabel}</span>
                <span class="req-tree-metrics">
                    <span class="req-tree-confidence" style="color:${confidenceColor(score.confidence)}" title="Confidence: ${score.confidence}%"><span class="req-tree-confidence-icon">◐</span>${score.confidence}%</span>
                    <${SegmentedBar} outcomes=${displayNode.outcomes} />
                </span>
            </div>
            ${sortChildren(displayNode.children, sortMode).map(child => html`
                <${TreeNode} node=${child} onSelect=${onSelect}
                    selectedPath=${selectedPath} focusedPath=${focusedPath} depth=${depth + 1}
                    path=${collapsedPath} searchTerm=${searchTerm} nodeFilter=${nodeFilter}
                    sortMode=${sortMode} />
            `)}
        </div>
    `;
}

interface DetailPanelProps {
    node: ReportCapabilityNode | null;
    segmentPath: string;
    capabilities: ReportCapabilityNode;
    onNavigate: (path: string) => void;
    onSelect: (path: string, node: ReportCapabilityNode) => void;
}

function DetailPanel({ node, segmentPath, capabilities, onNavigate, onSelect }: DetailPanelProps) {
    const displayNode = node || capabilities;
    const score = computeNodeScore(displayNode);
    const total = Object.values(displayNode.outcomes).reduce((a: number, b: number) => a + b, 0);
    const failedCount = (displayNode.outcomes.failed || 0) + (displayNode.outcomes.error || 0) + (displayNode.outcomes.compromised || 0);

    const directories = displayNode.children ? displayNode.children.filter(c => c.type === 'directory') : [];
    const files = displayNode.children ? displayNode.children.filter(c => c.type === 'file') : [];

    const rootName = capabilities.name || 'features';
    const fullPath = segmentPath ? rootName + '/' + segmentPath : rootName;

    const copyPath = () => {
        navigator.clipboard.writeText(fullPath).then(() => {
            const element = document.getElementById('req-path-copied');
            if (element) { element.style.opacity = '1'; setTimeout(() => { element.style.opacity = '0'; }, 1500); }
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

interface CapabilitiesViewProps {
    onNavigate: (path: string) => void;
    route: string;
}

export function CapabilitiesView({ onNavigate, route }: CapabilitiesViewProps) {
    const capabilities = DATA.capabilities;

    if (!capabilities) {
        return html`
            <div class="empty-state">
                <div class="empty-state-icon">${icons.completeness}</div>
                <div class="empty-state-title">Capabilities</div>
                <div class="empty-state-description">Configure a <code>specDirectory</code> to derive the capabilities hierarchy.</div>
            </div>
        `;
    }

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPath, setSelectedPath] = useState('');
    const [selectedNode, setSelectedNode] = useState<ReportCapabilityNode | null>(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [activeSort, setActiveSort] = useState('name');
    const [focusedPath, setFocusedPath] = useState('');

    useEffect(() => {
        const params = route && route.includes('?') ? new URLSearchParams(route.split('?')[1]) : null;
        const pathFromUrl = params?.get('path') ?? '';
        const node = findNodeByPath(capabilities, pathFromUrl);
        if (node) {
            setSelectedPath(pathFromUrl);
            setSelectedNode(node);
        }
    }, [route]);

    const nodeFilter = useMemo((): ((node: ReportCapabilityNode) => boolean) | null => {
        if (activeFilter === 'critical') return (n: ReportCapabilityNode) => nodeConfidence(n) < 50;
        if (activeFilter === 'at-risk') return (n: ReportCapabilityNode) => { const s = nodeConfidence(n); return s >= 50 && s < 90; };
        if (activeFilter === 'healthy') return (n: ReportCapabilityNode) => nodeConfidence(n) >= 90;
        if (activeFilter === 'gaps') return nodeHasGap;
        return null;
    }, [activeFilter]);

    const handleSelect = (path: string, node: ReportCapabilityNode) => {
        setSelectedPath(path);
        setSelectedNode(node);
        const newHash = path ? '#/capabilities?path=' + encodeURIComponent(path) : '#/capabilities';
        if (window.location.hash !== newHash) {
            window.history.pushState(null, '', newHash);
        }
    };

    const onTreeKeyDown = (e: KeyboardEvent) => {
        const visiblePaths = getVisiblePaths(capabilities, searchTerm, nodeFilter);
        const currentIndex = visiblePaths.indexOf(focusedPath);
        let nextIndex = currentIndex;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                nextIndex = Math.min(currentIndex + 1, visiblePaths.length - 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                nextIndex = Math.max(currentIndex - 1, 0);
                break;
            case 'ArrowRight': {
                e.preventDefault();
                // If focused node has children, move to first child
                const childIndex = visiblePaths.findIndex(
                    (p, i) => i > currentIndex && p.startsWith(visiblePaths[currentIndex] ? visiblePaths[currentIndex] + '/' : '')
                );
                if (childIndex !== -1) {
                    nextIndex = childIndex;
                }
                break;
            }
            case 'ArrowLeft': {
                e.preventDefault();
                // Move to parent node
                const currentPath = visiblePaths[currentIndex] || '';
                const lastSlash = currentPath.lastIndexOf('/');
                if (lastSlash !== -1) {
                    const parentPath = currentPath.substring(0, lastSlash);
                    const parentIndex = visiblePaths.indexOf(parentPath);
                    if (parentIndex !== -1) {
                        nextIndex = parentIndex;
                    }
                } else if (currentPath !== '') {
                    // Move to root (empty path)
                    const rootIndex = visiblePaths.indexOf('');
                    if (rootIndex !== -1) {
                        nextIndex = rootIndex;
                    }
                }
                break;
            }
            case 'Home':
                e.preventDefault();
                nextIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                nextIndex = visiblePaths.length - 1;
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (visiblePaths[currentIndex] !== undefined) {
                    const node = findNodeByPath(capabilities, visiblePaths[currentIndex]);
                    if (node) handleSelect(visiblePaths[currentIndex], node);
                }
                return;
            default:
                return;
        }

        if (nextIndex !== currentIndex && visiblePaths[nextIndex] !== undefined) {
            setFocusedPath(visiblePaths[nextIndex]);
            const element = document.querySelector(`[data-tree-path="${CSS.escape(visiblePaths[nextIndex])}"]`) as HTMLElement;
            if (element) element.focus();
        }
    };

    const totalCapabilities = countTopLevelCapabilities(capabilities);
    const visibleCount = useMemo(() => countVisibleNodes(capabilities, searchTerm, nodeFilter), [capabilities, searchTerm, nodeFilter]);
    const showFilterBar = totalCapabilities > 1;

    return html`
        <div class="capabilities-split">
            <div class="card req-tree-panel">
                ${showFilterBar ? html`
                    <div style="position:relative;margin-bottom:var(--space-md)">
                        <input class="search-input" type="text" placeholder="Find capabilities..."
                            value=${searchTerm} onInput=${(e: Event) => setSearchTerm((e.target as HTMLInputElement).value)}
                            aria-label="Find capabilities" style="margin-bottom:0;padding-right:36px" />
                        ${searchTerm ? html`<button onClick=${() => setSearchTerm('')}
                            class="btn-clear"
                            aria-label="Clear search">✕</button>` : null}
                    </div>
                    <${CapabilitiesFilterBar} activeFilter=${activeFilter} onFilter=${setActiveFilter}
                        capabilities=${capabilities} searchTerm=${searchTerm} onSearch=${setSearchTerm}
                        activeSort=${activeSort} onSort=${setActiveSort} />
                ` : null}
                <div class="text-muted mb-md" style="margin-top:var(--space-sm)" aria-live="polite" aria-atomic="true">
                    ${showFilterBar && (searchTerm || activeFilter !== 'all')
                        ? `Showing ${visibleCount} of ${totalCapabilities} capabilities`
                        : `${totalCapabilities} ${totalCapabilities !== 1 ? 'capabilities' : 'capability'}`}
                </div>
                <div class="req-tree-list" role="tree" onKeyDown=${onTreeKeyDown}>
                    <${TreeNode} node=${capabilities} onSelect=${handleSelect}
                        selectedPath=${selectedPath} focusedPath=${focusedPath} depth=${0}
                        path=${''} searchTerm=${searchTerm} isRoot=${true} nodeFilter=${nodeFilter}
                        sortMode=${activeSort} />
                </div>
            </div>
            <div class="req-detail-wrap">
                <${DetailPanel} node=${selectedNode} segmentPath=${selectedPath}
                    capabilities=${capabilities} onNavigate=${onNavigate} onSelect=${handleSelect} />
            </div>
        </div>
    `;
}
