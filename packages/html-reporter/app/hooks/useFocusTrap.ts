import type { RefObject } from 'preact';

import { useInitialFocus } from './useInitialFocus.js';
import { useKeyboardTrap } from './useKeyboardTrap.js';

export function useFocusTrap(containerRef: RefObject<HTMLElement>, isOpen: boolean, onClose: () => void): void {
    useInitialFocus(containerRef, isOpen);
    useKeyboardTrap(containerRef, isOpen, onClose);
}
