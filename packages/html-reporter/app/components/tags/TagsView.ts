import htm from 'htm';
import { h } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import type { ReportTag } from '../../../src/cli/reporting/ReportData.js';
import { BottomSheet } from '../common/BottomSheet.js';
import { FilterBar } from '../common/FilterBar.js';
import { FilterSheetContent } from '../common/FilterSheetContent.js';
import { ResultCount } from '../common/ResultCount.js';
import { SearchInput } from '../common/SearchInput.js';
import { TopbarActions } from '../common/TopbarActions.js';
import { ViewTopbar } from '../common/ViewTopbar.js';
import { TagRow, TagRowHeader } from './TagRow.js';
import { computeFilterCounts, filterTags, groupTagsByType } from './tagsHelpers.js';

const html = htm.bind(h);

interface TagsViewProps {
    tags: ReportTag[];
    onNavigate: (path: string) => void;
    onOpenSidebar?: () => void;
}

export function TagsView({ tags, onNavigate, onOpenSidebar }: TagsViewProps): ReturnType<typeof html> {
    const openSidebar = onOpenSidebar || (() => {});
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [filterSheetOpen, setFilterSheetOpen] = useState(false);

    const filterCounts = useMemo(() => computeFilterCounts(tags), [tags]);

    const filters = useMemo(() => [
        { key: 'all', label: 'All', count: tags.length },
        { key: 'passed', label: 'Passed', count: filterCounts.passed },
        { key: 'failed', label: 'Failed', count: filterCounts.failed },
        { key: 'skipped', label: 'Skipped', count: filterCounts.skipped },
    ], [tags, filterCounts]);

    const filtered = useMemo(() => filterTags(tags, search, filter), [tags, search, filter]);

    const groups = useMemo(() => groupTagsByType(filtered), [filtered]);

    const topbarActions = html`<${TopbarActions} onOpenFilter=${() => setFilterSheetOpen(true)} />`;

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

      ${filterSheetOpen ? html`<${BottomSheet} isOpen=${true} onClose=${() => setFilterSheetOpen(false)} title="Search & Filter">
        <${FilterSheetContent}
          search=${search} onSearch=${setSearch}
          filters=${filters}
          activeFilter=${filter} onFilter=${setFilter}
          filteredCount=${filtered.length} totalCount=${tags.length}
          ariaLabel="Filter tags by outcome"
          searchPlaceholder="Find tags..."
        />
      </${BottomSheet}>` : null}
    </div>
  `;
}
