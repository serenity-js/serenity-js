import htm from 'htm';
import { h } from 'preact';
import { useMemo } from 'preact/hooks';

import type { ReportHistoryEntry, ReportOutcomes, ReportScenario, ReportSummary } from '../../../src/cli/ReportData.js';
import { useRunSelection } from '../../hooks/useRunSelection.js';
import { useViewState } from '../../hooks/useViewState.js';
import { matchesOutcomeFilter, matchesSearch, totalFailedCount } from '../../utils/index.js';
import { FilterBar } from '../common/FilterBar.js';
import { ResultCount } from '../common/ResultCount.js';
import { RunSelector } from '../common/RunSelector.js';
import { SearchInput } from '../common/SearchInput.js';
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
}

export function ScenariosView({ scenarios: allScenarios, history, summary, specDirectory, onNavigate, route }: ScenariosViewProps): ReturnType<typeof html> {
    const { runIndex, isHistorical, activeTimestamp: activeRunTimestamp, onRunChange } = useRunSelection(route, history, '/tests', onNavigate);

    const { search, setSearch, filter, setFilter, sort, setSort } = useViewState({
        basePath: '/tests',
        route,
        defaults: { sort: 'category' },
    });

    const filtered = useMemo(() => {
        let result = allScenarios;
        if (filter && filter !== 'all') {
            result = result.filter(s => matchesOutcomeFilter(s.outcome, filter));
        }
        if (search) {
            result = result.filter(s => matchesSearch(s, search));
        }
        return sortScenarios(result, sort);
    }, [search, filter, sort]);

    const grouped = useMemo(() => {
        const groups: Record<string, typeof filtered> = {};
        for (const s of filtered) {
            if (!groups[s.category]) groups[s.category] = [];
            groups[s.category].push(s);
        }
        return groups;
    }, [filtered]);

    const runOutcomes: ReportOutcomes = useMemo(() =>
        runIndex !== null && history[runIndex] ? history[runIndex].outcomes : summary.outcomes,
    [runIndex]);

    const runTotal = useMemo(() =>
        Object.values(runOutcomes).reduce((a: number, b: number) => a + b, 0),
    [runOutcomes]);

    return html`
    <div class="flex-fill-view">
      ${history.length > 1 ? html`<${RunSelector} activeTimestamp=${activeRunTimestamp} history=${history} onRunChange=${onRunChange} isHistorical=${isHistorical} showLatestHref="#/tests" />` : null}

      <div class="controls-row">
        <div class="search-input-wrap">
          <${SearchInput} value=${search} onInput=${setSearch} />
        </div>

        <${FilterBar} filters=${[
            { key: 'all', label: 'All', count: runTotal },
            { key: 'passed', label: 'Passed', count: runOutcomes.passed },
            { key: 'failed', label: 'Failed', count: totalFailedCount(runOutcomes) },
            { key: 'skipped', label: 'Skipped', count: (runOutcomes.skipped || 0) + (runOutcomes.pending || 0) },
        ]}
        activeFilter=${filter} onFilter=${setFilter}
        ariaLabel="Filter tests by outcome" label="Status"
        sortOptions=${[
            { key: 'category', label: 'Category' },
            { key: 'name', label: 'Name' },
            { key: 'duration', label: 'Slowest' },
            { key: 'status', label: 'Status' },
        ]}
        activeSort=${sort} onSort=${setSort} />
      </div>

      <div class="card">
        ${filtered.length < allScenarios.length ? html`<${ResultCount} showing=${filtered.length} total=${allScenarios.length} label="test scenarios" />` : null}
        <${VirtualScenarioList} filtered=${filtered} grouped=${grouped} sort=${sort}
          onNavigate=${onNavigate} runIndex=${runIndex} setSearch=${setSearch}
          search=${search}
          specDirectory=${specDirectory}
          history=${history} />
      </div>
    </div>
  `;
}
