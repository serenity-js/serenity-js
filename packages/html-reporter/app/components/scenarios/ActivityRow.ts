import htm from 'htm';
import { h } from 'preact';

import type { ReportActivity } from '../../../src/cli/ReportData';
import { formatDuration, outcomeClass, outcomeIcon, showToast, useHashHistory } from '../../utils';
import { icons } from '../common/icons';

const html = htm.bind(h);

interface ActivityRowProps {
    activity: ReportActivity;
    displayName: string;
    hasChildren: boolean;
    expanded: boolean;
    onToggle: () => void;
    hasRestQuery: boolean;
    restExpanded: boolean;
    onToggleRest: () => void;
}

export function ActivityRow({ activity, displayName, hasChildren, expanded, onToggle, hasRestQuery, restExpanded, onToggleRest }: ActivityRowProps): ReturnType<typeof html> {
    const hashNav = useHashHistory();
    const hasPhoto = activity.artifacts && activity.artifacts.some(a => a.path && a.path.endsWith('.png'));

    const scrollToPhoto = (e: Event) => {
        e.stopPropagation();
        const photos = document.querySelectorAll('.photo-strip-item');
        for (const p of photos) { p.classList.remove('photo-highlight'); }
        const index = [...photos].findIndex(p => p.querySelector('.photo-strip-caption')?.textContent === activity.name);
        if (index >= 0) {
            hashNav.setParam('photo', String(index));
            const element = document.getElementById('photo-' + index);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('photo-highlight');
                setTimeout(() => element.classList.remove('photo-highlight'), 2000);
            }
        }
    };

    const copyLocation = (e: Event) => {
        e.stopPropagation();
        navigator.clipboard.writeText(activity.location!.path + ':' + activity.location!.line)
            .then(() => showToast('Location copied to clipboard'))
            .catch(() => {});
    };

    return html`
      <div class="activity-row" style=${hasChildren ? 'cursor:pointer' : ''} onClick=${hasChildren ? onToggle : undefined}>
        ${hasChildren ? html`<span class="expand-chevron-xs ${expanded ? 'open' : ''}">▸</span>` : html`<span style="width:12px;flex-shrink:0"></span>`}
        <div class="activity-icon ${outcomeClass(activity.outcome)}" data-outcome=${activity.outcome}>
          ${outcomeIcon(activity.outcome)}
        </div>
        <span class="activity-name ${activity.type === 'Task' ? 'task' : ''}">${displayName}</span>
        ${hasPhoto ? html`<span style="cursor:pointer;opacity:0.7;font-size:var(--font-sm)" title="View screenshot" onClick=${scrollToPhoto}>📷</span>` : null}
        ${hasRestQuery ? html`<span class="rest-badge" title="View HTTP exchange" onClick=${(e: Event) => { e.stopPropagation(); onToggleRest(); }}>REST</span>` : null}
        ${activity.location ? html`<span class="copy-location" title="Copy invocation location: ${activity.location.path}:${activity.location.line}" onClick=${copyLocation}>${icons.copy}</span>` : null}
        <span class="activity-duration">${formatDuration(activity.duration || 0)}</span>
      </div>
    `;
}
