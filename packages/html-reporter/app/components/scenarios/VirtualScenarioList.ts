import htm from 'htm';
import { h } from 'preact';
import { useCallback } from 'preact/hooks';

import type { ReportHistoryEntry, ReportScenario } from '../../../src/cli/ReportData';
import { ROW_HEIGHTS } from '../../config/layout';
import { GroupedVirtualList } from '../common/layout/GroupedVirtualList';
import { ScenarioRow } from './ScenarioRow';

const html = htm.bind(h);

export interface VirtualScenarioListProps {
    filtered: ReportScenario[];
    grouped: Record<string, ReportScenario[]>;
    sort: string;
    onNavigate: (path: string) => void;
    runIndex: number | null;
    setSearch: (search: string) => void;
    specDirectory?: string;
    history?: ReportHistoryEntry[];
}

export function VirtualScenarioList({ filtered, grouped, sort, onNavigate, runIndex, setSearch, specDirectory, history }: VirtualScenarioListProps): ReturnType<typeof html> {
    const items = sort === 'category'
        ? Object.entries(grouped).flatMap(([, scenarios]) => scenarios)
        : filtered;

    const groupByFunction = sort === 'category' ? (s: ReportScenario) => s.category : undefined;

    const renderItem = useCallback((scenario: ReportScenario) => {
        return html`<${ScenarioRow} scenario=${scenario} sort=${sort}
            onNavigate=${onNavigate} runIndex=${runIndex} setSearch=${setSearch}
            specDirectory=${specDirectory} history=${history} />`;
    }, [sort, onNavigate, runIndex, setSearch, specDirectory, history]);

    const renderGroupHeader = useCallback((category: string) => {
        const segments = category.split(' › ');
        return html`${segments.map((segment, index) => html`
          <span class="clickable" onClick=${() => setSearch('"' + segment + '"')}>${segment}</span>${index < segments.length - 1 ? html`<span class="breadcrumb-sep"> › </span>` : null}
        `)}`;
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
