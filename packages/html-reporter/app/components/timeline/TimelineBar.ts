import htm from 'htm';
import { h } from 'preact';

import type { ReportScenario } from '../../../src/cli/ReportData';
import { formatDuration, formatTimestamp, outcomeClass, scenarioUrl } from '../../utils';
import { OutcomeBadge } from '../common/OutcomeBadge';

const html = htm.bind(h);

interface TimelineBarProps {
    scenario: ReportScenario;
    rowHeight: number;
    translateY: number;
    sortBy: string;
    runStart: number;
    totalDur: number;
    slowest: number;
    onNavigate: (path: string) => void;
}

export function TimelineBar({ scenario, rowHeight, translateY, sortBy, runStart, totalDur, slowest, onNavigate }: TimelineBarProps): ReturnType<typeof html> {
    const s = scenario;
    const sStart = new Date(s.startedAt).getTime();
    const left = sortBy === 'time' ? ((sStart - runStart) / totalDur) * 100 : 0;
    const barWidth = sortBy === 'time'
        ? Math.max((s.duration / totalDur) * 100, Math.min((s.duration / slowest) * 8, 15))
        : Math.max((s.duration / slowest) * 100, 3);
    const nameColor = s.outcome !== 'SUCCESS' ? 'color:var(--color-' + outcomeClass(s.outcome) + ')' : '';
    const rowOpacity = s.outcome === 'SUCCESS' ? 'opacity:0.7;' : '';

    const handleClick = (): void => {
        onNavigate(scenarioUrl(s));
    };

    return html`
        <div class="timeline-row" style="position:absolute;top:0;left:0;width:100%;height:${rowHeight}px;transform:translateY(${translateY}px);display:flex;flex-direction:column;justify-content:center;padding:4px var(--space-sm);border-bottom:1px solid var(--divider);cursor:pointer;${rowOpacity}"
             onClick=${handleClick}
             title="Started: ${formatTimestamp(s.startedAt)} • Duration: ${formatDuration(s.duration)}">
            <div style="display:flex;align-items:center;gap:6px;overflow:hidden">
                <${OutcomeBadge} outcome=${s.outcome} size="xs" />
                <span style="font-size:var(--font-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;${nameColor}">${s.category} › ${s.name}</span>
                <span style="font-size:var(--font-xs);${s.outcome !== 'SUCCESS' ? 'color:var(--color-' + outcomeClass(s.outcome) + ')' : 'color:var(--text-secondary)'};font-family:var(--font-mono);white-space:nowrap;flex-shrink:0">${formatDuration(s.duration)}</span>
            </div>
            <div class="bar-track bar-track-md" style="margin-left:24px;margin-top:2px">
                <div style="position:absolute;left:${left}%;width:${barWidth}%;min-width:8px;height:100%;border-radius:3px;background:var(--color-${outcomeClass(s.outcome)});opacity:0.85"></div>
            </div>
        </div>
    `;
}
