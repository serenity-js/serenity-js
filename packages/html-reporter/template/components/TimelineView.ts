import htm from 'htm';
import { h } from 'preact';
import { useMemo, useRef, useState } from 'preact/hooks';

import type { ReportScenario, ReportSummary } from '../../src/ReportData';
import { useVirtualizer } from '../hooks';
import { formatDuration, formatTimestamp, outcomeClass, outcomeIcon, scenarioUrl } from '../utils';
import { FilterBar } from './FilterBar';

const html = htm.bind(h);

interface TimelineViewProps {
    scenarios: ReportScenario[];
    summary: ReportSummary;
    onNavigate: (path: string) => void;
}

export function TimelineView({ scenarios: allScenarios, summary, onNavigate }: TimelineViewProps): ReturnType<typeof html> {
    const [sortBy, setSortBy] = useState('time');
    const [filter, setFilter] = useState('all');
    const start = new Date(summary.startedAt).getTime();
    const end = new Date(summary.finishedAt).getTime();
    const totalDur = end - start;

    const scenarios = useMemo(() => {
        let result = allScenarios;
        if (filter && filter !== 'all') {
            const filterMatch: Record<string, string[]> = { passed: ['SUCCESS'], failed: ['FAILURE', 'ERROR', 'COMPROMISED'], skipped: ['SKIPPED', 'PENDING'] };
            const keys = filter.split(',');
            const allowed = keys.flatMap(k => filterMatch[k] || []);
            if (allowed.length > 0) result = result.filter(s => allowed.includes(s.outcome));
        }
        if (sortBy === 'duration') return [...result].sort((a, b) => b.duration - a.duration);
        return result;
    }, [sortBy, filter]);

    const durations = allScenarios.map(s => s.duration).filter(d => d > 0);
    const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    const slowest = Math.max(...durations);
    const fastest = Math.min(...durations.filter(d => d > 0));

    const rowHeight = 52;
    const parentRef = useRef<HTMLElement | null>(null);

    const virtualizer = useVirtualizer({
        count: scenarios.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeight,
        overscan: 20,
    });

    return html`
    <div>
      <div class="kpi-row mb-md grid-4col">
        <div class="kpi-card" tabindex="0" aria-label="Slowest test: ${formatDuration(slowest)}">
          <span class="kpi-label">Slowest</span>
          <span class="kpi-value" style="color:${slowest > avg * 3 ? 'var(--color-failed)' : slowest > avg * 2 ? 'var(--color-pending)' : ''}">${formatDuration(slowest)}</span>
        </div>
        <div class="kpi-card" tabindex="0" aria-label="Fastest test: ${formatDuration(fastest)}">
          <span class="kpi-label">Fastest</span>
          <span class="kpi-value">${formatDuration(fastest)}</span>
        </div>
        <div class="kpi-card" tabindex="0" aria-label="Average duration: ${formatDuration(avg)}">
          <span class="kpi-label">Average</span>
          <span class="kpi-value">${formatDuration(avg)}</span>
        </div>
        <div class="kpi-card" tabindex="0" aria-label="Total duration: ${formatDuration(summary.duration)}">
          <span class="kpi-label">Total</span>
          <span class="kpi-value">${formatDuration(summary.duration)}</span>
          <span class="kpi-subtitle">${allScenarios.length} scenarios</span>
        </div>
      </div>

      <${FilterBar} outcomes=${summary.outcomes} total=${allScenarios.length}
                   activeFilter=${filter} onFilter=${setFilter}
                   sortOptions=${[
                        { key: 'time', label: 'Execution order' },
                        { key: 'duration', label: 'Slowest first' },
                    ]}
                   activeSort=${sortBy} onSort=${setSortBy} />

      <div class="card pb-0">
        <div ref=${parentRef} style="border-top:1px solid var(--border-color);max-height:calc(100vh - 320px);overflow-y:auto">
          <div style="height:${virtualizer.getTotalSize()}px;width:100%;position:relative">
            ${virtualizer.getVirtualItems().map(virtualRow => {
                const i = virtualRow.index;
                const s = scenarios[i];
                const sStart = new Date(s.startedAt).getTime();
                const left = sortBy === 'time' ? ((sStart - start) / totalDur) * 100 : 0;
                const width = sortBy === 'time'
                    ? Math.max((s.duration / totalDur) * 100, Math.min((s.duration / slowest) * 8, 15))
                    : Math.max((s.duration / slowest) * 100, 0.5);
                const clickHandler = () => onNavigate(scenarioUrl(s));
                const barWidth = sortBy === 'time' ? width : Math.max((s.duration / slowest) * 100, 3);
                const nameColor = s.outcome !== 'SUCCESS' ? 'color:var(--color-' + outcomeClass(s.outcome) + ')' : '';
                const rowOpacity = s.outcome === 'SUCCESS' ? 'opacity:0.7;' : '';
                return html`
                <div class="timeline-row" style="position:absolute;top:0;left:0;width:100%;height:${rowHeight}px;transform:translateY(${virtualRow.start}px);display:flex;flex-direction:column;justify-content:center;padding:4px var(--space-sm);border-bottom:1px solid var(--divider);cursor:pointer;${rowOpacity}"
                     onClick=${clickHandler}
                     title="Started: ${formatTimestamp(s.startedAt)} • Duration: ${formatDuration(s.duration)}">
                  <div style="display:flex;align-items:center;gap:6px;overflow:hidden">
                    <span class="scenario-outcome-icon ${outcomeClass(s.outcome)}" style="width:18px;height:18px;font-size:var(--font-xs);flex-shrink:0">${outcomeIcon(s.outcome)}</span>
                    <span style="font-size:var(--font-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;${nameColor}">${s.category} › ${s.name}</span>
                    <span style="font-size:var(--font-xs);${s.outcome !== 'SUCCESS' ? 'color:var(--color-' + outcomeClass(s.outcome) + ')' : 'color:var(--text-secondary)'};font-family:var(--font-mono);white-space:nowrap;flex-shrink:0">${formatDuration(s.duration)}</span>
                  </div>
                  <div class="bar-track bar-track-md" style="margin-left:24px;margin-top:2px">
                    <div style="position:absolute;left:${left}%;width:${barWidth}%;min-width:8px;height:100%;border-radius:3px;background:var(--color-${outcomeClass(s.outcome)});opacity:0.85"></div>
                  </div>
                </div>
              `;
            })}
          </div>
        </div>
      </div>
    </div>
  `;
}
