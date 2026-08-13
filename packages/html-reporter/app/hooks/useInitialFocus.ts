import type { RefObject } from 'preact';
import { useEffect } from 'preact/hooks';

export function useInitialFocus(containerRef: RefObject<HTMLElement>, isOpen: boolean): void {
    useEffect(() => {
        if (!isOpen) return undefined;
        const firstInput = containerRef.current?.querySelector<HTMLElement>('input');
        if (firstInput) {
            firstInput.focus();
        } else {
            containerRef.current?.querySelector<HTMLElement>('.bottom-sheet-close')?.focus();
        }
        return undefined;
    }, [isOpen]);
}
