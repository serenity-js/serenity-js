/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { defaultRangeExtractor } from '@tanstack/virtual-core';
import htm from 'htm';
import { h } from 'preact';
import { useCallback, useMemo, useRef, useState } from 'preact/hooks';

import { useStickyHeader, useVirtualizer } from '../hooks';
import { DATA, matchesSearch, outcomeClass, scenarioUrl } from '../utils';
import { icons } from './icons';

const html = htm.bind(h);

export function StabilityView({ onNavigate }) {
    const flaky = DATA.unstableTests || [];

    const [filter, setFilter] = useState('unstable');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('category');

    if (flaky.length === 0) {
        return html`
      <div class="placeholder-view">
        ${icons.flaky}
        <h2>All Tests Stable</h2>
        <p>No unstable results detected.<br/>Run your test suite several times to populate history.</p>
      </div>
    `;
    }

    const allUnstable = useMemo(() => flaky.map(t => {
        const lastOutcome = t.history && t.history.length > 0 ? t.history[t.history.length - 1] : null;
        const kind = lastOutcome === 'SUCCESS' ? 'recovered' : 'degraded';
        return { ...t, kind };
    }), []);

    const degradedCount = allUnstable.filter(t => t.kind === 'degraded').length;
    const recoveredCount = allUnstable.filter(t => t.kind === 'recovered').length;

    const allItems = useMemo(() => {
        if (filter === 'degraded') return allUnstable.filter(t => t.kind === 'degraded');
        if (filter === 'recovered') return allUnstable.filter(t => t.kind === 'recovered');
        return allUnstable;
    }, [filter, allUnstable]);

    const searchedItems = useMemo(() => {
        if (!search) return allItems;
        return allItems.filter(t => matchesSearch(t, search));
    }, [allItems, search]);

    const sortedItems = useMemo(() => {
        if (sort === 'name') return [...searchedItems].sort((a, b) => a.name.localeCompare(b.name));
        return [...searchedItems].sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    }, [searchedItems, sort]);

    const STABILITY_ROW_HEIGHT = 56;
    const STABILITY_HEADER_HEIGHT_FIRST = 62;
    const STABILITY_HEADER_HEIGHT_REST = 78;
    const STABILITY_HEADER_CONTENT_HEIGHT = 46;

    const flatItems = useMemo(() => {
        if (sort !== 'category') return sortedItems.map(t => ({ type: 'scenario', item: t }));
        const groups = {};
        for (const t of sortedItems) {
            const cat = t.category || 'Uncategorised';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(t);
        }
        const result = [];
        for (const [category, tests] of Object.entries(groups)) {
            result.push({ type: 'header', category });
            for (const t of tests) result.push({ type: 'scenario', item: t });
        }
        return result;
    }, [sortedItems, sort]);

    const parentRef = useRef(null);
    const headerIndices = useMemo(() => {
        const indices = [];
        flatItems.forEach((item, i) => { if (item.type === 'header') indices.push(i); });
        return indices;
    }, [flatItems]);

    const activeStickyRef = useRef(-1);
    const rangeExtractor = useCallback((range) => {
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
            if (flatItems[index].type !== 'header') return STABILITY_ROW_HEIGHT;
            return index === 0 ? STABILITY_HEADER_HEIGHT_FIRST : STABILITY_HEADER_HEIGHT_REST;
        },
        overscan: 15,
        rangeExtractor,
    });

    const { parentRefCallback } = useStickyHeader({
        parentRef,
        id: 'vs-stability-sticky',
        flatItems,
        enabled: sort === 'category',
        headerHeight: STABILITY_HEADER_HEIGHT_REST,
        firstHeaderHeight: STABILITY_HEADER_HEIGHT_FIRST,
        rowHeight: STABILITY_ROW_HEIGHT,
        renderContent: (element, item) => {
            element.textContent = item.category.replace(/ › /g, '  ›  ');
        },
    });

    const kindIcon = (kind) => {
        if (kind === 'degraded') return html`<span class="scenario-outcome-icon failed">✗</span>`;
        return html`<span class="scenario-outcome-icon pending">⚡</span>`;
    };

    const kindLabel = (kind) => {
        if (kind === 'degraded') return 'currently failing';
        if (kind === 'recovered') return 'currently passing';
        return '';
    };

    return html`
    <div>
      <div style="position:relative;margin-bottom:var(--space-md)">
        <input class="search-input" type="text" placeholder="Find test scenarios..."
               value=${search} onInput=${e => setSearch(e.target.value)}
               aria-label="Find test scenarios" style="margin-bottom:0;padding-right:36px" />
        ${search ? html`<button onClick=${() => setSearch('')}
          class="btn-clear"
          aria-label="Clear search">✕</button>` : null}
      </div>

      <div class="filter-bar" role="group" aria-label="Filter tests by stability" style="align-items:center">
        <span style="font-size:var(--font-xs);font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;align-self:center">Status:</span>
        <button class="filter-chip ${filter === 'unstable' ? 'active' : ''}" onClick=${() => setFilter('unstable')}>
          <span>Unstable</span> <span class="count">${flaky.length}</span>
        </button>
        <button class="filter-chip failed ${filter === 'degraded' ? 'active' : ''}" onClick=${() => setFilter('degraded')}>
          <span>Degraded</span> <span class="count">${degradedCount}</span>
        </button>
        <button class="filter-chip passed ${filter === 'recovered' ? 'active' : ''}" onClick=${() => setFilter('recovered')}>
          <span>Recovered</span> <span class="count">${recoveredCount}</span>
        </button>
        <div class="sort-group">
          <label class="label-upper" for="stability-sort-select">Sort:</label>
          <select id="stability-sort-select" class="sort-select" value=${sort} onChange=${(e) => setSort(e.target.value)} aria-label="Sort order">
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
                    return html`
                  <div style="position:absolute;top:0;left:0;width:100%;height:${STABILITY_HEADER_CONTENT_HEIGHT}px;transform:translateY(${virtualRow.start + topOffset}px);background:var(--bg-surface);z-index:1"
                       class="scenario-group-header">
                    ${flatItem.category.split(' › ').map((segment, index, array) => html`
                      <span class="clickable" onClick=${() => setSearch('"' + segment + '"')}>${segment}</span>${index < array.length - 1 ? html`<span style="margin:0 4px;text-decoration:none;cursor:default"> › </span>` : null}
                    `)}
                  </div>
                `;
                }
                const t = flatItem.item;
                const clickHandler = () => onNavigate(scenarioUrl(t));
                return html`
                <div style="position:absolute;top:0;left:0;width:100%;height:${STABILITY_ROW_HEIGHT}px;transform:translateY(${virtualRow.start}px);overflow:hidden"
                     class="scenario-item" onClick=${clickHandler}>
                  ${kindIcon(t.kind)}
                  <div class="scenario-info flex-1">
                    <div class="scenario-name">${t.name}</div>
                    <div class="scenario-meta">
                      <span class="scenario-source">${t.source.line ? t.source.path + ':' + t.source.line : t.source.path}</span>
                      ${kindLabel(t.kind) ? html`<span style="color:var(--text-disabled)">•</span><span>${kindLabel(t.kind)}</span>` : null}
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:var(--space-md);flex-shrink:0">
                    ${t.history ? html`
                      <div style="display:flex;gap:2px;align-items:center">
                        ${t.history.map((outcome, index) => {
                            const runClickHandler = (e) => { e.stopPropagation(); onNavigate(scenarioUrl(t) + '?run=' + index); };
                            return html`<div style="width:12px;height:12px;border-radius:2px;background:var(--color-${outcomeClass(outcome)});opacity:0.85;cursor:pointer" title="${t.labels[index]}: ${outcome}" onClick=${runClickHandler}></div>`;
                        })}
                      </div>
                    ` : null}
                    ${t.flakinessRate !== undefined ? html`
                      <div style="text-align:right;min-width:44px" title="Failure ratio: ${Math.round(t.flakinessRate * 100)}%">
                        <div style="font-size:var(--font-md);font-weight:700;color:var(--color-pending)">${Math.round(t.flakinessRate * 100)}%</div>
                      </div>
                    ` : null}
                  </div>
                </div>
              `;
            })}
          </div>
        </div>
      </div>
    </div>
  `;
}
