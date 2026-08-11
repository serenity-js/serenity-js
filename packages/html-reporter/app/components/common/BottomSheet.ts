import htm from 'htm';
import type { ComponentChildren } from 'preact';
import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import { icons } from './icons.js';

const html = htm.bind(h);

export interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ComponentChildren;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps): ReturnType<typeof html> {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);

    // Focus the first input (search) on mount, falling back to close button
    useEffect(() => {
        if (!isOpen) return undefined;
        const firstInput = sheetRef.current?.querySelector<HTMLElement>('input');
        if (firstInput) {
            firstInput.focus();
        } else {
            closeButtonRef.current?.focus();
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

            if (e.key === 'Tab' && sheetRef.current) {
                const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
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

    const titleId = 'bottom-sheet-title';

    return html`
        <div class="bottom-sheet-backdrop" onClick=${onClose}></div>
        <div class="bottom-sheet"
             ref=${sheetRef}
             role="dialog"
             aria-modal="true"
             aria-labelledby=${titleId}
             data-testid="bottom-sheet">
            <div class="bottom-sheet-header">
                <span class="bottom-sheet-title" id=${titleId}>${title}</span>
                <button class="bottom-sheet-close"
                        ref=${closeButtonRef}
                        onClick=${onClose}
                        aria-label="Close">
                    ${icons.close}
                </button>
            </div>
            <div class="bottom-sheet-body">
                ${children}
            </div>
        </div>
    `;
}
