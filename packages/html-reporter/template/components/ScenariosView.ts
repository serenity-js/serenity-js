/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { defaultRangeExtractor } from '@tanstack/virtual-core';
import htm from 'htm';
import { h } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';

import { useStickyHeader, useVirtualizer } from '../hooks';
import { DATA, formatDuration, formatRunLabel, getBrowserTag, matchesSearch, outcomeClass, outcomeIcon, relativeSourcePath, scenarioUrl } from '../utils';
import { FilterBar } from './FilterBar';
import { RunSelector } from './RunSelector';

const html = htm.bind(h);

// ===== Virtualized Scenario List Component =====
function VirtualScenarioList({ filtered, grouped, sort, onNavigate, runIndex, setSearch }) {
    const parentRef = useRef(null);
    const SCENARIO_ROW_HEIGHT = 108;
    const GROUP_HEADER_HEIGHT_FIRST = 62;
    const GROUP_HEADER_HEIGHT_REST = 78;
    const GROUP_HEADER_CONTENT_HEIGHT = 46;

    const flatItems = useMemo(() => {
        if (sort === 'category') {
            const items = [];
            for (const [category, scenarios] of Object.entries(grouped)) {
                items.push({ type: 'header', category });
                for (const scenario of scenarios) {
                    items.push({ type: 'scenario', scenario });
                }
            }
            return items;
        }
        return filtered.map(scenario => ({ type: 'scenario', scenario }));
    }, [sort, filtered, grouped]);

    const headerIndices = useMemo(() => {
        const indices = [];
        flatItems.forEach((item, i) => {
            if (item.type === 'header') indices.push(i);
        });
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
        if (!defaultRange.includes(activeStickyIndex)) {
            return [activeStickyIndex, ...defaultRange];
        }
        return defaultRange;
    }, [sort, headerIndices]);

    const virtualizer = useVirtualizer({
        count: flatItems.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => flatItems[index].type === 'header' ? (index === 0 ? GROUP_HEADER_HEIGHT_FIRST : GROUP_HEADER_HEIGHT_REST) : SCENARIO_ROW_HEIGHT,
        overscan: 15,
        rangeExtractor,
    });

    const { parentRefCallback } = useStickyHeader({
        parentRef,
        id: 'vs-sticky-header',
        flatItems,
        enabled: sort === 'category',
        headerHeight: GROUP_HEADER_HEIGHT_REST,
        firstHeaderHeight: GROUP_HEADER_HEIGHT_FIRST,
        rowHeight: SCENARIO_ROW_HEIGHT,
        renderContent: (element, item) => {
            element.textContent = item.category.replace(/ › /g, '  ›  ');
        },
    });

    return html`
    <div ref=${parentRefCallback} class="scroll-container">
      <div style="height:${virtualizer.getTotalSize()}px;width:100%;position:relative">
        ${virtualizer.getVirtualItems().map(virtualRow => {
            const item = flatItems[virtualRow.index];
            if (item.type === 'header') {
                const segments = item.category.split(' › ');
                const topOffset = virtualRow.index === 0 ? 0 : 16;
                return html`
              <div style="position:absolute;top:0;left:0;width:100%;height:${GROUP_HEADER_CONTENT_HEIGHT}px;transform:translateY(${virtualRow.start + topOffset}px);background:var(--bg-surface);z-index:1"
                   class="scenario-group-header">
                ${segments.map((segment, index) => html`
                  <span class="clickable" onClick=${() => setSearch('"' + segment + '"')}>${segment}</span>${index < segments.length - 1 ? html`<span class="breadcrumb-sep"> › </span>` : null}
                `)}
              </div>
            `;
            }
            const scenario = item.scenario;
            const clickHandler = () => onNavigate(scenarioUrl(scenario, runIndex));
            const stopProp = (e) => e.stopPropagation();
            return html`
            <div style="position:absolute;top:0;left:0;width:100%;height:${SCENARIO_ROW_HEIGHT}px;transform:translateY(${virtualRow.start}px);overflow:hidden"
                 class="scenario-item" role="button" tabindex="0" onClick=${clickHandler}
                 onKeyDown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clickHandler(); } }}>
              <div class="scenario-outcome-icon ${outcomeClass(scenario.outcome)}">
                ${outcomeIcon(scenario.outcome)}
              </div>
              <div class="scenario-info">
                <div class="scenario-name">${scenario.category ? scenario.category + ' › ' : ''}${scenario.name}</div>
                <div class="scenario-tags">
                  ${getBrowserTag(scenario) ? html`<a href=${'#/tests?search=' + encodeURIComponent('"' + getBrowserTag(scenario) + '"')} class="badge badge-${getBrowserTag(scenario)} badge-link" onClick=${stopProp}>${getBrowserTag(scenario)}</a>` : null}
                  ${scenario.retries > 0 ? html`<span class="retries-badge">${scenario.retries + 1} ${(scenario.retries + 1) === 1 ? 'attempt' : 'attempts'}</span>` : null}
                  ${[...new Map((scenario.tags || []).filter(t => t.type !== 'feature' && t.type !== 'browser').map(t => [t.type + ':' + t.name, t])).values()].map(t => html`<a href=${'#/tests?search=' + encodeURIComponent('"' + t.name + '"')} class="tag-chip tag-chip-sm" onClick=${stopProp}>${t.name}</a>`)}
                </div>
                <div class="scenario-meta">
                  <span class="scenario-source">${relativeSourcePath(scenario)}</span>
                </div>
              </div>
              <span class="scenario-duration">${formatDuration(scenario.duration)}</span>
            </div>
          `;
        })}
      </div>
    </div>
  `;
}

