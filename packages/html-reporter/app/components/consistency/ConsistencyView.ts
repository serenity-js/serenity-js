import htm from 'htm';
import { h } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';

import type { ReportInconsistentTest } from '../../../src/cli/reporting/ReportData.js';
import { ROW_HEIGHTS } from '../../config/layout.js';
import { matchesSearch } from '../../utils/index.js';
import { classifyConsistencyKind } from '../../utils/selectors.js';
import { CategoryBreadcrumb } from '../common/CategoryBreadcrumb.js';
import { FilterBar } from '../common/FilterBar.js';
import { icons } from '../common/icons.js';
import { GroupedVirtualList } from '../common/layout/GroupedVirtualList.js';
import { ResultCount } from '../common/ResultCount.js';
import { SearchInput } from '../common/SearchInput.js';
import { ConsistencyRow } from './ConsistencyRow.js';

const html = htm.bind(h);

interface ConsistencyViewProps {
    inconsistentTests: ReportInconsistentTest[];
    specDirectory?: string;
    onNavigate: (path: string) => void;
}

interface ClassifiedTest extends ReportInconsistentTest {
    kind: string;
    lastOutcome: string;
}

function classifyTests(tests: ReportInconsistentTest[]): ClassifiedTest[] {
    return tests.map(t => {
        const lastOutcome = t.history && t.history.length > 0 ? t.history[t.history.length - 1] : 'SKIPPED';
        const kind = classifyConsistencyKind(t.history || []);
        return { ...t, kind, lastOutcome: typeof lastOutcome === 'string' ? lastOutcome : 'SKIPPED' };
    });
}

function countByKind(tests: ClassifiedTest[]): { flaky: number; inconsistent: number; degraded: number; recovered: number } {
    let flaky = 0, inconsistent = 0, degraded = 0, recovered = 0;
    for (const t of tests) {
        if (t.kind === 'flaky') flaky++;
        else if (t.kind === 'inconsistent') inconsistent++;
        else if (t.kind === 'degraded') degraded++;
        else if (t.kind === 'recovered') recovered++;
    }
    return { flaky, inconsistent, degraded, recovered };
}

function filterByKind(tests: ClassifiedTest[], filter: string): ClassifiedTest[] {
    if (filter === 'all') return tests;
    return tests.filter(t => t.kind === filter);
}

function sortTests(tests: ClassifiedTest[], sort: string): ClassifiedTest[] {
    if (sort === 'name') return [...tests].sort((a, b) => a.name.localeCompare(b.name));
    return [...tests].sort((a, b) => (a.category || '').localeCompare(b.category || ''));
}

export function ConsistencyView({ inconsistentTests, specDirectory, onNavigate }: ConsistencyViewProps): ReturnType<typeof html> {

    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('category');

    const allInconsistent = useMemo(() => classifyTests(inconsistentTests), [inconsistentTests]);
    const counts = useMemo(() => countByKind(allInconsistent), [allInconsistent]);

    const filteredItems = useMemo(() => filterByKind(allInconsistent, filter), [filter, allInconsistent]);

    const searchedItems = useMemo(() => {
        if (!search) return filteredItems;
        return filteredItems.filter(t => matchesSearch(t, search));
    }, [filteredItems, search]);

    const sortedItems = useMemo(() => sortTests(searchedItems, sort), [searchedItems, sort]);

    const groupByFunction = sort === 'category' ? (t: ClassifiedTest) => t.category || 'Uncategorised' : undefined;

    const renderItem = useCallback((item: ClassifiedTest) =>
        html`<${ConsistencyRow} item=${item} specDirectory=${specDirectory} onNavigate=${onNavigate} />`,
    [specDirectory, onNavigate]);

    const renderGroupHeader = useCallback((category: string) =>
        html`<${CategoryBreadcrumb} category=${category} onSegmentClick=${(segment: string) => setSearch('"' + segment + '"')} />`,
    [setSearch]);

    return inconsistentTests.length === 0
        ? html`
      <div class="placeholder-view">
        ${icons.unstable}
        <h2>All Tests Consistent</h2>
        <p>No inconsistent results detected. Run your test suite several times to populate history.</p>
      </div>
    `
        : html`
    <div class="flex-fill-view">
      <div class="controls-row">
        <div class="search-input-wrap">
          <${SearchInput} value=${search} onInput=${setSearch} />
        </div>

        <${FilterBar} filters=${[
            { key: 'all', label: 'All', count: inconsistentTests.length },
            { key: 'flaky', label: 'Flaky', count: counts.flaky },
            { key: 'inconsistent', label: 'Inconsistent', count: counts.inconsistent },
            { key: 'degraded', label: 'Degraded', count: counts.degraded, className: 'failed' },
            { key: 'recovered', label: 'Recovered', count: counts.recovered, className: 'passed' },
        ]}
        activeFilter=${filter} onFilter=${setFilter}
        ariaLabel="Filter tests by consistency" label="Status"
        multiSelect=${false}
        sortOptions=${[
            { key: 'category', label: 'Category' },
            { key: 'name', label: 'Name' },
        ]}
        activeSort=${sort} onSort=${setSort}
        sortId="consistency-sort-select" />
      </div>

      <div class="card pb-0">
        ${html`<${ResultCount} showing=${sortedItems.length} total=${sortedItems.length < inconsistentTests.length ? inconsistentTests.length : undefined} label=${sortedItems.length === 1 ? 'test scenario' : 'test scenarios'} />`}
        <${GroupedVirtualList}
            items=${sortedItems}
            groupBy=${groupByFunction}
            rowHeight=${ROW_HEIGHTS.consistency}
            renderItem=${renderItem}
            renderGroupHeader=${renderGroupHeader}
            id="vs-consistency-sticky"
        />
      </div>
    </div>
  `;
}
