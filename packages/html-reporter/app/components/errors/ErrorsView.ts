import htm from 'htm';
import { h } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';

import type { ReportHistoryEntry, ReportScenario } from '../../../src/cli/reporting/ReportData.js';
import { ROW_HEIGHTS } from '../../config/layout.js';
import { useRunSelection } from '../../hooks/useRunSelection.js';
import { BottomSheet } from '../common/BottomSheet.js';
import { FilterSheetContent } from '../common/FilterSheetContent.js';
import { icons } from '../common/icons.js';
import { GroupedVirtualList } from '../common/layout/GroupedVirtualList.js';
import { ResultCount } from '../common/ResultCount.js';
import { RunSelector } from '../common/RunSelector.js';
import { SearchInput } from '../common/SearchInput.js';
import { TopbarActions } from '../common/TopbarActions.js';
import { ViewTopbar } from '../common/ViewTopbar.js';
import type { ErrorRenderItem } from './categoriseErrors.js';
import { buildRenderItems, buildSummaryCards, categoriseErrors, CATEGORY_ICONS } from './categoriseErrors.js';
import { ErrorKpiCards } from './ErrorKpiCards.js';
import { ErrorRow } from './ErrorRow.js';

const html = htm.bind(h);

interface ErrorsViewProps {
    scenarios: ReportScenario[];
    history: ReportHistoryEntry[];
    specDirectory?: string;
    onNavigate: (path: string) => void;
    route: string;
    onOpenSidebar?: () => void;
}

function isErrorOutcome(outcome: string): boolean {
    return outcome === 'FAILURE' || outcome === 'ERROR' || outcome === 'COMPROMISED';
}

/**
 * Computes the list of scenarios with errors for the given run.
 * If runIndex is null or the latest run, filters allScenarios directly.
 * Otherwise, reconstructs scenarios from execution history for the historical run.
 */
function computeErrorScenarios(allScenarios: ReportScenario[], runIndex: number | null, history: ReportHistoryEntry[]): ReportScenario[] {
    if (runIndex === null || runIndex === history.length - 1) {
        return allScenarios.filter(s => isErrorOutcome(s.outcome));
    }
    const runTimestamp = history[runIndex]?.timestamp;
    if (!runTimestamp) return [];

    const result: ReportScenario[] = [];
    for (const s of allScenarios) {
        if (!s.executionHistory) continue;
        const entry = s.executionHistory.find(e => e.timestamp === runTimestamp);
        if (!entry) continue;
        if (isErrorOutcome(entry.outcome)) {
            result.push({
                ...s,
                outcome: entry.outcome,
                duration: entry.duration ?? s.duration,
                error: entry.error || undefined,
            } as ReportScenario);
        }
    }
    return result;
}

