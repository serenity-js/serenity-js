/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import htm from 'htm';
import { h } from 'preact';

const html = htm.bind(h);

export function FilterBar({ outcomes, total, activeFilter, onFilter, sortOptions, activeSort, onSort }) {
    const filters = [
        { key: 'all', label: 'All', count: total },
        { key: 'passed', label: 'Passed', count: outcomes.passed },
        { key: 'failed', label: 'Failed', count: (outcomes.failed || 0) + (outcomes.error || 0) + (outcomes.compromised || 0) },
        { key: 'skipped', label: 'Skipped', count: (outcomes.skipped || 0) + (outcomes.pending || 0) },
    ];

    return html`
    <div class="filter-bar" role="group" aria-label="Filter tests by outcome" style="align-items:center">
      <span style="font-size:var(--font-xs);font-weight:500;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;align-self:center">Status:</span>
      ${filters.map(f => html`
        <button class="filter-chip ${f.key} ${(activeFilter || 'all') === f.key ? 'active' : ''}"
                onClick=${() => onFilter && onFilter(f.key)}
                aria-pressed=${(activeFilter || 'all') === f.key}>
          <span>${f.label}</span>
          <span class="count">${f.count}</span>
        </button>
      `)}
      ${sortOptions ? html`
        <div class="sort-group">
          <label class="label-upper" for="sort-select">Sort:</label>
          <select id="sort-select" class="sort-select" value=${activeSort} onChange=${(e) => onSort(e.target.value)} aria-label="Sort order">
            ${sortOptions.map(s => html`<option value=${s.key} selected=${activeSort === s.key}>${s.label}</option>`)}
          </select>
        </div>
      ` : null}
    </div>
  `;
}
