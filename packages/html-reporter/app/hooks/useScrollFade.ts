import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

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

        const { scrollLeft, scrollWidth, clientWidth } = element;
        const left = scrollLeft > 1;
        const right = scrollLeft + clientWidth < scrollWidth - 1;

        const next = (left && right) ? ' fade-both' : left ? ' fade-left' : right ? ' fade-right' : '';

        setFadeClass(previous => previous === next ? previous : next);
    }, []);

    const ref = useCallback((element: T | null) => {
        // Clean up previous element
        if (elementRef.current) {
            elementRef.current.removeEventListener('scroll', update);
        }
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        elementRef.current = element;

        // Set up new element
        if (element) {
            element.addEventListener('scroll', update, { passive: true });
            observerRef.current = new ResizeObserver(update);
            observerRef.current.observe(element);
            update();
        } else {
            setFadeClass('');
        }
    }, [update]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (elementRef.current) {
                elementRef.current.removeEventListener('scroll', update);
            }
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [update]);

    return { ref, fadeClass };
}
