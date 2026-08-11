import htm from 'htm';
import { h } from 'preact';
import { useMemo, useRef, useState } from 'preact/hooks';

import type { ReportScenario, ReportSummary } from '../../../src/cli/reporting/ReportData.js';
import { useVirtualizer } from '../../hooks/index.js';
import { useMobileSheetState } from '../../hooks/useMobileSheetState.js';
import { formatDuration, matchesOutcomeFilter, totalFailedCount } from '../../utils/index.js';
import { FilterBar } from '../common/FilterBar.js';
import { KpiCard } from '../common/KpiCard.js';
import { MobileSheets } from '../common/MobileSheets.js';
import { TopbarActions } from '../common/TopbarActions.js';
import { ViewTopbar } from '../common/ViewTopbar.js';
import { TimelineBar } from './TimelineBar.js';
import { computeDurationStats } from './timelineHelpers.js';

const html = htm.bind(h);

interface TimelineViewProps {
    scenarios: ReportScenario[];
    summary: ReportSummary;
    onNavigate: (path: string) => void;
    route?: string;
    onOpenSidebar?: () => void;
}

export function TimelineView({ scenarios: allScenarios, summary, onNavigate, route = '', onOpenSidebar }: TimelineViewProps): ReturnType<typeof html> {
    const openSidebar = onOpenSidebar || (() => {});
    const sheets = useMobileSheetState();
    const initialSort = useMemo(() => {
        const params = new URLSearchParams(route.split('?')[1] || '');
        const sort = params.get('sort');
        return sort === 'duration' ? 'duration' : 'time';
    }, []);
    const [sortBy, setSortBy] = useState(initialSort);
    const [filter, setFilter] = useState('all');

    const start = new Date(summary.startedAt).getTime();
    const end = new Date(summary.finishedAt).getTime();
    const totalDur = end - start;

    const scenarios = useMemo(() => {
        let result = allScenarios;
        if (filter && filter !== 'all') {
            result = result.filter(s => matchesOutcomeFilter(s.outcome, filter));
        }
        if (sortBy === 'duration') return [...result].sort((a, b) => b.duration - a.duration);
        return result;
    }, [sortBy, filter]);

    const { avg, slowest, fastest } = useMemo(() => computeDurationStats(allScenarios), [allScenarios]);

    const rowHeight = 52;
    const parentRef = useRef<HTMLElement | null>(null);

    const virtualizer = useVirtualizer({
        count: scenarios.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeight,
        overscan: 20,
    });

    const filters = [
        { key: 'all', label: 'All', count: allScenarios.length },
        { key: 'passed', label: 'Passed', count: summary.outcomes.passed },
        { key: 'failed', label: 'Failed', count: totalFailedCount(summary.outcomes) },
        { key: 'skipped', label: 'Skipped', count: (summary.outcomes.skipped || 0) + (summary.outcomes.pending || 0) },
    ];

    const sortOptions = [
        { key: 'time', label: 'Execution order' },
        { key: 'duration', label: 'Slowest first' },
    ];

    const statsContent = html`
        <div class="kpi-row grid-4col">
          <${KpiCard} label="Slowest" value=${formatDuration(slowest)} ariaLabel="Slowest test: ${formatDuration(slowest)}" valueColor=${slowest > avg * 3 ? 'var(--color-failed)' : slowest > avg * 2 ? 'var(--color-pending)' : ''} />
          <${KpiCard} label="Fastest" value=${formatDuration(fastest)} ariaLabel="Fastest test: ${formatDuration(fastest)}" />
          <${KpiCard} label="Average" value=${formatDuration(avg)} ariaLabel="Average duration: ${formatDuration(avg)}" />
          <${KpiCard} label="Total" value=${formatDuration(summary.duration)} ariaLabel="Total duration: ${formatDuration(summary.duration)}" subtitle="${allScenarios.length} scenarios" />
        </div>
    `;

    const topbarActions = html`<${TopbarActions} onOpenFilter=${sheets.openFilter} onOpenSort=${sheets.openSort} onOpenStats=${sheets.openStats} />`;

    return html`
    <div class="flex-fill-view">
      <${ViewTopbar} title="Timeline" onOpenSidebar=${openSidebar} actions=${topbarActions} />
      <div class="kpi-row mb-md grid-4col desktop-only">
        <${KpiCard} label="Slowest" value=${formatDuration(slowest)} ariaLabel="Slowest test: ${formatDuration(slowest)}" valueColor=${slowest > avg * 3 ? 'var(--color-failed)' : slowest > avg * 2 ? 'var(--color-pending)' : ''} />
        <${KpiCard} label="Fastest" value=${formatDuration(fastest)} ariaLabel="Fastest test: ${formatDuration(fastest)}" />
        <${KpiCard} label="Average" value=${formatDuration(avg)} ariaLabel="Average duration: ${formatDuration(avg)}" />
        <${KpiCard} label="Total" value=${formatDuration(summary.duration)} ariaLabel="Total duration: ${formatDuration(summary.duration)}" subtitle="${allScenarios.length} scenarios" />
      </div>

      <div class="controls-row desktop-only">
        <${FilterBar} filters=${filters}
        activeFilter=${filter} onFilter=${setFilter}
        ariaLabel="Filter tests by outcome" label="Status"
        sortOptions=${sortOptions}
        activeSort=${sortBy} onSort=${setSortBy} />
      </div>

      <div class="card pb-0">
        <div ref=${parentRef} class="scroll-container" style="border-top:1px solid var(--border-color)">
          <div style="height:${virtualizer.getTotalSize()}px;width:100%;position:relative">
            ${virtualizer.getVirtualItems().map(virtualRow => html`
                <${TimelineBar}
                    key=${virtualRow.index}
                    scenario=${scenarios[virtualRow.index]}
                    rowHeight=${rowHeight}
                    translateY=${virtualRow.start}
                    sortBy=${sortBy}
                    runStart=${start}
                    totalDur=${totalDur}
                    slowest=${slowest}
                    onNavigate=${onNavigate}
                />
            `)}
          </div>
        </div>
      </div>

      <${MobileSheets}
        filterSheetOpen=${sheets.filterSheetOpen}
        onCloseFilter=${sheets.closeFilter}
        filterTitle="Filter"
        search=${''}
        onSearch=${() => {}}
        filters=${filters}
        activeFilter=${filter} onFilter=${setFilter}
        filteredCount=${scenarios.length} totalCount=${allScenarios.length}
        sortSheetOpen=${sheets.sortSheetOpen}
        onCloseSort=${sheets.closeSort}
        sortOptions=${sortOptions}
        activeSort=${sortBy} onSort=${setSortBy}
        statsSheetOpen=${sheets.statsSheetOpen}
        onCloseStats=${sheets.closeStats}
        statsContent=${statsContent}
      />
    </div>
  `;
}
