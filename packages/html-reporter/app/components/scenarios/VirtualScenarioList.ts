import htm from 'htm';
import { h } from 'preact';
import { useCallback } from 'preact/hooks';

import type { ReportHistoryEntry, ReportScenario } from '../../../src/cli/reporting/ReportData.js';
import { ROW_HEIGHTS } from '../../config/layout.js';
import { CategoryBreadcrumb } from '../common/CategoryBreadcrumb.js';
import { GroupedVirtualList } from '../common/layout/GroupedVirtualList.js';
import { ScenarioRow } from './ScenarioRow.js';

const html = htm.bind(h);

export interface VirtualScenarioListProps {
    filtered: ReportScenario[];
    grouped: Record<string, ReportScenario[]>;
    sort: string;
    onNavigate: (path: string) => void;
    runIndex: number | null;
    setSearch: (search: string) => void;
    search: string;
    specDirectory?: string;
    history?: ReportHistoryEntry[];
}

export function VirtualScenarioList({ filtered, grouped, sort, onNavigate, runIndex, setSearch, search, specDirectory, history }: VirtualScenarioListProps): ReturnType<typeof html> {
    const items = sort === 'category'
        ? Object.entries(grouped).flatMap(([, scenarios]) => scenarios)
        : filtered;

    const groupByFunction = sort === 'category' ? (s: ReportScenario) => s.category : undefined;

    const renderItem = useCallback((scenario: ReportScenario) => {
        return html`<${ScenarioRow} scenario=${scenario} sort=${sort}
            onNavigate=${onNavigate} runIndex=${runIndex} setSearch=${setSearch}
            search=${search}
            specDirectory=${specDirectory} history=${history} />`;
    }, [sort, onNavigate, runIndex, setSearch, search, specDirectory, history]);

    const renderGroupHeader = useCallback((category: string) => {
        return html`<${CategoryBreadcrumb} category=${category} onSegmentClick=${(segment: string) => setSearch('"' + segment + '"')} />`;
    }, [setSearch]);

    return html`<${GroupedVirtualList}
        items=${items}
        groupBy=${groupByFunction}
        rowHeight=${ROW_HEIGHTS.scenario}
        renderItem=${renderItem}
        renderGroupHeader=${renderGroupHeader}
        id="vs-sticky-header"
        ariaLabel="Test scenarios"
    />`;
}