// ===== Test Scenarios List View =====
export function ScenariosView({ onNavigate, route }) {
    const [search, setSearch] = useState(() => {
        const hash = window.location.hash;
        const params = hash.includes('?') ? new URLSearchParams(hash.split('?')[1]) : null;
        return params?.get('search') || '';
    });
    const [filter, setFilter] = useState(() => {
        const hash = window.location.hash;
        const params = hash.includes('?') ? new URLSearchParams(hash.split('?')[1]) : null;
        return params?.get('filter') || 'all';
    });
    const [sort, setSort] = useState(() => {
        const hash = window.location.hash;
        const params = hash.includes('?') ? new URLSearchParams(hash.split('?')[1]) : null;
        return params?.get('sort') || 'category';
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
        let result = DATA.scenarios;
        if (filter && filter !== 'all') {
            const filterMatch = { passed: ['SUCCESS'], failed: ['FAILURE', 'ERROR', 'COMPROMISED'], skipped: ['SKIPPED', 'PENDING'] };
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
            const statusOrder = { FAILURE: 1, ERROR: 2, COMPROMISED: 3, PENDING: 4, SKIPPED: 5, SUCCESS: 6 };
            result = [...result].sort((a, b) => (statusOrder[a.outcome] || 6) - (statusOrder[b.outcome] || 6));
        }
        return result;
    }, [search, filter, sort]);

    // Detect run index from route
    const runParameters = route.includes('?') ? new URLSearchParams(route.split('?')[1]) : null;
    const runString = runParameters ? runParameters.get('run') : null;
    const runIndex = useMemo(() => {
        if (runString === null) return null;
        const byTs = DATA.history.findIndex(r => r.timestamp === runString);
        if (byTs >= 0) return byTs;
        const parsed = parseInt(runString, 10);
        return isNaN(parsed) ? null : parsed;
    }, [runString]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (filter && filter !== 'all') params.set('filter', filter);
        if (sort && sort !== 'category') params.set('sort', sort);
        if (runIndex !== null && DATA.history[runIndex]) params.set('run', DATA.history[runIndex].timestamp);
        const parameterString = params.toString();
        const newHash = parameterString ? '#/tests?' + parameterString : '#/tests';
        if (window.location.hash !== newHash) {
            window.history.replaceState(null, '', newHash);
        }
    }, [search, filter, sort]);

    const grouped = useMemo(() => {
        const groups = {};
        for (const s of filtered) {
            if (!groups[s.category]) groups[s.category] = [];
            groups[s.category].push(s);
        }
        return groups;
    }, [filtered]);

    const historicalRun = (runIndex !== null && runIndex !== DATA.history.length - 1) ? DATA.history[runIndex] : null;

    const activeRunTimestamp = runIndex !== null && DATA.history[runIndex] ? DATA.history[runIndex].timestamp : DATA.history[DATA.history.length - 1]?.timestamp;
    const onRunChange = (e) => {
        const ts = e.target.value;
        const index = DATA.history.findIndex(r => r.timestamp === ts);
        const isLatest = index === DATA.history.length - 1;
        onNavigate(isLatest ? '/tests' : '/tests?run=' + ts);
    };

    const runOutcomes = useMemo(() => {
        if (runIndex !== null && DATA.history[runIndex]) {
            return DATA.history[runIndex].outcomes;
        }
        return DATA.summary.outcomes;
    }, [runIndex]);
    const runTotal = useMemo(() => {
        return Object.values(runOutcomes).reduce((a, b) => a + b, 0);
    }, [runOutcomes]);

    return html`
    <div>
      ${historicalRun ? html`
        <div class="historical-banner">
          <span>Viewing results from: <strong>${formatRunLabel(historicalRun.label, historicalRun.timestamp)}</strong> — ${formatDuration(historicalRun.duration)}</span>
          <a href="#/tests" style="cursor:pointer;color:var(--accent);font-weight:500;text-decoration:underline">show latest</a>
        </div>
      ` : null}

      <${RunSelector} activeTimestamp=${activeRunTimestamp} onRunChange=${onRunChange} />

      <div style="position:relative;margin-bottom:var(--space-md)">
        <input class="search-input" type="text" placeholder="Find test scenarios..."
               value=${search} onInput=${e => setSearch(e.target.value)}
               aria-label="Find test scenarios" style="margin-bottom:0;padding-right:36px" />
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
        <div class="text-muted mb-md">
          Showing ${filtered.length} of ${DATA.scenarios.length} test scenarios
        </div>
        <${VirtualScenarioList} filtered=${filtered} grouped=${grouped} sort=${sort}
          onNavigate=${onNavigate} runIndex=${runIndex} setSearch=${setSearch} />
      </div>
    </div>
  `;
}
