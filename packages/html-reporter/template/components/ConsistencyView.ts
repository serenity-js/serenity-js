import { defaultRangeExtractor } from '@tanstack/virtual-core';
import htm from 'htm';
import { h } from 'preact';
import { useCallback, useMemo, useRef, useState } from 'preact/hooks';

import type { ReportInconsistentTest } from '../../src/ReportData';
import { useStickyHeader, useVirtualizer } from '../hooks';
import type { Range } from '../hooks/useVirtualizer';
import { browserBadgeClass, getBrowserTag, matchesSearch, outcomeClass, relativeSourcePath, scenarioUrl } from '../utils';
import { icons } from './icons';

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

    const CONSISTENCY_ROW_HEIGHT = 88;
    const CONSISTENCY_HEADER_HEIGHT_FIRST = 62;
    const CONSISTENCY_HEADER_HEIGHT_REST = 78;
    const CONSISTENCY_HEADER_CONTENT_HEIGHT = 46;

    const flatItems: Array<{ type: 'header'; category: string } | { type: 'scenario'; item: ReportInconsistentTest & { kind: string } }> = useMemo(() => {
        if (sort !== 'category') return sortedItems.map(t => ({ type: 'scenario' as const, item: t }));
        const groups: Record<string, Array<ReportInconsistentTest & { kind: string }>> = {};
        for (const t of sortedItems) {
            const cat = t.category || 'Uncategorised';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(t);
        }
        const result: Array<{ type: 'header'; category: string } | { type: 'scenario'; item: ReportInconsistentTest & { kind: string } }> = [];
        for (const [category, tests] of Object.entries(groups)) {
            result.push({ type: 'header', category });
            for (const t of tests) result.push({ type: 'scenario', item: t });
        }
        return result;
    }, [sortedItems, sort]);

    const parentRef = useRef<HTMLElement | null>(null);
    const headerIndices = useMemo(() => {
        const indices: number[] = [];
        flatItems.forEach((item, i) => { if (item.type === 'header') indices.push(i); });
        return indices;
    }, [flatItems]);

    const activeStickyRef = useRef(-1);
    const rangeExtractor = useCallback((range: Range) => {
        if (sort !== 'category' || headerIndices.length === 0) {
            activeStickyRef.current = -1;
            return defaultRangeExtractor(range);
        }
        let activeStickyIndex = headerIndices[0];
        for (const index of headerIndices) {
            if (index > range.startIndex) break;
            activeStickyIndex = index;
        }
        activeStickyRef.current = activeStickyIndex;
        const defaultRange = defaultRangeExtractor(range);
        if (!defaultRange.includes(activeStickyIndex)) return [activeStickyIndex, ...defaultRange];
        return defaultRange;
    }, [sort, headerIndices]);

    const virtualizer = useVirtualizer({
        count: flatItems.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => {
            if (flatItems[index].type !== 'header') return CONSISTENCY_ROW_HEIGHT;
            return index === 0 ? CONSISTENCY_HEADER_HEIGHT_FIRST : CONSISTENCY_HEADER_HEIGHT_REST;
        },
        overscan: 15,
        rangeExtractor,
    });

    const { parentRefCallback } = useStickyHeader({
        parentRef,
        id: 'vs-consistency-sticky',
        flatItems,
        enabled: sort === 'category',
        headerHeight: CONSISTENCY_HEADER_HEIGHT_REST,
        firstHeaderHeight: CONSISTENCY_HEADER_HEIGHT_FIRST,
        rowHeight: CONSISTENCY_ROW_HEIGHT,
        renderContent: (element, item) => {
            element.textContent = (item.category as string).replace(/ › /g, '  ›  ');
        },
    });

    const kindIcon = (kind: string) => {
        if (kind === 'degraded') return html`<span class="scenario-outcome-icon failed">✗</span>`;
        if (kind === 'recovered') return html`<span class="scenario-outcome-icon passed">✓</span>`;
        return html`<span class="scenario-outcome-icon pending">⚠</span>`;
    };

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
        <div ref=${parentRefCallback} class="scroll-container">
          <div style="height:${virtualizer.getTotalSize()}px;width:100%;position:relative">
            ${virtualizer.getVirtualItems().map(virtualRow => {
                const flatItem = flatItems[virtualRow.index];
                if (flatItem.type === 'header') {
                    const topOffset = virtualRow.index === 0 ? 0 : 16;
                    const headerItem = flatItem as { type: 'header'; category: string };
                    return html`
                  <div style="position:absolute;top:0;left:0;width:100%;height:${CONSISTENCY_HEADER_CONTENT_HEIGHT}px;transform:translateY(${virtualRow.start + topOffset}px);background:var(--bg-surface);z-index:1"
                       class="scenario-group-header">
                    ${headerItem.category.split(' › ').map((segment, index, array) => html`
                      <span class="clickable" onClick=${() => setSearch('"' + segment + '"')}>${segment}</span>${index < array.length - 1 ? html`<span style="margin:0 4px;text-decoration:none;cursor:default"> › </span>` : null}
                    `)}
                  </div>
                `;
                }
                const t = flatItem.item;
                const clickHandler = () => onNavigate(scenarioUrl(t));
                return html`
                <div style="position:absolute;top:0;left:0;width:100%;height:${CONSISTENCY_ROW_HEIGHT}px;transform:translateY(${virtualRow.start}px);overflow:hidden"
                     class="scenario-item" role="button" tabindex="0" onClick=${clickHandler}
                     onKeyDown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clickHandler(); } }}>
                  ${kindIcon(t.kind)}
                  <div class="scenario-info">
                    <div class="scenario-name">${t.name}</div>
                    <div class="scenario-meta">
                      ${getBrowserTag(t) ? html`<span class="badge ${browserBadgeClass(getBrowserTag(t)!)}">${getBrowserTag(t)}</span>` : null}
                      ${(t.tags || []).filter(tag => tag.type === 'project').map(tag => html`<span class="badge">${tag.name}</span>`)}
                      <span class="scenario-source">${relativeSourcePath(t, specDirectory)}</span>
                      ${t.history && t.history.length > 1 ? html`<span class="scenario-history">${t.history.slice(-5).map((outcome, i) => html`<span class="history-dot history-dot--${outcomeClass(outcome)}" title=${outcome + (t.labels && t.labels[i] ? ' (' + t.labels[i] + ')' : '')}></span>`)}</span>` : null}
                    </div>
                  </div>
                  <span class="scenario-duration" style="color:var(--color-pending)">${Math.round(t.inconsistencyRate * 100)}%</span>
                </div>
              `;
            })}
          </div>
        </div>
      </div>
    </div>
  `;
}
