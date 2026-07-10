import htm from 'htm';
import { h } from 'preact';

import type { ReportTag } from '../../../src/cli/ReportData';
import { scoreColor } from '../../utils';

const html = htm.bind(h);

interface TagsViewProps {
    tags: ReportTag[];
    onNavigate: (path: string) => void;
}

export function TagsView({ tags, onNavigate }: TagsViewProps): ReturnType<typeof html> {
    const tagsByType: Record<string, Array<{ type: string; name: string; scenarioCount: number; passed: number }>> = {};
    for (const tag of tags) {
        const type = tag.type || 'other';
        if (!tagsByType[type]) tagsByType[type] = [];
        tagsByType[type].push(tag);
    }

    const typeOrder = Object.keys(tagsByType).sort((a, b) => {
        if (a === 'feature') return -1;
        if (b === 'feature') return 1;
        return a.localeCompare(b);
    });

    const typeIcons: Record<string, string> = { feature: '📋', tag: '#', issue: '🐛', browser: '🌐', capability: '🎯', theme: '📚' };
    const renderGroups = typeOrder.map(type => {
        const tags = tagsByType[type];
        const items = tags.map(tag => {
            const passRate = tag.scenarioCount > 0 ? Math.round((tag.passed / tag.scenarioCount) * 100) : 0;
            const passColor = scoreColor(passRate) || 'var(--text-primary)';
            return { name: tag.name, scenarioCount: tag.scenarioCount, passRate, passColor, icon: typeIcons[type] || '#' };
        }).sort((a, b) => a.passRate - b.passRate);
        return { type, label: type.charAt(0).toUpperCase() + type.slice(1), items };
    });

    const renderItems: Array<{ kind: string; label?: string; count?: number; name?: string; scenarioCount?: number; passRate?: number; passColor?: string; icon?: string }> = [];
    for (const group of renderGroups) {
        renderItems.push({ kind: 'header', label: group.label, count: group.items.length });
        for (const item of group.items) {
            renderItems.push({ kind: 'tag', ...item });
        }
    }

    return html`
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
          <div class="tag-card" onClick=${() => onNavigate('/tests?search=' + encodeURIComponent('"' + item.name + '"'))}>
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
  `;
}
