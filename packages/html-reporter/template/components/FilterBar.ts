import htm from 'htm';
import { h } from 'preact';

import type { ReportOutcomes } from '../../src/ReportData';

const html = htm.bind(h);

interface SortOption {
    key: string;
    label: string;
}

interface FilterBarProps {
    outcomes: ReportOutcomes;
    total: number;
    activeFilter: string;
    onFilter: (filter: string) => void;
    sortOptions?: SortOption[];
    activeSort?: string;
    onSort?: (sort: string) => void;
}

export function FilterBar({ outcomes, total, activeFilter, onFilter, sortOptions, activeSort, onSort }: FilterBarProps) {
    const filters = [
        { key: 'all', label: 'All', count: total },
        { key: 'passed', label: 'Passed', count: outcomes.passed },
        { key: 'failed', label: 'Failed', count: (outcomes.failed || 0) + (outcomes.error || 0) + (outcomes.compromised || 0) },
        { key: 'skipped', label: 'Skipped', count: (outcomes.skipped || 0) + (outcomes.pending || 0) },
    ];

    // Parse active filters as a Set (supports comma-separated multi-select)
    const activeSet = (!activeFilter || activeFilter === 'all') ? new Set<string>() : new Set(activeFilter.split(','));

    const handleClick = (key: string) => {
        if (key === 'all') {
            onFilter && onFilter('all');
            return;
        }
        const next = new Set(activeSet);
        if (next.has(key)) {
            next.delete(key);
        } else {
            next.add(key);
        }
        // If all are selected or none remain, reset to 'all'
        if (next.size === 0 || next.size === 3) {
            onFilter && onFilter('all');
        } else {
            onFilter && onFilter([...next].join(','));
        }
    };

    return html`
    <div class="filter-bar" role="group" aria-label="Filter tests by outcome" style="align-items:center">
      <span style="font-size:var(--font-xs);font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;align-self:center">Status:</span>
      ${filters.map(f => {
            const isActive = f.key === 'all' ? activeSet.size === 0 : activeSet.has(f.key);
            return html`
            <button class="filter-chip ${f.key} ${isActive ? 'active' : ''}"
                    onClick=${() => handleClick(f.key)}
                    aria-pressed=${isActive}>
                <span>${f.label}</span>
                <span class="count">${f.count}</span>
            </button>
          `;
        })}
      ${sortOptions ? html`
        <div class="sort-group">
          <label class="label-upper" for="sort-select">Sort:</label>
          <select id="sort-select" class="sort-select" value=${activeSort} onChange=${(e: Event) => onSort && onSort((e.target as HTMLSelectElement).value)} aria-label="Sort order">
            ${sortOptions.map(s => html`<option value=${s.key} selected=${activeSort === s.key}>${s.label}</option>`)}
          </select>
        </div>
      ` : null}
    </div>
  `;
}
