import htm from 'htm';
import { h } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';

import type { ReportInconsistentTest } from '../../../src/cli/ReportData';
import { ROW_HEIGHTS } from '../../config/layout';
import { matchesSearch } from '../../utils';
import { classifyConsistencyKind } from '../../utils/selectors';
import { FilterBar } from '../common/FilterBar';
import { icons } from '../common/icons';
import { GroupedVirtualList } from '../common/layout/GroupedVirtualList';
import { ResultCount } from '../common/ResultCount';
import { SearchInput } from '../common/SearchInput';
import { ConsistencyRow } from './ConsistencyRow';

const html = htm.bind(h);

interface ConsistencyViewProps {
    inconsistentTests: ReportInconsistentTest[];
    specDirectory?: string;
    onNavigate: (path: string) => void;
}

export function ConsistencyView({ inconsistentTests, specDirectory, onNavigate }: ConsistencyViewProps): ReturnType<typeof html> {

    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('category');

    if (inconsistentTests.length === 0) {
        return html`
      <div class="placeholder-view">
        ${icons.unstable}
        <h2>All Tests Consistent</h2>
        <p>No inconsistent results detected.<br/>Run your test suite several times to populate history.</p>
      </div>
    `;
    }

    const allInconsistent = useMemo(() => inconsistentTests.map(t => {
        const lastOutcome = t.history && t.history.length > 0 ? t.history[t.history.length - 1] : null;
        const kind = classifyConsistencyKind(t.history || []);
        return { ...t, kind, lastOutcome: lastOutcome || 'SKIPPED' };
    }), []);

    const flakyCount = allInconsistent.filter(t => t.kind === 'flaky').length;
    const inconsistentCount = allInconsistent.filter(t => t.kind === 'inconsistent').length;
    const degradedCount = allInconsistent.filter(t => t.kind === 'degraded').length;
    const recoveredCount = allInconsistent.filter(t => t.kind === 'recovered').length;

    const allItems = useMemo(() => {
        if (filter === 'flaky') return allInconsistent.filter(t => t.kind === 'flaky');
        if (filter === 'inconsistent') return allInconsistent.filter(t => t.kind === 'inconsistent');
        if (filter === 'degraded') return allInconsistent.filter(t => t.kind === 'degraded');
        if (filter === 'recovered') return allInconsistent.filter(t => t.kind === 'recovered');
        return allInconsistent;
    }, [filter, allInconsistent]);

    const searchedItems = useMemo(() => {
        if (!search) return allItems;
        return allItems.filter(t => matchesSearch(t, search));
    }, [allItems, search]);

    const sortedItems = useMemo(() => {
        if (sort === 'name') return [...searchedItems].sort((a, b) => a.name.localeCompare(b.name));
        return [...searchedItems].sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    }, [searchedItems, sort]);

    const groupByFunction = sort === 'category' ? (t: ReportInconsistentTest & { kind: string }) => t.category || 'Uncategorised' : undefined;

    const renderItem = useCallback((item: ReportInconsistentTest & { kind: string }) => {
        return html`<${ConsistencyRow} item=${item} specDirectory=${specDirectory} onNavigate=${onNavigate} />`;
    }, [specDirectory, onNavigate]);

    const renderGroupHeader = useCallback((category: string) => {
        return html`${category.split(' › ').map((segment, index, array) => html`
          <span class="clickable" onClick=${() => setSearch('"' + segment + '"')}>${segment}</span>${index < array.length - 1 ? html`<span style="margin:0 4px;text-decoration:none;cursor:default"> › </span>` : null}
        `)}`;
    }, [setSearch]);

    return html`
    <div>
      <div class="controls-row">
        <div class="search-input-wrap">
          <${SearchInput} value=${search} onInput=${setSearch} />
        </div>

        <${FilterBar} filters=${[
            { key: 'all', label: 'All', count: inconsistentTests.length },
            { key: 'flaky', label: 'Flaky', count: flakyCount },
            { key: 'inconsistent', label: 'Inconsistent', count: inconsistentCount },
            { key: 'degraded', label: 'Degraded', count: degradedCount, className: 'failed' },
            { key: 'recovered', label: 'Recovered', count: recoveredCount, className: 'passed' },
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
        <${ResultCount} showing=${sortedItems.length} label=${sortedItems.length === 1 ? 'test scenario' : 'test scenarios'} />
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
