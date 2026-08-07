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

interface KeyContext {
    items: HTMLElement[];
    currentItem: HTMLElement | null;
    currentIndex: number;
    container: HTMLElement;
}

function navigateDown(items: HTMLElement[], currentIndex: number): void {
    if (currentIndex < items.length - 1) {
        items[currentIndex + 1]?.focus();
    }
}

function navigateUp(items: HTMLElement[], currentIndex: number): void {
    if (currentIndex > 0) {
        items[currentIndex - 1]?.focus();
    }
}

function expandOrDescend(currentItem: HTMLElement | null): void {
    if (!currentItem) return;
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

function collapseOrAscend(currentItem: HTMLElement | null, container: HTMLElement): void {
    if (!currentItem) return;
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

function focusFirst(items: HTMLElement[]): void {
    items[0]?.focus();
}

function focusLast(items: HTMLElement[]): void {
    items[items.length - 1]?.focus();
}

function toggleExpansion(currentItem: HTMLElement | null): boolean {
    if (currentItem?.getAttribute('aria-expanded') !== undefined && currentItem?.getAttribute('aria-expanded') !== null) {
        const row = currentItem.querySelector('.activity-row') as HTMLElement;
        row?.click();
        return true;
    }
    return false;
}

const preventDefaultHandlers: Record<string, (ctx: KeyContext) => void> = {
    ArrowDown: ctx => navigateDown(ctx.items, ctx.currentIndex),
    ArrowUp: ctx => navigateUp(ctx.items, ctx.currentIndex),
    ArrowRight: ctx => expandOrDescend(ctx.currentItem),
    ArrowLeft: ctx => collapseOrAscend(ctx.currentItem, ctx.container),
    Home: ctx => focusFirst(ctx.items),
    End: ctx => focusLast(ctx.items),
};

/**
 * Handles keyboard navigation within an activity tree, implementing
 * the ARIA tree pattern (ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, End, Enter/Space).
 */
export function handleTreeKeyDown(e: KeyboardEvent, container: HTMLElement): void {
    const items = getVisibleTreeItems(container);
    const active = document.activeElement as HTMLElement;
    const currentItem = active?.closest('[role="treeitem"]') as HTMLElement | null;
    const currentIndex = currentItem ? items.indexOf(currentItem) : -1;

    const ctx: KeyContext = { items, currentItem, currentIndex, container };

    const handler = preventDefaultHandlers[e.key];
    if (handler) {
        e.preventDefault();
        handler(ctx);
        return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
        if (toggleExpansion(currentItem)) {
            e.preventDefault();
        }
    }
}
