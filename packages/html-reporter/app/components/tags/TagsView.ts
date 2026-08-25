import htm from 'htm';
import { h } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import type { ReportTag } from '../../../src/cli/reporting/ReportData.js';
import { useMobileSheetState } from '../../hooks/useMobileSheetState.js';
import { FilterBar } from '../common/FilterBar.js';
import { MobileSheets } from '../common/MobileSheets.js';
import { ResultCount } from '../common/ResultCount.js';
import { SearchInput } from '../common/SearchInput.js';
import { TopbarActions } from '../common/TopbarActions.js';
import { ViewTopbar } from '../common/ViewTopbar.js';
import { TagRow, TagRowHeader } from './TagRow.js';
import { computeFilterCounts, filterTags, groupTagsByType } from './tagsHelpers.js';

const html = htm.bind(h);

interface TagsViewProps {
    tags: ReportTag[];
    onNavigate?: (path: string) => void;
    onOpenSidebar?: () => void;
}

export function TagsView({ tags, onNavigate = () => {}, onOpenSidebar }: TagsViewProps): ReturnType<typeof html> {
    const openSidebar = onOpenSidebar || (() => {});
    const sheets = useMobileSheetState();
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

    const topbarActions = html`<${TopbarActions} onOpenFilter=${sheets.openFilter} />`;

    return html`
    <div>
      <${ViewTopbar} title="Tags" onOpenSidebar=${openSidebar} actions=${topbarActions} />
      <div class="controls-row desktop-only">
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

      <${MobileSheets}
        filterSheetOpen=${sheets.filterSheetOpen}
        onCloseFilter=${sheets.closeFilter}
        search=${search} onSearch=${setSearch}
        filters=${filters}
        activeFilter=${filter} onFilter=${setFilter}
        filteredCount=${filtered.length} totalCount=${tags.length}
        searchPlaceholder="Find tags..."
      />
    </div>
  `;
}
