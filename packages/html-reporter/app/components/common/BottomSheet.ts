import htm from 'htm';
import type { ComponentChildren } from 'preact';
import { h } from 'preact';
import { useRef } from 'preact/hooks';

import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { icons } from './icons.js';

const html = htm.bind(h);

export interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ComponentChildren;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps): ReturnType<typeof html> {
    const sheetRef = useRef<HTMLDivElement>(null);

    useFocusTrap(sheetRef, isOpen, onClose);

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
