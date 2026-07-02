import { defaultRangeExtractor } from '@tanstack/virtual-core';
import htm from 'htm';
import { h } from 'preact';
import { useCallback, useMemo, useRef } from 'preact/hooks';

import type { ReportHistoryEntry, ReportScenario } from '../../src/ReportData';
import { useStickyHeader, useVirtualizer } from '../hooks';
import type { Range } from '../hooks/useVirtualizer';
import { browserBadgeClass, formatDuration, formatRunLabel, getBrowserTag, outcomeClass, outcomeIcon, relativeSourcePath, scenarioUrl } from '../utils';

const html = htm.bind(h);

export interface VirtualScenarioListProps {
    filtered: ReportScenario[];
    grouped: Record<string, ReportScenario[]>;
    sort: string;
    onNavigate: (path: string) => void;
    runIndex: number | null;
    setSearch: (search: string) => void;
    specDirectory?: string;
    history?: ReportHistoryEntry[];
}

export function VirtualScenarioList({ filtered, grouped, sort, onNavigate, runIndex, setSearch, specDirectory, history }: VirtualScenarioListProps): ReturnType<typeof html> {
    const parentRef = useRef<HTMLElement | null>(null);
    const SCENARIO_ROW_HEIGHT = 108;
    const GROUP_HEADER_HEIGHT_FIRST = 62;
    const GROUP_HEADER_HEIGHT_REST = 78;
    const GROUP_HEADER_CONTENT_HEIGHT = 46;

    const flatItems: Array<{ type: 'header'; category: string } | { type: 'scenario'; scenario: ReportScenario }> = useMemo(() => {
        if (sort === 'category') {
            const items: Array<{ type: 'header'; category: string } | { type: 'scenario'; scenario: ReportScenario }> = [];
            for (const [category, scenarios] of Object.entries(grouped)) {
                items.push({ type: 'header', category });
                for (const scenario of scenarios) {
                    items.push({ type: 'scenario', scenario });
                }
            }
            return items;
        }
        return filtered.map(scenario => ({ type: 'scenario' as const, scenario }));
    }, [sort, filtered, grouped]);

    const headerIndices = useMemo(() => {
        const indices: number[] = [];
        flatItems.forEach((item, i) => {
            if (item.type === 'header') indices.push(i);
        });
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
            element.textContent = (item.category as string).replace(/ › /g, '  ›  ');
        },
    });

    return html`
    <div ref=${parentRefCallback} class="scroll-container" tabindex="0" role="list" aria-label="Test scenarios">
      <div style="height:${virtualizer.getTotalSize()}px;width:100%;position:relative">
        ${virtualizer.getVirtualItems().map(virtualRow => {
            const item = flatItems[virtualRow.index];
            if (item.type === 'header') {
                const segments = (item as { type: 'header'; category: string }).category.split(' › ');
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
            const clickHandler = () => onNavigate(scenarioUrl(scenario, runIndex, history));
            const stopProp = (e: Event) => e.stopPropagation();
            return html`
            <div style="position:absolute;top:0;left:0;width:100%;height:${SCENARIO_ROW_HEIGHT}px;transform:translateY(${virtualRow.start}px);overflow:hidden"
                 class="scenario-item" role="button" tabindex="0" onClick=${clickHandler}
                 onKeyDown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clickHandler(); } }}>
              <div class="scenario-outcome-icon ${outcomeClass(scenario.outcome)}">
                ${outcomeIcon(scenario.outcome)}
              </div>
              <div class="scenario-info">
                <div class="scenario-name">${sort !== 'category' && scenario.category ? scenario.category + ' › ' : ''}${scenario.name}</div>
                ${scenario.error ? html`<div class="scenario-error-preview">${scenario.error.message}</div>` : null}
                <div class="scenario-tags">
                  ${getBrowserTag(scenario) ? html`<a href=${'#/tests?search=' + encodeURIComponent('"' + getBrowserTag(scenario)! + '"')} class="badge ${browserBadgeClass(getBrowserTag(scenario)!)} badge-link" onClick=${stopProp}>${getBrowserTag(scenario)}</a>` : null}
                  ${scenario.retries && scenario.retries > 0 ? html`<span class="retries-badge">${scenario.retries + 1} ${(scenario.retries + 1) === 1 ? 'attempt' : 'attempts'}</span>` : null}
                  ${[...new Map((scenario.tags || []).filter(t => t.type !== 'feature' && t.type !== 'browser').map(t => [t.type + ':' + t.name, t])).values()].map(t => html`<a href=${'#/tests?search=' + encodeURIComponent('"' + t.name + '"')} class="tag-chip tag-chip-sm" onClick=${stopProp}>${t.name}</a>`)}
                </div>
                <div class="scenario-meta">
                  <span class="scenario-source">${relativeSourcePath(scenario, specDirectory)}</span>
                  ${scenario.executionHistory && scenario.executionHistory.length > 1 ? html`<span class="scenario-history">${(runIndex !== null ? scenario.executionHistory.slice(0, runIndex + 1) : scenario.executionHistory).slice(-5).map(h => html`<span class="history-dot history-dot--${outcomeClass(h.outcome)}" title=${h.outcome + ' — ' + formatRunLabel(h.run, h.timestamp || '')}></span>`)}</span>` : null}
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
