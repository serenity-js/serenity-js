import htm from 'htm';
import type { ComponentChildren } from 'preact';
import { h } from 'preact';

import { BottomSheet } from './BottomSheet.js';
import type { FilterDefinition } from './FilterBar.js';
import { FilterSheetContent } from './FilterSheetContent.js';
import type { SortOption } from './SortSheetContent.js';
import { SortSheetContent } from './SortSheetContent.js';

const html = htm.bind(h);

export interface MobileSheetsProps {
    // Filter sheet
    filterSheetOpen: boolean;
    onCloseFilter: () => void;
    filterTitle?: string;
    filterHeader?: ComponentChildren;
    search: string;
    onSearch: (value: string) => void;
    filters?: FilterDefinition[];
    activeFilter?: string;
    onFilter?: (filter: string) => void;
    filteredCount: number;
    totalCount: number;
    searchPlaceholder?: string;
    // Sort sheet
    sortSheetOpen?: boolean;
    onCloseSort?: () => void;
    sortOptions?: SortOption[];
    activeSort?: string;
    onSort?: (sort: string) => void;
    // Stats sheet (Timeline only)
    statsSheetOpen?: boolean;
    onCloseStats?: () => void;
    statsContent?: ComponentChildren;
}

export function MobileSheets(props: MobileSheetsProps): ReturnType<typeof html> {
    return html`
        ${props.filterSheetOpen ? html`<${BottomSheet} isOpen=${true} onClose=${props.onCloseFilter} title=${props.filterTitle || 'Search & Filter'}>
            ${props.filterHeader}
            <${FilterSheetContent}
                search=${props.search} onSearch=${props.onSearch}
                filters=${props.filters}
                activeFilter=${props.activeFilter}
                onFilter=${props.onFilter}
                filteredCount=${props.filteredCount}
                totalCount=${props.totalCount}
                searchPlaceholder=${props.searchPlaceholder}
            />
        </${BottomSheet}>` : null}
        ${props.sortSheetOpen && props.sortOptions ? html`<${BottomSheet} isOpen=${true} onClose=${props.onCloseSort} title="Sort">
            <${SortSheetContent}
                sortOptions=${props.sortOptions}
                activeSort=${props.activeSort}
                onSort=${props.onSort}
            />
        </${BottomSheet}>` : null}
        ${props.statsSheetOpen && props.statsContent ? html`<${BottomSheet} isOpen=${true} onClose=${props.onCloseStats} title="Timing Stats">
            ${props.statsContent}
        </${BottomSheet}>` : null}
    `;
}
