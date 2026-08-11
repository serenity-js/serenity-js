import type { RefObject } from 'preact';
import { useEffect } from 'preact/hooks';

export function useKeyboardTrap(containerRef: RefObject<HTMLElement>, isOpen: boolean, onClose: () => void): void {
    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key === 'Tab') {
                trapTabFocus(containerRef.current, e);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
}

function trapTabFocus(container: HTMLElement | null, e: KeyboardEvent): void {
    if (!container) return;
    const focusable = container.querySelectorAll<HTMLElement>(
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
