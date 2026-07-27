import htm from 'htm';
import { h } from 'preact';

import type { ReportActivity } from '../../../src/cli/ReportData.js';
import { formatDuration, outcomeClass, outcomeIcon, relativeLocationPath, showToast, useHashHistory } from '../../utils/index.js';
import { DATA } from '../../utils/data.js';
import { icons } from '../common/icons.js';

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
    summaryText?: string;
}

export function ActivityRow({ activity, displayName, hasChildren, expanded, onToggle, hasRestQuery, restExpanded, onToggleRest, summaryText }: ActivityRowProps): ReturnType<typeof html> {
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
        const relativePath = relativeLocationPath(activity.location!, DATA.specDirectory);
        navigator.clipboard.writeText(relativePath)
            .then(() => showToast('Location copied to clipboard'))
            .catch(() => {});
    };

    return html`
      <div class="activity-row" style=${hasChildren ? 'cursor:pointer' : ''} onClick=${hasChildren ? onToggle : undefined}>
        <div class="activity-icon ${outcomeClass(activity.outcome)}" data-outcome=${activity.outcome}>
          ${outcomeIcon(activity.outcome)}
        </div>
        <div class="activity-content">
          <span class="activity-name line-clamp-2 ${activity.type === 'Task' ? 'task' : ''}">${displayName}</span>
          <div class="activity-meta">
            ${summaryText && !expanded ? html`<span class="activity-summary">${summaryText}</span>` : null}
            <span class="activity-duration">${icons.clock}${formatDuration(activity.duration || 0)}</span>
            ${activity.location ? html`<span class="copy-location" title="Copy invocation location" onClick=${copyLocation}>${icons.copy}</span>` : null}
            ${hasPhoto ? html`<span class="activity-meta-icon" title="View screenshot" onClick=${scrollToPhoto}>📷</span>` : null}
            ${hasRestQuery ? html`<span class="rest-badge" title="View HTTP exchange" onClick=${(e: Event) => { e.stopPropagation(); onToggleRest(); }}>REST</span>` : null}
          </div>
        </div>
      </div>
    `;
}
