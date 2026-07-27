import htm from 'htm';
import { h } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import type { ReportTag } from '../../../src/cli/ReportData.js';
import { FilterBar } from '../common/FilterBar.js';
import { ResultCount } from '../common/ResultCount.js';
import { SearchInput } from '../common/SearchInput.js';
import { TagRow, TagRowHeader } from './TagRow.js';
import { computeFilterCounts, filterTags, groupTagsByType } from './tagsHelpers.js';

const html = htm.bind(h);

interface TagsViewProps {
    tags: ReportTag[];
    onNavigate: (path: string) => void;
}

export function TagsView({ tags, onNavigate }: TagsViewProps): ReturnType<typeof html> {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const filterCounts = useMemo(() => computeFilterCounts(tags), [tags]);

    const filters = useMemo(() => [
        { key: 'all', label: 'All', count: tags.length },
        { key: 'passed', label: 'Passed', count: filterCounts.passed },
        { key: 'failed', label: 'Failed', count: filterCounts.failed },
        { key: 'skipped', label: 'Skipped', count: filterCounts.skipped },
    ], [tags, filterCounts]);

    const filtered = useMemo(() => filterTags(tags, search, filter), [tags, search, filter]);

    const groups = useMemo(() => groupTagsByType(filtered), [filtered]);

    return html`
    <div>
      <div class="controls-row">
        <div class="search-input-wrap">
          <${SearchInput} value=${search} onInput=${setSearch} placeholder="Find tags..." />
        </div>
        <${FilterBar} filters=${filters} activeFilter=${filter} onFilter=${setFilter}
          ariaLabel="Filter tags by outcome" label="Outcome" />
      </div>

      ${filtered.length < tags.length ? html`<${ResultCount} showing=${filtered.length} total=${tags.length} label="tags" />` : null}

      <div class="card-grid">
        ${groups.map(group => html`
          <${TagRowHeader} label=${group.label} count=${group.tags.length} />
          ${group.tags.map(tag => {
                const passRate = tag.scenarioCount > 0 ? Math.round((tag.passed / tag.scenarioCount) * 100) : 0;
                return html`<${TagRow}
                  type=${group.type}
                  name=${tag.name}
                  scenarioCount=${tag.scenarioCount}
                  passRate=${passRate}
                  onNavigate=${onNavigate}
                />`;
            })}
        `)}
      </div>
    </div>
  `;
}
