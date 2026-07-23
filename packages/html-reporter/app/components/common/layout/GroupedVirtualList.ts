import { defaultRangeExtractor } from '@tanstack/virtual-core';
import htm from 'htm';
import { h } from 'preact';
import { useCallback, useMemo, useRef } from 'preact/hooks';

import { GROUP_HEADER_HEIGHTS } from '../../../config/layout';
import { useStickyHeader, useVirtualizer } from '../../../hooks';
import type { Range } from '../../../hooks/useVirtualizer';

const html = htm.bind(h);

export interface GroupedVirtualListProps<T, H = { category: string }> {
    /** Items to render */
    items: T[];

    /** Returns the group key for an item (for sticky headers). Omit for flat lists. */
    groupBy?: (item: T) => string;

    /** Pixel height of a single item row. Must match the CSS. */
    rowHeight: number;

    /** Renders a single item row. */
    renderItem: (item: T, index: number) => ReturnType<typeof html>;

    /** Renders a group header. Receives the group key. */
    renderGroupHeader?: (group: string) => ReturnType<typeof html>;

    /** Shown when items array is empty. */
    renderEmpty?: () => ReturnType<typeof html>;

    /** Height of the first group header. Default: GROUP_HEADER_HEIGHTS.first (62) */
    firstHeaderHeight?: number;

    /** Height of subsequent group headers. Default: GROUP_HEADER_HEIGHTS.rest (78) */
    headerHeight?: number;

    /** Number of items to render beyond the visible area. Default: 15 */
    overscan?: number;

    /** Unique ID for the sticky header DOM element. */
    id?: string;

    /** Aria label for the scroll container. */
    ariaLabel?: string;

    /** Computes additional header data for each group. Used by renderStickyContent. */
    groupHeaderData?: (groupKey: string, groupItems: T[]) => H;

    /** Custom content to render inside the sticky header. Called with (element, headerData). */
    renderStickyContent?: (element: HTMLDivElement, header: H & { type: 'header'; category: string }) => void;
}

type FlatItem<T, H> = { type: 'header'; category: string } & H | { type: 'item'; item: T };

export function GroupedVirtualList<T, H = { category: string }>({
    items,
    groupBy,
    rowHeight,
    renderItem,
    renderGroupHeader,
    renderEmpty,
    firstHeaderHeight = GROUP_HEADER_HEIGHTS.first,
    headerHeight = GROUP_HEADER_HEIGHTS.rest,
    overscan = 15,
    id = 'grouped-virtual-list',
    ariaLabel,
    groupHeaderData,
    renderStickyContent,
}: GroupedVirtualListProps<T, H>): ReturnType<typeof html> {
    const parentRef = useRef<HTMLElement | null>(null);

    const flatItems: Array<FlatItem<T, H>> = useMemo(() => {
        if (!groupBy) {
            return items.map(item => ({ type: 'item' as const, item }));
        }
        const groups: Record<string, T[]> = {};
        for (const item of items) {
            const key = groupBy(item);
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        }
        const result: Array<FlatItem<T, H>> = [];
        for (const [category, groupItems] of Object.entries(groups)) {
            const headerData = groupHeaderData ? groupHeaderData(category, groupItems) : {} as H;
            result.push({ type: 'header', category, ...headerData } as FlatItem<T, H>);
            for (const item of groupItems) {
                result.push({ type: 'item', item });
            }
        }
        return result;
    }, [items, groupBy, groupHeaderData]);

    const headerIndices = useMemo(() => {
        const indices: number[] = [];
        flatItems.forEach((item, i) => {
            if (item.type === 'header') indices.push(i);
        });
        return indices;
    }, [flatItems]);

    const activeStickyRef = useRef(-1);

    const rangeExtractor = useCallback((range: Range) => {
        if (!groupBy || headerIndices.length === 0) {
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
    }, [groupBy, headerIndices]);

    const virtualizer = useVirtualizer({
        count: flatItems.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => {
            if (flatItems[index].type === 'header') {
                return index === 0 ? firstHeaderHeight : headerHeight;
            }
            return rowHeight;
        },
        overscan,
        rangeExtractor,
    });

    const defaultRenderStickyContent = useCallback((element: HTMLDivElement, item: FlatItem<T, H>) => {
        if (item.type === 'header') {
            element.textContent = item.category.replace(/ › /g, '  ›  ');
        }
    }, []);

    const { parentRefCallback } = useStickyHeader({
        parentRef,
        id,
        flatItems,
        enabled: !!groupBy && headerIndices.length > 0,
        headerHeight,
        firstHeaderHeight,
        rowHeight,
        renderContent: renderStickyContent || defaultRenderStickyContent,
    });

    if (items.length === 0 && renderEmpty) {
        return renderEmpty();
    }

    return html`
    <div ref=${parentRefCallback} class="scroll-container" tabindex="0"
         role="list" aria-label=${ariaLabel || 'List'}>
      <div style="height:${virtualizer.getTotalSize()}px;width:100%;position:relative">
        ${virtualizer.getVirtualItems().map(virtualRow => {
            const flatItem = flatItems[virtualRow.index];
            if (flatItem.type === 'header') {
                const topOffset = virtualRow.index === 0 ? 0 : 16;
                return html`
              <div style="position:absolute;top:0;left:0;width:100%;height:${GROUP_HEADER_HEIGHTS.content}px;transform:translateY(${virtualRow.start + topOffset}px);background:var(--bg-surface);z-index:1"
                   class="scenario-group-header">
                ${renderGroupHeader ? renderGroupHeader(flatItem.category) : html`<span>${flatItem.category}</span>`}
              </div>
            `;
            }
            const itemData = flatItem as { type: 'item'; item: T };
            return html`
            <div style="position:absolute;top:0;left:0;width:100%;height:${rowHeight}px;transform:translateY(${virtualRow.start}px);overflow:hidden">
              ${renderItem(itemData.item, virtualRow.index)}
            </div>
          `;
        })}
      </div>
    </div>
  `;
}