export function ErrorsView({ scenarios: allScenarios, history, specDirectory, onNavigate, route, onOpenSidebar }: ErrorsViewProps): ReturnType<typeof html> {
    const openSidebar = onOpenSidebar || (() => {});
    const [filterSheetOpen, setFilterSheetOpen] = useState(false);
    const [search, setSearch] = useState('');
    const { runIndex: errorRunIndex, isHistorical: errorIsHistorical, activeTimestamp: errorActiveRunTs, onRunChange: onErrorRunChange } = useRunSelection(route, history, '/errors', onNavigate);

    const errorScenarios = useMemo(
        () => computeErrorScenarios(allScenarios, errorRunIndex, history),
        [allScenarios, errorRunIndex, history],
    );

    const filteredErrors = useMemo(() => {
        if (!search) return errorScenarios;
        const term = search.toLowerCase();
        return errorScenarios.filter(s =>
            s.name.toLowerCase().includes(term) ||
            s.category.toLowerCase().includes(term) ||
            (s.error?.message && s.error.message.toLowerCase().includes(term))
        );
    }, [errorScenarios, search]);

    const categoryOrder = useMemo(() => categoriseErrors(filteredErrors), [filteredErrors]);
    const summaryCards = useMemo(() => buildSummaryCards(categoryOrder), [categoryOrder]);
    const renderItems = useMemo(() => buildRenderItems(categoryOrder), [categoryOrder]);
    const scenarioItems = useMemo(() => renderItems.filter(item => item.type === 'scenario'), [renderItems]);

    const groupByFunction = useCallback((item: ErrorRenderItem) =>
        item.category || 'Errors',
    []);

    const renderItem = useCallback((item: ErrorRenderItem) =>
        html`<${ErrorRow} scenario=${item.scenario} duplicateCount=${item.duplicateCount}
            specDirectory=${specDirectory} onNavigate=${onNavigate} />`,
    [specDirectory, onNavigate]);

    const renderGroupHeader = useCallback((category: string) => {
        const icon = CATEGORY_ICONS[category] || '✗';
        const cat = categoryOrder.find(c => c.name === category);
        const count = cat ? cat.scenarios.length : 0;
        return html`
          <span>${icon}</span>
          <span>${category}</span>
          <span style="font-size:var(--font-xs);color:var(--text-disabled);font-weight:400">(${count})</span>
        `;
    }, [categoryOrder]);

    const renderStickyContent = useCallback((element: HTMLDivElement, header: { type: 'header'; category: string; icon: string; name: string; count: number }) => {
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.gap = 'var(--space-sm)';
        element.innerHTML = '';
        const iconSpan = document.createElement('span');
        iconSpan.textContent = header.icon;
        const nameSpan = document.createElement('span');
        nameSpan.textContent = header.name;
        const countSpan = document.createElement('span');
        countSpan.textContent = '(' + header.count + ')';
        countSpan.style.cssText = 'font-size:var(--font-xs);color:var(--text-disabled);font-weight:400';
        element.appendChild(iconSpan);
        element.appendChild(nameSpan);
        element.appendChild(countSpan);
    }, []);

    const groupHeaderData = useCallback((category: string) => ({
        icon: CATEGORY_ICONS[category] || '✗',
        name: category,
        count: categoryOrder.find(c => c.name === category)?.scenarios.length || 0,
    }), [categoryOrder]);

    if (errorScenarios.length === 0) {
        return html`
      <div class="flex-fill-view">
        <${ViewTopbar} title="Errors" onOpenSidebar=${openSidebar} />
        <div class="placeholder-view">
          ${icons.errors}
          <h2>No Errors</h2>
          <p>All tests passed without errors.</p>
        </div>
      </div>
    `;
    }

    const topbarActions = html`<${TopbarActions} onOpenFilter=${() => setFilterSheetOpen(true)} />`;

    return html`
    <div class="flex-fill-view">
      <${ViewTopbar} title="Errors" onOpenSidebar=${openSidebar} actions=${topbarActions} />
      ${history.length > 1 ? html`<div class="desktop-only"><${RunSelector} activeTimestamp=${errorActiveRunTs} history=${history} onRunChange=${onErrorRunChange} isHistorical=${errorIsHistorical} showLatestHref="#/errors" /></div>` : null}

      <div class="controls-row desktop-only">
        <div class="search-input-wrap">
          <${SearchInput} value=${search} onInput=${setSearch} placeholder="Find errors..." />
        </div>
      </div>

      <${ErrorKpiCards} cards=${summaryCards} />
      <div class="card pb-0">
        <${ResultCount} showing=${filteredErrors.length} total=${filteredErrors.length < errorScenarios.length ? errorScenarios.length : undefined} label=${filteredErrors.length === 1 ? 'error' : 'errors'} />
        <${GroupedVirtualList}
            items=${scenarioItems}
            groupBy=${groupByFunction}
            rowHeight=${ROW_HEIGHTS.error}
            renderItem=${renderItem}
            renderGroupHeader=${renderGroupHeader}
            groupHeaderData=${groupHeaderData}
            renderStickyContent=${renderStickyContent}
            id="vs-errors-sticky"
        />
      </div>

      ${filterSheetOpen ? html`<${BottomSheet} isOpen=${true} onClose=${() => setFilterSheetOpen(false)} title="Search & Run">
        ${history.length > 1 ? html`<${RunSelector} activeTimestamp=${errorActiveRunTs} history=${history} onRunChange=${onErrorRunChange} isHistorical=${errorIsHistorical} showLatestHref="#/errors" />` : null}
        <${FilterSheetContent}
          search=${search} onSearch=${setSearch}
          filteredCount=${filteredErrors.length} totalCount=${errorScenarios.length}
          searchPlaceholder="Find errors..."
        />
      </${BottomSheet}>` : null}
    </div>
  `;
}
