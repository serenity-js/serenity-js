import htm from 'htm';
import { h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import type { ReportHistoryEntry, ReportOutcomes, ReportScenario, ReportSummary } from '../../src/ReportData';
import { formatDuration, formatRunLabel, hashHistory, matchesSearch } from '../utils';
import { FilterBar } from './FilterBar';
import { RunSelector } from './RunSelector';
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
    const [search, setSearch] = useState(() => {
        return hashHistory.getParam('search') || '';
    });
    const [filter, setFilter] = useState(() => {
        return hashHistory.getParam('filter') || 'all';
    });
    const [sort, setSort] = useState(() => {
        return hashHistory.getParam('sort') || 'category';
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
            const filterMatch: Record<string, string[]> = { passed: ['SUCCESS'], failed: ['FAILURE', 'ERROR', 'COMPROMISED'], skipped: ['SKIPPED', 'PENDING'] };
            const keys = filter.split(',');
            const allowed = keys.flatMap(k => filterMatch[k] || []);
            if (allowed.length > 0) result = result.filter(s => allowed.includes(s.outcome));
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
        }
        return result;
    }, [search, filter, sort]);

    // Detect run index from route
    const runParameters = route.includes('?') ? new URLSearchParams(route.split('?')[1]) : null;
    const runString = runParameters ? runParameters.get('run') : null;
    const runIndex = useMemo(() => {
        if (runString === null) return null;
        const byTs = history.findIndex(r => r.timestamp === runString);
        if (byTs >= 0) return byTs;
        const parsed = parseInt(runString, 10);
        return isNaN(parsed) ? null : parsed;
    }, [runString]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (filter && filter !== 'all') params.set('filter', filter);
        if (sort && sort !== 'category') params.set('sort', sort);
        if (runIndex !== null && history[runIndex]) params.set('run', history[runIndex].timestamp);
        const parameterString = params.toString();
        const newHash = parameterString ? '/tests?' + parameterString : '/tests';
        hashHistory.replace(newHash);
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
        <div class="historical-banner">
          <span>Viewing results from: <strong>${formatRunLabel(historicalRun.label, historicalRun.timestamp)}</strong> — ${formatDuration(historicalRun.duration)}</span>
          <a href="#/tests" class="link-underline">show latest</a>
        </div>
      ` : null}

      <${RunSelector} activeTimestamp=${activeRunTimestamp} history=${history} onRunChange=${onRunChange} />

      <div style="position:relative;margin-bottom:var(--space-md)">
        <input class="search-input" type="text" placeholder="Find test scenarios..."
               value=${search} onInput=${(e: Event) => setSearch((e.target as HTMLInputElement).value)}
               aria-label="Find test scenarios" />
        ${search ? html`<button onClick=${() => setSearch('')}
          class="btn-clear"
          aria-label="Clear search">✕</button>` : null}
      </div>

      <${FilterBar} outcomes=${runOutcomes} total=${runTotal}
                     activeFilter=${filter} onFilter=${setFilter}
                     sortOptions=${[
                            { key: 'category', label: 'Category' },
                            { key: 'name', label: 'Name' },
                            { key: 'duration', label: 'Slowest' },
                            { key: 'status', label: 'Status' },
                        ]}
                     activeSort=${sort} onSort=${setSort} />

      <div class="card">
        <div class="text-muted mb-md" aria-live="polite" aria-atomic="true">
          Showing ${filtered.length} of ${allScenarios.length} test scenarios
        </div>
        <${VirtualScenarioList} filtered=${filtered} grouped=${grouped} sort=${sort}
          onNavigate=${onNavigate} runIndex=${runIndex} setSearch=${setSearch}
          specDirectory=${specDirectory}
          history=${history} />
      </div>
    </div>
  `;
}
