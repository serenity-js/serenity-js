import htm from 'htm';
import { h } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import type { ReportTag } from '../../../src/cli/ReportData';
import { formatTagToken, scoreColor } from '../../utils';
import { FilterBar } from '../common/FilterBar';
import { ResultCount } from '../common/ResultCount';
import { SearchInput } from '../common/SearchInput';

const html = htm.bind(h);

interface TagsViewProps {
    tags: ReportTag[];
    onNavigate: (path: string) => void;
}

export function TagsView({ tags, onNavigate }: TagsViewProps): ReturnType<typeof html> {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const filterCounts = useMemo(() => {
        const passed = tags.filter(t => t.scenarioCount > 0 && t.failed === 0 && t.skipped === 0).length;
        const failed = tags.filter(t => t.failed > 0).length;
        const skipped = tags.filter(t => t.skipped > 0).length;
        return { passed, failed, skipped };
    }, [tags]);

    const filters = useMemo(() => [
        { key: 'all', label: 'All', count: tags.length },
        { key: 'passed', label: 'Passed', count: filterCounts.passed },
        { key: 'failed', label: 'Failed', count: filterCounts.failed },
        { key: 'skipped', label: 'Skipped', count: filterCounts.skipped },
    ], [tags, filterCounts]);

    const filtered = useMemo(() => {
        let result = tags;
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(t => t.name.toLowerCase().includes(lowerSearch));
        }
        if (filter === 'passed') {
            result = result.filter(t => t.scenarioCount > 0 && t.failed === 0 && t.skipped === 0);
        } else if (filter === 'failed') {
            result = result.filter(t => t.failed > 0);
        } else if (filter === 'skipped') {
            result = result.filter(t => t.skipped > 0);
        }
        return result;
    }, [tags, search, filter]);

    const typeIcons: Record<string, string> = { feature: '📋', tag: '#', issue: '🐛', browser: '🌐', capability: '🎯', theme: '📚' };

    const renderItems = useMemo(() => {
        const tagsByType: Record<string, ReportTag[]> = {};
        for (const tag of filtered) {
            const type = tag.type || 'other';
            if (!tagsByType[type]) tagsByType[type] = [];
            tagsByType[type].push(tag);
        }

        const typeOrder = Object.keys(tagsByType).sort((a, b) => {
            if (a === 'feature') return -1;
            if (b === 'feature') return 1;
            return a.localeCompare(b);
        });

        const items: Array<{ kind: string; type?: string; label?: string; count?: number; name?: string; scenarioCount?: number; passRate?: number; passColor?: string; icon?: string }> = [];
        for (const type of typeOrder) {
            const groupTags = tagsByType[type];
            const sortedTags = [...groupTags].sort((a, b) => {
                const aRate = a.scenarioCount > 0 ? (a.passed / a.scenarioCount) : 0;
                const bRate = b.scenarioCount > 0 ? (b.passed / b.scenarioCount) : 0;
                return aRate - bRate;
            });
            items.push({ kind: 'header', type, label: type.charAt(0).toUpperCase() + type.slice(1), count: sortedTags.length });
            for (const tag of sortedTags) {
                const passRate = tag.scenarioCount > 0 ? Math.round((tag.passed / tag.scenarioCount) * 100) : 0;
                const passColor = scoreColor(passRate) || 'var(--text-primary)';
                items.push({ kind: 'tag', type, name: tag.name, scenarioCount: tag.scenarioCount, passRate, passColor, icon: typeIcons[type] || '#' });
            }
        }
        return items;
    }, [filtered]);

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
        ${renderItems.map(item => {
            if (item.kind === 'header') {
                return html`
                  <div class="grid-section-header">
                    ${item.label} <span style="font-weight:400;color:var(--text-disabled)">(${item.count})</span>
                  </div>
                `;
            }
            const barWidth = item.passRate + '%';
            const barColor = item.passColor;
            return html`
            <div class="tag-card" onClick=${() => onNavigate('/tests?search=' + encodeURIComponent(formatTagToken({ type: item.type!, name: item.name! })))}>
              <div class="tag-card-icon">${item.icon}</div>
              <div class="flex-1">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-sm);margin-bottom:4px">
                  <div class="tag-card-name">${item.name}</div>
                  <span style="font-size:var(--font-sm);font-weight:600;color:${barColor};flex-shrink:0;min-width:36px;text-align:right" title="Pass rate: ${item.passRate}%">${item.passRate}%</span>
                </div>
                <div class="bar-track bar-track-sm">
                  <div style="height:100%;width:${barWidth};background:${barColor};border-radius:2px;transition:width 0.3s"></div>
                </div>
                <div class="tag-card-count" style="margin-top:4px">${item.scenarioCount} scenario${item.scenarioCount! > 1 ? 's' : ''}</div>
              </div>
            </div>
          `;
        })}
      </div>
    </div>
  `;
}
