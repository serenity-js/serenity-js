import htm from 'htm';
import { h } from 'preact';
import { useMemo } from 'preact/hooks';

import type { ReportCapabilityNode } from '../../../src/cli/ReportData.js';
import { FilterBar } from '../common/FilterBar.js';
import { ResultCount } from '../common/ResultCount.js';
import { SearchInput } from '../common/SearchInput.js';
import {
    countTopLevelCapabilities,
    countVisibleNodes,
    findNodeByPath,
    getVisiblePaths,
    resolveTreeKeyNavigation,
    TreeNode,
} from './CapabilityTree.js';

const html = htm.bind(h);

interface CapabilityTreePanelProps {
    capabilities: ReportCapabilityNode;
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    activeFilter: string;
    setActiveFilter: (v: string) => void;
    activeSort: string;
    setActiveSort: (v: string) => void;
    selectedPath: string;
    focusedPath: string;
    setFocusedPath: (v: string) => void;
    nodeFilter: ((node: ReportCapabilityNode) => boolean) | null;
    healthCounts: { healthy: number; atRisk: number; critical: number; gaps: number; total: number };
    onSelect: (path: string, node: ReportCapabilityNode) => void;
}

interface TreeKeyDownOptions {
    capabilities: ReportCapabilityNode;
    searchTerm: string;
    nodeFilter: ((node: ReportCapabilityNode) => boolean) | null;
    focusedPath: string;
    setFocusedPath: (v: string) => void;
    onSelect: (path: string, node: ReportCapabilityNode) => void;
}

function handleTreeKeyDown(e: KeyboardEvent, options: TreeKeyDownOptions): void {
    const { capabilities, searchTerm, nodeFilter, focusedPath, setFocusedPath, onSelect } = options;
    const visiblePaths = getVisiblePaths(capabilities, searchTerm, nodeFilter);
    const currentIndex = visiblePaths.indexOf(focusedPath);

    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (visiblePaths[currentIndex] !== undefined) {
            const node = findNodeByPath(capabilities, visiblePaths[currentIndex]);
            if (node) onSelect(visiblePaths[currentIndex], node);
        }
        return;
    }

    const nextIndex = resolveTreeKeyNavigation(e.key, currentIndex, visiblePaths);
    if (nextIndex === currentIndex || nextIndex === -1) return;

    e.preventDefault();
    setFocusedPath(visiblePaths[nextIndex]);
    const element = document.querySelector(`[data-tree-path="${CSS.escape(visiblePaths[nextIndex])}"]`) as HTMLElement;
    if (element) element.focus();
}

interface TreePanelControlsProps {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    activeFilter: string;
    setActiveFilter: (v: string) => void;
    activeSort: string;
    setActiveSort: (v: string) => void;
    healthCounts: { healthy: number; atRisk: number; critical: number; gaps: number; total: number };
}

function TreePanelControls({ searchTerm, setSearchTerm, activeFilter, setActiveFilter, activeSort, setActiveSort, healthCounts }: TreePanelControlsProps): ReturnType<typeof html> {
    return html`
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
    `;
}

export function CapabilityTreePanel({
    capabilities, searchTerm, setSearchTerm, activeFilter, setActiveFilter,
    activeSort, setActiveSort, selectedPath, focusedPath, setFocusedPath,
    nodeFilter, healthCounts, onSelect,
}: CapabilityTreePanelProps): ReturnType<typeof html> {

    const totalCapabilities = countTopLevelCapabilities(capabilities);
    const visibleCount = useMemo(() => countVisibleNodes(capabilities, searchTerm, nodeFilter), [capabilities, searchTerm, nodeFilter]);
    const showFilterBar = totalCapabilities > 1;

    const onTreeKeyDown = (e: KeyboardEvent) => {
        handleTreeKeyDown(e, { capabilities, searchTerm, nodeFilter, focusedPath, setFocusedPath, onSelect });
    };

    return html`
        <div class="card req-tree-panel">
            ${showFilterBar ? html`
                <${TreePanelControls}
                    searchTerm=${searchTerm} setSearchTerm=${setSearchTerm}
                    activeFilter=${activeFilter} setActiveFilter=${setActiveFilter}
                    activeSort=${activeSort} setActiveSort=${setActiveSort}
                    healthCounts=${healthCounts} />
            ` : null}
            <div style="margin-top:var(--space-sm)">
                ${showFilterBar && (searchTerm || activeFilter !== 'all') && visibleCount < totalCapabilities ? html`<${ResultCount} showing=${visibleCount} total=${totalCapabilities} label=${totalCapabilities !== 1 ? 'capabilities' : 'capability'} />` : null}
            </div>
            <div class="req-tree-list" role="tree" onKeyDown=${onTreeKeyDown}>
                <${TreeNode} node=${capabilities} onSelect=${onSelect}
                    selectedPath=${selectedPath} focusedPath=${focusedPath} depth=${0}
                    path=${''} searchTerm=${searchTerm} isRoot=${true} nodeFilter=${nodeFilter}
                    sortMode=${activeSort} />
            </div>
        </div>
    `;
}
