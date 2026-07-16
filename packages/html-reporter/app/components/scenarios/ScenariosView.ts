import htm from 'htm';
import { h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import type { ReportHistoryEntry, ReportOutcomes, ReportScenario, ReportSummary } from '../../../src/cli/ReportData';
import { formatDuration, formatRunLabel, matchesOutcomeFilter, matchesSearch, resolveRunIndex, useHashHistory } from '../../utils';
import { FilterBar } from '../common/FilterBar';
import { HistoricalBanner } from '../common/HistoricalBanner';
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
    const hashNav = useHashHistory();
    const [search, setSearch] = useState(() => {
        return hashNav.getParam('search') || '';
    });
    const [filter, setFilter] = useState(() => {
        return hashNav.getParam('filter') || 'all';
    });
    const [sort, setSort] = useState(() => {
        return hashNav.getParam('sort') || 'category';
    });

    useEffect(() => {
        const params = route.includes('?') ? new URLSearchParams(route.split('?')[1]) : null;
        const newSearch = params?.get('search') || '';
        const newFilter = params?.get('filter') || 'all';
        const newSort = params?.get('sort') || 'category';
        setSearch(newSearch);
        setFilter(newFilter);
        setSort(newSort);
    }, [route]);

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

    // Detect run index from route
    const runParameters = route.includes('?') ? new URLSearchParams(route.split('?')[1]) : null;
    const runString = runParameters ? runParameters.get('run') : null;
    const runIndex = useMemo(() => resolveRunIndex(runString, history), [runString]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (filter && filter !== 'all') params.set('filter', filter);
        if (sort && sort !== 'category') params.set('sort', sort);
        if (runIndex !== null && history[runIndex]) params.set('run', history[runIndex].timestamp);
        const parameterString = params.toString();
        const newHash = parameterString ? '/tests?' + parameterString : '/tests';
        hashNav.replace(newHash);
    }, [search, filter, sort]);

    const grouped = useMemo(() => {
        const groups: Record<string, typeof filtered> = {};
        for (const s of filtered) {
            if (!groups[s.category]) groups[s.category] = [];
            groups[s.category].push(s);
        }
        return groups;
    }, [filtered]);

    const historicalRun = (runIndex !== null && runIndex !== history.length - 1) ? history[runIndex] : null;

    const activeRunTimestamp = runIndex !== null && history[runIndex] ? history[runIndex].timestamp : history[history.length - 1]?.timestamp;
    const onRunChange = (e: Event) => {
        const ts = (e.target as HTMLSelectElement).value;
        const index = history.findIndex(r => r.timestamp === ts);
        const isLatest = index === history.length - 1;
        onNavigate(isLatest ? '/tests' : '/tests?run=' + ts);
    };

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
      ${historicalRun ? html`
        <${HistoricalBanner} label="Viewing results from:" runLabel=${formatRunLabel(historicalRun.label, historicalRun.timestamp)} subtitle=${'— ' + formatDuration(historicalRun.duration)} showLatestHref="#/tests" onShowLatest=${() => {}} />
      ` : null}

      ${history.length > 1 ? html`<${RunSelector} activeTimestamp=${activeRunTimestamp} history=${history} onRunChange=${onRunChange} />` : null}

      <${SearchInput} value=${search} onInput=${setSearch} />

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

      <div class="card">
        <${ResultCount} showing=${filtered.length} total=${allScenarios.length} label="test scenarios" />
        <${VirtualScenarioList} filtered=${filtered} grouped=${grouped} sort=${sort}
          onNavigate=${onNavigate} runIndex=${runIndex} setSearch=${setSearch}
          search=${search}
          specDirectory=${specDirectory}
          history=${history} />
      </div>
    </div>
  `;
}
