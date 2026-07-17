import htm from 'htm';
import { h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import type { ReportCapabilityNode } from '../../../src/cli/ReportData';
import { useHashHistory } from '../../utils';
import { FilterBar } from '../common/FilterBar';
import { icons } from '../common/icons';
import { ResultCount } from '../common/ResultCount';
import { SearchInput } from '../common/SearchInput';
import { DetailPanel } from './CapabilityDetail';
import { countTopLevelCapabilities, countVisibleNodes, findNodeByPath, getVisiblePaths, nodeConfidence, nodeHasGap, TreeNode } from './CapabilityTree';

const html = htm.bind(h);

interface CapabilitiesViewProps {
    capabilities?: ReportCapabilityNode;
    onNavigate: (path: string) => void;
    route: string;
}

export function CapabilitiesView({ capabilities, onNavigate, route }: CapabilitiesViewProps): ReturnType<typeof html> {
    const hashNav = useHashHistory();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPath, setSelectedPath] = useState('');
    const [selectedNode, setSelectedNode] = useState<ReportCapabilityNode | null>(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [activeSort, setActiveSort] = useState('name');
    const [focusedPath, setFocusedPath] = useState('');

    useEffect(() => {
        if (!capabilities) return;
        const params = route && route.includes('?') ? new URLSearchParams(route.split('?')[1]) : null;
        const pathFromUrl = params?.get('path') ?? '';
        const node = findNodeByPath(capabilities, pathFromUrl);
        if (node) {
            setSelectedPath(pathFromUrl);
            setSelectedNode(node);
        }
    }, [route, capabilities]);

    if (!capabilities) {
        return html`
            <div class="empty-state">
                <div class="empty-state-icon">${icons.completeness}</div>
                <div class="empty-state-title">Capabilities</div>
                <div class="empty-state-description">Configure a <code>specDirectory</code> to derive the capabilities hierarchy.</div>
            </div>
        `;
    }

    const nodeFilter = useMemo((): ((node: ReportCapabilityNode) => boolean) | null => {
        if (activeFilter === 'critical') return (n: ReportCapabilityNode) => nodeConfidence(n) < 50;
        if (activeFilter === 'at-risk') return (n: ReportCapabilityNode) => { const s = nodeConfidence(n); return s >= 50 && s < 90; };
        if (activeFilter === 'healthy') return (n: ReportCapabilityNode) => nodeConfidence(n) >= 90;
        if (activeFilter === 'gaps') return nodeHasGap;
        return null;
    }, [activeFilter]);

    const healthCounts = useMemo(() => {
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
        return { healthy, atRisk, critical, gaps, total: healthy + atRisk + critical };
    }, [capabilities]);

    const handleSelect = (path: string, node: ReportCapabilityNode) => {
        setSelectedPath(path);
        setSelectedNode(node);
        const newHash = path ? '/capabilities?path=' + encodeURIComponent(path) : '/capabilities';
        hashNav.push(newHash);
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
                    <div class="controls-row">
                        <div class="search-input-wrap">
                            <${SearchInput} value=${searchTerm} onInput=${setSearchTerm} placeholder="Find capabilities..." />
                        </div>
                        <${FilterBar} filters=${[
                            { key: 'all', label: 'All', count: healthCounts.total },
                            { key: 'healthy', label: 'Healthy', count: healthCounts.healthy },
                            { key: 'at-risk', label: 'At Risk', count: healthCounts.atRisk },
                            { key: 'critical', label: 'Critical', count: healthCounts.critical },
                            { key: 'gaps', label: 'Gaps', count: healthCounts.gaps },
                        ]}
                        activeFilter=${activeFilter} onFilter=${setActiveFilter}
                        ariaLabel="Filter capabilities by health" label="Health"
                        multiSelect=${false}
                        sortOptions=${[
                            { key: 'name', label: 'Name' },
                            { key: 'confidence', label: 'Confidence' },
                            { key: 'scenarios', label: 'Scenarios' },
                        ]}
                        activeSort=${activeSort} onSort=${setActiveSort}
                        sortId="cap-sort-select" />
                    </div>
                ` : null}
                <div style="margin-top:var(--space-sm)">
                    <${ResultCount} showing=${showFilterBar && (searchTerm || activeFilter !== 'all') ? visibleCount : totalCapabilities} total=${totalCapabilities} label=${totalCapabilities !== 1 ? 'capabilities' : 'capability'} />
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
