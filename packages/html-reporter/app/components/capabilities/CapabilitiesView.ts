import htm from 'htm';
import { h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import type { ReportCapabilityNode } from '../../../src/cli/reporting/ReportData.js';
import { useMobileSheetState } from '../../hooks/useMobileSheetState.js';
import { useViewState } from '../../hooks/useViewState.js';
import { useHashHistory } from '../../utils/index.js';
import { BottomSheet } from '../common/BottomSheet.js';
import { icons } from '../common/icons.js';
import { ViewTopbar } from '../common/ViewTopbar.js';
import { DetailPanel } from './CapabilityDetail.js';
import {
    findNodeByPath,
    nodeConfidence,
    nodeHasGap,
} from './CapabilityTree.js';
import { CapabilityTreePanel } from './CapabilityTreePanel.js';

const html = htm.bind(h);

interface CapabilitiesViewProps {
    capabilities?: ReportCapabilityNode;
    onNavigate: (path: string) => void;
    route: string;
    onOpenSidebar?: () => void;
}

function buildNodeFilter(activeFilter: string): ((node: ReportCapabilityNode) => boolean) | null {
    if (activeFilter === 'critical') return (n: ReportCapabilityNode) => nodeConfidence(n) < 50;
    if (activeFilter === 'at-risk') return (n: ReportCapabilityNode) => { const s = nodeConfidence(n); return s >= 50 && s < 90; };
    if (activeFilter === 'healthy') return (n: ReportCapabilityNode) => nodeConfidence(n) >= 90;
    if (activeFilter === 'gaps') return nodeHasGap;
    return null;
}

function computeHealthCounts(capabilities: ReportCapabilityNode): { healthy: number; atRisk: number; critical: number; gaps: number; total: number } {
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
}

export function CapabilitiesView({ capabilities, onNavigate, route, onOpenSidebar }: CapabilitiesViewProps): ReturnType<typeof html> {
    const openSidebar = onOpenSidebar || (() => {});
    const sheets = useMobileSheetState();
    const [selectedPath, setSelectedPath] = useState('');
    const [selectedNode, setSelectedNode] = useState<ReportCapabilityNode | null>(null);
    const [focusedPath, setFocusedPath] = useState('');

    const { search: searchTerm, setSearch: setSearchTerm, filter: activeFilter, setFilter: setActiveFilter, sort: activeSort, setSort: setActiveSort } = useViewState({
        basePath: '/capabilities',
        route,
        defaults: { sort: 'name' },
    });

    const hashNav = useHashHistory();

    useEffect(() => {
        if (selectedPath) {
            hashNav.setParam('path', selectedPath);
        } else {
            hashNav.deleteParam('path');
        }
    }, [selectedPath]);

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
            <div>
                <${ViewTopbar} title="Capabilities" onOpenSidebar=${openSidebar} />
                <div class="empty-state">
                    <div class="empty-state-icon">${icons.completeness}</div>
                    <div class="empty-state-title">Capabilities</div>
                    <div class="empty-state-description">Configure a <code>specDirectory</code> to derive the capabilities hierarchy.</div>
                </div>
            </div>
        `;
    }

    const nodeFilter = useMemo(() => buildNodeFilter(activeFilter), [activeFilter]);
    const healthCounts = useMemo(() => computeHealthCounts(capabilities), [capabilities]);

    const handleSelect = (path: string, node: ReportCapabilityNode) => {
        setSelectedPath(path);
        setSelectedNode(node);
    };

    const handleMobileSelect = (path: string, node: ReportCapabilityNode) => {
        handleSelect(path, node);
        sheets.closeFilter();
    };

    const topbarActions = html`
        <button class="btn-icon" onClick=${sheets.openFilter} aria-label="Browse capabilities">
            ${icons.folder}
        </button>
    `;

    return html`
        <div>
            <${ViewTopbar} title="Capabilities" onOpenSidebar=${openSidebar} actions=${topbarActions} />
            <div class="capabilities-split">
                <div class="desktop-only">
                    <${CapabilityTreePanel}
                        capabilities=${capabilities}
                        searchTerm=${searchTerm} setSearchTerm=${setSearchTerm}
                        activeFilter=${activeFilter} setActiveFilter=${setActiveFilter}
                        activeSort=${activeSort} setActiveSort=${setActiveSort}
                        selectedPath=${selectedPath} focusedPath=${focusedPath}
                        setFocusedPath=${setFocusedPath}
                        nodeFilter=${nodeFilter} healthCounts=${healthCounts}
                        onSelect=${handleSelect} />
                </div>
                <div class="req-detail-wrap">
                    <${DetailPanel} node=${selectedNode} segmentPath=${selectedPath}
                        capabilities=${capabilities} onNavigate=${onNavigate} onSelect=${handleSelect} />
                </div>
            </div>

            ${sheets.filterSheetOpen ? html`<${BottomSheet} isOpen=${true} onClose=${sheets.closeFilter} title="Capabilities">
                <${CapabilityTreePanel}
                    capabilities=${capabilities}
                    searchTerm=${searchTerm} setSearchTerm=${setSearchTerm}
                    activeFilter=${activeFilter} setActiveFilter=${setActiveFilter}
                    activeSort=${activeSort} setActiveSort=${setActiveSort}
                    selectedPath=${selectedPath} focusedPath=${focusedPath}
                    setFocusedPath=${setFocusedPath}
                    nodeFilter=${nodeFilter} healthCounts=${healthCounts}
                    onSelect=${handleMobileSelect} />
            </${BottomSheet}>` : null}
        </div>
    `;
}
