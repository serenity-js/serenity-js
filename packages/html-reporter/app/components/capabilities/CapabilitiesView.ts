import htm from 'htm';
import { h } from 'preact';
import { useMemo } from 'preact/hooks';

import type { ReportCapabilityNode } from '../../../src/cli/reporting/ReportData.js';
import { useCapabilityNavigation } from '../../hooks/useCapabilityNavigation.js';
import { useMobileSheetState } from '../../hooks/useMobileSheetState.js';
import { useViewState } from '../../hooks/useViewState.js';
import { buildNodeFilter, computeHealthCounts } from '../../utils/capabilityFiltering.js';
import { BottomSheet } from '../common/BottomSheet.js';
import { icons } from '../common/icons.js';
import { ViewTopbar } from '../common/ViewTopbar.js';
import { DetailPanel } from './CapabilityDetail.js';
import { CapabilityTreePanel } from './CapabilityTreePanel.js';

const html = htm.bind(h);

interface CapabilitiesViewProps {
    capabilities?: ReportCapabilityNode;
    onNavigate?: (path: string) => void;
    route?: string;
    onOpenSidebar?: () => void;
}

export function CapabilitiesView({ capabilities, onNavigate = () => {}, route = '', onOpenSidebar }: CapabilitiesViewProps): ReturnType<typeof html> {
    const openSidebar = onOpenSidebar || (() => {});
    const sheets = useMobileSheetState();

    const { search: searchTerm, setSearch: setSearchTerm, filter: activeFilter, setFilter: setActiveFilter, sort: activeSort, setSort: setActiveSort } = useViewState({
        basePath: '/capabilities',
        route,
        defaults: { sort: 'name' },
    });

    const { selectedPath, selectedNode, focusedPath, setFocusedPath, handleSelect } =
        useCapabilityNavigation({ capabilities, route, searchTerm, activeFilter, activeSort });

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
