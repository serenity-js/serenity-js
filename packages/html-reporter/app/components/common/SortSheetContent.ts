import htm from 'htm';
import { h } from 'preact';

const html = htm.bind(h);

export interface SortOption {
    key: string;
    label: string;
}

export interface SortSheetContentProps {
    sortOptions: SortOption[];
    activeSort: string;
    onSort: (sort: string) => void;
    sortLabel?: string;
}

export function SortSheetContent({ sortOptions, activeSort, onSort, sortLabel }: SortSheetContentProps): ReturnType<typeof html> {
    const label = sortLabel || 'Sort by';

    return html`
        <div data-testid="sort-sheet-content">
            <div class="sort-sheet-label">${label}</div>
            <div class="sort-sheet-options" role="group" aria-label=${label}>
                ${sortOptions.map(option => html`
                    <button class="sort-sheet-option"
                            aria-pressed=${activeSort === option.key}
                            onClick=${() => onSort(option.key)}>
                        ${option.label}
                    </button>
                `)}
            </div>
        </div>
    `;
}
