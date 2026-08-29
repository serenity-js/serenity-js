import htm from 'htm';
import { h } from 'preact';

import type { ReportHistoryEntry, ReportScenario, ReportSummary } from '../../../src/cli/reporting/ReportData.js';
import { useMobileSheetState } from '../../hooks/useMobileSheetState.js';
import { useRunSelection } from '../../hooks/useRunSelection.js';
import { useScenarioFilter } from '../../hooks/useScenarioFilter.js';
import { useViewState } from '../../hooks/useViewState.js';
import { formatRunLabel } from '../../utils/index.js';
import { FilterBar } from '../common/FilterBar.js';
import { MobileSheets } from '../common/MobileSheets.js';
import { ResultCount } from '../common/ResultCount.js';
import { RunSelector } from '../common/RunSelector.js';
import { SearchInput } from '../common/SearchInput.js';
import { TopbarActions } from '../common/TopbarActions.js';
import { ViewTopbar } from '../common/ViewTopbar.js';
import { VirtualScenarioList } from './VirtualScenarioList.js';

const html = htm.bind(h);

// ===== Test Scenarios List View =====
interface ScenariosViewProps {
    scenarios: ReportScenario[];
    history: ReportHistoryEntry[];
    summary: ReportSummary;
    specDirectory?: string;
    onNavigate?: (path: string) => void;
    route?: string;
    onOpenSidebar?: () => void;
}

export function ScenariosView({ scenarios: allScenarios, history, summary, specDirectory, onNavigate = () => {}, route = '', onOpenSidebar }: ScenariosViewProps): ReturnType<typeof html> {
    const openSidebar = onOpenSidebar || (() => {});
    const sheets = useMobileSheetState();

    const { runIndex, isHistorical, activeTimestamp: activeRunTimestamp, onRunChange } = useRunSelection(route, history, '/tests', onNavigate);

    const { search, setSearch, filter, setFilter, sort, setSort } = useViewState({
        basePath: '/tests',
        route,
        defaults: { sort: 'category' },
        validFilters: ['passed', 'failed', 'skipped'],
    });

    const { filtered, grouped, filters, scenarioTotal } = useScenarioFilter({
        allScenarios, history, runIndex, isHistorical, search, filter, sort,
    });

    const sortOptions = [
        { key: 'category', label: 'Category' },
        { key: 'name', label: 'Name' },
        { key: 'duration', label: 'Slowest' },
        { key: 'status', label: 'Status' },
    ];

    const topbarActions = html`<${TopbarActions} onOpenFilter=${sheets.openFilter} onOpenSort=${sheets.openSort} />`;

    return html`
    <div class="flex-fill-view">
      <${ViewTopbar} title="Test Scenarios" onOpenSidebar=${openSidebar} actions=${topbarActions} />
      ${history.length > 1 ? html`<div class="desktop-only"><${RunSelector} activeTimestamp=${activeRunTimestamp} history=${history} onRunChange=${onRunChange} isHistorical=${isHistorical} showLatestHref="#/tests" /></div>` : null}

      <div class="controls-row desktop-only">
        <div class="search-input-wrap">
          <${SearchInput} value=${search} onInput=${setSearch} />
        </div>

        <${FilterBar} filters=${filters}
        activeFilter=${filter} onFilter=${setFilter}
        ariaLabel="Filter tests by outcome" label="Status"
        sortOptions=${sortOptions}
        activeSort=${sort} onSort=${setSort} />
      </div>

      <div class="card">
        ${html`<${ResultCount} showing=${filtered.length} total=${filtered.length < scenarioTotal ? scenarioTotal : undefined} label=${filtered.length === 1 ? 'test scenario' : 'test scenarios'} suffix=${isHistorical && runIndex !== null && history[runIndex] ? 'Run ' + formatRunLabel(history[runIndex].label, history[runIndex].timestamp) : undefined} />`}
        <${VirtualScenarioList} filtered=${filtered} grouped=${grouped} sort=${sort}
          onNavigate=${onNavigate} runIndex=${runIndex} setSearch=${setSearch}
          search=${search}
          specDirectory=${specDirectory}
          history=${history} />
      </div>

      <${MobileSheets}
        filterSheetOpen=${sheets.filterSheetOpen}
        onCloseFilter=${sheets.closeFilter}
        filterHeader=${history.length > 1 ? html`<${RunSelector} activeTimestamp=${activeRunTimestamp} history=${history} onRunChange=${onRunChange} isHistorical=${isHistorical} showLatestHref="#/tests" />` : null}
        search=${search} onSearch=${setSearch}
        filters=${filters}
        activeFilter=${filter} onFilter=${setFilter}
        filteredCount=${filtered.length} totalCount=${scenarioTotal}
        sortSheetOpen=${sheets.sortSheetOpen}
        onCloseSort=${sheets.closeSort}
        sortOptions=${sortOptions}
        activeSort=${sort} onSort=${setSort}
      />
    </div>
  `;
}
