/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import htm from 'htm';
import { h } from 'preact';
import { useMemo, useRef, useState } from 'preact/hooks';

import { useVirtualizer } from '../hooks';
import { DATA, formatDuration, outcomeClass, outcomeIcon, scenarioUrl } from '../utils';
import { FilterBar } from './FilterBar';

const html = htm.bind(h);

export function TimelineView({ onNavigate }) {
    const [sortBy, setSortBy] = useState('time');
    const [filter, setFilter] = useState('all');
    const allScenarios = DATA.scenarios;
    const start = new Date(DATA.summary.startedAt).getTime();
    const end = new Date(DATA.summary.finishedAt).getTime();
    const totalDur = end - start;

    const scenarios = useMemo(() => {
        let result = allScenarios;
        if (filter !== 'all') {
            const filterMatch = { passed: ['SUCCESS'], failed: ['FAILURE', 'ERROR', 'COMPROMISED'], skipped: ['SKIPPED', 'PENDING'] };
            const allowed = filterMatch[filter];
            if (allowed) result = result.filter(s => allowed.includes(s.outcome));
        }
        if (sortBy === 'duration') return [...result].sort((a, b) => b.duration - a.duration);
        return result;
    }, [sortBy, filter]);

    const durations = allScenarios.map(s => s.duration).filter(d => d > 0);
    const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    const slowest = Math.max(...durations);
    const fastest = Math.min(...durations.filter(d => d > 0));

    const rowHeight = 52;
    const parentRef = useRef(null);

    const virtualizer = useVirtualizer({
        count: scenarios.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeight,
        overscan: 20,
    });

    return html`
    <div>
      <div class="grid-stats" style="margin-bottom:var(--space-md)">
        <div class="card" style="padding:var(--space-sm) var(--space-md);display:flex;align-items:center;gap:var(--space-sm)">
          <div class="card-title" style="margin-bottom:0">Slowest</div>
          <div class="card-value" style="color:var(--color-failed);font-size:var(--font-lg)">${formatDuration(slowest)}</div>
        </div>
        <div class="card" style="padding:var(--space-sm) var(--space-md);display:flex;align-items:center;gap:var(--space-sm)">
          <div class="card-title" style="margin-bottom:0">Fastest</div>
          <div class="card-value" style="color:var(--color-passed);font-size:var(--font-lg)">${formatDuration(fastest)}</div>
        </div>
        <div class="card" style="padding:var(--space-sm) var(--space-md);display:flex;align-items:center;gap:var(--space-sm)">
          <div class="card-title" style="margin-bottom:0">Average</div>
          <div class="card-value" style="font-size:var(--font-lg)">${formatDuration(avg)}</div>
        </div>
        <div class="card" style="padding:var(--space-sm) var(--space-md);display:flex;align-items:center;gap:var(--space-sm)">
          <div class="card-title" style="margin-bottom:0">Total Run</div>
          <div class="card-value" style="font-size:var(--font-lg)">${formatDuration(DATA.summary.duration)}</div>
        </div>
      </div>

      <${FilterBar} outcomes=${DATA.summary.outcomes} total=${allScenarios.length}
                   activeFilter=${filter} onFilter=${setFilter}
                   sortOptions=${[
                        { key: 'time', label: 'Execution order' },
                        { key: 'duration', label: 'Slowest first' },
                    ]}
                   activeSort=${sortBy} onSort=${setSortBy} />

      <div class="card" style="padding-bottom:0">
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
                return html`
                <div class="timeline-row" style="position:absolute;top:0;left:0;width:100%;height:${rowHeight}px;transform:translateY(${virtualRow.start}px);display:flex;flex-direction:column;justify-content:center;padding:4px var(--space-sm);border-bottom:1px solid var(--divider);cursor:pointer"
                     onClick=${clickHandler}
                     title="Started: ${new Date(s.startedAt).toLocaleTimeString()} • Duration: ${formatDuration(s.duration)}">
                  <div style="display:flex;align-items:center;gap:6px;overflow:hidden">
                    <span class="scenario-outcome-icon ${outcomeClass(s.outcome)}" style="width:18px;height:18px;font-size:var(--font-xs);flex-shrink:0">${outcomeIcon(s.outcome)}</span>
                    <span style="font-size:var(--font-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;${nameColor}">${s.category} › ${s.name}</span>
                    <span style="font-size:var(--font-xs);${s.outcome !== 'SUCCESS' ? 'color:var(--color-' + outcomeClass(s.outcome) + ')' : 'color:var(--text-secondary)'};font-family:var(--font-mono);white-space:nowrap;flex-shrink:0">${formatDuration(s.duration)}</span>
                  </div>
                  <div style="height:10px;margin-left:24px;margin-top:2px;position:relative">
                    <div style="position:absolute;left:${left}%;width:${barWidth}%;height:100%;border-radius:3px;background:var(--color-${outcomeClass(s.outcome)});opacity:0.85"></div>
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
