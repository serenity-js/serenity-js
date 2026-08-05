/**
 * Returns all visible treeitem elements (those not inside a collapsed ancestor).
 * A treeitem is visible if none of its ancestor treeitems have aria-expanded="false".
 */
function getVisibleTreeItems(container: HTMLElement): HTMLElement[] {
    const all = container.querySelectorAll<HTMLElement>('[role="treeitem"]');
    return Array.from(all).filter(item => {
        let element: HTMLElement | null = item.parentElement;
        while (element && element !== container) {
            if (element.getAttribute('role') === 'treeitem' && element.getAttribute('aria-expanded') === 'false') {
                return false;
            }
            element = element.parentElement;
        }
        return true;
    });
}

/**
 * Handles keyboard navigation within an activity tree, implementing
 * the ARIA tree pattern (ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, End, Enter/Space).
 */
export function handleTreeKeyDown(e: KeyboardEvent, container: HTMLElement): void {
    const items = getVisibleTreeItems(container);
    const active = document.activeElement as HTMLElement;
    const currentItem = active?.closest('[role="treeitem"]') as HTMLElement | null;
    const currentIndex = currentItem ? items.indexOf(currentItem) : -1;

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            if (currentIndex < items.length - 1) {
                items[currentIndex + 1]?.focus();
            }
            break;
        case 'ArrowUp':
            e.preventDefault();
            if (currentIndex > 0) {
                items[currentIndex - 1]?.focus();
            }
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (currentItem) {
                const isExpanded = currentItem.getAttribute('aria-expanded');
                if (isExpanded === 'false') {
                    const row = currentItem.querySelector('.activity-row') as HTMLElement;
                    row?.click();
                } else if (isExpanded === 'true') {
                    const group = currentItem.querySelector('[role="group"]');
                    const firstChild = group?.querySelector('[role="treeitem"]') as HTMLElement;
                    firstChild?.focus();
                }
            }
            break;
        case 'ArrowLeft':
            e.preventDefault();
            if (currentItem) {
                const isExpanded = currentItem.getAttribute('aria-expanded');
                if (isExpanded === 'true') {
                    const row = currentItem.querySelector('.activity-row') as HTMLElement;
                    row?.click();
                } else {
                    const parent = currentItem.parentElement?.closest('[role="treeitem"]') as HTMLElement;
                    if (parent && container.contains(parent)) {
                        parent.focus();
                    }
                }
            }
            break;
        case 'Home':
            e.preventDefault();
            items[0]?.focus();
            break;
        case 'End':
            e.preventDefault();
            items[items.length - 1]?.focus();
            break;
        case 'Enter':
        case ' ':
            if (currentItem?.getAttribute('aria-expanded') !== undefined && currentItem?.getAttribute('aria-expanded') !== null) {
                e.preventDefault();
                const row = currentItem.querySelector('.activity-row') as HTMLElement;
                row?.click();
            }
            break;
    }
}
