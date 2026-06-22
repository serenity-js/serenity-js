/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import htm from 'htm';
import { h } from 'preact';

import { DATA } from '../utils';

const html = htm.bind(h);

export function TagsView({ onNavigate }) {
    const tagsByType = {};
    for (const tag of DATA.tags) {
        const type = tag.type || 'other';
        if (!tagsByType[type]) tagsByType[type] = [];
        tagsByType[type].push(tag);
    }

    const typeOrder = Object.keys(tagsByType).sort((a, b) => {
        if (a === 'feature') return -1;
        if (b === 'feature') return 1;
        return a.localeCompare(b);
    });

    const typeIcons = { feature: '📋', tag: '#', issue: '🐛', browser: '🌐', capability: '🎯', theme: '📚' };
    const renderGroups = typeOrder.map(type => {
        const tags = tagsByType[type];
        const items = tags.map(tag => {
            const passRate = tag.scenarioCount > 0 ? Math.round((tag.passed / tag.scenarioCount) * 100) : 0;
            const passColor = passRate >= 80 ? 'var(--color-passed)' : passRate >= 50 ? 'var(--color-pending)' : 'var(--color-failed)';
            return { name: tag.name, scenarioCount: tag.scenarioCount, passRate, passColor, icon: typeIcons[type] || '#' };
        });
        return { type, label: type.charAt(0).toUpperCase() + type.slice(1), items };
    });

    const renderItems = [];
    for (const group of renderGroups) {
        renderItems.push({ kind: 'header', label: group.label, count: group.items.length });
        for (const item of group.items) {
            renderItems.push({ kind: 'tag', ...item });
        }
    }

    return html`
    <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:var(--space-sm)">
      ${renderItems.map(item => {
            if (item.kind === 'header') {
                return html`
            <div style="grid-column:1/-1;padding:var(--space-md) 0 var(--space-sm);font-size:var(--font-sm);font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid var(--divider);margin-top:var(--space-md)">
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
              <div style="height:4px;border-radius:2px;background:var(--border-color);overflow:hidden">
                <div style="height:100%;width:${barWidth};background:${barColor};border-radius:2px;transition:width 0.3s"></div>
              </div>
              <div class="tag-card-count" style="margin-top:4px">${item.scenarioCount} scenario${item.scenarioCount > 1 ? 's' : ''}</div>
            </div>
          </div>
        `;
        })}
    </div>
  `;
}
