import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

/**
 * Computes the CSS fade class for a horizontally scrollable element
 * based on its current scroll position.
 */
export function computeFadeClass(element: HTMLElement): string {
    const { scrollLeft, scrollWidth, clientWidth } = element;
    const left = scrollLeft > 1;
    const right = scrollLeft + clientWidth < scrollWidth - 1;

    if (left && right) return ' fade-both';
    if (left) return ' fade-left';
    if (right) return ' fade-right';
    return '';
}

function attachScrollListener(element: HTMLElement, handler: () => void): ResizeObserver {
    element.addEventListener('scroll', handler, { passive: true });
    const observer = new ResizeObserver(handler);
    observer.observe(element);
    return observer;
}

function detachScrollListener(element: HTMLElement, handler: () => void, observer: ResizeObserver | null): void {
    element.removeEventListener('scroll', handler);
    if (observer) {
        observer.disconnect();
    }
}

/**
 * Hook that provides scroll-position-aware fade indicators for horizontally scrollable containers.
 * Returns a callback ref to attach to the scrollable element and a CSS class string for the fade state.
 *
 * Uses a callback ref pattern because Preact's `useRef` + `useEffect` can miss the initial element
 * assignment in deeply nested component trees. The callback ref fires reliably when the DOM element
 * is attached or detached.
 */
export function useScrollFade<T extends HTMLElement>(): {
    ref: (element: T | null) => void;
    fadeClass: string;
} {
    const elementRef = useRef<T | null>(null);
    const observerRef = useRef<ResizeObserver | null>(null);
    const [fadeClass, setFadeClass] = useState('');

    const update = useCallback(() => {
        const element = elementRef.current;
        if (!element) return;

        const next = computeFadeClass(element);
        setFadeClass(previous => previous === next ? previous : next);
    }, []);

    const ref = useCallback((element: T | null) => {
        // Clean up previous element
        if (elementRef.current) {
            detachScrollListener(elementRef.current, update, observerRef.current);
            observerRef.current = null;
        }

        elementRef.current = element;

        // Set up new element
        if (element) {
            observerRef.current = attachScrollListener(element, update);
            update();
        } else {
            setFadeClass('');
        }
    }, [update]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (elementRef.current) {
                detachScrollListener(elementRef.current, update, observerRef.current);
            }
        };
    }, [update]);

    return { ref, fadeClass };
}
