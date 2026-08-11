import htm from 'htm';
import { h } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import type { ReportHistoryEntry, ReportScenario, ReportSummary } from '../../../src/cli/reporting/ReportData.js';
import { useRunSelection } from '../../hooks/useRunSelection.js';
import { useViewState } from '../../hooks/useViewState.js';
import { formatRunLabel, matchesOutcomeFilter, matchesSearch } from '../../utils/index.js';
import { BottomSheet } from '../common/BottomSheet.js';
import { FilterBar } from '../common/FilterBar.js';
import { FilterSheetContent } from '../common/FilterSheetContent.js';
import { ResultCount } from '../common/ResultCount.js';
import { RunSelector } from '../common/RunSelector.js';
import { SearchInput } from '../common/SearchInput.js';
import { SortSheetContent } from '../common/SortSheetContent.js';
import { TopbarActions } from '../common/TopbarActions.js';
import { ViewTopbar } from '../common/ViewTopbar.js';
import { VirtualScenarioList } from './VirtualScenarioList.js';

const html = htm.bind(h);

const STATUS_ORDER: Record<string, number> = { FAILURE: 1, ERROR: 2, COMPROMISED: 3, PENDING: 4, SKIPPED: 5, SUCCESS: 6 };

const sortComparators: Record<string, (a: ReportScenario, b: ReportScenario) => number> = {
    name: (a, b) => a.name.localeCompare(b.name),
    duration: (a, b) => b.duration - a.duration,
    status: (a, b) => (STATUS_ORDER[a.outcome] || 6) - (STATUS_ORDER[b.outcome] || 6),
    category: (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
};

function sortScenarios(scenarios: ReportScenario[], sort: string): ReportScenario[] {
    const comparator = sortComparators[sort] || sortComparators.category;
    return [...scenarios].sort(comparator);
}

// ===== Test Scenarios List View =====
interface ScenariosViewProps {
    scenarios: ReportScenario[];
    history: ReportHistoryEntry[];
    summary: ReportSummary;
    specDirectory?: string;
    onNavigate: (path: string) => void;
    route: string;
    onOpenSidebar?: () => void;
}

export function ScenariosView({ scenarios: allScenarios, history, summary, specDirectory, onNavigate, route, onOpenSidebar }: ScenariosViewProps): ReturnType<typeof html> {
    const openSidebar = onOpenSidebar || (() => {});
    const [filterSheetOpen, setFilterSheetOpen] = useState(false);
    const [sortSheetOpen, setSortSheetOpen] = useState(false);

    const { runIndex, isHistorical, activeTimestamp: activeRunTimestamp, onRunChange } = useRunSelection(route, history, '/tests', onNavigate);

    const { search, setSearch, filter, setFilter, sort, setSort } = useViewState({
        basePath: '/tests',
        route,
        defaults: { sort: 'category' },
        validFilters: ['passed', 'failed', 'skipped'],
    });

    const filtered = useMemo(() => {
        let result = allScenarios;

        // When viewing a historical run, reconstruct outcomes from executionHistory
        if (isHistorical && runIndex !== null && history[runIndex]) {
            const runTimestamp = history[runIndex].timestamp;
            result = allScenarios
                .filter(s => s.executionHistory?.some(e => e.timestamp === runTimestamp))
                .map(s => {
                    const entry = s.executionHistory.find(e => e.timestamp === runTimestamp);
                    return entry
                        ? { ...s, outcome: entry.outcome, duration: entry.duration ?? s.duration, error: entry.error || undefined } as ReportScenario
                        : s;
                });
        }

        if (filter && filter !== 'all') {
            result = result.filter(s => matchesOutcomeFilter(s.outcome, filter));
        }
        if (search) {
            result = result.filter(s => matchesSearch(s, search));
        }
        return sortScenarios(result, sort);
    }, [search, filter, sort, runIndex, isHistorical]);

    const grouped = useMemo(() => {
        const groups: Record<string, typeof filtered> = {};
        for (const s of filtered) {
            if (!groups[s.category]) groups[s.category] = [];
            groups[s.category].push(s);
        }
        return groups;
    }, [filtered]);

    // Compute scenarios matching the current search (before outcome filter)
    // so filter chip counts reflect the narrowed search results
    const searchMatched = useMemo(() => {
        let result = allScenarios;

        if (isHistorical && runIndex !== null && history[runIndex]) {
            const runTimestamp = history[runIndex].timestamp;
            result = allScenarios
                .filter(s => s.executionHistory?.some(e => e.timestamp === runTimestamp))
                .map(s => {
                    const entry = s.executionHistory.find(e => e.timestamp === runTimestamp);
                    return entry
                        ? { ...s, outcome: entry.outcome, duration: entry.duration ?? s.duration, error: entry.error || undefined } as ReportScenario
                        : s;
                });
        }

        if (search) {
            result = result.filter(s => matchesSearch(s, search));
        }
        return result;
    }, [search, runIndex, isHistorical]);

    const filterCounts = useMemo(() => {
        let passed = 0, failed = 0, skipped = 0;
        for (const s of searchMatched) {
            if (matchesOutcomeFilter(s.outcome, 'passed')) passed++;
            else if (matchesOutcomeFilter(s.outcome, 'failed')) failed++;
            else if (matchesOutcomeFilter(s.outcome, 'skipped')) skipped++;
        }
        return { total: searchMatched.length, passed, failed, skipped };
    }, [searchMatched]);

    // Total scenarios available in the run (before any search/filter) — used for ResultCount
    const scenarioTotal = useMemo(() => {
        if (isHistorical && runIndex !== null && history[runIndex]) {
            const runTimestamp = history[runIndex].timestamp;
            return allScenarios.filter(s => s.executionHistory?.some(e => e.timestamp === runTimestamp)).length;
        }
        return allScenarios.length;
    }, [runIndex, isHistorical]);

    const filters = [
        { key: 'all', label: 'All', count: filterCounts.total },
        { key: 'passed', label: 'Passed', count: filterCounts.passed },
        { key: 'failed', label: 'Failed', count: filterCounts.failed },
        { key: 'skipped', label: 'Skipped', count: filterCounts.skipped },
    ];

    const sortOptions = [
        { key: 'category', label: 'Category' },
        { key: 'name', label: 'Name' },
        { key: 'duration', label: 'Slowest' },
        { key: 'status', label: 'Status' },
    ];

    const topbarActions = html`<${TopbarActions} onOpenFilter=${() => setFilterSheetOpen(true)} onOpenSort=${() => setSortSheetOpen(true)} />`;

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

      ${filterSheetOpen ? html`<${BottomSheet} isOpen=${true} onClose=${() => setFilterSheetOpen(false)} title="Search & Filter">
        ${history.length > 1 ? html`<${RunSelector} activeTimestamp=${activeRunTimestamp} history=${history} onRunChange=${onRunChange} isHistorical=${isHistorical} showLatestHref="#/tests" />` : null}
        <${FilterSheetContent}
          search=${search} onSearch=${setSearch}
          filters=${filters}
          activeFilter=${filter} onFilter=${setFilter}
          filteredCount=${filtered.length} totalCount=${scenarioTotal}
          ariaLabel="Filter tests by outcome"
        />
      </${BottomSheet}>` : null}

      ${sortSheetOpen ? html`<${BottomSheet} isOpen=${true} onClose=${() => setSortSheetOpen(false)} title="Sort">
        <${SortSheetContent}
          sortOptions=${sortOptions}
          activeSort=${sort} onSort=${setSort}
        />
      </${BottomSheet}>` : null}
    </div>
  `;
}
