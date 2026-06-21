/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { defaultRangeExtractor } from '@tanstack/virtual-core';
import htm from 'htm';
import { h } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';

import { useVirtualizer } from '../hooks';
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

    const stickyElementRef = useRef(null);
    if (!stickyElementRef.current) {
        stickyElementRef.current = document.createElement('div');
        stickyElementRef.current.id = 'vs-stability-sticky';
        stickyElementRef.current.className = 'scenario-group-header';
        stickyElementRef.current.style.cssText = 'display:none;position:sticky;top:0;width:100%;height:46px;flex-shrink:0;z-index:3;background:var(--bg-surface);box-shadow:0 1px 0 var(--border-color);margin-bottom:-46px;padding:var(--space-md) var(--space-md) var(--space-sm);font-size:var(--font-sm);font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px';
    }

    const parentRefCallback = useCallback((node) => {
        parentRef.current = node;
        if (node && sort === 'category') {
            const stickyElement = stickyElementRef.current;
            if (stickyElement.parentNode !== node) node.insertBefore(stickyElement, node.firstChild);
        }
    }, [sort]);

    useEffect(() => {
        const element = parentRef.current;
        const stickyElement = stickyElementRef.current;
        if (!element || sort !== 'category') { stickyElement.style.display = 'none'; return; }
        const headerStarts = [];
        let pos = 0;
        for (let i = 0; i < flatItems.length; i++) {
            if (flatItems[i].type === 'header') headerStarts.push({ index: i, start: pos, category: flatItems[i].category });
            const hHeight = i === 0 ? STABILITY_HEADER_HEIGHT_FIRST : STABILITY_HEADER_HEIGHT_REST;
            pos += flatItems[i].type === 'header' ? hHeight : STABILITY_ROW_HEIGHT;
        }
        let currentCategory = '';
        const onScroll = () => {
            const scrollTop = element.scrollTop;
            let activeHeader = null;
            for (const h of headerStarts) { if (h.start <= scrollTop) activeHeader = h; else break; }
            const activeHeaderHeight = activeHeader && activeHeader.index === 0 ? STABILITY_HEADER_HEIGHT_FIRST : STABILITY_HEADER_HEIGHT_REST;
            if (!activeHeader || scrollTop <= activeHeader.start + activeHeaderHeight) { stickyElement.style.display = 'none'; return; }
            stickyElement.style.display = 'block';
            if (currentCategory !== activeHeader.category) {
                currentCategory = activeHeader.category;
                stickyElement.textContent = activeHeader.category.replace(/ › /g, '  ›  ');
            }
        };
        element.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => element.removeEventListener('scroll', onScroll);
    }, [sort, flatItems]);

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
          style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-secondary);font-size:var(--font-lg);padding:4px;line-height:1"
          aria-label="Clear search">✕</button>` : null}
      </div>

      <div style="display:flex;gap:var(--space-sm);margin-bottom:var(--space-md);flex-wrap:wrap;align-items:center">
        <span style="font-size:var(--font-xs);font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">State:</span>
        <button class="filter-chip ${filter === 'unstable' ? 'active' : ''}" onClick=${() => setFilter('unstable')}>
          Unstable <span class="count">${flaky.length}</span>
        </button>
        <button class="filter-chip failed ${filter === 'degraded' ? 'active' : ''}" onClick=${() => setFilter('degraded')}>
          Degraded <span class="count">${degradedCount}</span>
        </button>
        <button class="filter-chip passed ${filter === 'recovered' ? 'active' : ''}" onClick=${() => setFilter('recovered')}>
          Recovered <span class="count">${recoveredCount}</span>
        </button>
        <div class="sort-group">
          <label style="font-size:var(--font-xs);font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px" for="stability-sort-select">Sort:</label>
          <select id="stability-sort-select" class="sort-select" value=${sort} onChange=${(e) => setSort(e.target.value)} aria-label="Sort order">
            <option value="category" selected=${sort === 'category'}>Category</option>
            <option value="name" selected=${sort === 'name'}>Name</option>
          </select>
        </div>
      </div>

      <div class="card" style="padding-bottom:0">
        <div style="font-size:var(--font-sm);color:var(--text-secondary);margin-bottom:var(--space-md)">
          Showing ${sortedItems.length} ${sortedItems.length === 1 ? 'test' : 'tests'}
        </div>
        <div ref=${parentRefCallback} style="max-height:calc(100vh - 380px);overflow-y:auto;position:relative">
          <div style="height:${virtualizer.getTotalSize()}px;width:100%;position:relative">
            ${virtualizer.getVirtualItems().map(virtualRow => {
                const flatItem = flatItems[virtualRow.index];
                if (flatItem.type === 'header') {
                    const topOffset = virtualRow.index === 0 ? 0 : 16;
                    return html`
                  <div style="position:absolute;top:0;left:0;width:100%;height:${STABILITY_HEADER_CONTENT_HEIGHT}px;transform:translateY(${virtualRow.start + topOffset}px);background:var(--bg-surface);z-index:1"
                       class="scenario-group-header">
                    ${flatItem.category.split(' › ').map((segment, index, array) => html`
                      <span style="cursor:pointer" onClick=${() => setSearch('"' + segment + '"')}>${segment}</span>${index < array.length - 1 ? html`<span style="margin:0 4px;text-decoration:none;cursor:default"> › </span>` : null}
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
                  <div class="scenario-info" style="flex:1;min-width:0">
                    <div class="scenario-name">${t.name}</div>
                    <div class="scenario-meta">
                      <span class="scenario-source">${t.source.path}:${t.source.line}</span>
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
