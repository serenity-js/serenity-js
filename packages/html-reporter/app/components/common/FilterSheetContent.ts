import htm from 'htm';
import { h } from 'preact';

import type { FilterDefinition } from './FilterBar.js';
import { FilterBar } from './FilterBar.js';
import { SearchInput } from './SearchInput.js';

const html = htm.bind(h);

export interface FilterSheetContentProps {
    search: string;
    onSearch: (value: string) => void;
    filters?: FilterDefinition[];
    activeFilter?: string;
    onFilter?: (filter: string) => void;
    filteredCount: number;
    totalCount: number;
    multiSelect?: boolean;
    ariaLabel?: string;
    searchPlaceholder?: string;
}

export function FilterSheetContent({ search, onSearch, filters, activeFilter, onFilter, filteredCount, totalCount, multiSelect, ariaLabel, searchPlaceholder }: FilterSheetContentProps): ReturnType<typeof html> {
    const isFiltered = filteredCount < totalCount;
    const countText = isFiltered
        ? `Matched ${filteredCount} of ${totalCount}`
        : `Showing all of ${totalCount}`;

    const resetFilters = () => {
        onSearch('');
        if (onFilter) onFilter('all');
    };

    return html`
        <div data-testid="filter-sheet-content">
            <${SearchInput}
                value=${search}
                onInput=${onSearch}
                placeholder=${searchPlaceholder}
                ariaLabel=${ariaLabel}
            />
            ${filters && onFilter ? html`<${FilterBar}
                filters=${filters}
                activeFilter=${activeFilter || 'all'}
                onFilter=${onFilter}
                multiSelect=${multiSelect}
                ariaLabel=${ariaLabel}
            />` : null}
            <div class="filter-sheet-count" aria-live="polite">
                ${countText}${isFiltered ? html` · <button class="filter-sheet-reset" onClick=${resetFilters}>Reset filters</button>` : null}
            </div>
        </div>
    `;
}
