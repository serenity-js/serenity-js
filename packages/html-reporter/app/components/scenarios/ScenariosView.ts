import htm from 'htm';
import { h } from 'preact';
import { useMemo } from 'preact/hooks';

import type { ReportHistoryEntry, ReportOutcomes, ReportScenario, ReportSummary } from '../../../src/cli/ReportData';
import { useRunSelection } from '../../hooks/useRunSelection';
import { useViewState } from '../../hooks/useViewState';
import { matchesOutcomeFilter, matchesSearch } from '../../utils';
import { FilterBar } from '../common/FilterBar';
import { ResultCount } from '../common/ResultCount';
import { RunSelector } from '../common/RunSelector';
import { SearchInput } from '../common/SearchInput';
import { VirtualScenarioList } from './VirtualScenarioList';

const html = htm.bind(h);

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
        extraParams: () => (runIndex !== null && history[runIndex] ? { run: history[runIndex].timestamp } : {}),
    });

    const filtered = useMemo(() => {
        let result = allScenarios;
        if (filter && filter !== 'all') {
            result = result.filter(s => matchesOutcomeFilter(s.outcome, filter));
        }
        if (search) {
            result = result.filter(s => matchesSearch(s, search));
        }
        if (sort === 'name') {
            result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === 'duration') {
            result = [...result].sort((a, b) => b.duration - a.duration);
        } else if (sort === 'status') {
            const statusOrder: Record<string, number> = { FAILURE: 1, ERROR: 2, COMPROMISED: 3, PENDING: 4, SKIPPED: 5, SUCCESS: 6 };
            result = [...result].sort((a, b) => (statusOrder[a.outcome] || 6) - (statusOrder[b.outcome] || 6));
        } else {
            // Default (category): sort by category then name within each category
            result = [...result].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
        }
        return result;
    }, [search, filter, sort]);

    const grouped = useMemo(() => {
        const groups: Record<string, typeof filtered> = {};
        for (const s of filtered) {
            if (!groups[s.category]) groups[s.category] = [];
            groups[s.category].push(s);
        }
        return groups;
    }, [filtered]);

    const runOutcomes: ReportOutcomes = useMemo(() => {
        if (runIndex !== null && history[runIndex]) {
            return history[runIndex].outcomes;
        }
        return summary.outcomes;
    }, [runIndex]);
    const runTotal = useMemo(() => {
        return Object.values(runOutcomes).reduce((a: number, b: number) => a + b, 0);
    }, [runOutcomes]);

    return html`
    <div>
      ${history.length > 1 ? html`<${RunSelector} activeTimestamp=${activeRunTimestamp} history=${history} onRunChange=${onRunChange} isHistorical=${isHistorical} showLatestHref="#/tests" />` : null}

      <div class="controls-row">
        <div class="search-input-wrap">
          <${SearchInput} value=${search} onInput=${setSearch} />
        </div>

        <${FilterBar} filters=${[
            { key: 'all', label: 'All', count: runTotal },
            { key: 'passed', label: 'Passed', count: runOutcomes.passed },
            { key: 'failed', label: 'Failed', count: (runOutcomes.failed || 0) + (runOutcomes.error || 0) + (runOutcomes.compromised || 0) },
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
