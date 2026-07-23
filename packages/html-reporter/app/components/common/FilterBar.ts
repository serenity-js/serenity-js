import htm from 'htm';
import { h } from 'preact';

import { targetValue } from '../../utils';

const html = htm.bind(h);

export interface FilterDefinition {
    key: string;
    label: string;
    count: number;
    className?: string;
}

interface SortOption {
    key: string;
    label: string;
}

export interface FilterBarProps {
    filters: FilterDefinition[];
    activeFilter: string;
    onFilter: (filter: string) => void;
    ariaLabel?: string;
    label?: string;
    multiSelect?: boolean;
    sortOptions?: SortOption[];
    activeSort?: string;
    onSort?: (sort: string) => void;
    sortId?: string;
}

interface FilterChipProps {
    filter: FilterDefinition;
    isActive: boolean;
    onClick: () => void;
}

function FilterChip({ filter, isActive, onClick }: FilterChipProps): ReturnType<typeof html> {
    return html`
      <button class="filter-chip ${filter.className || filter.key} ${isActive ? 'active' : ''}"
              onClick=${onClick}
              aria-pressed=${isActive}>
          <span class="chip-label">${filter.label}</span>
          <span class="count">${filter.count}</span>
      </button>
    `;
}

interface SortDropdownProps {
    selectId: string;
    options: SortOption[];
    activeSort?: string;
    onSort?: (sort: string) => void;
}

function SortDropdown({ selectId, options, activeSort, onSort }: SortDropdownProps): ReturnType<typeof html> {
    return html`
      <div class="sort-group">
        <select id="${selectId}" class="sort-select" value=${activeSort} onChange=${(e: Event) => onSort && onSort(targetValue(e))} aria-label="Sort order">
          ${options.map(s => html`<option value=${s.key} selected=${activeSort === s.key}>${s.label}</option>`)}
        </select>
      </div>
    `;
}

export function FilterBar({ filters, activeFilter, onFilter, ariaLabel, label, multiSelect = true, sortOptions, activeSort, onSort, sortId }: FilterBarProps): ReturnType<typeof html> {

    // Parse active filters as a Set (supports comma-separated multi-select)
    const activeSet = (!activeFilter || activeFilter === 'all') ? new Set<string>() : new Set(activeFilter.split(','));

    const handleClick = (key: string) => {
        if (!multiSelect) {
            onFilter(key);
            return;
        }

        if (key === 'all') {
            onFilter('all');
            return;
        }
        const next = new Set(activeSet);
        if (next.has(key)) {
            next.delete(key);
        } else {
            next.add(key);
        }
        // If none remain, reset to 'all'
        const nonAllFilters = filters.filter(f => f.key !== 'all');
        if (next.size === 0 || next.size === nonAllFilters.length) {
            onFilter('all');
        } else {
            onFilter([...next].join(','));
        }
    };

    const isChipActive = (f: FilterDefinition): boolean => {
        if (multiSelect) {
            return f.key === 'all' ? activeSet.size === 0 : activeSet.has(f.key);
        }
        return activeFilter === f.key;
    };

    const selectId = sortId || 'sort-select';

    return html`
    <div class="filter-bar-row" data-testid="filter-bar">
      <div class="filter-bar scroll-x-hidden" role="group" aria-label="${ariaLabel || 'Filter'}">
        ${filters.map(f => html`
          <${FilterChip} filter=${f} isActive=${isChipActive(f)} onClick=${() => handleClick(f.key)} />
        `)}
      </div>
      ${sortOptions ? html`
        <${SortDropdown} selectId=${selectId} options=${sortOptions} activeSort=${activeSort} onSort=${onSort} />
      ` : null}
    </div>
  `;
}
