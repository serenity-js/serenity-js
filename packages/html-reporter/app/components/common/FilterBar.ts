import htm from 'htm';
import { h } from 'preact';

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

    const selectId = sortId || 'sort-select';

    return html`
    <div class="filter-bar" role="group" aria-label="${ariaLabel || 'Filter'}" style="align-items:center" data-testid="filter-bar">
      ${label ? html`<span class="label-upper" style="align-self:center">${label}:</span>` : null}
      ${filters.map(f => {
            const isActive = multiSelect
                ? (f.key === 'all' ? activeSet.size === 0 : activeSet.has(f.key))
                : activeFilter === f.key;
            return html`
            <button class="filter-chip ${f.className || f.key} ${isActive ? 'active' : ''}"
                    onClick=${() => handleClick(f.key)}
                    aria-pressed=${isActive}>
                <span class="chip-label">${f.label}</span>
                <span class="count">${f.count}</span>
            </button>
          `;
        })}
      ${sortOptions ? html`
        <div class="sort-group">
          <label class="label-upper" for="${selectId}">Sort:</label>
          <select id="${selectId}" class="sort-select" value=${activeSort} onChange=${(e: Event) => onSort && onSort((e.target as HTMLSelectElement).value)} aria-label="Sort order">
            ${sortOptions.map(s => html`<option value=${s.key} selected=${activeSort === s.key}>${s.label}</option>`)}
          </select>
        </div>
      ` : null}
    </div>
  `;
}
