import type { RefObject } from 'preact';
import { useEffect } from 'preact/hooks';

export function useFocusTrap(containerRef: RefObject<HTMLElement>, isOpen: boolean, onClose: () => void): void {
    // Focus the first input on mount, falling back to close button
    useEffect(() => {
        if (!isOpen) return undefined;
        const firstInput = containerRef.current?.querySelector<HTMLElement>('input');
        if (firstInput) {
            firstInput.focus();
        } else {
            const closeButton = containerRef.current?.querySelector<HTMLElement>('.bottom-sheet-close');
            closeButton?.focus();
        }
        return undefined;
    }, [isOpen]);

    // Keyboard handling: Escape to close, Tab trap
    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }

            if (e.key === 'Tab' && containerRef.current) {
                const focusable = containerRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusable.length === 0) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
}
