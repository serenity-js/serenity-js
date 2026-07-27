import htm from 'htm';
import { h } from 'preact';

import { formatTagToken, scoreColor } from '../../utils/index.js';
import { link } from '../../utils/link.js';

const html = htm.bind(h);

const typeIcons: Record<string, string> = {
    feature: '📋',
    tag: '#',
    issue: '🐛',
    browser: '🌐',
    capability: '🎯',
    theme: '📚',
};

interface TagRowHeaderProps {
    label: string;
    count: number;
}

export function TagRowHeader({ label, count }: TagRowHeaderProps): ReturnType<typeof html> {
    return html`
        <div class="grid-section-header">
            ${label} <span style="font-weight:400;color:var(--text-disabled)">(${count})</span>
        </div>
    `;
}

interface TagRowProps {
    type: string;
    name: string;
    scenarioCount: number;
    passRate: number;
    onNavigate: (path: string) => void;
}

export function TagRow({ type, name, scenarioCount, passRate, onNavigate }: TagRowProps): ReturnType<typeof html> {
    const passColor = scoreColor(passRate) || 'var(--text-primary)';
    const icon = typeIcons[type] || '#';
    const barWidth = passRate + '%';

    const handleClick = (): void => {
        onNavigate(link({ view: 'tests', search: formatTagToken({ type, name }) }));
    };

    return html`
        <div class="tag-card" onClick=${handleClick}>
            <div class="tag-card-icon">${icon}</div>
            <div class="flex-1">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-sm);margin-bottom:4px">
                    <div class="tag-card-name">${name}</div>
                    <span style="font-size:var(--font-sm);font-weight:600;color:${passColor};flex-shrink:0;min-width:36px;text-align:right" title="Pass rate: ${passRate}%">${passRate}%</span>
                </div>
                <div class="bar-track bar-track-sm">
                    <div style="height:100%;width:${barWidth};background:${passColor};border-radius:2px;transition:width 0.3s"></div>
                </div>
                <div class="tag-card-count" style="margin-top:4px">${scenarioCount} scenario${scenarioCount > 1 ? 's' : ''}</div>
            </div>
        </div>
    `;
}
