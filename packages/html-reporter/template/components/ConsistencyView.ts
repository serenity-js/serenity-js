import htm from 'htm';
import { h } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';

import type { ReportInconsistentTest } from '../../src/ReportData';
import { ROW_HEIGHTS } from '../config/layout';
import { matchesSearch } from '../utils';
import { icons } from './icons';
import { GroupedVirtualList } from './layout/GroupedVirtualList';
import { ConsistencyRow } from './rows/ConsistencyRow';

const html = htm.bind(h);

interface ConsistencyViewProps {
    inconsistentTests: ReportInconsistentTest[];
    specDirectory?: string;
    onNavigate: (path: string) => void;
}

export function ConsistencyView({ inconsistentTests, specDirectory, onNavigate }: ConsistencyViewProps): ReturnType<typeof html> {

    const [filter, setFilter] = useState('inconsistent');
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
        const kind = lastOutcome === 'SUCCESS' ? 'recovered' : 'degraded';
        return { ...t, kind };
    }), []);

    const degradedCount = allInconsistent.filter(t => t.kind === 'degraded').length;
    const recoveredCount = allInconsistent.filter(t => t.kind === 'recovered').length;

    const allItems = useMemo(() => {
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
      <div style="position:relative" class="mb-md">
        <input class="search-input" type="text" placeholder="Find test scenarios..."
               value=${search} onInput=${(e: Event) => setSearch((e.target as HTMLInputElement).value)}
               aria-label="Find test scenarios" />
        ${search ? html`<button onClick=${() => setSearch('')}
          class="btn-clear"
          aria-label="Clear search">✕</button>` : null}
      </div>

      <div class="filter-bar" role="group" aria-label="Filter tests by consistency" style="align-items:center">
        <span class="label-upper" style="align-self:center">Status:</span>
        <button class="filter-chip ${filter === 'inconsistent' ? 'active' : ''}" onClick=${() => setFilter('inconsistent')}>
          <span>Inconsistent</span> <span class="count">${inconsistentTests.length}</span>
        </button>
        <button class="filter-chip failed ${filter === 'degraded' ? 'active' : ''}" onClick=${() => setFilter('degraded')}>
          <span>Degraded</span> <span class="count">${degradedCount}</span>
        </button>
        <button class="filter-chip passed ${filter === 'recovered' ? 'active' : ''}" onClick=${() => setFilter('recovered')}>
          <span>Recovered</span> <span class="count">${recoveredCount}</span>
        </button>
        <div class="sort-group">
          <label class="label-upper" for="consistency-sort-select">Sort:</label>
          <select id="consistency-sort-select" class="sort-select" value=${sort} onChange=${(e: Event) => setSort((e.target as HTMLSelectElement).value)} aria-label="Sort order">
            <option value="category" selected=${sort === 'category'}>Category</option>
            <option value="name" selected=${sort === 'name'}>Name</option>
          </select>
        </div>
      </div>

      <div class="card pb-0">
        <div class="text-muted mb-md">
          Showing ${sortedItems.length} ${sortedItems.length === 1 ? 'test' : 'tests'}
        </div>
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
