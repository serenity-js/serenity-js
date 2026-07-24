import { useCallback, useEffect, useRef } from 'preact/hooks';

interface StickyHeaderOptions<H extends { type: string }> {
    parentRef: { current: HTMLElement | null };
    id: string;
    flatItems: ReadonlyArray<H>;
    enabled: boolean;
    headerHeight: number;
    firstHeaderHeight: number;
    rowHeight: number;
    renderContent: (element: HTMLDivElement, item: H) => void;
}

interface StickyHeaderResult {
    parentRefCallback: (node: HTMLElement | null) => void;
}

interface HeaderPosition<H> {
    index: number;
    start: number;
    item: H;
}

export function computeHeaderPositions<H extends { type: string }>(
    flatItems: ReadonlyArray<H>,
    firstHeaderHeight: number,
    headerHeight: number,
    rowHeight: number,
): Array<HeaderPosition<H>> {
    const headerStarts: Array<HeaderPosition<H>> = [];
    let position = 0;
    for (let i = 0; i < flatItems.length; i++) {
        if (flatItems[i].type === 'header') {
            headerStarts.push({ index: i, start: position, item: flatItems[i] });
        }
        const itemHeaderHeight = i === 0 ? firstHeaderHeight : headerHeight;
        position += flatItems[i].type === 'header' ? itemHeaderHeight : rowHeight;
    }
    return headerStarts;
}

export function findActiveHeader<H>(
    scrollTop: number,
    headerStarts: ReadonlyArray<HeaderPosition<H>>,
): HeaderPosition<H> | null {
    let activeHeader: HeaderPosition<H> | null = null;
    for (const header of headerStarts) {
        if (header.start <= scrollTop) activeHeader = header;
        else break;
    }
    return activeHeader;
}

export function updateStickyElement<H extends { type: string }>(
    stickyElement: HTMLDivElement,
    activeHeader: HeaderPosition<H> | null,
    firstHeaderHeight: number,
    headerHeight: number,
    scrollTop: number,
    renderContent: (element: HTMLDivElement, item: H) => void,
    currentKey: { value: string },
): void {
    const activeHeaderHeight = activeHeader && activeHeader.index === 0 ? firstHeaderHeight : headerHeight;
    if (!activeHeader || scrollTop <= activeHeader.start + activeHeaderHeight) {
        stickyElement.style.display = 'none';
        return;
    }
    stickyElement.style.display = 'block';
    const key = JSON.stringify(activeHeader.item);
    if (currentKey.value !== key) {
        currentKey.value = key;
        renderContent(stickyElement, activeHeader.item);
    }
}

export function useStickyHeader<H extends { type: string }>(options: StickyHeaderOptions<H>): StickyHeaderResult {
    const { parentRef, id, flatItems, enabled, headerHeight, firstHeaderHeight, rowHeight, renderContent } = options;

    const stickyElementRef = useRef<HTMLDivElement | null>(null);
    if (!stickyElementRef.current) {
        stickyElementRef.current = document.createElement('div');
        stickyElementRef.current.id = id;
        stickyElementRef.current.className = 'scenario-group-header';
        stickyElementRef.current.style.cssText = 'display:none;position:sticky;top:0;width:100%;height:46px;flex-shrink:0;z-index:3;background:var(--bg-surface);box-shadow:0 1px 0 var(--border-color);margin-bottom:-46px;padding:var(--space-md) var(--space-md) var(--space-sm);font-size:var(--font-sm);font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px';
    }

    const parentRefCallback = useCallback((node: HTMLElement | null) => {
        parentRef.current = node;
        if (node && enabled) {
            const stickyElement = stickyElementRef.current!;
            if (stickyElement.parentNode !== node) {
                node.insertBefore(stickyElement, node.firstChild);
            }
        }
    }, [enabled]);

    useEffect(() => {
        const element = parentRef.current;
        const stickyElement = stickyElementRef.current!;
        if (!element || !enabled) {
            stickyElement.style.display = 'none';
            return undefined;
        }

        const headerStarts = computeHeaderPositions(flatItems, firstHeaderHeight, headerHeight, rowHeight);
        const currentKey = { value: '' };

        const onScroll = (): void => {
            const scrollTop = element.scrollTop;
            const activeHeader = findActiveHeader(scrollTop, headerStarts);
            updateStickyElement(stickyElement, activeHeader, firstHeaderHeight, headerHeight, scrollTop, renderContent, currentKey);
        };

        element.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => element.removeEventListener('scroll', onScroll);
    }, [enabled, flatItems, headerHeight, firstHeaderHeight, rowHeight, renderContent]);

    return { parentRefCallback };
}
