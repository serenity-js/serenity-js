import type { Range, VirtualItem, VirtualizerOptions as FullVirtualizerOptions } from '@tanstack/virtual-core';
import { elementScroll, observeElementOffset, observeElementRect, Virtualizer } from '@tanstack/virtual-core';
import { useEffect, useRef, useState } from 'preact/hooks';

/**
 * Subset of VirtualizerOptions that callers provide.
 * The hook fills in observeElementRect, observeElementOffset, scrollToFn, and onChange.
 */
interface UseVirtualizerOptions {
    count: number;
    getScrollElement: () => HTMLElement | null;
    estimateSize: (index: number) => number;
    overscan?: number;
    rangeExtractor?: (range: Range) => number[];
}

export function useVirtualizer(options: UseVirtualizerOptions): Virtualizer<HTMLElement, Element> {
    const [, rerender] = useState(0);
    const resolvedOptions: FullVirtualizerOptions<HTMLElement, Element> = {
        ...options,
        // Until the virtualiser measures the scroll container after mounting,
        // assume it's as large as the viewport, so that the first render already includes
        // the rows that will be visible, rather than rendering an empty list first.
        initialRect: { width: window.innerWidth, height: window.innerHeight },
        observeElementRect,
        observeElementOffset,
        scrollToFn: elementScroll,
        onChange: () => {
            rerender(c => c + 1);
        },
    };

    const instanceRef = useRef<Virtualizer<HTMLElement, Element> | null>(null);
    if (!instanceRef.current) {
        instanceRef.current = new Virtualizer(resolvedOptions);
    }
    instanceRef.current.setOptions(resolvedOptions);

    useEffect(() => {
        return instanceRef.current!._didMount();
    }, []);

    useEffect(() => {
        return instanceRef.current!._willUpdate();
    });

    return instanceRef.current;
}

export type { Range, VirtualItem };
